#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${PLANNING_SYNC_URL:-http://127.0.0.1:5000}"
TOKEN="${PLANNING_SYNC_TOKEN:-}"

if [[ -z "$TOKEN" ]]; then
  echo "PLANNING_SYNC_TOKEN is required" >&2
  exit 1
fi

month=$(date +%m)
year=$(date +%Y)

# School year starts in September
if [[ "$month" -ge 9 ]]; then
  school_year="$year"
else
  school_year=$((year - 1))
fi

payload=$(printf '{"schoolYear":%s}' "$school_year")

curl -sS --fail -X POST "${BASE_URL}/planning/sync" \
  -H "X-API-Key: ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${payload}"
