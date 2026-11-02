# DESIGN.md — Take the shot landing site

Direction contract for `website-v3`. A **night gallery**: the site is the wall after
closing, prints lit against near-black, typed museum labels, one red dot for a sold
collection. The app is neo-brutalist yellow-on-cream; the marketing surface is the
exhibition.

## Register

**Design is the product.** This is a brand surface: one signature, executed with
restraint everywhere else. The product UI is a serve-register surface and keeps its
own brutalist theme.

## The signature move

**Photographs are hung, not displayed.**

- the wall is near-black; prints and the full-bleed photographs are the only light
- every print sits in a dark mat with a hairline frame and a typed label: title,
  collection size, price
- a single red dot marks a sold collection — the gallery convention, with the word
  "Sold" beside it so colour is never the only signal
- the page opens and closes on full-bleed photographs under a scrim, like walking
  into and out of the room

No cards, no tilt, no doodles, no cream panels. Precision is the contrast with the
hand-drawn site it replaces.

## Palette

| Token | Value | Role |
| --- | --- | --- |
| `--paper` | `#0b0a07` | the room |
| `--surface` | `#15130d` | mats, labels, QR card |
| `--night` | `#131109` | privacy room, closer and footer base |
| `--ink` | `#f2ece0` | type, hairlines, bone |
| `--ink-2` | `rgba(242,236,224,.78)` | body copy |
| `--muted` | `rgba(242,236,224,.55)` | meta, fineprint |
| `--rule` | `rgba(242,236,224,.14)` | hairlines |
| `--rule-strong` | `rgba(242,236,224,.32)` | label rules, ghost buttons |
| `--yellow` | `#f0c020` | the app's mark: primary actions, wordmark tile |
| `--sold` | `#e04a2e` | sold dot only |

Colour rules: photographs supply the colour. Yellow is reserved for actions and the
app mark; red means sold and nothing else. No gradients except the photographic
scrims on the hero and the closer.

## Type

| Role | Face | Use |
| --- | --- | --- |
| Display | Instrument Serif (self-hosted) | headlines, plaque titles, numerals |
| Text | Instrument Sans (self-hosted, variable) | body, labels, buttons, nav |

Both faces are OFL and self-hosted in `fonts/`, so a page load makes no
third-party request — the same rule the app follows. `font-display: swap`.

## Layout

- 12-column grid, 1240px measure, hairlines instead of cards
- headings sit left and large; the supporting paragraph sits right, under its own
  short rule — never a centred section head
- the hero and the closer are full-bleed photographs with a directional scrim; the
  copy sits on the dark side so the image stays visible
- the wall breaks the grid once: 7 + 5 in the first row, 4 + 4 + 4 below
- spacing scale: sections at `--s-8`, generous, because dark space reads as room

## Motion

One orchestrated entrance: the hero image opens from the top like a shutter, then
the copy rises. Nothing else animates on scroll. Hover is reserved for links and
buttons; the header's rule appears once the page moves.

`prefers-reduced-motion: reduce` removes the entrance and forces instant state.

## Content rules

- No invented proof, logos, testimonials, stats or emoji
- Prices and collection sizes are openly labelled as example data
- One price per collection — never imply per-photo pricing
- Long explanations live in `<details>`, never as walls of copy
- Every claim must match README.md of the current release

## Do not

- Add a light surface: the room stays dark
- Add a second bold move: the wall is the only one
- Use red for anything except a sold marker
- Brighten the scrims until the photographs stop reading as photographs
