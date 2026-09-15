"use client";
// Client component: thin wrapper so the settings action is bound on the client.

import { EntityForm } from "@/components/admin/entity-form";
import { saveSettings } from "@/lib/admin/entity-actions";

export function SettingsForm({ initial }: { initial: Record<string, unknown> }) {
  return (
    <EntityForm
      initial={initial}
      idPrefix="settings"
      onSubmit={saveSettings}
      fields={[
        { name: "siteName", label: "Site name", type: "text" },
        { name: "email", label: "Email", type: "email" },
        { name: "phone", label: "Phone", type: "text" },
        { name: "whatsapp", label: "WhatsApp link", type: "text", help: "Shown as the WhatsApp mark in the contact block. Paste the link from WhatsApp (wa.me/...), or a number. Empty hides it." },
        { name: "location", label: "Location", type: "text" },
        { name: "availabilityStatus", label: "Availability", type: "select", options: [{ value: "AVAILABLE", label: "Available" }, { value: "LIMITED", label: "Limited" }, { value: "BOOKED", label: "Booked" }], help: "Drives the dot in the hero and the contact block." },
        { name: "availabilityNote", label: "Availability note", type: "text", help: "e.g. available for Q1, 2 slots open" },
        { name: "bookingUrl", label: "Booking link", type: "url" },
        { name: "socialsGithub", label: "GitHub", type: "url" },
        { name: "socialsLinkedin", label: "LinkedIn", type: "url" },
        { name: "socialsX", label: "X", type: "url" },
        { name: "metaTitle", label: "Default meta title", type: "text", span: 2 },
        { name: "metaDescription", label: "Default meta description", type: "textarea", max: 160 },
        { name: "ogImageUrl", label: "Default social image URL", type: "url" },
        { name: "faviconUrl", label: "Favicon URL", type: "url" },
        { name: "gaId", label: "Analytics ID", type: "text" },
        { name: "analyticsEnabled", label: "Analytics enabled", type: "toggle" },
        { name: "maintenanceMode", label: "Maintenance mode (public site shows a notice)", type: "toggle" },
      ]}
    />
  );
}
