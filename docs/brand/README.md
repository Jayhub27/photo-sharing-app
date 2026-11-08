# Take the shot — brand assets

The mark combines a camera and a price tag: take the shot, then sell the original.
The wordmark uses Instrument Serif, with **shot** in italic and an amber period.

## Palette

| Token | Hex | Use |
| --- | --- | --- |
| Cream | `#F4EFE5` | Primary background |
| Espresso | `#211C15` | Ink, camera mark |
| Amber | `#E9A63A` | App icon, period, accents |
| Paper | `#FAF5EA` | Tag fill, light text |

## Files

| File | Use |
| --- | --- |
| `take-the-shot-logo.svg` | Primary horizontal lockup, transparent |
| `take-the-shot-logo-cream.png` | Presentation on cream |
| `take-the-shot-logo-dark.png` | Light-on-espresso version |
| `take-the-shot-logo-mono.png` | Single-colour print version |
| `take-the-shot-mark.svg` / `.png` | Square app icon / social avatar |
| `take-the-shot-mark-light.*` | Mark for dark backgrounds |
| `take-the-shot-mark-mono.*` | One-colour mark |
| `take-the-shot-maskable.svg` | Full-bleed maskable app icon |
| `take-the-shot-adaptive.svg` | Transparent Expo adaptive foreground |
| `take-the-shot-og.svg` | 1200×630 social card source |

The web favicon uses `server/public/icons/favicon-source.svg`, a simplified
camera that stays legible at 16px. PWA icons use `server/public/icons/icon.svg`
and `icon-maskable.svg`; run `node server/scripts/generate-icons.mjs` from
`server/` after changing either source.
