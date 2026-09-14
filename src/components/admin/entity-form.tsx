"use client";
// Client component: schema-driven form for the simple entities and settings.
// Server actions do the real validation and return field errors.

import { useState, useTransition } from "react";
import { useFieldArray, useForm, type Path } from "react-hook-form";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { MediaUploader } from "@/components/admin/media-uploader";
import { slugify } from "@/lib/admin/schemas";

const cdn = (process.env.NEXT_PUBLIC_CDN_URL ?? "").replace(/\/$/, "");

export type FieldDef = {
  name: string;
  label: string;
  /** "image": one library image; the value is the Media id and `<name>Preview` carries its URL. */
  type: "text" | "textarea" | "number" | "select" | "toggle" | "list" | "url" | "email" | "slug" | "image";
  options?: { value: string; label: string }[];
  help?: string;
  required?: boolean;
  /** For slug: the field it derives from until edited by hand. */
  slugFrom?: string;
  span?: 1 | 2;
  max?: number;
};

type Values = Record<string, unknown>;

type EntityFormProps = {
  fields: FieldDef[];
  initial: Values;
  onSubmit: (values: Values) => Promise<{ ok: true } | { ok: false; error: string; fields?: Record<string, string> }>;
  submitLabel?: string;
  onCancel?: () => void;
  idPrefix?: string;
  /** Rendered beside the form, receives live values. */
  aside?: (values: Values) => React.ReactNode;
};

function ListField({ name, label, control, register }: { name: string; label: string; control: ReturnType<typeof useForm<Values>>["control"]; register: ReturnType<typeof useForm<Values>>["register"] }) {
  const { fields, append, remove } = useFieldArray({ control, name: name as never });
  return (
    <div className="flex flex-col gap-1">
      <p className="text-small text-ash max-w-none">{label}</p>
      <ul className="list-none m-0 p-0 flex flex-col gap-1">
        {fields.map((f, i) => (
          <li key={f.id} className="flex gap-1">
            <Input {...register(`${name}.${i}` as Path<Values>)} aria-label={`${label} ${i + 1}`} />
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)} aria-label={`Remove ${label} ${i + 1}`}>Remove</Button>
          </li>
        ))}
      </ul>
      <div><Button type="button" variant="secondary" size="sm" onClick={() => append("" as never)}>Add item</Button></div>
    </div>
  );
}

export function EntityForm({ fields, initial, onSubmit, submitLabel = "Save", onCancel, idPrefix = "f", aside }: EntityFormProps) {
  const { register, handleSubmit, setError, setValue, watch, control, reset, formState: { errors, isDirty } } = useForm<Values>({ defaultValues: initial });
  const [pending, start] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [slugTouched, setSlugTouched] = useState<Record<string, boolean>>({});
  const values = watch();

  const submit = handleSubmit((v) => {
    setFormError(null);
    setSaved(false);
    start(async () => {
      const r = await onSubmit(v);
      if (r.ok) { reset(v); setSaved(true); return; }
      setFormError(r.error);
      for (const [k, msg] of Object.entries(r.fields ?? {})) setError(k as Path<Values>, { message: msg });
    });
  });

  const err = (n: string) => (errors[n]?.message as string | undefined) ?? undefined;

  return (
    <div className={aside ? "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4" : undefined}>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map((f) => {
          const id = `${idPrefix}-${f.name}`;
          const span = f.span === 2 || f.type === "textarea" || f.type === "list" || f.type === "image" ? "md:col-span-2" : "";
          if (f.type === "image") {
            const preview = String(values[`${f.name}Preview`] ?? "");
            return (
              <div key={f.name} className={`flex flex-col gap-1 ${span}`}>
                <p className="text-small text-ash max-w-none">{f.label}</p>
                {f.help ? <p className="text-small text-ash max-w-none">{f.help}</p> : null}
                <input type="hidden" {...register(f.name)} />
                {preview ? (
                  <div className="grid grid-cols-[192px_minmax(0,1fr)] gap-2 items-start">
                    <div className="aspect-[16/10] rounded-sm bg-bone border border-divider-light overflow-hidden relative">
                      <img src={preview} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                    <div><Button type="button" size="sm" variant="ghost" onClick={() => { setValue(f.name, "", { shouldDirty: true }); setValue(`${f.name}Preview`, ""); }}>Remove</Button></div>
                  </div>
                ) : null}
                <MediaUploader projectId={null} slot="GALLERY" single compact prompt={preview ? "Drop a new image to replace it." : undefined} onUploaded={(m) => { if (m.type !== "IMAGE") return; setValue(f.name, m.id, { shouldDirty: true }); setValue(`${f.name}Preview`, `${cdn}/${m.keyPrefix}/w800.webp`); }} />
                {err(f.name) ? <p role="alert" className="text-small text-status-error max-w-none">{err(f.name)}</p> : null}
              </div>
            );
          }
          if (f.type === "toggle") {
            return (
              <label key={f.name} htmlFor={id} className={`flex items-center gap-2 text-small ${span}`}>
                <input id={id} type="checkbox" {...register(f.name)} className="w-2 h-2 accent-[#D6F631]" />
                {f.label}
              </label>
            );
          }
          if (f.type === "list") return <div key={f.name} className={span}><ListField name={f.name} label={f.label} control={control} register={register} /></div>;
          if (f.type === "select") {
            return (
              <Field key={f.name} id={id} label={f.label} help={f.help} error={err(f.name)} className={span}>
                <Select {...register(f.name)}>{f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select>
              </Field>
            );
          }
          if (f.type === "textarea") {
            const len = String(values[f.name] ?? "").length;
            return (
              <Field key={f.name} id={id} label={f.max ? `${f.label} (${len}/${f.max})` : f.label} help={f.help} error={err(f.name)} className={span}>
                <Textarea {...register(f.name)} rows={4} />
              </Field>
            );
          }
          if (f.type === "slug") {
            const src = f.slugFrom ? String(values[f.slugFrom] ?? "") : "";
            return (
              <Field key={f.name} id={id} label={f.label} help={f.help ?? "Lowercase, hyphens. Fills in from the title until you edit it."} error={err(f.name)} className={span}>
                <Input
                  {...register(f.name, {
                    onChange: () => setSlugTouched((s) => ({ ...s, [f.name]: true })),
                  })}
                  onFocus={() => { if (!slugTouched[f.name] && !values[f.name] && src) setValue(f.name, slugify(src)); }}
                  onBlur={() => { if (!slugTouched[f.name] && src) setValue(f.name, slugify(src), { shouldDirty: true }); }}
                  placeholder={src ? slugify(src) : ""}
                />
              </Field>
            );
          }
          return (
            <Field key={f.name} id={id} label={f.label} help={f.help} error={err(f.name)} className={span}>
              <Input type={f.type === "number" ? "number" : f.type === "url" ? "url" : f.type === "email" ? "email" : "text"} {...register(f.name)} />
            </Field>
          );
        })}
        {formError ? <p role="alert" className="md:col-span-2 text-small text-status-error max-w-none">{formError}</p> : null}
        <div className="md:col-span-2 flex items-center gap-2">
          <Button type="submit" pending={pending}>{submitLabel}</Button>
          {onCancel ? <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button> : null}
          {saved && !isDirty ? <span role="status" className="text-small text-ash">Saved.</span> : null}
        </div>
      </form>
      {aside ? <div>{aside(values)}</div> : null}
    </div>
  );
}
