/**
 * The six service icons on the hero orbit (owner, 2026-11-07: the first set
 * of thin line icons "looked like AI slop"). Each is one solid shape in
 * currentColor with its detail knocked out, so it reads at a glance and holds
 * at small sizes: a browser holding a tiny site, a message carrying the brand
 * spark, a tile of rising bars, a calendar with slots filled, a clapperboard,
 * a megaphone.
 */
export type ServiceId = "websites" | "automation" | "crm" | "pipeline" | "production" | "ads";

export function ServiceIcon({ id }: { id: ServiceId }) {
  switch (id) {
    case "websites":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" fillRule="evenodd" d="M5 2.5h14A3 3 0 0 1 22 5.5v13a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-13a3 3 0 0 1 3-3ZM5.6 4.6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm3 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM5 8.5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1Z" />
          <rect x="6.5" y="10.6" width="9" height="2.4" rx="1.2" fill="currentColor" />
          <rect x="6.5" y="14.4" width="5.2" height="2.4" rx="1.2" fill="currentColor" />
        </svg>
      );
    case "automation":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" fillRule="evenodd" d="M5 2.5h14a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-8.2l-4.8 4v-4H5a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3Zm7 2.7c-.6 3.2-1.8 4.4-5 5 3.2.6 4.4 1.8 5 5 .6-3.2 1.8-4.4 5-5-3.2-.6-4.4-1.8-5-5Z" />
        </svg>
      );
    case "crm":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" fillRule="evenodd" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm.2 10.5a1.5 1.5 0 0 0-1.5 1.5v2.6a1.5 1.5 0 0 0 3 0V14a1.5 1.5 0 0 0-1.5-1.5Zm4.8-4a1.5 1.5 0 0 0-1.5 1.5v6.6a1.5 1.5 0 0 0 3 0V10A1.5 1.5 0 0 0 12 8.5Zm4.8-3a1.5 1.5 0 0 0-1.5 1.5v9.6a1.5 1.5 0 0 0 3 0V7a1.5 1.5 0 0 0-1.5-1.5Z" />
        </svg>
      );
    case "pipeline":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="6.2" y="1.5" width="2.6" height="5" rx="1.3" fill="currentColor" />
          <rect x="15.2" y="1.5" width="2.6" height="5" rx="1.3" fill="currentColor" />
          <path fill="currentColor" fillRule="evenodd" d="M5 4.5h14a3 3 0 0 1 3 3V19a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3Zm.5 6.3v2.9h2.9v-2.9Zm5.05 0v2.9h2.9v-2.9Zm5.05 0v2.9h2.9v-2.9Zm-10.1 4.9v2.9h2.9v-2.9Z" />
        </svg>
      );
    case "production":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" fillRule="evenodd" d="M4.5 9.5h15a2.5 2.5 0 0 1 2.5 2.5v7.5a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 19.5V12a2.5 2.5 0 0 1 2.5-2.5Zm5.6 2.9v6.2l5.2-3.1Z" />
          <path fill="currentColor" fillRule="evenodd" transform="translate(2.2 5.4) rotate(-12)" d="M1.2 0h17.6A1.2 1.2 0 0 1 20 1.2v1.6A1.2 1.2 0 0 1 18.8 4H1.2A1.2 1.2 0 0 1 0 2.8V1.2A1.2 1.2 0 0 1 1.2 0Zm3.1.7L2.7 3.3h2.4L6.7.7Zm5 0L7.7 3.3h2.4L11.7.7Zm5 0-1.6 2.6h2.4L16.7.7Z" />
        </svg>
      );
    case "ads":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M3.8 8.6H7l8.6-5a1.1 1.1 0 0 1 1.7.95v14.9a1.1 1.1 0 0 1-1.7.95L7 15.4H3.8A1.8 1.8 0 0 1 2 13.6v-3.2a1.8 1.8 0 0 1 1.8-1.8Z" />
          <path fill="currentColor" d="M7.4 16.4h3.4l1.1 4.3a1 1 0 0 1-1 1.3H9.1a1 1 0 0 1-1-.8Z" />
          <path d="M20 9.2a4 4 0 0 1 0 5.6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
  }
}
