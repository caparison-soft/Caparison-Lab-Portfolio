import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

/**
 * Phase 1 styleguide: every token, type size, button variant and form
 * state, rendered with plain utilities so the system can be checked before
 * pages exist. Phase 2 replaces the raw markup with the real primitives.
 */

const swatches = [
  { name: "lime", cls: "bg-lime", hex: "#D6F631", onDark: false },
  { name: "olive-950", cls: "bg-olive-950", hex: "#171B06", onDark: true },
  { name: "olive-800", cls: "bg-olive-800", hex: "#2B3110", onDark: true },
  { name: "olive-600", cls: "bg-olive-600", hex: "#4A5410", onDark: true },
  { name: "olive-400", cls: "bg-olive-400", hex: "#8EA320", onDark: false },
  { name: "bone", cls: "bg-bone", hex: "#ECEEE8", onDark: false },
  { name: "paper", cls: "bg-paper", hex: "#FAFBF7", onDark: false },
  { name: "ink", cls: "bg-ink", hex: "#000000", onDark: true },
  { name: "ash", cls: "bg-ash", hex: "#5A6152", onDark: true },
  { name: "sage", cls: "bg-sage", hex: "#A8B09C", onDark: false },
  { name: "cobalt", cls: "bg-cobalt", hex: "#2033A6", onDark: true },
];

const statuses = [
  { name: "live", cls: "bg-status-live", label: "Live / available" },
  { name: "progress", cls: "bg-status-progress", label: "In progress" },
  { name: "draft", cls: "bg-status-draft", label: "Draft" },
  { name: "info", cls: "bg-status-info", label: "Info" },
  { name: "warn", cls: "bg-status-warn", label: "Warning" },
  { name: "error", cls: "bg-status-error", label: "Error" },
];

const typeScale = [
  { token: "display-xl", cls: "text-display-xl", spec: "clamp(44–84px) / 0.95 / -0.03em / 900" },
  { token: "display-l", cls: "text-display-l", spec: "clamp(36–60px) / 1.0 / -0.025em / 700" },
  { token: "h2", cls: "text-h2", spec: "clamp(28–40px) / 1.1 / -0.02em / 700" },
  { token: "h3", cls: "text-h3", spec: "26px / 1.25 / -0.01em / 700" },
  { token: "h4", cls: "text-h4", spec: "20px / 1.3 / -0.005em / 500" },
  { token: "body-l", cls: "text-body-l", spec: "19px / 1.6 / 0 / 400" },
  { token: "body", cls: "text-body", spec: "16px / 1.65 / 0 / 400" },
  { token: "small", cls: "text-small", spec: "14px / 1.5 / 0 / 400" },
];

const spacing = [
  { token: "1", px: 8 }, { token: "2", px: 16 }, { token: "3", px: 24 }, { token: "4", px: 40 },
  { token: "5", px: 64 }, { token: "6", px: 96 }, { token: "7", px: 160 },
];

const radii = [
  { token: "none", cls: "rounded-none", use: "rules, dividers, table cells, data blocks" },
  { token: "sm", cls: "rounded-sm", use: "inputs, small controls, tags" },
  { token: "lg", cls: "rounded-lg", use: "cards, panels, media frames" },
  { token: "full", cls: "rounded-full", use: "status dot and pill filters only" },
];

const btn = "inline-flex items-center justify-center whitespace-nowrap h-[40px] px-3 rounded-sm font-medium text-body leading-none transition-colors dur-fast ease-out disabled:opacity-50 disabled:cursor-not-allowed";
const btnPrimary = `${btn} bg-lime text-ink hover:bg-olive-400`;
const btnSecondaryLight = `${btn} bg-transparent text-ink border border-ink hover:bg-ink hover:text-bone`;
const btnSecondaryDark = `${btn} bg-transparent text-bone border border-olive-600 hover:bg-olive-800 hover:border-lime`;
const btnGhostLight = `${btn} bg-transparent text-ash hover:text-ink px-2`;
const btnGhostDark = `${btn} bg-transparent text-sage hover:text-lime px-2`;
const btnDestructive = `${btn} bg-status-error text-white hover:bg-status-error-hover`;

const input = "block w-full h-[40px] px-2 rounded-sm bg-paper text-ink border border-divider-light placeholder:text-ash transition-colors dur-fast hover:border-ash disabled:opacity-50 disabled:cursor-not-allowed";
const inputError = `${input} border-status-error`;
const label = "block text-small text-ash mb-1";

function Section({ marker, title, children }: { marker: string; title: string; children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-3 py-5 border-t border-divider-light">
      <div>
        <p className="font-medium text-ash md:sticky md:top-3">{marker}</p>
      </div>
      <div>
        <h2 className="mb-3">{title}</h2>
        {children}
      </div>
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <main id="main" className="px-3 md:px-[48px] max-w-layout mx-auto">
      <header className="py-5">
        <p className="data text-ash">styleguide</p>
        <h1 className="mt-2">Every token, in one place.</h1>
        <p className="mt-3 text-body-l text-ash">
          Two families, ten colours, three radii, seven spacing steps, three durations. Everything on the site is built from what is on this page.
        </p>
      </header>

      <Section marker="colour" title="Palette">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {swatches.map((s) => (
            <li key={s.name} className={`${s.cls} rounded-lg p-2 border border-divider-light`}>
              <p className={`font-medium ${s.onDark ? "text-bone" : "text-ink"}`}>{s.name}</p>
              <p className={`data ${s.onDark ? "text-sage" : "text-ash"}`}>{s.hex}</p>
            </li>
          ))}
        </ul>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="rounded-lg p-3 bg-paper border border-divider-light">
            <p className="text-small text-ash">Light surface</p>
            <p className="mt-1">Ink for headings and body. <span className="text-ash">Ash for secondary text.</span> <a href="#colour">Cobalt for links.</a></p>
            <p className="mt-2 inline-flex items-center gap-1"><span className="status-dot" aria-hidden="true" /> Lime only as a dot or a fill with ink on top.</p>
          </div>
          <div className="section-dark rounded-lg p-3 border border-olive-600">
            <p className="text-small muted">Dark surface</p>
            <p className="mt-1 text-bone">Bone for headings. <span className="muted">Sage for secondary text.</span> <span className="accent">Lime as text is fine here, 14.3:1.</span></p>
            <p className="mt-2 inline-flex items-center gap-1 text-bone"><span className="status-dot" aria-hidden="true" /> Same dot, same size.</p>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-small text-ash mb-1">Signature gradient, 135°. Logo and one decorative mark per page, never behind text.</p>
          <div className="h-4 rounded-lg" style={{ background: "var(--gradient-signature)" }} aria-hidden="true" />
        </div>
      </Section>

      <Section marker="status" title="Status">
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {statuses.map((s) => (
            <li key={s.name} className="flex items-center gap-1 bg-paper border border-divider-light rounded-sm px-2 h-[40px]">
              <span className={`${s.cls} rounded-full`} style={{ width: 8, height: 8 }} aria-hidden="true" />
              <span className="text-small">{s.label}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-small text-ash">Status is never communicated by colour alone. The label is always present.</p>
      </Section>

      <Section marker="type" title="Type scale">
        <ul className="flex flex-col gap-3">
          {typeScale.map((t) => (
            <li key={t.token} className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 md:gap-3 items-baseline border-b border-divider-light pb-2">
              <p className="data text-ash">{t.token}<br />{t.spec}</p>
              <p className={`${t.cls} max-w-none`}>Scoped in a week, shipped by week ten.</p>
            </li>
          ))}
          <li className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 md:gap-3 items-baseline border-b border-divider-light pb-2">
            <p className="data text-ash">mono<br />13px / 1.45 / 0.01em / 400</p>
            <p className="data max-w-none">nexus-crm &nbsp; react &nbsp; postgres &nbsp; $12k – 18k &nbsp; 9 wk &nbsp; 2025-06-01</p>
          </li>
          <li className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 md:gap-3 items-baseline pb-2">
            <p className="data text-ash">mono-s<br />11px / 1.4 / 0.02em / 500</p>
            <p className="font-mono text-mono-s max-w-none">v1.4.2 &nbsp; 2026-09-12T17:44Z &nbsp; cuid_kx8...</p>
          </li>
        </ul>
        <p className="mt-3 text-small text-ash">Satoshi for everything a person reads. JetBrains Mono only where the content is genuinely data. Sentence case everywhere.</p>
      </Section>

      <Section marker="space" title="Spacing">
        <ul className="flex flex-col gap-1">
          {spacing.map((s) => (
            <li key={s.token} className="flex items-center gap-2">
              <span className="data text-ash w-[80px]">{s.token} = {s.px}px</span>
              <span className="bg-olive-400 h-1" style={{ width: s.px }} aria-hidden="true" />
            </li>
          ))}
        </ul>
        <p className="mt-2 text-small text-ash">8px base. The default Tailwind multiplier is disabled: only these seven values exist as utilities.</p>
      </Section>

      <Section marker="radius" title="Radius">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {radii.map((r) => (
            <li key={r.token}>
              <div className={`${r.cls} bg-paper border border-divider-light h-4`} aria-hidden="true" />
              <p className="data mt-1">{r.token}</p>
              <p className="text-small text-ash">{r.use}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section marker="buttons" title="Buttons">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="bg-bone border border-divider-light rounded-lg p-3 flex flex-col gap-2 items-start">
            <p className="text-small text-ash">On light</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={btnPrimary}>Start a project</button>
              <button type="button" className={btnSecondaryLight}>See the work</button>
              <button type="button" className={btnGhostLight}>Cancel</button>
              <button type="button" className={btnDestructive}>Delete project</button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={btnPrimary} disabled>Start a project</button>
              <button type="button" className={btnSecondaryLight} disabled>See the work</button>
              <button type="button" className={btnGhostLight} disabled>Cancel</button>
              <button type="button" className={btnDestructive} disabled>Delete project</button>
            </div>
            <p className="text-small text-ash">Row two is disabled. Tab through for the cobalt focus ring. Hover for the state change.</p>
          </div>
          <div className="section-dark rounded-lg p-3 flex flex-col gap-2 items-start">
            <p className="text-small muted">On dark</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={btnPrimary}>Send enquiry</button>
              <button type="button" className={btnSecondaryDark}>All work</button>
              <button type="button" className={btnGhostDark}>Cancel</button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={btnPrimary} disabled>Send enquiry</button>
              <button type="button" className={btnSecondaryDark} disabled>All work</button>
              <button type="button" className={btnGhostDark} disabled>Cancel</button>
            </div>
            <p className="text-small muted">Focus ring is lime on dark surfaces.</p>
          </div>
        </div>
      </Section>

      <Section marker="forms" title="Form states">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-[720px]" onSubmit={undefined}>
          <div>
            <label htmlFor="sg-name" className={label}>Name</label>
            <input id="sg-name" className={input} placeholder="Default" />
          </div>
          <div>
            <label htmlFor="sg-email" className={label}>Email</label>
            <input id="sg-email" className={inputError} defaultValue="not-an-email" aria-invalid="true" aria-describedby="sg-email-err" />
            <p id="sg-email-err" className="mt-1 text-small text-status-error">Enter an email address we can reply to.</p>
          </div>
          <div>
            <label htmlFor="sg-budget" className={label}>Budget</label>
            <select id="sg-budget" className={input} defaultValue="">
              <option value="" disabled>Choose a band</option>
              <option>Under $5k</option>
              <option>$5k – $10k</option>
              <option>$10k – $20k</option>
            </select>
          </div>
          <div>
            <label htmlFor="sg-disabled" className={label}>Disabled</label>
            <input id="sg-disabled" className={input} disabled value="Read only" readOnly />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="sg-message" className={label}>What you&rsquo;re building</label>
            <textarea id="sg-message" className={`${input} h-auto py-1 min-h-[120px]`} placeholder="A few lines is enough." />
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <button type="button" className={btnPrimary}>Send enquiry</button>
            <span className="text-small text-ash">Inputs are paper on bone, 4px radius, hairline border. Labels are labels, never placeholders.</span>
          </div>
        </form>
      </Section>

      <Section marker="structure" title="Structural devices">
        <ul className="flex flex-col border-t border-divider-light">
          <li className="is-active grid grid-cols-[1fr_auto_auto] gap-3 items-baseline py-2 px-2 border-b border-divider-light bg-paper">
            <span className="font-medium">Nexus CRM <span className="text-ash font-normal">Tarn Logistics</span></span>
            <span className="data">$12k – 18k</span>
            <span className="data">9 wk</span>
          </li>
          <li className="grid grid-cols-[1fr_auto_auto] gap-3 items-baseline py-2 px-2 border-b border-divider-light">
            <span className="font-medium">Orbit Booking <span className="text-ash font-normal">Orbit Workspaces</span></span>
            <span className="data">$6k – 9k</span>
            <span className="data">5 wk</span>
          </li>
          <li className="grid grid-cols-[1fr_auto_auto] gap-3 items-baseline py-2 px-2 border-b border-divider-light">
            <span className="font-medium">Meridian patient intake <span className="text-ash font-normal">Meridian Health</span></span>
            <span className="data">$15k – 22k</span>
            <span className="data">10 wk</span>
          </li>
        </ul>
        <p className="mt-2 text-small text-ash">The 2px lime left rule is the cursor: active, current, selected. Hairlines separate items in a sequence. Numbers are tabular.</p>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 border border-divider-light">
          <div className="p-2 border-b md:border-b-0 md:border-r border-divider-light"><p className="data text-h3 font-mono">40%</p><p className="text-small text-ash">faster quote turnaround</p></div>
          <div className="p-2 border-b md:border-b-0 md:border-r border-divider-light"><p className="data text-h3 font-mono">3.2s to 0.4s</p><p className="text-small text-ash">dashboard load</p></div>
          <div className="p-2"><p className="data text-h3 font-mono">0</p><p className="text-small text-ash">P1 bugs in 90 days</p></div>
        </div>
        <p className="mt-2 text-small text-ash">The sheet: shared hairlines, zero gap, zero radius. Used for metrics and the capability grid.</p>
      </Section>

      <Section marker="motion" title="Motion">
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <li className="bg-paper border border-divider-light rounded-lg p-2"><p className="data">dur-fast 120ms</p><p className="text-small text-ash">hover, focus, colour shifts</p></li>
          <li className="bg-paper border border-divider-light rounded-lg p-2"><p className="data">dur-base 240ms</p><p className="text-small text-ash">expand, collapse, tab change</p></li>
          <li className="bg-paper border border-divider-light rounded-lg p-2"><p className="data">dur-slow 560ms</p><p className="text-small text-ash">page transitions, hero reveal</p></li>
        </ul>
        <p className="mt-2 text-small text-ash">ease-out cubic-bezier(0.16, 1, 0.3, 1) for entrances. ease-in-out cubic-bezier(0.65, 0, 0.35, 1) for moves. Reduced motion removes every transform and opacity animation.</p>
      </Section>

      <div className="py-5 border-t border-divider-light" />
    </main>
  );
}
