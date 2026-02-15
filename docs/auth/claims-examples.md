# JWT Claims Examples

These examples show **decoded JWT payloads** (not full tokens).
Use them to validate role extraction and UI gating behavior.

## Admin

```json
{
  "iss": "https://auth.freeflow.local/realms/freeflow-acme",
  "sub": "f:1234:admin",
  "aud": "freeflow-web",
  "preferred_username": "admin",
  "email": "admin@freeflow.dev",
  "name": "FreeFlow Admin",
  "realm_access": {
    "roles": ["Admin", "uma_authorization", "offline_access"]
  },
  "resource_access": {
    "freeflow-web": {
      "roles": ["Admin"]
    }
  }
}
```

## Operator

```json
{
  "iss": "https://auth.freeflow.local/realms/freeflow-acme",
  "sub": "f:2345:operator",
  "aud": "freeflow-web",
  "preferred_username": "operator",
  "email": "operator@freeflow.dev",
  "name": "FreeFlow Operator",
  "realm_access": {
    "roles": ["Operator", "uma_authorization"]
  },
  "resource_access": {
    "freeflow-web": {
      "roles": ["Operator"]
    }
  }
}
```

## Viewer

```json
{
  "iss": "https://auth.freeflow.local/realms/freeflow-acme",
  "sub": "f:3456:viewer",
  "aud": "freeflow-web",
  "preferred_username": "viewer",
  "email": "viewer@freeflow.dev",
  "name": "FreeFlow Viewer",
  "realm_access": {
    "roles": ["Viewer"]
  },
  "resource_access": {
    "freeflow-web": {
      "roles": ["Viewer"]
    }
  }
}
```
