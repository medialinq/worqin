#!/usr/bin/env bash
# Deploy worqin-app via Coolify API
# Vereist: COOLIFY_API_TOKEN in .env.local of als env var
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Laad token uit .env.local als die bestaat
if [[ -f "$PROJECT_DIR/.env.local" ]]; then
  source <(grep '^COOLIFY_API_TOKEN=' "$PROJECT_DIR/.env.local")
fi

if [[ -z "${COOLIFY_API_TOKEN:-}" ]]; then
  echo "ERROR: COOLIFY_API_TOKEN niet gevonden."
  echo "Zet deze in .env.local of als environment variable."
  exit 1
fi

SERVER="root@server01.hjn-media.nl"
APP_UUID="gvsvp4p63ke4qyvbvawd70af"
API_URL="http://localhost:8000/api/v1"

echo ">>> Triggering deploy voor worqin-app..."

RESPONSE=$(ssh "$SERVER" "curl -s -X POST \
  -H 'Authorization: Bearer $COOLIFY_API_TOKEN' \
  -H 'Content-Type: application/json' \
  '$API_URL/applications/$APP_UUID/restart'")

echo "$RESPONSE"

# Wacht en check status
echo ">>> Wachten op container start..."
sleep 10

STATUS=$(ssh "$SERVER" "docker ps --format '{{.Names}} {{.Status}}' | grep gvs")
echo ">>> Container: $STATUS"

echo ">>> Deploy compleet: https://worqin.hjn-media.nl"
