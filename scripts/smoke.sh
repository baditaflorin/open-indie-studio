#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

mkdir -p tmp
npm run build
test -s docs/index.html
test -s docs/404.html

PORT="${SMOKE_PORT:-$((4600 + RANDOM % 1000))}"
BASE_URL="http://127.0.0.1:${PORT}/open-indie-studio/"

npx vite preview --host 127.0.0.1 --port "$PORT" --strictPort > tmp/smoke-server.log 2>&1 &
SERVER_PID=$!
cleanup() {
  kill "$SERVER_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for _ in $(seq 1 40); do
  if curl -fsS "$BASE_URL" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done

if ! curl -fsS "$BASE_URL" >/dev/null; then
  cat tmp/smoke-server.log
  exit 1
fi

BASE_URL="$BASE_URL" npx playwright test
