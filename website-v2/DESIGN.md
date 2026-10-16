# DESIGN.md — Take the shot landing site

Direction contract for `website-v2`. The site is a photographer's working notebook:
paper, pencil rules, taped prints, handwritten prices. The app itself stays plain —
this is only the marketing surface.

## Register

**Design is the product.** This is a brand surface, so distinctiveness is the bar:
one signature, executed with restraint everywhere else. The product itself (the app,
the API) is a serve-register surface and is documented in `../docs/MOBILE.md`.

## The signature move

**The page is a notebook page.** Everything hangs off that one idea:

- wavy pencil rules separate sections instead of hairlines
- every print is taped, tilted and stamped, never a bare rectangle
- prices are handwritten labels, not UI chips
- drawings are real pencil sketches (SVG), never emoji or icon fonts

## Palette

| Token | Value | Role |
| --- | --- | --- |
| `--paper` | `#faf7f0` | page field (sketch skin) |
| `--surface` | `#fffdf7` | cards, labels, prints |
| `--ink` | `#2f2a25` | type, rules, drawn strokes |
| `--ink-soft` | `#4b443c` | body copy |
| `--muted` | `#6f675c` | secondary copy |
| `--price` | `#d93a1f` | money only: prices, sold stamp, hover |
| `--pencil-blue` | `#2f6fb5` | section 1 lead |
| `--pencil-gold` | `#c08a1e` | section 2 lead |
| `--pencil-green` | `#3f7d4f` | section 3 lead |
| `--pencil-violet` | `#6f4fa8` | section 4 lead |

Colour rules: money is the only warm accent that means something. The pencil leads
are decorative and always paired with a rule or mark, never the only signal.

## Type

| Role | Face | Use |
| --- | --- | --- |
| Display | Permanent Marker (self-hosted) | headings, labels, the sold stamp |
| Body | Architects Daughter (self-hosted) | copy, lists, buttons |

Both faces are self-hosted in `fonts/` so no third-party request leaves the page —
the same rule the app follows. `font-display: swap`.

## Shape, depth, texture

- Wobble radii (`--wob-sm`, `--wob-md`) instead of uniform rounding; frames tilt
  between -1° and 6° so nothing looks machine-placed
- One hard pencil shadow (`4px 5px 0 rgba(47,42,37,.16)`) — no soft elevation scale
- Paper grain (SVG turbulence, multiply, off below 48rem) and three colour washes
- Tape strips on labels, prints and the polaroid

### Stamps

The sold stamp goes on a print with a corner modifier, chosen so it lands away
from the subject: `stamp--tl`, `stamp--tr` (top band, usually sky), `stamp--ml`,
`stamp--mr` (beside the subject). Never centre it over the print.

### Section rules

Each section sets `--lead`, `--rule` and `--rule-size` for its wavy separator, so
the rules alternate wave shape and colour instead of repeating one rhythm:

| Section | Lead | Wave |
| --- | --- | --- |
| Selling | blue | `--doodle-wave-b`, 230px |
| Privacy | violet | `--doodle-wave-c`, 140px |
| How it works | green | `--doodle-wave-b`, 180px |
| Downloads | gold | `--doodle-squiggle`, 200px |
| Questions | red | `--doodle-wave-c`, 190px |

## Motion

One entrance per section (rise/fade, `--ease`), hover only on things you can press,
floating camera doodles drift on canvas with a `prefers-reduced-motion` opt-out.
Never animate layout properties.

## Content rules

- No invented proof, no fake logos, no emoji
- Prices, sizes and platform claims must match the current release
- Long explanations live in `<details>` disclosures, never as walls of copy
- Every section keeps one focal point; drawings sit beside the type, not behind it

## Do not

- Add another bold move: the notebook is the only one
- Introduce soft shadows, gradients or glass panels
- Recolour the leads without also checking the money accent stays unique
