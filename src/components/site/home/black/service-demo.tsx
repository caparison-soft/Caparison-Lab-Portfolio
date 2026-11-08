import type { ServiceId } from "@/components/site/home/orbit/icons";

/**
 * The moving picture for each service in "What we build" until the owner sets
 * a GIF or video for it (home.orbit.<id>.media). Drawn and looped in CSS
 * (src/styles/home-services.css, .sd-*): a site scrolling, a missed call
 * turning into a booking, a job moving across the pipeline, a week of posts
 * filling in, a clip being cut, leads climbing. The words come from the
 * service's "visual" block, the same lines its orbit card uses; the numbers
 * are made up and the picture carries the example tag. Reduced motion shows
 * the finished frame. Server component.
 */
export function ServiceDemo({ id, lines, example }: { id: ServiceId; lines: string[]; example: string }) {
  const l = (i: number) => lines[i] ?? "";
  const tag = <span className="sd-tag">{example}</span>;
  switch (id) {
    case "websites":
      return (
        <div className="sd sd--web">
          <div className="sd-browser">
            <div className="sd-bar"><i /><i /><i /><span>{l(0)}</span></div>
            <div className="sd-viewport">
              <div className="sd-page">
                <div className="sd-hero">
                  <p>{l(1)}</p>
                  <span className="sd-btn">{l(2)}</span>
                </div>
                <div className="sd-tiles"><span /><span /><span /></div>
                <div className="sd-lines"><span /><span /><span /></div>
                <div className="sd-tiles sd-tiles--wide"><span /><span /></div>
              </div>
              <svg className="sd-pointer" viewBox="0 0 24 24"><path d="M3 2.5 20.5 10l-7.2 2.3L10.9 20 3 2.5Z" /></svg>
            </div>
          </div>
          {tag}
        </div>
      );
    case "automation":
      return (
        <div className="sd sd--chat">
          <div className="sd-thread">
            <span className="sd-mono sd-step" style={{ ["--s" as string]: 0 }}>{l(0)}</span>
            <span className="sd-bub sd-bub--out sd-step" style={{ ["--s" as string]: 1 }}>{l(1)}</span>
            <span className="sd-typing sd-step" style={{ ["--s" as string]: 2 }}><i /><i /><i /></span>
            <span className="sd-bub sd-bub--in sd-step" style={{ ["--s" as string]: 3 }}>{l(2)}</span>
            <span className="sd-chip sd-step" style={{ ["--s" as string]: 4 }}>{l(3)}</span>
          </div>
          {tag}
        </div>
      );
    case "crm":
      return (
        <div className="sd sd--crm">
          <span className="sd-mono">{l(0)}</span>
          <div className="sd-board">
            {[1, 2, 3, 4].map((c) => (
              <div key={c} className="sd-col">
                <b>{l(c)}</b>
                <span className="sd-card" />
                <span className="sd-card" />
              </div>
            ))}
            <span className="sd-card sd-card--moving" />
          </div>
          {tag}
        </div>
      );
    case "pipeline":
      return (
        <div className="sd sd--cal">
          <span className="sd-mono">{l(0)}</span>
          <div className="sd-week">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <div key={d}>
                <span className="sd-day">{l(d)}</span>
                <b className={d % 2 === 1 ? "sd-slot sd-slot--on" : "sd-slot"} style={{ ["--s" as string]: Math.floor(d / 2) }} />
                <b className={d === 2 || d === 6 ? "sd-slot sd-slot--on" : "sd-slot"} style={{ ["--s" as string]: 4 + Math.floor(d / 3) }} />
              </div>
            ))}
          </div>
          {tag}
        </div>
      );
    case "production":
      return (
        <div className="sd sd--film">
          <div className="sd-vf"><i /><i /><i /><i /></div>
          <span className="sd-rec">{l(1)}</span>
          <p className="sd-clip">{l(0)}</p>
          <div className="sd-timeline">
            <span style={{ width: "18%" }} />
            <span style={{ width: "30%" }} className="sd-cut" />
            <span style={{ width: "22%" }} />
            <span style={{ width: "30%" }} className="sd-cut sd-cut--2" />
            <i className="sd-playhead" />
          </div>
          {tag}
        </div>
      );
    case "ads":
      return (
        <div className="sd sd--ads">
          <span className="sd-mono">{l(0)}</span>
          <p className="sd-kpi">{l(1)}</p>
          <div className="sd-bars">
            {[22, 30, 26, 44, 52, 70, 92].map((h, i) => (
              <span key={i} style={{ ["--h" as string]: `${h}%`, ["--s" as string]: i }} />
            ))}
          </div>
          <svg className="sd-line" viewBox="0 0 320 120" preserveAspectRatio="none">
            <path d="M0 110 C60 106 100 92 150 74 S250 30 320 10" />
          </svg>
          <span className="sd-chip sd-chip--top">{l(2)}</span>
          {tag}
        </div>
      );
  }
}
