#!/usr/bin/env bash
set -euo pipefail

SCORPIO_URL=${SCORPIO_URL:-http://localhost:9090}
TENANT=${TENANT:-alpha}
INLINE_CONTEXT=${INLINE_CONTEXT:-0}
AUTO_BOOTSTRAP=${AUTO_BOOTSTRAP:-1}
ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)

SMARTMETER_FILE="$ROOT_DIR/docs/ngsi-ld/examples/entity-smartmeter.jsonld"
MEASUREMENT_FILE="$ROOT_DIR/docs/ngsi-ld/examples/entity-measurement.jsonld"
SUB_FILE="$ROOT_DIR/docs/ngsi-ld/examples/subscription-smartmeter.jsonld"

if [[ "$INLINE_CONTEXT" == "1" ]]; then
  TMP_DIR=$(mktemp -d)
  SMARTMETER_FILE="$TMP_DIR/entity-smartmeter.jsonld"
  MEASUREMENT_FILE="$TMP_DIR/entity-measurement.jsonld"
  SUB_FILE="$TMP_DIR/subscription-smartmeter.jsonld"

  cat <<'JSON' > "$SMARTMETER_FILE"
{
  "id": "urn:ngsi-ld:SmartMeter:alpha:emeter-001",
  "type": "SmartMeter",
  "meterId": { "type": "Property", "value": "emeter-001" },
  "tenant": { "type": "Property", "value": "alpha" },
  "siteId": { "type": "Property", "value": "site-001" },
  "@context": {
    "SmartMeter": "https://freeflow.example.com/ontology#SmartMeter",
    "meterId": "https://freeflow.example.com/ontology#meterId",
    "tenant": "https://freeflow.example.com/ontology#tenant",
    "siteId": "https://freeflow.example.com/ontology#siteId",
    "Property": "https://uri.etsi.org/ngsi-ld/Property",
    "Relationship": "https://uri.etsi.org/ngsi-ld/Relationship"
  }
}
JSON

  cat <<'JSON' > "$MEASUREMENT_FILE"
{
  "id": "urn:ngsi-ld:SmartMeterMeasurement:alpha:emeter-001:2026-02-16T00:00:00Z",
  "type": "SmartMeterMeasurement",
  "meter": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:SmartMeter:alpha:emeter-001"
  },
  "powerW": { "type": "Property", "value": 1825.4, "observedAt": "2026-02-16T00:00:00Z" },
  "energyKWh": { "type": "Property", "value": 0.1521, "observedAt": "2026-02-16T00:00:00Z" },
  "timestamp": { "type": "Property", "value": "2026-02-16T00:00:00Z" },
  "tenant": { "type": "Property", "value": "alpha" },
  "@context": {
    "SmartMeterMeasurement": "https://freeflow.example.com/ontology#SmartMeterMeasurement",
    "meter": { "@id": "https://freeflow.example.com/ontology#meter", "@type": "@id" },
    "powerW": "https://freeflow.example.com/ontology#powerW",
    "energyKWh": "https://freeflow.example.com/ontology#energyKWh",
    "timestamp": "https://freeflow.example.com/ontology#timestamp",
    "tenant": "https://freeflow.example.com/ontology#tenant",
    "Property": "https://uri.etsi.org/ngsi-ld/Property",
    "Relationship": "https://uri.etsi.org/ngsi-ld/Relationship"
  }
}
JSON

  cat <<'JSON' > "$SUB_FILE"
{
  "id": "urn:ngsi-ld:Subscription:alpha:emeter-001",
  "type": "Subscription",
  "entities": [{ "type": "SmartMeterMeasurement" }],
  "q": "meter==urn:ngsi-ld:SmartMeter:alpha:emeter-001",
  "notification": {
    "endpoint": {
      "uri": "http://localhost:8092/notify/ngsi-ld",
      "accept": "application/ld+json"
    }
  },
  "throttling": 1,
  "@context": {
    "SmartMeterMeasurement": "https://freeflow.example.com/ontology#SmartMeterMeasurement",
    "meter": { "@id": "https://freeflow.example.com/ontology#meter", "@type": "@id" },
    "Property": "https://uri.etsi.org/ngsi-ld/Property",
    "Relationship": "https://uri.etsi.org/ngsi-ld/Relationship"
  }
}
JSON
fi

if [[ -n "$TENANT" && "$AUTO_BOOTSTRAP" != "0" ]]; then
  BOOTSTRAP_PAYLOAD=$(cat <<JSON
{
  "id": "urn:ngsi-ld:TenantSeed:${TENANT}:bootstrap",
  "type": "TenantSeed",
  "tenant": { "type": "Property", "value": "${TENANT}" },
  "@context": {
    "TenantSeed": "https://freeflow.example.com/ontology#TenantSeed",
    "tenant": "https://freeflow.example.com/ontology#tenant",
    "Property": "https://uri.etsi.org/ngsi-ld/Property"
  }
}
JSON
)

  curl -s -o /dev/null -w "Bootstrap Tenant -> HTTP %{http_code}\n" \
    -X POST "$SCORPIO_URL/ngsi-ld/v1/entities?options=update" \
    -H "Content-Type: application/ld+json" \
    -H "NGSILD-Tenant: $TENANT" \
    --data-binary "$BOOTSTRAP_PAYLOAD" || true
fi

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
