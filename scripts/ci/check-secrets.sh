#!/usr/bin/env bash
# Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
# Fails when a secret or signing file is committed. Public keys are fine: the Supabase
# publishable key, RevenueCat's public SDK key and android/app/google-services.json
# are meant to ship inside the app. Run locally: bash scripts/ci/check-secrets.sh
set -u
fail=0

bad_files=$(git ls-files | grep -E '\.(jks|keystore|p12|pfx|pem)$|(^|/)keystore\.properties$|(^|/)\.env(\.local)?$|service-account.*\.json$' || true)
if [ -n "$bad_files" ]; then
  echo "::error::Signing or secret files are committed:"; echo "$bad_files"; fail=1
fi

patterns='BEGIN (RSA |EC |OPENSSL |ENCRYPTED )?PRIVATE KEY|"private_key"[[:space:]]*:|sb_secret_[A-Za-z0-9_]{10,}|key-[0-9a-f]{32}([^0-9a-f]|$)|eyJhbGciOi[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{10,}|SERVICE_ROLE_KEY[[:space:]]*=[[:space:]]*[^[:space:]$"{]'
hits=$(git grep -nIE "$patterns" -- . ':!package-lock.json' ':!scripts/ci/check-secrets.sh' ':!docs/team' ':!CLAUDE.md' || true)
if [ -n "$hits" ]; then
  echo "::error::Something that looks like a secret is committed (showing file and line only):"
  echo "$hits" | cut -d: -f1,2 | sort -u
  fail=1
fi

if [ "$fail" -ne 0 ]; then
  echo "If this is a real secret: remove it, then ROTATE it (a committed secret must be treated as leaked)."
  exit 1
fi
echo "No secrets found."
