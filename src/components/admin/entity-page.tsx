import { SimpleCrud } from "@/components/admin/simple-crud";
import type { FieldDef } from "@/components/admin/entity-form";
import { getSimpleRows } from "@/lib/admin/admin-queries";
import type { EntityName } from "@/lib/admin/schemas";

type Props = {
  entity: EntityName;
  marker: string;
  heading: string;
  intro?: string;
  singular: string;
  plural: string;
  fields: FieldDef[];
  blank: Record<string, unknown>;
  featuredToggle?: boolean;
  aside?: "weightPreview";
};

/** Server wrapper for the simple CRUD screens. */
export async function EntityPage({ entity, marker, heading, intro, singular, plural, fields, blank, featuredToggle, aside }: Props) {
  const rows = await getSimpleRows(entity);
  return (
    <div className="flex flex-col gap-3 max-w-[900px]">
      <header>
        <p className="text-small text-ash max-w-none">{marker}</p>
        <h1 className="text-h2 mt-[4px]">{heading}</h1>
        {intro ? <p className="mt-1 text-body text-ash">{intro}</p> : null}
      </header>
      <SimpleCrud entity={entity} rows={rows} fields={fields} singular={singular} plural={plural} emptyState={`No ${plural} yet. Add your first one.`} blank={blank} featuredToggle={featuredToggle} aside={aside} />
    </div>
  );
}
