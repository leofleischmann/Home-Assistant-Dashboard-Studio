#!/usr/bin/env sh
# Home Assistant Dashboard Studio - lokaler HA-Sync (macOS/Linux).
# Ohne Argument: "watch" (pusht bei jedem Speichern). Oder: ./sync.sh pull / push.
cd "$(dirname "$0")" || exit 1
exec node scripts/sync.mjs "${1:-watch}"
