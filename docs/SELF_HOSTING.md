# Self-hosting Take the shot

Take the shot is a single Node.js service (Express + TypeScript) backed by
Supabase for Postgres and private object storage. You can run it with the
Supabase cloud free tier, or fully self-hosted with the Supabase CLI.

The web app and the PWA (installable on Android and iOS) are served by the same
process. The Expo app is optional.

## 1. Database and storage

### Option A — Supabase cloud

1. Create a project at https://supabase.com.
2. Open the SQL editor and run all of `supabase/schema.sql`.
3. Create a **private** storage bucket named `photos` (Storage → New bucket,
   keep "Public bucket" off).
4. From Project Settings → API, note the project URL and the `service_role` key.

### Option B — self-hosted Supabase

```bash
# Requires Docker and the Supabase CLI
supabase init          # if supabase/ is not already initialized
supabase start         # starts Postgres, Storage, PostgREST and friends
supabase db reset      # applies schema.sql + supabase/migrations/*
```

`supabase status` prints the local API URL and keys. Use those in `server/.env`.
The default local storage bucket is created by the schema.

## 2. Environment

```bash
cp server/.env.example server/.env
```

| Variable | Required | Notes |
| --- | --- | --- |
| `SUPABASE_URL` | yes | `https://PROJECT.supabase.co` or `http://127.0.0.1:54321` |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Server-side only. Never expose to clients. |
| `SUPABASE_STORAGE_BUCKET` | no | Defaults to `photos` |
| `PORT` | no | Defaults to `3000` |
| `PUBLIC_BASE_URL` | in production | Used for QR codes and Open Graph links |
| `SESSION_TTL_DAYS` | no | Defaults to `30` |
| `APP_ORIGINS` | no | Extra CORS origins, comma separated |
| `STRIPE_SECRET_KEY` | to sell | Enables checkout for paid collections |
| `STRIPE_WEBHOOK_SECRET` | to sell | Endpoint: `POST /api/stripe/webhook` |
| `STRIPE_APPLICATION_FEE_PERCENT` | no | Platform fee, requires Stripe Connect |

## 3. Run

### Docker (recommended)

```bash
docker compose up --build -d
```

The service listens on `http://localhost:3000` and exposes
`GET /api/health` for health checks.

### From source

```bash
npm install
npm run build --workspace server
npm run server          # or: node server/dist/index.js
```

## 4. HTTPS and public access

Service workers (the PWA), camera capture and most browser APIs require a secure
context. Put the container behind a reverse proxy with TLS (Caddy, nginx, Traefik
or a platform like Fly.io/Render), and set `PUBLIC_BASE_URL` to that origin.

For quick tests from a phone, expose the local port with a tunnel. The web UI is
fully responsive, and "Add to Home Screen" turns it into an app-like window
without an app store install.

## 5. Stripe (selling)

1. Add `STRIPE_SECRET_KEY` and restart.
2. Add a webhook endpoint pointing at `https://your-domain.com/api/stripe/webhook`
   for `checkout.session.completed` and `checkout.session.async_payment_succeeded`,
   then put its signing secret in `STRIPE_WEBHOOK_SECRET`.
3. Open a collection you own → **Sell** → set a price.

Payments go directly to your Stripe account. Owners can connect their own Stripe
account from the **Pricing & sales** panel: the server creates a Stripe Express
account, runs hosted onboarding, and stores the account id for destination
charges (`stripe_account_id` on the collection owner). Set
`STRIPE_APPLICATION_FEE_PERCENT` to take a platform fee.

## 6. Operations

- **Backups** — back up Postgres and the storage bucket. Originals are streamed
  through the API and never made public, so the bucket can stay private.
- **Cleanup** — collections can auto-delete after 1-3650 days. An in-process
  sweeper runs hourly, and `POST /api/maintenance/sweep` is available for an
  external cron (protect it with a network rule or a proxy).
- **Upgrades** — `git pull && docker compose up --build -d`. Database changes
  live in `supabase/migrations/`; apply them with `supabase db push`.

## Troubleshooting

- **`SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set`** — the server reads
  `server/.env` relative to the process working directory. Run it from the repo
  root or point `env_file:` at your file in `docker-compose.yml`.
- **"Database setup needed" warning when selling** — run the `selling` section of
  `supabase/schema.sql` (or `supabase db push`).
- **Images 403** — confirm the bucket is named like `SUPABASE_STORAGE_BUCKET` and
  that the key is the `service_role` key, not the anon key.
