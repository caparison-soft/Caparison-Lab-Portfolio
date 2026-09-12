"use client";
// Client component: the project editor. One react-hook-form across seven
// tabs, autosave every 20s while dirty, manual save, discard, typed delete.

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
import { checkSlug, deleteProject, saveProject } from "@/lib/admin/project-actions";
import { slugify, type ProjectInput } from "@/lib/admin/schemas";
import type { EditorData } from "@/lib/admin/admin-queries";
import { cx } from "@/lib/cx";

const TABS: TabDef[] = [
  { id: "content", label: "Content" },
  { id: "media", label: "Media" },
  { id: "details", label: "Details" },
  { id: "commercials", label: "Commercials" },
  { id: "cta", label: "CTA" },
  { id: "seo", label: "SEO" },
  { id: "publish", label: "Publish" },
];

const tabOfField: Record<string, string> = {
  title: "content", slug: "content", summary: "content", body: "content",
  categoryId: "details", tagIds: "details", clientName: "details", clientLogoUrl: "details", year: "details", teamSize: "details", liveUrl: "details", repoUrl: "details",
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

export function ProjectEditor({ data, previewToken }: { data: EditorData; previewToken: string }) {
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

  // Autosave.
  useEffect(() => {
    const t = setInterval(() => { if (formState.isDirty) start(() => save()); }, AUTOSAVE_MS);
    return () => clearInterval(t);
  }, [formState.isDirty, save]);

  // Cmd/Ctrl+S.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); start(() => save()); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => { if (formState.isDirty) e.preventDefault(); };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [formState.isDirty]);

  const metrics = useFieldArray({ control, name: "metrics" });
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
            {dirty ? <Button size="sm" variant="ghost" onClick={() => { reset(); setSaveError(null); }}>Discard changes</Button> : null}
            <Button size="sm" onClick={() => start(() => save())} pending={pending} disabled={!dirty && !saveError}>Save</Button>
          </div>
          <p role="status" aria-live="polite" className={cx("data max-w-none", saveError ? "text-status-error" : "text-ash")}>
            {saveError ? saveError : savedAt ? `saved ${clock(savedAt)}` : dirty ? "unsaved changes" : `last saved ${clock(data.updatedAt)}`}
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
              <p className="text-small text-ash mt-1 max-w-none">Use Section for the case headings (the brief, what we built). They render as markers on the page.</p>
            </div>
          </div>
        </TabPanel>

        <TabPanel id="media" active={tab} idPrefix="pe">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2 border border-divider-light rounded-lg bg-paper p-3">
              <p className="text-body text-ink max-w-none">Image and video uploads to R2 arrive in the media phase.</p>
              <p className="text-small text-ash max-w-none mt-1">
                {data.media.length === 0 ? "No media on this project yet." : `${data.media.length} media item${data.media.length === 1 ? "" : "s"} attached.`}
              </p>
            </div>
            <Field id="videoProvider" label="Video source">
              <Select {...register("videoProvider")}><option value="R2">Uploaded file</option><option value="YOUTUBE">YouTube</option><option value="VIMEO">Vimeo</option></Select>
            </Field>
            <Field id="videoUrl" label={videoProvider === "R2" ? "Video key (set by upload)" : "Video URL"} error={err("videoUrl")} help={videoProvider === "R2" ? "Filled in automatically when a video is uploaded." : "Paste the public watch URL."}>
              <Input {...register("videoUrl")} disabled={videoProvider === "R2"} />
            </Field>
          </div>
        </TabPanel>

        <TabPanel id="details" active={tab} idPrefix="pe">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field id="clientName" label="Client name" error={err("clientName")}><Input {...register("clientName")} /></Field>
            <Field id="clientLogoUrl" label="Client logo URL" error={err("clientLogoUrl")} help="Upload arrives in the media phase; a URL works now."><Input type="url" {...register("clientLogoUrl")} /></Field>
            <Field id="year" label="Year" error={err("year")}><Input type="number" min={2000} max={2100} {...register("year")} /></Field>
            <Field id="categoryId" label="Type" error={err("categoryId")}>
              <Select {...register("categoryId")}><option value="">None</option>{data.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
            </Field>
            <div className="md:col-span-2">
              <Controller control={control} name="tagIds" render={({ field }) => <TagPicker tags={data.tags} value={field.value ?? []} onChange={field.onChange} />} />
            </div>
            <Field id="teamSize" label="Team size" error={err("teamSize")}><Input type="number" min={1} max={50} {...register("teamSize")} /></Field>
            <div />
            <Field id="liveUrl" label="Live URL" error={err("liveUrl")}><Input type="url" {...register("liveUrl")} /></Field>
            <Field id="repoUrl" label="Repository URL" error={err("repoUrl")}><Input type="url" {...register("repoUrl")} /></Field>
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
                <Button type="button" size="sm" variant="secondary" onClick={() => metrics.append({ label: "", value: "", note: "" })}>Add metric</Button>
              </div>
              {metrics.fields.length === 0 ? <p className="text-small text-ash py-2">No metrics yet. Add the numbers a client would want.</p> : null}
              <SortableList
                items={metrics.fields.map((f) => ({ id: f.id }))}
                onReorder={(ids) => { const order = ids.map((id) => metrics.fields.findIndex((f) => f.id === id)); const next = order.map((i) => getValues(`metrics.${i}`)).filter((m): m is { label: string; value: string; note: string } => Boolean(m)); metrics.replace(next); }}
                itemClassName="py-1"
                renderItem={(item, handle) => {
                  const i = metrics.fields.findIndex((f) => f.id === item.id);
                  return (
                    <div className="grid grid-cols-[24px_1fr_1fr_1.5fr_auto] gap-2 items-end">
                      <span className="pb-2">{handle}</span>
                      <Field id={`metric-value-${i}`} label="Value"><Input {...register(`metrics.${i}.value`)} className="font-mono text-mono" /></Field>
                      <Field id={`metric-label-${i}`} label="Label"><Input {...register(`metrics.${i}.label`)} /></Field>
                      <Field id={`metric-note-${i}`} label="Note"><Input {...register(`metrics.${i}.note`)} /></Field>
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
            <Field id="status" label="Status" help="Publishing revalidates the public site."><Select {...register("status")}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></Select></Field>
            <Field id="publishedAt" label="Publish date" help="Set automatically on first publish if empty."><Input type="date" {...register("publishedAt")} /></Field>
            <label className="inline-flex items-center gap-1 text-small"><input type="checkbox" {...register("featured")} className="w-2 h-2 accent-[#D6F631]" />Featured on the homepage</label>
            <label className="inline-flex items-center gap-1 text-small"><input type="checkbox" {...register("currentlyBuilding")} className="w-2 h-2 accent-[#D6F631]" />Currently building (shown in the hero strip)</label>
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
