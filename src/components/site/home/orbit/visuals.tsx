import type { ServiceId } from "./icons";

/**
 * The small Emerald picture at the top of each orbit card. All text comes from
 * the service's "visual" block, one line per slot; the numbers are made up and
 * the card says so with the example tag. No stock photography: the production
 * card is a drawn camera frame and timeline, not a photo.
 */
export function ServiceVisual({ id, lines, example }: { id: ServiceId; lines: string[]; example: string }) {
  const l = (i: number) => lines[i] ?? "";
  const tag = <span className="ob-cv-tag">{example}</span>;
  switch (id) {
    case "websites":
      return (
        <div className="ob-cv">
          <div className="ob-cv-bar"><i /><i /><i /><span>{l(0)}</span></div>
          <p className="ob-cv-big">{l(1)}</p>
          <span className="ob-cv-chip">{l(2)}</span>
          {tag}
        </div>
      );
    case "automation":
      return (
        <div className="ob-cv">
          <span className="ob-cv-mono">{l(0)}</span>
          <span className="ob-cv-bub ob-cv-bub--out">{l(1)}</span>
          <span className="ob-cv-bub ob-cv-bub--in">{l(2)}</span>
          <span className="ob-cv-chip ob-cv-chip--corner">{l(3)}</span>
          {tag}
        </div>
      );
    case "crm":
      return (
        <div className="ob-cv">
          <span className="ob-cv-mono">{l(0)}</span>
          <div className="ob-cv-cols" aria-hidden="true">
            <span style={{ height: "45%" }} />
            <span style={{ height: "32%" }} />
            <span style={{ height: "62%" }} />
            <span className="is-on" style={{ height: "92%" }} />
          </div>
          <div className="ob-cv-labels"><span>{l(1)}</span><span>{l(2)}</span><span>{l(3)}</span><span>{l(4)}</span></div>
          {tag}
        </div>
      );
    case "pipeline":
      return (
        <div className="ob-cv">
          <span className="ob-cv-mono">{l(0)}</span>
          <div className="ob-cv-week">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <div key={d}>
                <b className={d === 1 || d === 3 || d === 5 ? "is-on" : undefined} />
                {l(d)}
              </div>
            ))}
          </div>
          {tag}
        </div>
      );
    case "production":
      return (
        <div className="ob-cv ob-cv--frame">
          <div className="ob-cv-vf" aria-hidden="true"><i /><i /><i /><i /></div>
          <span className="ob-cv-rec">{l(1)}</span>
          <span className="ob-cv-clip">{l(0)}</span>
          <div className="ob-cv-timeline" aria-hidden="true">
            <span style={{ width: "22%" }} />
            <span style={{ width: "34%" }} className="is-on" />
            <span style={{ width: "18%" }} />
            <span style={{ width: "26%" }} />
            <i />
          </div>
          {tag}
        </div>
      );
    case "ads":
      return (
        <div className="ob-cv">
          <span className="ob-cv-mono">{l(0)}</span>
          <p className="ob-cv-kpi">{l(1)}</p>
          <svg className="ob-cv-spark" viewBox="0 0 320 80" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 76 C60 74 100 62 150 50 S250 18 320 6 L320 80 L0 80 Z" className="ob-cv-spark-fill" />
            <path d="M0 76 C60 74 100 62 150 50 S250 18 320 6" className="ob-cv-spark-line" />
          </svg>
          <span className="ob-cv-chip ob-cv-chip--top">{l(2)}</span>
          {tag}
        </div>
      );
  }
}
