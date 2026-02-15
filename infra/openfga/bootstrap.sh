#!/usr/bin/env bash
set -euo pipefail

FGA_URL="${FGA_URL:-http://localhost:8083}"
MODEL_FILE="${FGA_MODEL_FILE:-$(cd "$(dirname "$0")" && pwd)/model.fga}"
SEED_FILE="${FGA_SEED_FILE:-$(cd "$(dirname "$0")" && pwd)/seed-tuples.json}"

if ! command -v fga >/dev/null 2>&1; then
  echo "fga CLI not found. Install from https://openfga.dev/docs/getting-started/cli"
  exit 1
fi

export FGA_API_URL="$FGA_URL"

store_name="freeflow"
store_id=$(fga store list | grep -m1 "$store_name" | awk '{print $1}' || true)
if [ -z "$store_id" ]; then
  store_id=$(fga store create --name "$store_name" | awk '{print $1}')
fi

export FGA_STORE_ID="$store_id"

model_id=$(fga model write --file "$MODEL_FILE" | awk '{print $1}')

echo "Model ID: $model_id"

fga tuple write --file "$SEED_FILE" --model-id "$model_id"

echo "Bootstrap complete (store=$store_id, model=$model_id)."
