#!/usr/bin/env bash
# Confirms no server secret name or value reached the client bundle.
# Run after `next build`.
set -euo pipefail
cd "$(dirname "$0")/.."
if [ ! -d .next/static ]; then echo "No .next/static — run next build first."; exit 1; fi

fail=0
for name in R2_SECRET_ACCESS_KEY R2_ACCESS_KEY_ID SUPABASE_SERVICE_ROLE_KEY RESEND_API_KEY CRON_SECRET DRAFT_PREVIEW_SECRET DATABASE_URL DIRECT_URL; do
  if grep -rq "$name" .next/static; then
    echo "FAIL  $name appears in the client bundle"; fail=1
  else
    echo "PASS  $name absent from client bundle"
  fi
done

# Also check the values, if a .env is present locally.
if [ -f .env ]; then
  for name in R2_SECRET_ACCESS_KEY SUPABASE_SERVICE_ROLE_KEY RESEND_API_KEY CRON_SECRET; do
    value=$(grep -E "^${name}=" .env | head -1 | cut -d= -f2- | tr -d '"')
    if [ -n "$value" ] && grep -rqF "$value" .next/static; then
      echo "FAIL  value of $name appears in the client bundle"; fail=1
    fi
  done
fi

exit $fail
