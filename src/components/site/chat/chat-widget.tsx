"use client";
// Client component: the assistant is interactive end to end. It holds the
// open state and the conversation, streams replies from /api/chat with fetch,
// keeps the conversation in sessionStorage, moves focus in and out of the
// panel, and listens for clicks on any [data-chat-open] element on the page.
// None of that can run on the server; ChatSlot passes it the copy.

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Fragment, useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Magnetic } from "@/components/motion/magnetic";

export type ChatLabels = Record<
  | "chat.launcher.label"
  | "chat.launcher.open"
  | "chat.launcher.close"
  | "chat.title"
  | "chat.status"
  | "chat.close"
  | "chat.reset"
  | "chat.greeting"
  | "chat.suggestionsLabel"
  | "chat.inputLabel"
  | "chat.placeholder"
  | "chat.send"
  | "chat.charsLeft"
  | "chat.typing"
  | "chat.saving"
  | "chat.leadSaved"
  | "chat.youLabel"
  | "chat.botLabel"
  | "chat.reviewPrompt"
  | "chat.reviewLink"
  | "chat.disclaimer"
  | "chat.unconfigured"
  | "chat.error.rateLimited"
  | "chat.error.busy"
  | "chat.error.refused"
  | "chat.error.generic",
  string
>;

/** kind marks the widget's own notes: shown, never sent to the model. */
type Msg = { id: string; role: "user" | "assistant"; content: string; kind?: "note" | "error" };

const MAX_CHARS = 1000;
const STORAGE_KEY = "cl-chat";
const REVIEW_HREF = "/#contact";

let seq = 0;
const newId = () => `${Date.now().toString(36)}-${(seq++).toString(36)}`;

function load(): Msg[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const data: unknown = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(data)) return [];
    return data.filter(
      (m): m is Msg =>
        !!m && typeof m === "object" && typeof m.id === "string" && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"),
    );
  } catch {
    return [];
  }
}

function save(messages: Msg[]) {
  try {
    if (messages.length) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode or storage blocked: the conversation just won't survive a reload.
  }
}

// ---------------------------------------------------------------- reply text

const LIST_ITEM = /^\s*(?:[-*•]|(\d+)[.)])\s+(.*)$/;
// An email address, or a site path such as /services or /contact?type=review.
const TOKEN = /([\w.+-]+@[\w-]+(?:\.[\w-]+)+)|(^|[\s(])(\/[a-z0-9-]+(?:\/[a-z0-9-]+)*(?:\?[a-z0-9=&-]+)?(?:#[a-z0-9-]+)?)/gi;

function Inline({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  const out: ReactNode[] = [];
  // **bold** is the only emphasis honoured; stray asterisks are dropped.
  text.split(/(\*\*[^*]+\*\*)/g).forEach((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      out.push(<strong key={`b${i}`}>{part.slice(2, -2)}</strong>);
      return;
    }
    const clean = part.replace(/\*\*/g, "");
    let last = 0;
    for (const m of clean.matchAll(TOKEN)) {
      const at = m.index ?? 0;
      const lead = m[2] ?? "";
      out.push(clean.slice(last, at) + lead);
      if (m[1]) {
        out.push(
          <a key={`e${i}-${at}`} href={`mailto:${m[1]}`} className="chat-link">
            {m[1]}
          </a>,
        );
      } else if (m[3]) {
        out.push(
          <Link key={`p${i}-${at}`} href={m[3]} className="chat-link" onClick={onNavigate}>
            {m[3]}
          </Link>,
        );
      }
      last = at + m[0].length;
    }
    out.push(clean.slice(last));
  });
  return <>{out.map((n, i) => (typeof n === "string" ? <Fragment key={`t${i}`}>{n}</Fragment> : n))}</>;
}

/** Paragraphs and simple lists, built as elements. Never HTML from the model. */
function Reply({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flushPara = () => {
    if (!para.length) return;
    const linesOf = para;
    blocks.push(
      <p key={`p${blocks.length}`}>
        {linesOf.map((l, i) => (
          <Fragment key={i}>
            {i > 0 ? <br /> : null}
            <Inline text={l} onNavigate={onNavigate} />
          </Fragment>
        ))}
      </p>,
    );
    para = [];
  };
  const flushList = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    blocks.push(
      <Tag key={`l${blocks.length}`}>
        {list.items.map((item, i) => (
          <li key={i}>
            <Inline text={item} onNavigate={onNavigate} />
          </li>
        ))}
      </Tag>,
    );
    list = null;
  };
  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushPara();
      flushList();
      continue;
    }
    const m = LIST_ITEM.exec(line);
    if (m) {
      flushPara();
      const ordered = Boolean(m[1]);
      if (list && list.ordered !== ordered) flushList();
      if (!list) list = { ordered, items: [] };
      list.items.push(m[2]);
    } else {
      flushList();
      para.push(line.replace(/^#+\s+/, ""));
    }
  }
  flushPara();
  flushList();
  return <>{blocks}</>;
}

// ---------------------------------------------------------------- icons

/** The brand spark (owner, 2026-11-07): the launcher reads as "ask us", not as a generic chat bubble. */
function BubbleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false">
      <path d="M12 2.5C13 8.4 15.6 11 21.5 12 15.6 13 13 15.6 12 21.5 11 15.6 8.4 13 2.5 12 8.4 11 11 8.4 12 2.5Z" fill="currentColor" />
    </svg>
  );
}

function CloseIcon({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M12 19V5M5.5 11.5L12 5l6.5 6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---------------------------------------------------------------- widget

export function ChatWidget({ labels, suggestions, email }: { labels: ChatLabels; suggestions: string[]; email: string }) {
  const reduced = useReducedMotion();
  const titleId = useId();
  const panelId = useId();
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [live, setLive] = useState("");
  const launcherRef = useRef<HTMLButtonElement>(null);
  // Say hello once: the label shows beside the button a few seconds after the
  // page settles, for five seconds (owner, 2026-11-07). Never under reduced motion.
  const [hello, setHello] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const a = window.setTimeout(() => setHello(true), 3200);
    const b = window.setTimeout(() => setHello(false), 8200);
    return () => { window.clearTimeout(a); window.clearTimeout(b); };
  }, []);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Msg[]>([]);
  const restored = useRef(false);

  const fill = useCallback((s: string, extra?: Record<string, string>) => {
    let out = s.replace(/\{email\}/g, email);
    for (const [k, v] of Object.entries(extra ?? {})) out = out.replace(new RegExp(`\\{${k}\\}`, "g"), v);
    return out;
  }, [email]);

  // Restore after mount so the server render and the first client render match.
  useEffect(() => {
    const m = load();
    messagesRef.current = m;
    setMessages(m);
    restored.current = true;
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
    if (restored.current && !busy) save(messages);
  }, [messages, busy]);

  // Keep the newest message in view while it streams.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy, open]);

  // Phones get a full-screen sheet; hold the page still behind it.
  useEffect(() => {
    const html = document.documentElement;
    if (open) html.setAttribute("data-chat-sheet", "");
    else html.removeAttribute("data-chat-sheet");
    return () => html.removeAttribute("data-chat-sheet");
  }, [open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  }, []);

  const openPanel = useCallback(() => {
    setOpen(true);
    // After the panel mounts.
    requestAnimationFrame(() => requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true })));
  }, []);

  const update = (id: string, fn: (m: Msg) => Msg) => setMessages((list) => list.map((m) => (m.id === id ? fn(m) : m)));

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, MAX_CHARS);
      if (!text || abortRef.current) return;
      const user: Msg = { id: newId(), role: "user", content: text };
      const reply: Msg = { id: newId(), role: "assistant", content: "" };
      const history = [...messagesRef.current.filter((m) => !m.kind), user].map(({ role, content }) => ({ role, content }));
      setMessages((list) => [...list, user, reply]);
      setInput("");
      setBusy(true);
      setLive("");

      const controller = new AbortController();
      abortRef.current = controller;
      const fail = (key: keyof ChatLabels) => {
        const message = fill(labels[key]);
        update(reply.id, (m) => ({ ...m, content: message, kind: "error" }));
        setLive(message);
      };

      let content = "";
      let leadOk = false;
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, path: window.location.pathname }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          if (res.status === 503 || data.error === "unconfigured") fail("chat.unconfigured");
          else if (data.error === "rate_limited") fail("chat.error.rateLimited");
          else if (data.error === "busy") fail("chat.error.busy");
          else fail("chat.error.generic");
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let errored = false;
        const handle = (line: string) => {
          if (!line.trim()) return;
          let ev: { type?: string; text?: string; to?: number; ok?: boolean; code?: string };
          try {
            ev = JSON.parse(line);
          } catch {
            return;
          }
          if (ev.type === "text" && typeof ev.text === "string") {
            content += ev.text;
            setSaving(false);
            update(reply.id, (m) => ({ ...m, content }));
          } else if (ev.type === "rewind" && typeof ev.to === "number") {
            content = content.slice(0, ev.to);
            update(reply.id, (m) => ({ ...m, content }));
          } else if (ev.type === "saving") {
            setSaving(true);
          } else if (ev.type === "lead") {
            setSaving(false);
            leadOk = Boolean(ev.ok);
          } else if (ev.type === "error") {
            errored = true;
            const key = ev.code === "busy" ? "chat.error.busy" : ev.code === "refused" ? "chat.error.refused" : "chat.error.generic";
            const message = fill(labels[key]);
            if (content) {
              setMessages((list) => [...list, { id: newId(), role: "assistant", content: message, kind: "error" }]);
              setLive(message);
            } else {
              fail(key);
            }
          }
        };
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n");
          buffer = parts.pop() ?? "";
          parts.forEach(handle);
        }
        handle(buffer);

        if (!content && !errored) fail("chat.error.generic");
        else if (content) setLive(content);
        if (leadOk) setMessages((list) => [...list, { id: newId(), role: "assistant", content: labels["chat.leadSaved"], kind: "note" }]);
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") {
          if (content) setMessages((list) => [...list, { id: newId(), role: "assistant", content: fill(labels["chat.error.generic"]), kind: "error" }]);
          else fail("chat.error.generic");
        }
      } finally {
        abortRef.current = null;
        setBusy(false);
        setSaving(false);
      }
    },
    [fill, labels],
  );

  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  // Any element marked data-chat-open opens the panel; data-chat-prompt also asks its question.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-chat-open]") : null;
      if (!target) return;
      e.preventDefault();
      openPanel();
      const prompt = target.getAttribute("data-chat-prompt");
      if (prompt) void sendRef.current(prompt);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [openPanel]);

  const reset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setLive("");
    inputRef.current?.focus();
  };

  const onNavigate = () => {
    if (window.matchMedia("(max-width: 640px)").matches) setOpen(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const left = MAX_CHARS - input.length;
  const last = messages[messages.length - 1];
  const waiting = busy && (!last || last.role !== "assistant" || !last.content);
  const visible = messages.filter((m) => !(m.role === "assistant" && !m.content));

  const spring = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.8 };

  return (
    <div className="chat-root">
      <AnimatePresence>
        {open ? (
          <motion.div
            key="panel"
            id={panelId}
            role="dialog"
            aria-modal="false"
            aria-labelledby={titleId}
            className="chat-panel"
            style={{ transformOrigin: "100% 100%" }}
            initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.6, y: 40, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.85, y: 24, x: 10, transition: { duration: 0.18 } }}
            transition={spring}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                close();
              }
            }}
          >
            <header className="chat-head">
              <div className="chat-head-text">
                <h2 id={titleId} className="chat-title">
                  {labels["chat.title"]}
                </h2>
                <p className="chat-status">
                  <span className="chat-dot" aria-hidden="true" />
                  {labels["chat.status"]}
                </p>
              </div>
              {messages.length ? (
                <button type="button" className="chat-reset" onClick={reset}>
                  {labels["chat.reset"]}
                </button>
              ) : null}
              <button type="button" className="chat-close" onClick={close} aria-label={labels["chat.close"]}>
                <CloseIcon />
              </button>
            </header>

            <div ref={scrollRef} className="chat-scroll" data-lenis-prevent="">
              <ul className="chat-list" aria-busy={busy || undefined}>
                <li className="chat-msg chat-msg--bot">
                  <span className="sr-only">{labels["chat.botLabel"]}: </span>
                  <div className="chat-bubble">
                    <p>{labels["chat.greeting"]}</p>
                  </div>
                </li>
                {visible.map((m) => (
                  <motion.li
                    key={m.id}
                    className={`chat-msg ${m.role === "user" ? "chat-msg--user" : "chat-msg--bot"}${m.kind ? ` chat-msg--${m.kind}` : ""}`}
                    initial={reduced ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
                  >
                    <span className="sr-only">{m.role === "user" ? labels["chat.youLabel"] : labels["chat.botLabel"]}: </span>
                    <div className="chat-bubble">
                      {m.role === "user" ? <p>{m.content}</p> : <Reply text={m.content} onNavigate={onNavigate} />}
                    </div>
                  </motion.li>
                ))}
                {waiting || saving ? (
                  <li className="chat-msg chat-msg--bot">
                    <div className="chat-bubble chat-typing">
                      <span className="chat-typing-dots" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                      {saving ? <span className="chat-typing-note">{labels["chat.saving"]}</span> : <span className="sr-only">{labels["chat.typing"]}</span>}
                    </div>
                  </li>
                ) : null}
              </ul>

              {messages.length === 0 && suggestions.length ? (
                <div className="chat-suggest">
                  <p className="chat-suggest-label" id={`${panelId}-s`}>
                    {labels["chat.suggestionsLabel"]}
                  </p>
                  <ul className="chat-chips" aria-labelledby={`${panelId}-s`}>
                    {suggestions.map((s) => (
                      <li key={s}>
                        <button type="button" className="chat-chip" onClick={() => void send(s)}>
                          {s}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <form className="chat-form" onSubmit={submit}>
              <label htmlFor={inputId} className="sr-only">
                {labels["chat.inputLabel"]}
              </label>
              <textarea
                ref={inputRef}
                id={inputId}
                className="chat-input"
                rows={1}
                value={input}
                maxLength={MAX_CHARS}
                placeholder={labels["chat.placeholder"]}
                aria-describedby={left < 150 ? `${inputId}-left` : undefined}
                onChange={(e) => {
                  setInput(e.target.value);
                  const el = e.target;
                  el.style.height = "auto";
                  el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    void send(input);
                    e.currentTarget.style.height = "auto";
                  }
                }}
              />
              <button type="submit" className="chat-send" disabled={busy || !input.trim()} aria-label={labels["chat.send"]}>
                <SendIcon />
              </button>
              {left < 150 ? (
                <p id={`${inputId}-left`} className="chat-left">
                  {fill(labels["chat.charsLeft"], { n: String(left) })}
                </p>
              ) : null}
            </form>

            <footer className="chat-foot">
              <p>
                {labels["chat.reviewPrompt"]}{" "}
                <Link href={REVIEW_HREF} className="chat-link" onClick={() => setOpen(false)}>
                  {labels["chat.reviewLink"]}
                </Link>
              </p>
              <p className="chat-note">{labels["chat.disclaimer"]}</p>
            </footer>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {live}
      </div>

      <div className="chat-launcher-wrap" data-open={open || undefined} data-hello={hello || undefined}>
        <span className="chat-launcher-label" aria-hidden="true">
          {labels["chat.launcher.label"]}
        </span>
        <Magnetic strength={0.3}>
          <button
            ref={launcherRef}
            type="button"
            className="chat-launcher"
            aria-expanded={open}
            aria-controls={open ? panelId : undefined}
            aria-label={open ? labels["chat.launcher.close"] : labels["chat.launcher.open"]}
            onClick={() => (open ? close() : openPanel())}
            onKeyDown={(e) => {
              if (e.key === "Escape" && open) close();
            }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={open ? "x" : "chat"}
                className="chat-launcher-icon"
                initial={reduced ? false : { opacity: 0, rotate: -60, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, rotate: 60, scale: 0.6 }}
                transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 30 }}
              >
                {open ? <CloseIcon size={22} /> : <BubbleIcon />}
              </motion.span>
            </AnimatePresence>
          </button>
        </Magnetic>
      </div>
    </div>
  );
}
