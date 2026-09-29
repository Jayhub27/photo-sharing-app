# Contributing

Thanks for taking a look at **Take the shot** — a self-hostable photo sharing and selling app.

## Getting started

```bash
npm install
cp server/.env.example server/.env   # fill in Supabase + optional Stripe values
cp app/.env.example app/.env         # only needed for the Expo app
npm run server                       # API + web app on http://localhost:3000
```

See [docs/SELF_HOSTING.md](docs/SELF_HOSTING.md) for database setup, Docker and deployment.

## Project layout

```
server/            Express + TypeScript API, server-rendered pages, SQL-less Supabase client
  src/routes.ts    Collections, photos, QR, members, import, checkout
  src/page-*.ts    Server-rendered pages (home, collection, auth)
  src/ui.ts        Shared CSS, layout, PWA plumbing
  public/          PWA manifest, service worker, icons, offline page
app/               Expo / React Native client
supabase/          schema.sql + incremental migrations
website/           Static landing page
```

## Before you open a pull request

```bash
npm run build --workspace server      # TypeScript build must pass
npx tsc --noEmit -p app/tsconfig.json # Mobile app typecheck must pass
```

CI runs the same two commands on every pull request.

## Guidelines

- Keep the web app dependency-free: pages are server-rendered with inline CSS/JS. Prefer small additions to `server/src/ui.ts` over new client libraries.
- Mobile-first: test at 360-430 px width. Touch targets should be at least 44 px.
- Never log or commit secrets. `.env` files are gitignored; use the `.env.example` files as the source of truth for configuration.
- Keep the storage bucket private. Images are streamed through the API on purpose.
- One focused change per pull request, with a clear description of the behavior change.

## Reporting bugs

Open a GitHub issue with:

1. What you did and what you expected.
2. What actually happened, including error messages.
3. Whether you run the published Docker image, a local checkout, and which browser/device.
