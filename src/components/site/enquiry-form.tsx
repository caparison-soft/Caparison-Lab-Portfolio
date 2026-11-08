"use client";
// Client component: inline validation state from the server action needs
// useActionState and a pending indicator. Everything else on the page is server-rendered.

import { useActionState } from "react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { CtaButton } from "@/components/site/cta-button";
import { submitInquiry, type InquiryState } from "@/app/(site)/actions/inquiry";

export type EnquiryFormLabels = {
  name: string;
  email: string;
  company: string;
  budget: string;
  timeline: string;
  message: string;
  submit: string;
  regarding: string;
  /** "What do you need?" Only shown when projectTypes are given. */
  projectType?: string;
  /** Hint under the message box. */
  messageHelp?: string;
};

type EnquiryFormProps = {
  labels: EnquiryFormLabels;
  budgetBands: string[];
  timelineBands: string[];
  surface?: "light" | "dark";
  sourcePath: string;
  sourceProject?: { slug: string; title: string } | null;
  /** Prefix for input ids so two forms can share a page. */
  idPrefix?: string;
  /** Options for "What do you need?"; the field is left out when empty. */
  projectTypes?: string[];
  /** The option picked on arrival, e.g. the free review from ?type=review. */
  defaultProjectType?: string;
  /** The light redesign's lime button instead of the shared Button. */
  ctaStyle?: boolean;
};

const initial: InquiryState = { ok: false };

export function EnquiryForm({ labels, budgetBands, timelineBands, surface = "light", sourcePath, sourceProject, idPrefix = "enq", projectTypes = [], defaultProjectType, ctaStyle = false }: EnquiryFormProps) {
  const [state, action, pending] = useActionState(submitInquiry, initial);
  const id = (s: string) => `${idPrefix}-${s}`;
  const muted = surface === "dark" ? "text-sage" : "text-ash";
  // On the contact page the form sits on a paper card, so the fields step down to bone.
  const field = ctaStyle ? "bg-bone! h-[48px]!" : undefined;
  const area = ctaStyle ? "bg-bone!" : undefined;

  if (state.ok && state.message) {
    return (
      <div role="status" aria-live="polite" className={surface === "dark" ? "border border-olive-600 rounded-lg p-3" : "border border-divider-light bg-paper rounded-lg p-3"}>
        <p className={surface === "dark" ? "text-bone max-w-none" : "text-ink max-w-none"}>{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3" noValidate>
      {sourceProject ? (
        <p className={`text-small max-w-none ${muted}`}>
          {labels.regarding}: <span className={surface === "dark" ? "text-bone" : "text-ink"}>{sourceProject.title}</span>
        </p>
      ) : null}
      <input type="hidden" name="sourcePath" value={sourcePath} />
      <input type="hidden" name="sourceProjectSlug" value={sourceProject?.slug ?? ""} />
      {/* Honeypot: hidden from people, filled by bots. */}
      <div className="absolute w-px h-px overflow-hidden opacity-0 pointer-events-none" aria-hidden="true">
        <label htmlFor={id("website")}>Website</label>
        <input id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {projectTypes.length > 0 && labels.projectType ? (
        <Field id={id("projectType")} label={labels.projectType} surface={surface}>
          <Select name="projectType" defaultValue={defaultProjectType ?? ""} surface={surface} className={field}>
            {defaultProjectType ? null : <option value=""></option>}
            {projectTypes.map((o) => <option key={o} value={o}>{o}</option>)}
          </Select>
        </Field>
      ) : null}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field id={id("name")} label={labels.name} surface={surface} error={state.errors?.name}>
          <Input name="name" autoComplete="name" required surface={surface} className={field} />
        </Field>
        <Field id={id("email")} label={labels.email} surface={surface} error={state.errors?.email}>
          <Input name="email" type="email" autoComplete="email" required surface={surface} className={field} />
        </Field>
      </div>
      <Field id={id("company")} label={labels.company} surface={surface}>
        <Input name="company" autoComplete="organization" surface={surface} className={field} />
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field id={id("budget")} label={labels.budget} surface={surface}>
          <Select name="budgetBand" defaultValue="" surface={surface} className={field}>
            <option value=""></option>
            {budgetBands.map((b) => <option key={b} value={b}>{b}</option>)}
          </Select>
        </Field>
        <Field id={id("timeline")} label={labels.timeline} surface={surface}>
          <Select name="timelineBand" defaultValue="" surface={surface} className={field}>
            <option value=""></option>
            {timelineBands.map((b) => <option key={b} value={b}>{b}</option>)}
          </Select>
        </Field>
      </div>
      <Field id={id("message")} label={labels.message} help={labels.messageHelp} surface={surface} error={state.errors?.message}>
        <Textarea name="message" required surface={surface} className={area} />
      </Field>
      {state.errors?.form ? (
        <p role="alert" className={`text-small max-w-none ${surface === "dark" ? "text-status-warn" : "text-status-error"}`}>{state.errors.form}</p>
      ) : null}
      <div>
        {ctaStyle ? (
          <CtaButton type="submit" pending={pending}>{labels.submit}</CtaButton>
        ) : (
          <Button type="submit" surface={surface} pending={pending}>{labels.submit}</Button>
        )}
      </div>
    </form>
  );
}
