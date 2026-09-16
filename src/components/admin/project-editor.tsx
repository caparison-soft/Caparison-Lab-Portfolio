"use client";
// Client component: the project editor. One react-hook-form across seven
// tabs, autosave every 20s while a DRAFT is dirty (never a live page, never a
// publish), explicit Publish with confirmation, manual save, discard, typed delete.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Controller, useFieldArray, useForm, type Path } from "react-hook-form";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { Tabs, TabPanel, type TabDef } from "@/components/admin/tabs";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SortableList } from "@/components/admin/sortable-list";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { TagPicker } from "@/components/admin/tag-picker";
import { ProjectMedia } from "@/components/admin/project-media";
import type { ProjectMediaState } from "@/lib/admin/media-queries";
import { checkSlug, deleteProject, saveProject } from "@/lib/admin/project-actions";
import { slugify, type ProjectInput } from "@/lib/admin/schemas";
import type { EditorData } from "@/lib/admin/admin-queries";
import { cx } from "@/lib/cx";

const TABS: TabDef[] = [
  { id: "content", label: "Content" },
  { id: "media", label: "Media" },
  { id: "details", label: "Details" },
  { id: "story", label: "Story" },
  { id: "commercials", label: "Commercials" },
  { id: "cta", label: "CTA" },
  { id: "seo", label: "SEO" },
  { id: "publish", label: "Publish" },
];

const tabOfField: Record<string, string> = {
  title: "content", slug: "content", summary: "content", body: "content",
  categoryId: "details", tagIds: "details", clientName: "details", clientLogoUrl: "details", year: "details", teamSize: "details", liveUrl: "details", repoUrl: "details",
  role: "details", platforms: "details", stage: "details", launchedAt: "details", teamMemberIds: "details",
  outcome: "story", decisions: "story", phases: "story", afterNote: "story", brief: "story", whatWeBuilt: "story", storySide: "story",
  budgetMin: "commercials", budgetMax: "commercials", budgetCurrency: "commercials", budgetDisplay: "commercials", durationValue: "commercials", durationUnit: "commercials", durationDisplay: "commercials", metrics: "commercials",
  videoUrl: "media", videoProvider: "media",
  ctaMode: "cta", ctaLabel: "cta", ctaHref: "cta", ctaNote: "cta",
  metaTitle: "seo", metaDescription: "seo", ogImageUrl: "seo",
  status: "publish", featured: "publish", currentlyBuilding: "publish", buildNote: "publish", publishedAt: "publish",
};

const AUTOSAVE_MS = 20_000;

function clock(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function ProjectEditor({ data, previewToken, media }: { data: EditorData; previewToken: string; media: ProjectMediaState }) {
  const router = useRouter();
  const form = useForm<ProjectInput>({ defaultValues: data.values });
  const { register, control, watch, setValue, getValues, reset, setError, clearErrors, formState } = form;
  const [tab, setTab] = useState("content");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [errorTabs, setErrorTabs] = useState<Set<string>>(new Set());
  const [slugState, setSlugState] = useState<"idle" | "checking" | "ok" | "taken">("idle");
  const [slugTouched, setSlugTouched] = useState(data.values.slug !== slugify(data.values.title) && data.values.slug !== "untitled-project");
  const [pending, start] = useTransition();
  const savingRef = useRef(false);

  const title = watch("title");
  const slug = watch("slug");
  const summary = watch("summary");
  const ctaMode = watch("ctaMode");
  const status = watch("status");
  const metaTitle = watch("metaTitle");
  const metaDescription = watch("metaDescription");
  const videoProvider = watch("videoProvider");
  const currentlyBuilding = watch("currentlyBuilding");
  const outcome = watch("outcome");

  // Auto-slug from title until the slug is edited by hand.
  useEffect(() => {
    if (!slugTouched) setValue("slug", slugify(title ?? ""), { shouldDirty: true });
  }, [title, slugTouched, setValue]);

  // Uniqueness check, debounced.
  useEffect(() => {
    if (!slug) return;
    setSlugState("checking");
    const t = setTimeout(async () => {
      const r = await checkSlug(slug, data.id);
      setSlugState(r.available ? "ok" : "taken");
    }, 400);
    return () => clearTimeout(t);
  }, [slug, data.id]);

  const save = useCallback(async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaveError(null);
    clearErrors();
    const values = getValues();
    const r = await saveProject(data.id, values);
    savingRef.current = false;
    if (r.ok) {
      reset(values);
      setSavedAt(r.savedAt);
      setErrorTabs(new Set());
      router.refresh();
    } else {
      setSaveError(r.error);
      const tabs = new Set<string>();
      for (const [k, msg] of Object.entries(r.fields ?? {})) {
        setError(k.split(".")[0] as Path<ProjectInput>, { message: msg });
        tabs.add(tabOfField[k.split(".")[0]] ?? "content");
      }
      setErrorTabs(tabs);
      if (tabs.size > 0 && !tabs.has(tab)) setTab(Array.from(tabs)[0]);
    }
  }, [data.id, getValues, reset, setError, clearErrors, router, tab]);

  // What is saved right now, versus what the form says.
  const live = data.values.status === "PUBLISHED";
  const willPublish = status === "PUBLISHED" && !live;
  const [confirmPublish, setConfirmPublish] = useState(false);

  // Autosave: drafts only. A live page changes only when the owner presses
  // the button, and a draft never autosaves itself into Published.
  useEffect(() => {
    if (live) return;
    const t = setInterval(() => {
      if (formState.isDirty && getValues("status") === "DRAFT") start(() => save());
    }, AUTOSAVE_MS);
    return () => clearInterval(t);
  }, [formState.isDirty, live, getValues, save]);

  // Cmd/Ctrl+S. Publishing still asks first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (willPublish) setConfirmPublish(true);
        else start(() => save());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, willPublish]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => { if (formState.isDirty) e.preventDefault(); };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [formState.isDirty]);

  const metrics = useFieldArray({ control, name: "metrics" });
  const decisions = useFieldArray({ control, name: "decisions" });
  const phases = useFieldArray({ control, name: "phases" });
  const platformList = useFieldArray({ control, name: "platforms" as never });
  const err = (n: keyof ProjectInput) => (formState.errors[n]?.message as string | undefined) ?? undefined;
  const dirty = formState.isDirty;

  return (
    <div className="flex flex-col gap-3 max-w-[1100px]">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-small text-ash max-w-none">
            <Link href="/admin/projects" className="text-ash hover:text-ink no-underline">projects</Link> / {data.slug}
          </p>
          <h1 className="text-h2 mt-[4px] truncate">{title || "Untitled project"}</h1>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            {dirty && !confirmPublish ? <Button size="sm" variant="ghost" onClick={() => { reset(); setSaveError(null); }}>Discard changes</Button> : null}
            {willPublish ? (
              confirmPublish ? (
                <>
                  <span className="text-small text-ink">Put this page on the public site?</span>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmPublish(false)}>Cancel</Button>
                  <Button size="sm" onClick={() => { setConfirmPublish(false); start(() => save()); }} pending={pending}>Publish now</Button>
                </>
              ) : (
                <Button size="sm" onClick={() => setConfirmPublish(true)} pending={pending} disabled={!dirty && !saveError}>Publish</Button>
              )
            ) : (
              <Button size="sm" onClick={() => start(() => save())} pending={pending} disabled={!dirty && !saveError}>{live ? "Update live page" : "Save draft"}</Button>
            )}
          </div>
          <p role="status" aria-live="polite" suppressHydrationWarning className={cx("data max-w-none", saveError ? "text-status-error" : "text-ash")}>
            {saveError
              ? saveError
              : dirty
                ? live ? "unsaved changes, not on the site yet" : willPublish ? "not published yet" : "unsaved draft changes, autosaves"
                : savedAt
                  ? `${live ? "live, " : "draft, "}saved ${clock(savedAt)}`
                  : `${live ? "live, " : "draft, "}last saved ${clock(data.updatedAt)}`}
          </p>
        </div>
      </header>

      <Tabs tabs={TABS.map((t) => ({ ...t, error: errorTabs.has(t.id) }))} active={tab} onChange={setTab} idPrefix="pe" />

      <form onSubmit={(e) => { e.preventDefault(); start(() => save()); }} className="flex flex-col gap-3">
        <TabPanel id="content" active={tab} idPrefix="pe">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field id="title" label="Title" error={err("title")}><Input {...register("title")} /></Field>
            <Field
              id="slug"
              label="Slug"
              error={err("slug") ?? (slugState === "taken" ? "Another project already uses this slug." : undefined)}
              help={slugState === "checking" ? "Checking…" : slugState === "ok" ? "Available." : "Lowercase letters, numbers, hyphens. Fills in from the title until edited."}
            >
              <Input {...register("slug", { onChange: () => setSlugTouched(true) })} className="font-mono text-mono" />
            </Field>
            <Field id="summary" label={`Summary (${(summary ?? "").length}/160)`} error={err("summary")} className="md:col-span-2" help="One sentence. Shown in the index and as the case-page sub.">
              <Textarea {...register("summary")} rows={2} maxLength={160} />
            </Field>
            <div className="md:col-span-2">
              <p className="text-small text-ash mb-1 max-w-none">Body</p>
              <Controller control={control} name="body" render={({ field }) => <RichTextEditor value={field.value} onChange={(json) => field.onChange(json)} id="body" label="Body" />} />
              <p className="text-small text-ash mt-1 max-w-none">Older projects only. The case page reads &ldquo;The brief&rdquo; and &ldquo;What we built&rdquo; from the Story tab now, and falls back to this when both of those are empty.</p>
            </div>
          </div>
        </TabPanel>

        <TabPanel id="media" active={tab} idPrefix="pe">
          <div className="flex flex-col gap-4">
            <ProjectMedia projectId={data.id} items={media.items} coverImageId={media.coverImageId} heroMediaId={media.heroMediaId} storyImageId={media.storyImageId} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-divider-light pt-3">
              <Field id="videoProvider" label="Hero from a link" help="Uploaded hero is the default. Choose YouTube or Vimeo to embed a link at the top instead; it takes precedence over an uploaded hero. Saved with the page.">
                <Select {...register("videoProvider")}><option value="R2">Uploaded hero (above)</option><option value="YOUTUBE">YouTube</option><option value="VIMEO">Vimeo</option></Select>
              </Field>
              {videoProvider !== "R2" ? (
                <Field id="videoUrl" label="Video URL" error={err("videoUrl")} help="Paste the public watch URL.">
                  <Input {...register("videoUrl")} />
                </Field>
              ) : null}
            </div>
          </div>
        </TabPanel>

        <TabPanel id="details" active={tab} idPrefix="pe">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field id="clientName" label="Client name" error={err("clientName")}><Input {...register("clientName")} /></Field>
            <Field id="clientLogoUrl" label="Client logo URL" error={err("clientLogoUrl")} help="Upload the logo in Media, open it and press Copy URL, then paste here."><Input type="url" {...register("clientLogoUrl")} /></Field>
            <Field id="year" label="Year" error={err("year")}><Input type="number" min={2000} max={2100} {...register("year")} /></Field>
            <Field id="categoryId" label="Type" error={err("categoryId")} help={<>Add or rename types under <Link href="/admin/types" className="text-cobalt">Project types</Link>.</>}>
              <Select {...register("categoryId")}><option value="">None</option>{data.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
            </Field>
            <div className="md:col-span-2">
              <Controller control={control} name="tagIds" render={({ field }) => <TagPicker tags={data.tags} value={field.value ?? []} onChange={field.onChange} />} />
            </div>
            <Field id="teamSize" label="Team size" error={err("teamSize")}><Input type="number" min={1} max={50} {...register("teamSize")} /></Field>
            <Field id="role" label="Our part" error={err("role")} help="What the studio did, e.g. design, frontend, backend, deployment. Shown in the sidebar."><Input {...register("role")} /></Field>
            <Field id="stage" label="Status today" error={err("stage")} help="Where the product stands now. Shown in the sidebar.">
              <Select {...register("stage")}><option value="">Not shown</option><option value="LIVE">Live</option><option value="BETA">In beta</option><option value="RETIRED">Retired</option></Select>
            </Field>
            <Field id="launchedAt" label="Launch date" error={err("launchedAt")} help="Shown instead of the year when set."><Input type="date" {...register("launchedAt")} /></Field>
            <div className="md:col-span-2">
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-small text-ash max-w-none">Platforms. e.g. web, macOS, Windows, iOS, Premiere Pro plugin.</p>
                <Button type="button" size="sm" variant="secondary" onClick={() => platformList.append("" as never)}>Add platform</Button>
              </div>
              {platformList.fields.length === 0 ? <p className="text-small text-ash py-1">None yet.</p> : null}
              <ul className="list-none m-0 p-0 flex flex-col gap-1">
                {platformList.fields.map((f, i) => (
                  <li key={f.id} className="flex gap-1">
                    <Input {...register(`platforms.${i}` as const)} aria-label={`Platform ${i + 1}`} />
                    <Button type="button" variant="ghost" size="sm" onClick={() => platformList.remove(i)}>Remove</Button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2">
              <p className="text-small text-ash max-w-none mb-1">Who worked on it. Shown at the foot of the case page; add people in Team first.</p>
              {data.teamMembers.length === 0 ? <p className="text-small text-ash py-1">No team members yet.</p> : null}
              <Controller
                control={control}
                name="teamMemberIds"
                render={({ field }) => (
                  <ul className="list-none m-0 p-0 flex flex-wrap gap-2">
                    {data.teamMembers.map((m) => {
                      const on = (field.value ?? []).includes(m.id);
                      return (
                        <li key={m.id}>
                          <label className="inline-flex items-center gap-1 text-small border border-divider-light rounded-sm px-2 py-1 bg-paper cursor-pointer">
                            <input type="checkbox" className="w-2 h-2 accent-[#D6F631]" checked={on} onChange={(e) => field.onChange(e.target.checked ? [...(field.value ?? []), m.id] : (field.value ?? []).filter((id: string) => id !== m.id))} />
                            {m.name} <span className="text-ash">{m.role}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              />
            </div>
            <Field id="liveUrl" label="Live URL" error={err("liveUrl")}><Input type="url" {...register("liveUrl")} /></Field>
            <Field id="repoUrl" label="Repository URL" error={err("repoUrl")}><Input type="url" {...register("repoUrl")} /></Field>
          </div>
        </TabPanel>

        <TabPanel id="story" active={tab} idPrefix="pe">
          <div className="grid grid-cols-1 gap-4">
            <Field id="outcome" label={`Outcome line (${(outcome ?? "").length}/200)`} error={err("outcome")} help="One bold line under the summary: the result, with a number where you have one. e.g. 700+ assets in one Premiere panel, 4,000 editors in the first quarter.">
              <Input {...register("outcome")} maxLength={200} />
            </Field>

            {/* The story panel: two fields beside the story picture (owner, 2026-09-16). */}
            <div className="border-t border-divider-light pt-3">
              <p className="text-small text-ash max-w-none mb-2">The story panel on the case page. &ldquo;The brief&rdquo; reads straight away; &ldquo;What we built&rdquo; opens when a visitor asks for it. The picture sits in the Media tab.</p>
              <Controller control={control} name="brief" render={({ field }) => <RichTextEditor value={field.value} onChange={(json) => field.onChange(json)} id="brief" label="The brief" />} />
              <div className="mt-3">
                <Controller control={control} name="whatWeBuilt" render={({ field }) => <RichTextEditor value={field.value} onChange={(json) => field.onChange(json)} id="whatWeBuilt" label="What we built" />} />
              </div>
              <div className="mt-3 max-w-[280px]">
                <Field id="storySide" label="Picture side" error={err("storySide")} help="Which side of the story panel the picture sits on.">
                  <Select {...register("storySide")}>
                    <option value="LEFT">Left</option>
                    <option value="RIGHT">Right</option>
                  </Select>
                </Field>
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-small text-ash max-w-none">Key decisions. Two or three: what you chose and why. Drag to reorder.</p>
                <Button type="button" size="sm" variant="secondary" onClick={() => decisions.append({ title: "", reason: "" })}>Add decision</Button>
              </div>
              {decisions.fields.length === 0 ? <p className="text-small text-ash py-2">None yet. e.g. &ldquo;A Premiere panel, not a separate app&rdquo; because editors never leave the timeline.</p> : null}
              <SortableList
                items={decisions.fields.map((f) => ({ id: f.id }))}
                onReorder={(ids) => { const order = ids.map((id) => decisions.fields.findIndex((f) => f.id === id)); const next = order.map((i) => getValues(`decisions.${i}`)).filter((d): d is { title: string; reason: string } => Boolean(d)); decisions.replace(next); }}
                itemClassName="border-b border-divider-light"
                renderItem={(item, handle) => {
                  const i = decisions.fields.findIndex((f) => f.id === item.id);
                  return (
                    <div className="grid grid-cols-[24px_minmax(0,1fr)_minmax(0,2fr)_auto] gap-2 items-start py-2">
                      <span className="pt-3">{handle}</span>
                      <Field id={`decision-title-${i}`} label="Decision"><Input {...register(`decisions.${i}.title`)} /></Field>
                      <Field id={`decision-reason-${i}`} label="Why"><Textarea {...register(`decisions.${i}.reason`)} rows={2} /></Field>
                      <Button type="button" variant="ghost" size="sm" className="mt-4" onClick={() => decisions.remove(i)}>Remove</Button>
                    </div>
                  );
                }}
              />
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-small text-ash max-w-none">Timeline. The project&rsquo;s own steps, e.g. Scope / week 1, Beta / week 7, Launch / week 9. Drag to reorder.</p>
                <Button type="button" size="sm" variant="secondary" onClick={() => phases.append({ label: "", when: "", note: "" })}>Add step</Button>
              </div>
              {phases.fields.length === 0 ? <p className="text-small text-ash py-2">None yet.</p> : null}
              <SortableList
                items={phases.fields.map((f) => ({ id: f.id }))}
                onReorder={(ids) => { const order = ids.map((id) => phases.fields.findIndex((f) => f.id === id)); const next = order.map((i) => getValues(`phases.${i}`)).filter((f): f is { label: string; when: string; note: string } => Boolean(f)); phases.replace(next); }}
                itemClassName="border-b border-divider-light"
                renderItem={(item, handle) => {
                  const i = phases.fields.findIndex((f) => f.id === item.id);
                  return (
                    <div className="grid grid-cols-[24px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)_auto] gap-2 items-start py-2">
                      <span className="pt-3">{handle}</span>
                      <Field id={`phase-label-${i}`} label="Step"><Input {...register(`phases.${i}.label`)} /></Field>
                      <Field id={`phase-when-${i}`} label="When"><Input {...register(`phases.${i}.when`)} className="font-mono text-mono" placeholder="week 1" /></Field>
                      <Field id={`phase-note-${i}`} label="Note (optional)"><Input {...register(`phases.${i}.note`)} /></Field>
                      <Button type="button" variant="ghost" size="sm" className="mt-4" onClick={() => phases.remove(i)}>Remove</Button>
                    </div>
                  );
                }}
              />
            </div>
            <Field id="afterNote" label="Since launch" error={err("afterNote")} help="One line on what happened after, e.g. retainer since month two, v2 scoped, the client runs it themselves. Shown under the results.">
              <Input {...register("afterNote")} />
            </Field>
          </div>
        </TabPanel>

        <TabPanel id="commercials" active={tab} idPrefix="pe">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Field id="budgetMin" label="Budget min" error={err("budgetMin")}><Input type="number" min={0} step={100} {...register("budgetMin")} className="font-mono text-mono" /></Field>
            <Field id="budgetMax" label="Budget max" error={err("budgetMax")}><Input type="number" min={0} step={100} {...register("budgetMax")} className="font-mono text-mono" /></Field>
            <Field id="budgetCurrency" label="Currency" error={err("budgetCurrency")}><Input maxLength={3} {...register("budgetCurrency")} className="font-mono text-mono uppercase" /></Field>
            <Field id="budgetDisplay" label="Display override" error={err("budgetDisplay")} help="Shown instead of the computed band, e.g. $12k – 18k"><Input {...register("budgetDisplay")} className="font-mono text-mono" /></Field>
            <Field id="durationValue" label="Duration" error={err("durationValue")}><Input type="number" min={1} {...register("durationValue")} className="font-mono text-mono" /></Field>
            <Field id="durationUnit" label="Unit"><Select {...register("durationUnit")}><option value="DAYS">Days</option><option value="WEEKS">Weeks</option><option value="MONTHS">Months</option></Select></Field>
            <Field id="durationDisplay" label="Display override" error={err("durationDisplay")} className="md:col-span-2" help="e.g. 6 – 8 weeks"><Input {...register("durationDisplay")} className="font-mono text-mono" /></Field>
            <div className="md:col-span-4">
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-small text-ash max-w-none">Metrics. The result blocks on the case page. Drag to reorder.</p>
                <Button type="button" size="sm" variant="secondary" onClick={() => metrics.append({ label: "", value: "", note: "", period: "", source: "" })}>Add metric</Button>
              </div>
              {metrics.fields.length === 0 ? <p className="text-small text-ash py-2">No metrics yet. Add the numbers a client would want.</p> : null}
              <SortableList
                items={metrics.fields.map((f) => ({ id: f.id }))}
                onReorder={(ids) => { const order = ids.map((id) => metrics.fields.findIndex((f) => f.id === id)); const next = order.map((i) => getValues(`metrics.${i}`)).filter((m): m is { label: string; value: string; note: string; period: string; source: string } => Boolean(m)); metrics.replace(next); }}
                itemClassName="py-1"
                renderItem={(item, handle) => {
                  const i = metrics.fields.findIndex((f) => f.id === item.id);
                  return (
                    <div className="grid grid-cols-[24px_1fr_1fr_1.5fr_1fr_1fr_auto] gap-2 items-end">
                      <span className="pb-2">{handle}</span>
                      <Field id={`metric-value-${i}`} label="Value"><Input {...register(`metrics.${i}.value`)} className="font-mono text-mono" /></Field>
                      <Field id={`metric-label-${i}`} label="Label"><Input {...register(`metrics.${i}.label`)} /></Field>
                      <Field id={`metric-note-${i}`} label="Note"><Input {...register(`metrics.${i}.note`)} /></Field>
                      <Field id={`metric-period-${i}`} label="Period"><Input {...register(`metrics.${i}.period`)} placeholder="first 90 days" /></Field>
                      <Field id={`metric-source-${i}`} label="Measured by"><Input {...register(`metrics.${i}.source`)} placeholder="Mixpanel" /></Field>
                      <Button type="button" size="sm" variant="ghost" onClick={() => metrics.remove(i)} className="mb-[2px]">Remove</Button>
                    </div>
                  );
                }}
              />
              {err("metrics") ? <p className="text-small text-status-error max-w-none">{err("metrics")}</p> : null}
            </div>
          </div>
        </TabPanel>

        <TabPanel id="cta" active={tab} idPrefix="pe">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <fieldset className="md:col-span-2 flex flex-wrap gap-3">
              <legend className="text-small text-ash mb-1">Mode</legend>
              {[
                { v: "ENQUIRY", l: "Enquiry: pre-fills the form with this project" },
                { v: "EXTERNAL", l: "External link" },
                { v: "NONE", l: "No call to action" },
              ].map((o) => (
                <label key={o.v} className="inline-flex items-center gap-1 text-small"><input type="radio" value={o.v} {...register("ctaMode")} className="accent-[#D6F631]" />{o.l}</label>
              ))}
            </fieldset>
            {ctaMode !== "NONE" ? <Field id="ctaLabel" label="Button label" error={err("ctaLabel")} help="Leave empty for the site default."><Input {...register("ctaLabel")} /></Field> : null}
            {ctaMode === "EXTERNAL" ? <Field id="ctaHref" label="Link" error={err("ctaHref")}><Input type="url" {...register("ctaHref")} /></Field> : null}
            {ctaMode === "ENQUIRY" ? <Field id="ctaNote" label="Note" error={err("ctaNote")} className="md:col-span-2" help="One or two lines under the heading, e.g. the typical band for this kind of work."><Textarea {...register("ctaNote")} rows={2} /></Field> : null}
          </div>
        </TabPanel>

        <TabPanel id="seo" active={tab} idPrefix="pe">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-4">
            <div className="flex flex-col gap-3">
              <Field id="metaTitle" label={`Meta title (${(metaTitle ?? "").length}/60)`} error={err("metaTitle")} help="Leave empty to use the project title."><Input {...register("metaTitle")} maxLength={70} /></Field>
              <Field id="metaDescription" label={`Meta description (${(metaDescription ?? "").length}/160)`} error={err("metaDescription")} help="Leave empty to use the summary."><Textarea {...register("metaDescription")} rows={3} maxLength={170} /></Field>
              <Field id="ogImageUrl" label="Social image URL" error={err("ogImageUrl")} help="1200 by 630. Upload arrives in the media phase. Leave empty for the generated one."><Input type="url" {...register("ogImageUrl")} /></Field>
            </div>
            <div className="bg-paper border border-divider-light rounded-lg p-3 self-start">
              <p className="text-small text-ash max-w-none mb-2">Search preview</p>
              <p className="text-small text-ash max-w-none truncate">caparisonlab.com/work/{slug || "slug"}</p>
              <p className="text-body-l text-cobalt max-w-none leading-tight mt-[2px] line-clamp-1">{(metaTitle || title || "Project title").slice(0, 60)}</p>
              <p className="text-small text-ink max-w-none mt-[2px] line-clamp-2">{(metaDescription || summary || "Summary appears here.").slice(0, 160)}</p>
            </div>
          </div>
        </TabPanel>

        <TabPanel id="publish" active={tab} idPrefix="pe">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field id="status" label="Status" help="Draft and archived never show on the site. Choose Published, then press Publish at the top; live pages change only when you press Update live page."><Select {...register("status")}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></Select></Field>
            <Field id="publishedAt" label="Publish date" help="Set automatically on first publish if empty."><Input type="date" {...register("publishedAt")} /></Field>
            <label className="inline-flex items-center gap-1 text-small"><input type="checkbox" {...register("featured")} className="w-2 h-2 accent-[#D6F631]" />Featured on the homepage</label>
            <label className="inline-flex items-center gap-1 text-small"><input type="checkbox" {...register("currentlyBuilding")} className="w-2 h-2 accent-[#D6F631]" />Currently building (internal note, not shown on the site)</label>
            {currentlyBuilding ? <Field id="buildNote" label="Progress note" help="e.g. wk 4 of 7"><Input {...register("buildNote")} className="font-mono text-mono" /></Field> : <div />}
            <div className="md:col-span-2 flex flex-wrap items-center gap-2 border-t border-divider-light pt-3">
              <Button variant="secondary" size="sm" href={`/preview/${data.slug}?token=${previewToken}`} target="_blank" rel="noopener">Preview as visitor</Button>
              {status === "PUBLISHED" ? <Button variant="ghost" size="sm" href={`/work/${data.slug}`} target="_blank" rel="noopener">Open on the site</Button> : null}
              <span className="text-small text-ash">Preview shows the last saved version.</span>
            </div>
            <div className="md:col-span-2 flex items-center gap-2 border-t border-divider-light pt-3">
              <ConfirmDelete
                label="Delete project"
                expected={data.values.title}
                description="The project is hidden everywhere and its slug is kept. Restoring needs a database change."
                onConfirm={async (typed) => { const r = await deleteProject(data.id, typed); if (r.ok) router.push("/admin/projects"); return r; }}
              />
            </div>
          </div>
        </TabPanel>
      </form>
    </div>
  );
}
