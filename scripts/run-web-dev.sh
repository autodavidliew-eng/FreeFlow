#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "FreeFlow web dev bootstrap"

NVM_DIR="${HOME}/.nvm"
if [[ -s "${NVM_DIR}/nvm.sh" ]]; then
  # shellcheck disable=SC1090
  . "${NVM_DIR}/nvm.sh"
fi

if command -v nvm >/dev/null 2>&1 && [[ -f "${ROOT_DIR}/.nvmrc" ]]; then
  NODE_VERSION="$(cat "${ROOT_DIR}/.nvmrc")"
  nvm install "${NODE_VERSION}"
  nvm use --delete-prefix "${NODE_VERSION}" --silent
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found. Attempting to enable via corepack..."
  if command -v corepack >/dev/null 2>&1; then
    corepack enable
    corepack prepare pnpm@9.1.0 --activate
  else
    echo "corepack not available. Falling back to npm global install."
    npm install -g pnpm@9.1.0
  fi
fi

echo "Installing dependencies..."
pnpm install

if [[ -z "${KEYCLOAK_ISSUER:-}" || -z "${KEYCLOAK_ID:-}" || -z "${SESSION_SECRET:-}" ]]; then
  echo "Warning: Missing auth env vars."
  echo "Set KEYCLOAK_ISSUER, KEYCLOAK_ID, SESSION_SECRET for login flow."
fi

echo "Starting Next.js dev server..."
pnpm --filter @freeflow/web dev
