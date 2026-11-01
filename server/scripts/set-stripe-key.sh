#!/usr/bin/env bash
# Add the Stripe sandbox secret key to Vercel + the local server env, then
# redeploy production. The key is read silently and never printed.
#
# Usage:
#   npm run stripe:env --workspace server
#   bash server/scripts/set-stripe-key.sh
#
# Optional: pass the environment as the first argument (default: production).
set -euo pipefail

cd "$(dirname "$0")/.."

ENVIRONMENT="${1:-production}"

if ! npx vercel whoami >/dev/null 2>&1; then
  echo "Not logged in to Vercel. Run 'npx vercel login' first." >&2
  exit 1
fi

printf 'Paste your Stripe sandbox secret key (sk_test_...): '
IFS= read -r -s KEY
printf '\n'

# Keys never contain whitespace, but a terminal paste can add a newline.
KEY="$(printf '%s' "$KEY" | tr -d '[:space:]')"

case "$KEY" in
  sk_test_*) ;;
  sk_live_*)
    echo "That is a live key. Refusing: this app is wired to the test-mode sandbox." >&2
    exit 1
    ;;
  *)
    echo "Expected a key starting with sk_test_. Nothing was changed." >&2
    exit 1
    ;;
esac

printf '%s' "$KEY" | npx vercel env add STRIPE_SECRET_KEY "$ENVIRONMENT" \
  --force --sensitive --yes >/dev/null
echo "Added STRIPE_SECRET_KEY to Vercel ($ENVIRONMENT)."

if [ -f .env ]; then
  if grep -q '^STRIPE_SECRET_KEY=' .env; then
    sed -i "s|^STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$KEY|" .env
  else
    printf '\nSTRIPE_SECRET_KEY=%s\n' "$KEY" >> .env
  fi
  chmod 600 .env
  echo "Updated server/.env for local development."
fi

# Vercel applies environment changes only to new deployments. The project's
# Root Directory is `server`, so deploy from the repo root and name the project
# explicitly; running `vercel` inside server/ would resolve to server/server.
echo "Redeploying production..."
cd ..
npx vercel --prod --yes --project take-the-shot-api
