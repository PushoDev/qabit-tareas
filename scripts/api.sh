#!/usr/bin/env bash
# Levanta solo la API (Express, puerto 3001) con recarga automática.
set -euo pipefail
cd "$(dirname "$0")/.."
exec npm run dev:api
