# Caparison Lab — Brand Guide
Version 1.0

---

## 1. What the brand is

Caparison Lab is a build studio. The word "Lab" is doing real work in the name: the promise is not "we make nice websites," it is "we run experiments, measure them, and ship the ones that hold." Everything in this guide follows from that.

**Positioning line (internal):** A studio that ships software and shows its work.

**Three things the identity must communicate**
1. **Engineering credibility.** Real numbers, real timelines, real stacks. Not adjectives.
2. **Precision.** Tight geometry, deliberate spacing, nothing accidental.
3. **Energy.** The lime is a signal color — it marks live things, active things, things that are running.

**Three things it must never communicate**
- Agency fluff ("digital transformation partner," "elevate your brand")
- Generic startup gloss (violet gradients, glass cards, floating 3D blobs)
- Terminal-hacker cosplay (green text on black, fake matrix rain, `>_` everywhere)

---

## 2. Logo

### Assets
| File | Use |
|---|---|
| `CaparisonLAB_logo.png` | Primary lockup, stacked. Use on light backgrounds. |
| `CaparisonLAB_logo_Black.png` | Stacked lockup, dark-surface variant. |
| `CaparisonLAB_Lattermark_Black.png` | Horizontal wordmark on light backgrounds. Default for site headers. |
| `CaparisonLAB_Lattermark_White.png` | Horizontal wordmark on dark backgrounds. |
| `CaparisonLAB_Icon.png` | Hex mark alone. Favicon, app icon, avatar, watermark. |

### Anatomy
The mark is a rounded hexagon (a nut / a node) holding a four-point spark inside a circular aperture. Read it as: **a component, and something happening inside it.** The hexagon is the engineering shell; the spark is the result.

The hexagon carries a diagonal gradient running from lime at the upper-left to near-black olive at the lower-right. **This gradient direction is fixed at 135°.** It is the single most recognisable property of the mark — do not flatten it, reverse it, or re-angle it.

### Clear space
Minimum clear space on all sides = the width of one hexagon flat (about 18% of the mark's width). Nothing enters this zone — no text, no rules, no image edges.

### Minimum sizes
- Icon alone: 24 px (below this the spark closes up; use a simplified single-colour hex)
- Horizontal wordmark: 120 px wide
- Stacked lockup: 96 px wide

### Rules
**Do**
- Use the horizontal wordmark in navigation; use the stacked lockup for covers, decks, and print
- Place the full-colour mark on `bone`, `paper`, or `olive-950` only
- Let the icon bleed off a canvas edge at very large scale as a graphic element — this is encouraged and is a core visual move for the brand
- Use the icon at ~16–20 px as an inline "node" marker in lists and timelines

**Don't**
- Recolour the hexagon gradient, or fill it with flat lime
- Add a drop shadow, outer glow, stroke, or bevel
- Rotate the mark (the hexagon's flat-top orientation is fixed)
- Stretch, condense, or re-letterspace the wordmark
- Place the mark on a busy photograph without a solid plate behind it
- Rebuild the wordmark in a substitute typeface — always use the supplied artwork

### The lime dot
The lime dot before "LAB" is a live element, not punctuation. Where the brand needs a status indicator — "available for work," "currently building," "in progress" — reuse that dot at the same scale and colour. It is the brand's smallest recognisable unit.

---

## 3. Colour

All values below are sampled from the supplied artwork or derived from it. Contrast ratios are calculated against WCAG 2.1.

### Core palette

| Token | Hex | Role |
|---|---|---|
| `lime` | `#D6F631` | The brand accent. Exact value from the logo. |
| `olive-950` | `#171B06` | Primary dark surface. This is the brand's "black." |
| `olive-800` | `#2B3110` | Raised surface on dark. Cards, panels, table rows. |
| `olive-600` | `#4A5410` | Borders and dividers on dark. |
| `olive-400` | `#8EA320` | The gradient's mid-tone. Quiet accent, chart series, hover states. |
| `bone` | `#ECEEE8` | Primary light surface. |
| `paper` | `#FAFBF7` | Raised surface on light. |
| `ink` | `#000000` | Text on light surfaces. Matches the wordmark exactly. |
| `ash` | `#5A6152` | Secondary text on light. 5.5:1 on `bone`. |
| `sage` | `#A8B09C` | Secondary text on dark. 7.8:1 on `olive-950`. |

### Support colour

| Token | Hex | Role |
|---|---|---|
| `cobalt` | `#2033A6` | Links, informational states, second data series. |

Lime and cobalt is a deliberate pairing. A single acid-green accent on a dark field is the most predictable way to dress an engineering brand, and it reads as generic. The cobalt gives the palette a second voice so lime can be reserved for genuinely active things. Use cobalt sparingly — roughly one-fifth as often as lime.

### Signature gradient
```
linear-gradient(135deg, #D6F631 0%, #8EA320 46%, #171B06 100%)
```
Reserved for: the logo, one large decorative mark per page maximum, and nothing else. Never behind text. Never on a button. Never as a section background.

### The critical accessibility rule

**Lime is never text on a light background.**

| Pair | Ratio | Verdict |
|---|---|---|
| `lime` on `bone` | 1.05 : 1 | Invisible. Never. |
| `lime` on white | 1.23 : 1 | Invisible. Never. |
| `lime` on `olive-950` | 14.3 : 1 | Excellent — primary accent use |
| `lime` on `olive-800` | 11.2 : 1 | Excellent |
| `ink` on `lime` | 14.3 : 1 | Excellent — this is the button pattern |
| `olive-400` on white | 2.8 : 1 | Large display text only |
| `cobalt` on `bone` | 8.6 : 1 | Excellent |
| `cobalt` on `lime` | 8.2 : 1 | Excellent |

So, on light surfaces lime works only as a **fill** with `ink` on top of it, or as a small non-informational graphic (the status dot, a 2 px rule, an underline). On dark surfaces lime can be text, icons, and accents freely.

### Distribution
Aim for roughly:
- 60% surface (`bone` / `paper` on light sections, `olive-950` on dark sections)
- 30% type (`ink`, `ash`, `sage`)
- 8% lime
- 2% cobalt

If lime is covering more than a tenth of the screen, the design has lost its signal.

### Light and dark
The brand is **light-primary**. The default surface is `bone`; dark sections punctuate. This is a deliberate inversion of the expected treatment — a lime-and-dark engineering studio is what everyone builds, so the studio that puts its lime on paper looks like it made a choice.

Dark sections earn their place: the work index, a single case-study hero, the footer. Not everything.

---

## 4. Typography

Two families. No more.

### Display and body — Satoshi
**Satoshi** (Fontshare, free for commercial use). A geometric grotesque whose circular bowls and clean terminals sit closest to the supplied wordmark. Used across headings and body so the page reads as one voice.

Weights in use: 400 Regular, 500 Medium, 700 Bold, 900 Black.

Fallback stack:
```css
font-family: 'Satoshi', 'Hanken Grotesk', system-ui, -apple-system, sans-serif;
```

> If Satoshi is unavailable, use **General Sans** (also Fontshare). Do not substitute Inter — it is the default of every generated interface and will cost the brand its distinctiveness. Do not substitute Poppins — too soft, and too familiar.

### Data and code — JetBrains Mono
**JetBrains Mono** (Apache 2.0). Used only where the content genuinely is code or machine data.

Legitimate uses: code samples, stack names, project IDs, budget figures, durations, timestamps, version strings, commit-style entries.

Illegitimate uses: section labels, nav items, button text, body copy, "eyebrow" text above headings. Monospace scattered over an interface as decoration is one of the clearest tells of a templated design. It must always mean *this is data*.

### Scale
A 1.25 ratio on a 16 px base, with display sizes set larger and tighter than the ratio would suggest — headlines in this brand should feel engineered, so they run tight.

| Token | Size | Line height | Tracking | Weight |
|---|---|---|---|---|
| `display-xl` | 84px / clamp to 44px | 0.95 | −0.03em | 900 |
| `display-l` | 60px / clamp to 36px | 1.0 | −0.025em | 700 |
| `h2` | 40px | 1.1 | −0.02em | 700 |
| `h3` | 26px | 1.25 | −0.01em | 700 |
| `h4` | 20px | 1.3 | −0.005em | 500 |
| `body-l` | 19px | 1.6 | 0 | 400 |
| `body` | 16px | 1.65 | 0 | 400 |
| `small` | 14px | 1.5 | 0 | 400 |
| `mono` | 13px | 1.45 | 0.01em | 400 |
| `mono-s` | 11px | 1.4 | 0.02em | 500 |

### Typographic rules
- Sentence case everywhere. No ALL-CAPS labels, no tracked-out eyebrow text.
- Body measure under 72 characters.
- Never colour or italicise a single word in a headline for emphasis. If a headline needs emphasis it needs rewriting.
- Numbers in tabular contexts use `font-variant-numeric: tabular-nums`.
- Section markers, where needed, are lowercase route-style slugs in Satoshi Medium — `work`, `capabilities`, `process`. This reads as native to software without borrowing terminal costume.

---

## 5. Layout

### Grid
12 columns, 24 px gutters, max content width 1240 px, page margin 24 px mobile / 48 px desktop.

### The spine
The brand's structural signature is an **asymmetric spine**: a narrow left rail (roughly 2 columns) carrying orientation — section marker, index, status — and a wide right column carrying content. Content is left-aligned against that spine. Centred layouts are used once per page at most, and only for a deliberate pause.

### Spacing
8 px base. Use `8, 16, 24, 40, 64, 96, 160`. Section padding varies by content weight — sections should not all be the same height. A rhythm of tall / short / tall is what stops a page feeling like a template.

### Radius
A deliberate three-step scale, not one radius on everything:
- `0` — rules, dividers, table cells, data blocks
- `4px` — inputs, small controls, tags
- `12px` — cards, panels, media frames
- `999px` — the status dot and pill-shaped filters only

### Elevation
Borders and background steps, not shadows. `1px solid` in `olive-600` on dark or `rgba(0,0,0,0.08)` on light does the work that a soft grey blur usually does, and looks built rather than floated. Reserve real shadow for genuinely overlapping UI: modals, dropdowns, toasts.

### Structural devices carry meaning
- A 2 px lime rule on the **left edge** of a block means *active / current / selected*. It is the cursor.
- Hairline dividers separate items in a sequence or list.
- Numbered markers (01 / 02 / 03) appear **only** where content is genuinely ordered — a process, a timeline. Never on a grid of capabilities.

---

## 6. Motion

**Principle: one orchestrated moment per page, then motion only in response to the person.**

Page-load: a single reveal sequence on the hero, 600–800 ms total, staggered at 60 ms. Nothing else animates on load.

Scroll: no fade-and-slide-up on every section. That pattern, repeated, is the single most recognisable signature of a generated page. If a scroll-triggered reveal is used, it is used once, on the one element worth the attention.

Interaction: motion answers an action and shows what changed. Opening, expanding, filtering, confirming, submitting.

### Tokens
| Token | Value | Use |
|---|---|---|
| `dur-fast` | 120ms | Hover, focus, colour shifts |
| `dur-base` | 240ms | Expand, collapse, tab change |
| `dur-slow` | 560ms | Page transitions, hero reveal |
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Moves and transforms |

`prefers-reduced-motion: reduce` removes all transform and opacity animation and leaves colour transitions only. This is not optional.

---

## 7. Voice

**Plain, specific, and slightly understated.** The work is the boast; the copy does not need to be.

| Instead of | Write |
|---|---|
| "We deliver cutting-edge digital solutions" | "We build web apps, and we ship them." |
| "Let's elevate your brand together" | "Tell us what you're building." |
| "Transform your business with innovative technology" | "Six weeks, three engineers, one release." |
| "Passionate about excellence" | (delete) |

### Rules
- Lead with the specific: numbers, timelines, stacks, outcomes.
- Active voice. A button says what happens: "Send enquiry," not "Submit."
- The same action keeps the same name throughout a flow. A button that says "Publish" produces a toast that says "Published."
- No exclamation marks in interface copy. No emoji in the product or the site.
- Errors explain what happened and what to do next, without apologising.
- Empty states are invitations, not apologies. "No projects yet. Add your first one." — not "Oops, nothing here!"

### Applied to this brand
- Call work "work," not "portfolio" or "showcase."
- Call services "what we build" or "capabilities," not "solutions" or "offerings."
- Give price as a band, honestly: `$4k – $8k`, not "contact for pricing."
- Give duration as a range: `6 – 8 weeks`.

---

## 8. Applied palette reference

### Light section
```
surface        bone        #ECEEE8
raised         paper       #FAFBF7
heading        ink         #000000
body           ash         #5A6152
divider                    rgba(0,0,0,0.08)
accent fill    lime        #D6F631   (with ink text on top)
link           cobalt      #2033A6
```

### Dark section
```
surface        olive-950   #171B06
raised         olive-800   #2B3110
border         olive-600   #4A5410
heading        bone        #ECEEE8
body           sage        #A8B09C
accent         lime        #D6F631
quiet accent   olive-400   #8EA320
```

### Buttons
| Variant | Surface | Text | Border | Hover |
|---|---|---|---|---|
| Primary | `lime` | `ink` | none | `olive-400`, text stays `ink` |
| Secondary (light) | transparent | `ink` | `1px ink` | fill `ink`, text `bone` |
| Secondary (dark) | transparent | `bone` | `1px olive-600` | fill `olive-800`, border `lime` |
| Ghost | transparent | `ash` / `sage` | none | text `ink` / `lime` |
| Destructive | `#8C1D18` | `#FFFFFF` | none | `#6E1712` |

Focus ring on every interactive element: `2px solid` in `cobalt` on light surfaces, `lime` on dark, with `2px` offset. Never `outline: none` without a replacement.

### Status
| State | Colour | Note |
|---|---|---|
| Live / available | `lime` `#D6F631` | The brand dot |
| In progress | `olive-400` `#8EA320` | |
| Draft | `ash` `#5A6152` | |
| Info | `cobalt` `#2033A6` | |
| Warning | `#B4740F` | |
| Error | `#8C1D18` | |

Status is never communicated by colour alone — always pair with a label.

---

## 9. Quick don't list

1. No violet, indigo, or blue-violet gradients anywhere.
2. No gradient-filled headline text.
3. No glassmorphism — no `backdrop-filter` blur cards.
4. No emoji in the interface.
5. No ALL-CAPS tracked eyebrow labels above headings.
6. No "→" appended to button and link text.
7. No meta strings joined with middle dots (`Design · Build · Ship`).
8. No tinted near-black (`#0B0B0B`, `#111`) standing in for the brand dark — use `olive-950`.
9. No monospace as decoration.
10. No identical rounded cards with identical soft grey shadows.
11. No fade-up-on-scroll on every section.
12. No stock illustration, no 3D blobs, no floating device mockups at an angle.
13. No lime text on a light background, ever.
14. No third typeface.
