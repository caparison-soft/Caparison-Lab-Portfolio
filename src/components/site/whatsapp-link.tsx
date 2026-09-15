import { siWhatsapp } from "simple-icons";
import { cx } from "@/lib/cx";

/**
 * WhatsApp as the second way in, in place of a published phone number
 * (owner, 2026-09-15). The setting takes either a link pasted from the app
 * (wa.me/..., including the /qr/ invite form) or a bare number, which becomes
 * a wa.me link. Anything else renders nothing rather than a broken link.
 */
export function whatsappHref(value: string | null | undefined): string | null {
  const v = (value ?? "").trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return /\s/.test(v) ? null : v;
  const digits = v.replace(/\D/g, "");
  return digits.length >= 8 ? `https://wa.me/${digits}` : null;
}

type Props = {
  /** The raw SiteSettings.whatsapp value. */
  value: string | null | undefined;
  /** Copy row, so the label stays editable. */
  label: string;
  className?: string;
};

export function WhatsAppLink({ value, label, className }: Props) {
  const href = whatsappHref(value);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cx("inline-flex items-center gap-1 self-start no-underline transition-colors dur-fast", className)}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" focusable="false" className="shrink-0">
        <path d={siWhatsapp.path} />
      </svg>
      <span className="text-body">{label}</span>
    </a>
  );
}
