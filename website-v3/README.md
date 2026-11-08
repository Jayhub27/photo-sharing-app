# website-v3

The night-gallery landing site for Take the shot. Plain HTML, one stylesheet, one
script — no build step, no third-party requests.

```bash
npx --yes serve website-v3 -l 8080
```

- `DESIGN.md` — direction contract: palette, type, signature move, rules
- `index.html` — the page
- `privacy.html` — the privacy policy
- `404.html` — custom not-found page
- `robots.txt`, `sitemap.xml` — crawler entry points
- `styles.css` — appearance layer
- `app.js` — release links, year, sticky-header rule
- `fonts/` — Instrument Serif and Instrument Sans, self-hosted (OFL)
- `images/` — example collections (placeholder photographs)
- `vercel.json` — CSP, clean URLs and asset caching for a static deploy

Deploying this folder replaces the current landing site. Point a Vercel project at
`website-v3` and keep the same domain.
