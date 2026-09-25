# Take the shot

A **paid photo-sharing service**. Create a collection of photos, share it with a
QR code or link, and — if you want — put a price on it so people can buy the
original files with a card. Stripe handles checkout; downloads unlock
automatically after payment.

- **Web app** — server-rendered, responsive, mobile-first (works from any phone browser)
- **Mobile app** — Expo / React Native (iOS + Android)
- **Backend** — Express + TypeScript, Postgres + Storage on Supabase, Stripe for payments

## What it does

| Feature | Notes |
| --- | --- |
| Collections + QR sharing | Scan the QR and the gallery opens, no app install needed |
| **Sell your shots** | Set a price per collection; buyers pay with Stripe Checkout |
| **Time-limited hosting** | Auto-delete a collection after 1–3650 days; hourly sweeper + cron endpoint |
| Free or paid | `price_cents` empty = free; thumbnails stay visible either way |
| Locked originals | Paid collections stream low-res thumbnails until purchased |
| Sales dashboard | Owners see sales count, revenue and buyer emails per collection |
| Thumbnails | `sharp` generates 640px JPEG thumbs and reads width/height |
| Search, sort, filter, grid/list | Persistent per-browser preferences |
| Multi-select | Click-drag marquee, right-click drag, shift-click ranges, context menu |
| Batch actions | Download selected as ZIP, delete selected in one request |
| Import from links | Google Drive file links, direct image URLs, any page with `og:image` |
| Collaboration | Invite viewers/editors by email; private collections stay member-only |
| Live sync | New photos appear for everyone within ~5s |
| ZIP download | Whole collection or a selection |
| Save a shared collection | Copies photos into your own account |
| Accounts | Sessions, bcrypt hashes, rate limits, session TTL |
| Responsive + mobile UI | Bottom action bar, bottom-sheet modals, safe-area padding, dark/light theme |

## Architecture

```
┌─────────────────┐  HTTP   ┌──────────────────┐          ┌──────────────────┐
│  Web (server    │ ──────▶ │  Express API     │ ───────▶ │  Supabase        │
│  rendered pages)│ ◀────── │  + sharp + Stripe│ ◀─────── │  Postgres/Storage│
└─────────────────┘         └────────┬─────────┘          └──────────────────┘
┌─────────────────┐                  │ Stripe Checkout / webhooks
│  Expo mobile app│ ─────────────────┘
└─────────────────┘
```

```
photo-sharing-app/
├─ server/                 Express + TypeScript API and web pages
│  ├─ src/
│  │  ├─ index.ts          App entry, security headers, CORS, Stripe webhook mount
│  │  ├─ routes.ts         Collections, photos, QR, members, import, selling
│  │  ├─ stripe.ts         Stripe client + schema/feature detection
│  │  ├─ auth.ts           Signup/login/sessions
│  │  ├─ ui.ts             Shared CSS + page helpers
│  │  ├─ page-home.ts      Collection list page
│  │  ├─ page-collection.ts Collection page (selection, selling, import, upload)
│  │  ├─ page-auth.ts      Login/signup pages
│  │  ├─ ratelimit.ts      Fixed-window limiter
│  │  └─ zip.ts            ZIP writer
├─ app/                    Expo / React Native mobile app
├─ supabase/schema.sql     Full database schema (run in the Supabase SQL editor)
└─ supabase/migrations/    Incremental migrations (selling)
```

## Setup

### 1. Database

Create a Supabase project, then run **all of `supabase/schema.sql`** in the SQL
editor. It creates the tables, indexes, RLS hardening and the storage setup.

> Selling needs the `selling` section at the bottom of that file
> (`price_cents`, `currency`, `purchases`, `stripe_account_id`). Migrations live
> in `supabase/migrations/` if you prefer `supabase db push`.

Create a **private** storage bucket named `photos` (the server streams images
through `/api/photos`, so it never needs to be public).

### 2. Environment

`server/.env`:

```bash
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...        # service role key, server-side only
SUPABASE_STORAGE_BUCKET=photos

# Optional
PORT=3000
PUBLIC_BASE_URL=https://your-domain.com   # absolute links for QR codes / OG tags
SESSION_TTL_DAYS=30
APP_ORIGINS=https://app.example.com       # extra CORS origins

# Stripe (required to sell)
STRIPE_SECRET_KEY=sk_...                  # Stripe secret key (test or live)
STRIPE_WEBHOOK_SECRET=whsec_...           # endpoint: /api/stripe/webhook
STRIPE_APPLICATION_FEE_PERCENT=10         # optional platform fee (with Connect)
```

### 3. Run

```bash
npm install
npm run server        # API + web app on http://localhost:3000
npm run app           # Expo app (set EXPO_PUBLIC_API_BASE first)
npm run website       # download landing page on http://localhost:8080
```

The mobile app talks to the API over your LAN or a tunnel:

```bash
export EXPO_PUBLIC_API_BASE="https://your-domain.com"
npm run app
```

## Selling photos

1. Open a collection you own and tap **Sell**.
2. Enter a price (for example `12.00`) and pick a currency.
3. Share the collection link or QR code.

Visitors see the thumbnails and a **Buy** button. Stripe Checkout collects the
card; on success the buyer returns to the collection and every original file
unlocks (including ZIP downloads).

**How access is enforced**

- `price_cents` empty or `0` → free for everyone (private collections still need an invite).
- Priced collection + no purchase → thumbnails and page only; originals, single
  downloads and ZIP return `402 purchase_required`.
- Owner, editors and invited members always have full access.
- Purchases are recorded by the Stripe webhook, with a checkout-return fallback
  (`/api/collections/:id/access?session_id=...`) so it also works locally without
  `stripe listen`.

### Payouts (Stripe Connect)

By default payments land in the platform's Stripe account. To pay owners
directly, set the owner's `users.stripe_account_id` to a Stripe Connect account
and optionally `STRIPE_APPLICATION_FEE_PERCENT` to keep a platform cut. Checkout
then uses `transfer_data.destination` and `application_fee_amount`.

## Time-limited collections

Owners can schedule a collection to delete itself. In the collection page open
**More → Auto-delete** and pick 1 day, 7 days, 30 days, 90 days, a year, or a
custom number of days. Leaving it empty keeps the collection forever.

- The deadline is stored as `collections.expires_at` (see the expiring section of
  `supabase/schema.sql`).
- A sweep runs **hourly** on a long-running server and is also available as an
  endpoint so any cron can trigger it:

  ```bash
  curl -X POST https://your-domain.com/api/maintenance/sweep \
    -H "x-maintenance-secret: $MAINTENANCE_SECRET"
  ```

- The sweep removes storage objects first, then photos, members, purchases and
  the collection row. Deletion happens within an hour of the deadline, and
  expired collections return `410 Gone` immediately even before the sweep runs.
- `MAINTENANCE_SECRET` is required for the endpoint; without it the endpoint is
  disabled. `MAINTENANCE_SWEEP_INTERVAL_MINUTES` tunes the in-process interval
  (default 60, minimum 5).

> **Selling and expiry conflict:** if a priced collection expires, buyers lose
> access and their purchase rows are deleted. The pricing and auto-delete dialogs
> warn about this.

## Importing photos

**From a device:** tap **Add photos** on the web or the mobile app and pick files
(the phone picker sees Google Photos, iCloud, Drive and local storage as sources).

**From a link:** in a collection, open **More → Import from link** and paste one
link per line. The server downloads the image and stores it like an upload.

Supported:

- Direct image URLs (`https://…/photo.jpg`)
- Google Drive file links (`drive.google.com/file/d/<ID>/view`)
- Any HTML page with an `og:image` tag
- Google Photos **single photo** share links

Limitations:

- Google Photos **album** links only expose the album cover, not every photo
  (Google removed the old album API). Save each photo's share link instead.
- Links must be publicly reachable; localhost and private IP ranges are blocked.
- Max 10 links per request, 25 MB per image.

## Multi-select

- Tap **☑** to enter select mode, then tap photos.
- **Click-drag** anywhere on the grid (or **right-click drag**) to marquee-select.
- **Shift-click** selects a range, **Ctrl/Cmd-click** toggles one photo.
- **Right-click a photo** for Open / Download / Select / Select all / Delete.
- The floating bar handles ZIP download, delete, select-all and cancel.

## API reference

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/signup` · `/api/auth/login` · `/api/auth/logout` | Auth + session cookie |
| GET | `/api/auth/me` | Current user |
| GET | `/api/collections` | List (search `q`, `sort`, `filter`, paging) |
| POST | `/api/collections` | Create collection |
| GET | `/api/collections/:id` | Collection + photos + pricing/access state |
| PATCH | `/api/collections/:id` | Rename, visibility, `price_cents`, `currency`, `expires_in_days` |
| DELETE | `/api/collections/:id` | Delete collection and its photos |
| GET | `/api/collections/:id/qr` | PNG QR code for the share link |
| POST | `/api/collections/:id/photos` | Upload images (multipart `photos`) |
| POST | `/api/collections/:id/photos/delete` | Batch delete `{ ids: [] }` |
| POST | `/api/collections/:id/import` | Import from links `{ urls: [] }` |
| GET | `/api/collections/:id/zip` | Download ZIP (optional `?ids=a,b`) |
| POST | `/api/collections/:id/save` | Copy a shared collection to your account |
| GET/POST/PATCH/DELETE | `/api/collections/:id/members[/:userId]` | Collaboration |
| POST | `/api/collections/:id/checkout` | Start Stripe Checkout for a priced collection |
| GET | `/api/collections/:id/access` | Purchase state (+ `session_id` verification) |
| GET | `/api/collections/:id/sales` | Owner sales list and revenue |
| POST | `/api/stripe/webhook` | Stripe webhook (raw body, signature verified) |
| POST | `/api/maintenance/sweep` | Delete expired collections (requires `x-maintenance-secret`) |
| GET | `/api/photos/:filename` | Stream photo (`?thumb=1`, `?download=1`) |
| DELETE | `/api/photos/:id` | Delete a single photo |

## Security

- Service-role Supabase key stays server-side; RLS is enabled on all tables.
- Private storage bucket; images are proxied through authenticated endpoints.
- bcrypt password hashes, HTTP-only session cookies with TTL.
- Rate limits on auth and uploads; SSRF guard on URL imports.
- `X-Frame-Options`, `nosniff`, `Referrer-Policy`, HSTS behind TLS.
