#!/usr/bin/env bash
# Levanta la API y la web a la vez (Ctrl+C detiene las dos).
set -euo pipefail
cd "$(dirname "$0")/.."
exec npm run dev
