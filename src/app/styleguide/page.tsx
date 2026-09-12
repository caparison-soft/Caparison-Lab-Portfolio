import type { Metadata } from "next";
import {
  Button, Field, Input, Select, Textarea, Tag, TagList, StatusDot, DataLine, Divider,
  MediaFrame, SectionMarker, Spine, SpineIndex, Section,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

/**
 * The system, on one page. Every primitive in every state on both surfaces.
 * Focus-visible is shown statically with the .sg-focus class so it can be
 * screenshotted; hover states are live.
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

const typeScale = [
  { token: "display-xl", cls: "text-display-xl", spec: "44–84px  0.95  -0.03em  900" },
  { token: "display-l", cls: "text-display-l", spec: "36–60px  1.0  -0.025em  700" },
  { token: "h2", cls: "text-h2", spec: "28–40px  1.1  -0.02em  700" },
  { token: "h3", cls: "text-h3", spec: "26px  1.25  -0.01em  700" },
  { token: "h4", cls: "text-h4", spec: "20px  1.3  -0.005em  500" },
  { token: "body-l", cls: "text-body-l", spec: "19px  1.6  0  400" },
  { token: "body", cls: "text-body", spec: "16px  1.65  0  400" },
  { token: "small", cls: "text-small", spec: "14px  1.5  0  400" },
];

const spacing = [8, 16, 24, 40, 64, 96, 160];

const radii = [
  { token: "none", cls: "rounded-none", use: "rules, dividers, table cells, data blocks" },
  { token: "sm", cls: "rounded-sm", use: "inputs, small controls, tags" },
  { token: "lg", cls: "rounded-lg", use: "cards, panels, media frames" },
  { token: "full", cls: "rounded-full", use: "status dot and pill filters only" },
];

const indexItems = [
  { href: "#colour", label: "colour" },
  { href: "#type", label: "type" },
  { href: "#space", label: "space and radius" },
  { href: "#buttons", label: "buttons" },
  { href: "#forms", label: "forms" },
  { href: "#data", label: "data and status" },
  { href: "#structure", label: "structure" },
  { href: "#media", label: "media" },
  { href: "#motion", label: "motion" },
];

function Block({ id, marker, title, children, tone = "bone" as const }: { id: string; marker: string; title: string; children: React.ReactNode; tone?: "bone" | "paper" | "dark" }) {
  const surface = tone === "dark" ? "dark" : "light";
  return (
    <Section id={id} tone={tone} pad="base" className={tone === "bone" ? "border-t border-divider-light" : undefined}>
      <Spine sticky={false} rail={<SectionMarker surface={surface}>{marker}</SectionMarker>}>
        <h2 className="mb-3">{title}</h2>
        {children}
      </Spine>
    </Section>
  );
}

export default function StyleguidePage() {
  return (
    <main id="main">
      <style>{`.sg-focus{outline:2px solid var(--color-cobalt);outline-offset:2px}.on-dark .sg-focus{outline-color:var(--color-lime)}`}</style>

      <Section as="header" pad="tall" className="pb-4">
        <Spine
          rail={
            <SpineIndex items={indexItems.map((i, n) => ({ ...i, active: n === 0 }))} />
          }
        >
          <SectionMarker>styleguide</SectionMarker>
          <h1 className="mt-2">Every token, in one place.</h1>
          <p className="mt-3 text-body-l text-ash">
            Two families, ten colours, three radii, seven spacing steps, three durations. Thirteen primitives. Everything on the site is built from what is on this page.
          </p>
        </Spine>
      </Section>

      <Block id="colour" marker="colour" title="Palette">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-2 list-none p-0 m-0">
          {swatches.map((s) => (
            <li key={s.name} className={`${s.cls} rounded-lg p-2 border border-divider-light`}>
              <p className={`font-medium max-w-none ${s.onDark ? "text-bone" : "text-ink"}`}>{s.name}</p>
              <p className={`data max-w-none ${s.onDark ? "text-sage" : "text-ash"}`}>{s.hex}</p>
            </li>
          ))}
        </ul>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="rounded-lg p-3 bg-paper border border-divider-light">
            <p className="text-small text-ash">Light surface</p>
            <p className="mt-1">Ink for headings and body. <span className="text-ash">Ash for secondary text.</span> <a href="#colour">Cobalt for links.</a></p>
            <p className="mt-2"><StatusDot status="live" label="Lime only as a dot, or a fill with ink on top." /></p>
          </div>
          <div className="section-dark on-dark rounded-lg p-3 border border-olive-600">
            <p className="text-small muted">Dark surface</p>
            <p className="mt-1 text-bone">Bone for headings. <span className="muted">Sage for secondary text.</span> <span className="accent">Lime as text is fine here, 14.3:1.</span></p>
            <p className="mt-2"><StatusDot status="live" label="Same dot, same size." surface="dark" /></p>
          </div>
        </div>
        <p className="mt-3 text-small text-ash">Signature gradient, 135°. Logo and one decorative mark per page. Never behind text.</p>
        <div className="mt-1 h-4 rounded-lg" style={{ background: "var(--gradient-signature)" }} aria-hidden="true" />
      </Block>

      <Block id="type" marker="type" title="Type scale">
        <ul className="flex flex-col list-none p-0 m-0">
          {typeScale.map((t) => (
            <li key={t.token} className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-1 lg:gap-3 items-baseline border-b border-divider-light py-2">
              <p className="data text-ash max-w-none">{t.token}<br />{t.spec}</p>
              <p className={`${t.cls} max-w-none`}>Scoped in a week, shipped by week ten.</p>
            </li>
          ))}
          <li className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-1 lg:gap-3 items-baseline border-b border-divider-light py-2">
            <p className="data text-ash max-w-none">mono<br />13px  1.45  0.01em  400</p>
            <DataLine items={[{ value: "nexus-crm" }, { value: "$12k – 18k" }, { value: "9 wk" }, { value: "2025-06-01" }]} />
          </li>
          <li className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-1 lg:gap-3 items-baseline py-2">
            <p className="data text-ash max-w-none">mono-s<br />11px  1.4  0.02em  500</p>
            <p className="font-mono text-mono-s max-w-none">v1.4.2  2026-09-12T17:44Z  cuid_kx8</p>
          </li>
        </ul>
        <p className="mt-3 text-small text-ash">Satoshi for everything a person reads. JetBrains Mono only where the content is genuinely data. Sentence case everywhere.</p>
      </Block>

      <Block id="space" marker="space" title="Spacing and radius">
        <ul className="flex flex-col gap-1 list-none p-0 m-0">
          {spacing.map((px, i) => (
            <li key={px} className="flex items-center gap-2">
              <span className="data text-ash w-[96px]">{i + 1} = {px}px</span>
              <span className="bg-olive-400 h-1" style={{ width: px }} aria-hidden="true" />
            </li>
          ))}
        </ul>
        <p className="mt-2 text-small text-ash">8px base. The default Tailwind multiplier is disabled: only these seven values exist as utilities.</p>
        <ul className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 list-none p-0 m-0">
          {radii.map((r) => (
            <li key={r.token}>
              <div className={`${r.cls} bg-paper border border-divider-light h-4`} aria-hidden="true" />
              <p className="data mt-1 max-w-none">{r.token}</p>
              <p className="text-small text-ash max-w-none">{r.use}</p>
            </li>
          ))}
        </ul>
      </Block>

      <Block id="buttons" marker="buttons" title="Button">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="bg-bone border border-divider-light rounded-lg p-3 flex flex-col gap-2">
            <p className="text-small text-ash">On light. Rows: default, focus-visible, disabled, pending, small.</p>
            <div className="flex flex-wrap gap-2">
              <Button>Start a project</Button>
              <Button variant="secondary">See the work</Button>
              <Button variant="ghost">Cancel</Button>
              <Button variant="destructive">Delete project</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="sg-focus">Start a project</Button>
              <Button variant="secondary" className="sg-focus">See the work</Button>
              <Button variant="ghost" className="sg-focus">Cancel</Button>
              <Button variant="destructive" className="sg-focus">Delete project</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button disabled>Start a project</Button>
              <Button variant="secondary" disabled>See the work</Button>
              <Button variant="ghost" disabled>Cancel</Button>
              <Button variant="destructive" disabled>Delete project</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button pending>Send enquiry</Button>
              <Button variant="secondary" href="/styleguide#buttons">A link, as a button</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Publish</Button>
              <Button size="sm" variant="secondary">Unpublish</Button>
              <Button size="sm" variant="ghost">Discard changes</Button>
              <Button size="sm" variant="destructive">Delete</Button>
            </div>
          </div>
          <div className="section-dark on-dark rounded-lg p-3 flex flex-col gap-2">
            <p className="text-small muted">On dark. Same rows. Focus ring is lime.</p>
            <div className="flex flex-wrap gap-2">
              <Button surface="dark">Send enquiry</Button>
              <Button surface="dark" variant="secondary">All work</Button>
              <Button surface="dark" variant="ghost">Cancel</Button>
              <Button surface="dark" variant="destructive">Delete</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button surface="dark" className="sg-focus">Send enquiry</Button>
              <Button surface="dark" variant="secondary" className="sg-focus">All work</Button>
              <Button surface="dark" variant="ghost" className="sg-focus">Cancel</Button>
              <Button surface="dark" variant="destructive" className="sg-focus">Delete</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button surface="dark" disabled>Send enquiry</Button>
              <Button surface="dark" variant="secondary" disabled>All work</Button>
              <Button surface="dark" variant="ghost" disabled>Cancel</Button>
              <Button surface="dark" variant="destructive" disabled>Delete</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button surface="dark" pending>Send enquiry</Button>
              <Button surface="dark" variant="secondary" href="/work">All work</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button surface="dark" size="sm">Publish</Button>
              <Button surface="dark" size="sm" variant="secondary">Unpublish</Button>
              <Button surface="dark" size="sm" variant="ghost">Discard changes</Button>
            </div>
          </div>
        </div>
      </Block>

      <Block id="forms" marker="forms" title="Input, Select, Textarea, Field">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <form className="flex flex-col gap-3" aria-label="Light form states">
            <p className="text-small text-ash max-w-none">On light. Default, focus-visible, error, help, disabled.</p>
            <Field id="l-name" label="Name">
              <Input placeholder="Default" />
            </Field>
            <Field id="l-focus" label="Company">
              <Input defaultValue="Tarn Logistics" className="sg-focus" />
            </Field>
            <Field id="l-email" label="Email" error="Enter an email address we can reply to.">
              <Input type="email" defaultValue="not-an-email" />
            </Field>
            <Field id="l-budget" label="Budget" help="A band is enough. It sets the size of the first conversation.">
              <Select defaultValue="">
                <option value="" disabled>Choose a band</option>
                <option>Under $5k</option>
                <option>$5k – $10k</option>
                <option>$10k – $20k</option>
                <option>$20k – $50k</option>
              </Select>
            </Field>
            <Field id="l-disabled" label="Reference">
              <Input value="CL-2026-041" readOnly disabled />
            </Field>
            <Field id="l-message" label="What you’re building">
              <Textarea placeholder="A few lines is enough." />
            </Field>
            <div className="flex items-center gap-2">
              <Button type="submit">Send enquiry</Button>
              <Button type="button" variant="ghost">Cancel</Button>
            </div>
          </form>
          <form className="section-dark on-dark rounded-lg p-3 flex flex-col gap-3" aria-label="Dark form states">
            <p className="text-small muted max-w-none">On dark. Same states. Error text is the warn tone for contrast on olive.</p>
            <Field id="d-name" label="Name" surface="dark">
              <Input surface="dark" placeholder="Default" />
            </Field>
            <Field id="d-focus" label="Company" surface="dark">
              <Input surface="dark" defaultValue="Tarn Logistics" className="sg-focus" />
            </Field>
            <Field id="d-email" label="Email" surface="dark" error="Enter an email address we can reply to.">
              <Input surface="dark" type="email" defaultValue="not-an-email" />
            </Field>
            <Field id="d-timeline" label="Timeline" surface="dark" help="When you need it live, not when you want to start.">
              <Select surface="dark" defaultValue="">
                <option value="" disabled>Choose a band</option>
                <option>This month</option>
                <option>Next 1 – 3 months</option>
                <option>3 – 6 months</option>
              </Select>
            </Field>
            <Field id="d-disabled" label="Reference" surface="dark">
              <Input surface="dark" value="CL-2026-041" readOnly disabled />
            </Field>
            <Field id="d-message" label="What you’re building" surface="dark">
              <Textarea surface="dark" placeholder="A few lines is enough." />
            </Field>
            <div className="flex items-center gap-2">
              <Button type="submit" surface="dark">Send enquiry</Button>
              <Button type="button" surface="dark" variant="ghost">Cancel</Button>
            </div>
          </form>
        </div>
      </Block>

      <Block id="data" marker="data" title="Tag, DataLine, StatusDot">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="bg-bone border border-divider-light rounded-lg p-3 flex flex-col gap-3">
            <div>
              <p className="text-small text-ash">Data tags. Mono, no separators.</p>
              <TagList className="mt-1" items={["react", "next.js", "postgres", "aws", "typescript"]} />
            </div>
            <div>
              <p className="text-small text-ash">Filter pills. Selected is the lime fill.</p>
              <ul className="mt-1 flex flex-wrap gap-1 list-none p-0 m-0">
                <li><Tag variant="filter" selected href="#data">All</Tag></li>
                <li><Tag variant="filter" href="#data">Web application</Tag></li>
                <li><Tag variant="filter" href="#data">Mobile app</Tag></li>
                <li><Tag variant="filter" className="sg-focus" href="#data">Automation</Tag></li>
              </ul>
            </div>
            <div>
              <p className="text-small text-ash">DataLine, row and stack.</p>
              <DataLine className="mt-1" items={[{ label: "budget", value: "$12k – 18k" }, { label: "duration", value: "9 wk" }, { label: "team", value: "3" }, { label: "year", value: "2025" }]} />
              <DataLine className="mt-3" direction="stack" items={[{ label: "client", value: "Tarn Logistics" }, { label: "budget", value: "$12k – 18k" }]} />
            </div>
            <div>
              <p className="text-small text-ash">StatusDot. Always with a label.</p>
              <ul className="mt-1 grid grid-cols-2 gap-1 list-none p-0 m-0">
                <li><StatusDot status="live" label="Live" /></li>
                <li><StatusDot status="progress" label="In progress" /></li>
                <li><StatusDot status="draft" label="Draft" /></li>
                <li><StatusDot status="info" label="Info" /></li>
                <li><StatusDot status="warn" label="Warning" /></li>
                <li><StatusDot status="error" label="Error" /></li>
              </ul>
            </div>
          </div>
          <div className="section-dark on-dark rounded-lg p-3 flex flex-col gap-3">
            <div>
              <p className="text-small muted">Data tags on dark.</p>
              <TagList className="mt-1" surface="dark" items={["react", "next.js", "postgres", "aws", "typescript"]} />
            </div>
            <div>
              <p className="text-small muted">Filter pills on dark.</p>
              <ul className="mt-1 flex flex-wrap gap-1 list-none p-0 m-0">
                <li><Tag variant="filter" surface="dark" selected href="#data">All</Tag></li>
                <li><Tag variant="filter" surface="dark" href="#data">Web application</Tag></li>
                <li><Tag variant="filter" surface="dark" href="#data">Mobile app</Tag></li>
                <li><Tag variant="filter" surface="dark" className="sg-focus" href="#data">Automation</Tag></li>
              </ul>
            </div>
            <div>
              <p className="text-small muted">DataLine on dark.</p>
              <DataLine className="mt-1" surface="dark" items={[{ label: "budget", value: "$12k – 18k" }, { label: "duration", value: "9 wk" }, { label: "team", value: "3" }, { label: "year", value: "2025" }]} />
            </div>
            <div>
              <p className="text-small muted">StatusDot on dark.</p>
              <ul className="mt-1 grid grid-cols-2 gap-1 list-none p-0 m-0">
                <li><StatusDot surface="dark" status="live" label="Live" /></li>
                <li><StatusDot surface="dark" status="progress" label="In progress" /></li>
                <li><StatusDot surface="dark" status="draft" label="Draft" /></li>
                <li><StatusDot surface="dark" status="info" label="Info" /></li>
                <li><StatusDot surface="dark" status="warn" label="Warning" /></li>
                <li><StatusDot surface="dark" status="error" label="Error" /></li>
              </ul>
            </div>
          </div>
        </div>
      </Block>

      <Block id="structure" marker="structure" title="Spine, SectionMarker, Divider, the sheet" tone="dark">
        <p className="text-small muted max-w-none mb-3">This block is a dark section. The rail on the left is the Spine with a SectionMarker. Below: index rows on dark with the lime cursor on the active row, then the metrics sheet.</p>
        <ul className="list-none p-0 m-0 border-t border-olive-600">
          {[
            { t: "Nexus CRM", c: "Tarn Logistics", b: "$12k – 18k", d: "9 wk", active: true },
            { t: "Orbit Booking", c: "Orbit Workspaces", b: "$6k – 9k", d: "5 wk", active: false },
            { t: "Meridian patient intake", c: "Meridian Health", b: "$15k – 22k", d: "10 wk", active: false },
          ].map((r) => (
            <li key={r.t} className={`flex flex-wrap gap-x-3 gap-y-0 items-baseline py-2 px-2 border-b border-olive-600 ${r.active ? "is-active bg-olive-800" : ""}`}>
              <span className="font-medium text-bone basis-full md:basis-auto md:flex-1">{r.t} <span className="muted font-normal">{r.c}</span></span>
              <span className="data text-bone">{r.b}</span>
              <span className="data text-bone">{r.d}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-small muted max-w-none">The 2px lime left rule is the cursor: active, current, selected. Hairlines separate items in a sequence. Numbers are tabular.</p>
        <Divider surface="dark" className="my-3" />
        <div className="grid grid-cols-1 md:grid-cols-3 border border-olive-600">
          <div className="p-2 border-b md:border-b-0 md:border-r border-olive-600"><p className="font-mono text-h3 text-bone max-w-none">40%</p><p className="text-small muted max-w-none">faster quote turnaround</p></div>
          <div className="p-2 border-b md:border-b-0 md:border-r border-olive-600"><p className="font-mono text-h3 text-bone max-w-none">3.2s to 0.4s</p><p className="text-small muted max-w-none">dashboard load</p></div>
          <div className="p-2"><p className="font-mono text-h3 text-bone max-w-none">0</p><p className="text-small muted max-w-none">P1 bugs in 90 days</p></div>
        </div>
        <p className="mt-2 text-small muted max-w-none">The sheet: shared hairlines, zero gap, zero radius. Used for metrics and the capability grid.</p>
      </Block>

      <Block id="media" marker="media" title="MediaFrame">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-2">
          <MediaFrame ratio={16 / 10}>
            <img src="/brand/lockup-ink.png" alt="Caparison Lab stacked lockup, used here as a placeholder image" width={1000} height={1000} />
          </MediaFrame>
          <div className="flex flex-col gap-2">
            <MediaFrame ratio={1}>
              <img src="/brand/icon.png" alt="Caparison Lab hex mark" width={1000} height={1000} />
            </MediaFrame>
            <MediaFrame ratio={16 / 10} />
          </div>
        </div>
        <p className="mt-2 text-small text-ash">Fixed aspect ratio so nothing shifts. 12px radius, one background step, hairline border. The empty frame is the loading state.</p>
      </Block>

      <Block id="motion" marker="motion" title="Motion" tone="paper">
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 list-none p-0 m-0">
          <li className="bg-bone border border-divider-light rounded-lg p-2"><p className="data max-w-none">dur-fast 120ms</p><p className="text-small text-ash max-w-none">hover, focus, colour shifts</p></li>
          <li className="bg-bone border border-divider-light rounded-lg p-2"><p className="data max-w-none">dur-base 240ms</p><p className="text-small text-ash max-w-none">expand, collapse, tab change</p></li>
          <li className="bg-bone border border-divider-light rounded-lg p-2"><p className="data max-w-none">dur-slow 560ms</p><p className="text-small text-ash max-w-none">page transitions, hero reveal</p></li>
        </ul>
        <p className="mt-2 text-small text-ash">ease-out cubic-bezier(0.16, 1, 0.3, 1) for entrances. ease-in-out cubic-bezier(0.65, 0, 0.35, 1) for moves. Reduced motion removes every transform and opacity animation.</p>
      </Block>
    </main>
  );
}
