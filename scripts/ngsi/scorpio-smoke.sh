#!/usr/bin/env bash
set -euo pipefail

SCORPIO_URL=${SCORPIO_URL:-http://localhost:9090}
TENANT=${TENANT:-alpha}
ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)

SMARTMETER_FILE="$ROOT_DIR/docs/ngsi-ld/examples/entity-smartmeter.jsonld"
MEASUREMENT_FILE="$ROOT_DIR/docs/ngsi-ld/examples/entity-measurement.jsonld"
SUB_FILE="$ROOT_DIR/docs/ngsi-ld/examples/subscription-smartmeter.jsonld"

if [[ ! -f "$SMARTMETER_FILE" ]]; then
  echo "Missing $SMARTMETER_FILE" >&2
  exit 1
fi

curl -s -o /dev/null -w "Create SmartMeter -> HTTP %{http_code}\n" \
  -X POST "$SCORPIO_URL/ngsi-ld/v1/entities" \
  -H "Content-Type: application/ld+json" \
  -H "NGSILD-Tenant: $TENANT" \
  --data-binary "@$SMARTMETER_FILE"

curl -s -o /dev/null -w "Create Measurement -> HTTP %{http_code}\n" \
  -X POST "$SCORPIO_URL/ngsi-ld/v1/entities" \
  -H "Content-Type: application/ld+json" \
  -H "NGSILD-Tenant: $TENANT" \
  --data-binary "@$MEASUREMENT_FILE"

curl -s -o /dev/null -w "Create Subscription -> HTTP %{http_code}\n" \
  -X POST "$SCORPIO_URL/ngsi-ld/v1/subscriptions" \
  -H "Content-Type: application/ld+json" \
  -H "NGSILD-Tenant: $TENANT" \
  --data-binary "@$SUB_FILE"

curl -s "$SCORPIO_URL/ngsi-ld/v1/entities?type=SmartMeterMeasurement&limit=1" \
  -H "Accept: application/ld+json" \
  -H "NGSILD-Tenant: $TENANT" | head -n 5

