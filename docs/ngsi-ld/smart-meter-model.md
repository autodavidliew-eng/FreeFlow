# Smart Meter NGSI-LD Model

This document defines a FreeFlow-compatible Smart Meter model using NGSI-LD entities, properties, and relationships.

## Entity Types

### SmartMeter
Represents a physical smart meter device.

Required fields:
- `id` (URN): `urn:ngsi-ld:SmartMeter:<tenant>:<meterId>`
- `type`: `SmartMeter`
- `meterId` (Property)
- `tenant` (Property)
- `siteId` (Property)
- `location` (GeoProperty, optional)

### SmartMeterMeasurement
Represents a single measurement event.

Required fields:
- `id` (URN): `urn:ngsi-ld:SmartMeterMeasurement:<tenant>:<meterId>:<ts>`
- `type`: `SmartMeterMeasurement`
- `meter` (Relationship -> SmartMeter)
- `powerW` (Property + observedAt)
- `energyKWh` (Property + observedAt)
- `timestamp` (Property, ISO 8601)
- `tenant` (Property)

## @context usage
All entities and subscriptions **must** include a JSON-LD `@context` reference.

Recommended:

```
"@context": [
  "http://localhost:8090/context/freeflow-energy.jsonld",
  "http://localhost:8090/context/ngsi-ld-core-context.jsonld"
]
```

Use `Content-Type: application/ld+json` for POST/PATCH requests.

## Notes
- `powerW` is the instantaneous power in watts.
- `energyKWh` is the energy in kWh for the 5-minute measurement window.
- `observedAt` timestamp is applied to `powerW` and `energyKWh` properties.
- `NGSILD-Tenant` header is required on all broker calls.
- The FreeFlow context can be extended to align with Smart Data Models terms as needed.
