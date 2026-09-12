import { SettingsForm } from "@/components/admin/settings-form";
import { getSettingsForm } from "@/lib/admin/admin-queries";

export default async function SettingsAdmin() {
  const initial = await getSettingsForm();
  return (
    <div className="flex flex-col gap-3 max-w-[900px]">
      <header>
        <p className="text-small text-ash max-w-none">settings</p>
        <h1 className="text-h2 mt-[4px]">Site settings</h1>
        <p className="mt-1 text-body text-ash">Identity, contact details, the availability dot, SEO defaults, analytics and maintenance mode.</p>
      </header>
      <SettingsForm initial={initial} />
    </div>
  );
}
