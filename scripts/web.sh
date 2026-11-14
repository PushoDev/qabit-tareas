#!/usr/bin/env bash
# Levanta solo la web (Vite + React, puerto 5173). Se ve en https://qabit-tareas.test
set -euo pipefail
cd "$(dirname "$0")/.."
exec npm run dev:web
