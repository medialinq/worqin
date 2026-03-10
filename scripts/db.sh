#!/usr/bin/env bash
# Open een psql sessie naar de Supabase database
# Gebruik: ./scripts/db.sh
# Of:      ./scripts/db.sh < migration.sql
set -euo pipefail

SERVER="root@server01.hjn-media.nl"
DB_CONTAINER="supabase-db-ac84c8w44g8gs00sswgwkwco"

if [ -t 0 ]; then
  # Interactive mode
  ssh -t "$SERVER" "docker exec -it $DB_CONTAINER psql -U supabase_admin -d postgres"
else
  # Piped mode (e.g., cat migration.sql | ./scripts/db.sh)
  ssh "$SERVER" "docker exec -i $DB_CONTAINER psql -U supabase_admin -d postgres"
fi
