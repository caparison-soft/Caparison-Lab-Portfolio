import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { getChatContext } from "@/lib/chat/context";
import { createChatEnquiry, ENQUIRY_TOOL_SCHEMA, type RequestMeta } from "@/lib/chat/lead";

/**
 * The site assistant. POST { messages: [{ role, content }] } and get back a
 * newline-delimited JSON stream the widget reads as it arrives:
 *   { type: "text", text }      a piece of the reply
 *   { type: "rewind", to }      drop the reply back to `to` characters (a turn is being re-run)
 *   { type: "saving" }          the create_enquiry tool is running
 *   { type: "lead", ok }        the tool finished
 *   { type: "error", code }     busy | refused | failed
 *   { type: "done" }
 * Plain JSON with a status instead of a stream when the request never reaches
 * the model: 503 unconfigured (no API key), 429 rate_limited, 400 invalid.
 *
 * Guardrails: 1,000 characters per message, the last 12 messages of history,
 * a capped reply, 30 messages per hour per IP and a daily ceiling across all
 * visitors, both counted from `chat.message` audit rows (no message text is
 * logged). Lead capture shares the contact form's limits (src/lib/chat/lead.ts).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DEFAULT_MODEL = "claude-opus-5-5";
const MAX_INPUT_CHARS = 1000;
const MAX_HISTORY = 12;
const MAX_OUTPUT_TOKENS = 3000;
const PER_IP_PER_HOUR = 30;
const ALL_VISITORS_PER_DAY = 1000;
const MAX_TOOL_ROUNDS = 3;
const MAX_JSON_RETRIES = 2;

const body = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .min(1)
    .max(60),
  path: z.string().max(300).optional(),
});

const ENQUIRY_TOOL: Anthropic.Beta.BetaTool = {
  name: "create_enquiry",
  description:
    "Send the visitor's details to the studio team as an enquiry, so a person replies by email within one working day. Call it once, only after the visitor has asked to be contacted (or asked for the review, a quote or to start) and has given their name, email, business name and what they need. Never fill a field with a guess.",
  input_schema: ENQUIRY_TOOL_SCHEMA,
  eager_input_streaming: true,
};

function json(status: number, data: Record<string, unknown>): Response {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function requestMeta(req: Request): RequestMeta {
  const h = req.headers;
  return {
    ip: (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown",
    userAgent: h.get("user-agent"),
    referrer: h.get("referer"),
  };
}

/** Last MAX_HISTORY messages, starting on a visitor turn, empty ones dropped. */
function trimHistory(messages: { role: "user" | "assistant"; content: string }[]): Anthropic.Beta.BetaMessageParam[] {
  const kept = messages.filter((m) => m.content.trim()).slice(-MAX_HISTORY);
  while (kept.length && kept[0].role !== "user") kept.shift();
  return kept.map((m) => ({ role: m.role, content: m.content.trim() }));
}

/**
 * The assistant turn to send back with a tool result. After a mid-output
 * fallback, blocks the declined model produced before the last `fallback`
 * marker (thinking, tool calls) must not be echoed; text and everything after
 * the marker echo as they are.
 */
function echoable(content: Anthropic.Beta.BetaContentBlock[]): Anthropic.Beta.BetaContentBlock[] {
  let boundary = -1;
  content.forEach((b, i) => {
    if (b.type === "fallback") boundary = i;
  });
  if (boundary < 0) return content;
  return content.filter((b, i) => i > boundary || b.type === "text" || b.type === "fallback");
}

export async function POST(req: Request): Promise<Response> {
  // Same-origin only: the endpoint spends money, it is not a public API.
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.get("host")) return json(403, { error: "forbidden" });
    } catch {
      return json(403, { error: "forbidden" });
    }
  }

  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const { email } = await getChatContext();
    return json(503, { error: "unconfigured", email });
  }

  let parsed: z.infer<typeof body>;
  try {
    parsed = body.parse(await req.json());
  } catch {
    return json(400, { error: "invalid" });
  }
  const last = parsed.messages[parsed.messages.length - 1];
  if (last.role !== "user" || !last.content.trim() || last.content.length > MAX_INPUT_CHARS) {
    return json(400, { error: "invalid" });
  }
  const history = trimHistory(parsed.messages);
  if (!history.length) return json(400, { error: "invalid" });

  const meta = requestMeta(req);
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [byIp, everyone] = await Promise.all([
    prisma.auditLog.count({ where: { action: "chat.message", createdAt: { gte: hourAgo }, diff: { path: ["ip"], equals: meta.ip } } }),
    prisma.auditLog.count({ where: { action: "chat.message", createdAt: { gte: dayAgo } } }),
  ]);
  if (byIp >= PER_IP_PER_HOUR) {
    await logAudit({ action: "chat.rate_limited", entity: "Chat", diff: { ip: meta.ip } });
    return json(429, { error: "rate_limited" });
  }
  if (everyone >= ALL_VISITORS_PER_DAY) {
    await logAudit({ action: "chat.rate_limited", entity: "Chat", diff: { ip: meta.ip, scope: "daily" } });
    return json(429, { error: "busy" });
  }
  await logAudit({
    action: "chat.message",
    entity: "Chat",
    diff: { ip: meta.ip, turns: history.length, chars: last.content.length, path: parsed.path ?? null },
  });

  const { system } = await getChatContext();
  const model = env.CHAT_MODEL ?? DEFAULT_MODEL;
  const client = new Anthropic({ apiKey, maxRetries: 1, timeout: 55_000 });
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        } catch {
          // The visitor closed the panel or the page; nothing to send to.
        }
      };
      const messages: Anthropic.Beta.BetaMessageParam[] = [...history];
      const usage = { input: 0, output: 0, cacheRead: 0 };
      let sent = 0; // characters of reply text sent so far
      let stop: string | null = null;
      let lead: boolean | null = null;

      try {
        let jsonRetries = 0;
        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          const mark = sent;
          let message: Anthropic.Beta.BetaMessage;
          try {
            const s = client.beta.messages.stream(
              {
                model,
                max_tokens: MAX_OUTPUT_TOKENS,
                // Low effort: short, factual replies. Thinking stays adaptive (the model's default).
                output_config: { effort: "low" },
                system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
                tools: [ENQUIRY_TOOL],
                messages,
                // Server-side fallback: if the model declines on policy grounds,
                // the API re-runs the turn on its default fallback model.
                betas: ["server-side-fallback-2026-07-01"],
                fallbacks: "default",
              },
              { signal: req.signal },
            );
            let first = true;
            for await (const event of s) {
              if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
                let text = event.delta.text;
                if (first && sent > 0) text = `\n\n${text.replace(/^\s+/, "")}`;
                first = false;
                sent += text.length;
                send({ type: "text", text });
              }
            }
            message = await s.finalMessage();
            jsonRetries = 0;
          } catch (err) {
            // A tool input that is not parseable JSON (eager input streaming
            // leaves validation to us): re-run the turn, a capped number of times.
            if (err instanceof Anthropic.APIError || req.signal.aborted || jsonRetries++ >= MAX_JSON_RETRIES) throw err;
            sent = mark;
            send({ type: "rewind", to: mark });
            round--;
            continue;
          }

          usage.input += message.usage.input_tokens;
          usage.output += message.usage.output_tokens;
          usage.cacheRead += message.usage.cache_read_input_tokens ?? 0;
          stop = message.stop_reason;

          if (message.stop_reason === "refusal") {
            send({ type: "error", code: "refused" });
            break;
          }
          const content = echoable(message.content);
          const calls = content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
          // Only a turn that ended on tool_use runs its tools: a call cut off by
          // the token cap (max_tokens) can still parse as a valid partial input.
          if (message.stop_reason !== "tool_use" || calls.length === 0) break;

          const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
          for (const call of calls) {
            if (call.name !== "create_enquiry") {
              results.push({ type: "tool_result", tool_use_id: call.id, content: "Unknown tool.", is_error: true });
              continue;
            }
            if (lead === true) {
              results.push({ type: "tool_result", tool_use_id: call.id, content: "Already sent in this conversation. Do not send it again.", is_error: true });
              continue;
            }
            send({ type: "saving" });
            const r = await createChatEnquiry(call.input, meta);
            lead = r.ok;
            send({ type: "lead", ok: r.ok });
            results.push(
              r.ok
                ? { type: "tool_result", tool_use_id: call.id, content: "Sent. The team will reply by email within one working day." }
                : {
                    type: "tool_result",
                    tool_use_id: call.id,
                    is_error: true,
                    content:
                      r.reason === "invalid"
                        ? `Not sent: ${r.detail ?? "a field is missing or invalid"}. Ask the visitor for the missing or corrected detail.`
                        : r.reason === "rate_limited"
                          ? "Not sent: too many enquiries from this visitor recently. Give them the email address instead."
                          : "Not sent: a problem on our side. Apologise and give them the email address instead.",
                  },
            );
          }
          messages.push({ role: "assistant", content });
          messages.push({ role: "user", content: results });
        }
        if (stop === "max_tokens" && sent === 0) send({ type: "error", code: "failed" });
        send({ type: "done" });
      } catch (err) {
        if (!req.signal.aborted) {
          if (err instanceof Anthropic.RateLimitError || err instanceof Anthropic.InternalServerError) {
            send({ type: "error", code: "busy" });
          } else {
            console.error("chat: request failed", err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : err);
            send({ type: "error", code: "failed" });
          }
        }
      } finally {
        await logAudit({
          action: "chat.reply",
          entity: "Chat",
          diff: { ip: meta.ip, model, stop, lead, inputTokens: usage.input, outputTokens: usage.output, cacheReadTokens: usage.cacheRead },
        });
        try {
          controller.close();
        } catch {
          // Already closed by a disconnect.
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
