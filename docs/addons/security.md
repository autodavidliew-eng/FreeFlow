# Add-on Security Notes

## Why short-lived handoff tokens

Add-on launch tokens are limited to 120 seconds to reduce exposure risk:

- Minimize replay windows if URLs are leaked.
- Force add-ons to exchange or refresh for longer sessions if needed.
- Tight audience scoping (`aud = appKey`) prevents cross-app token reuse.

## Recommended Practices

- Use HTTPS-only launch URLs.
- Validate `aud`, `exp`, and signature on every add-on request.
- Store no token in query strings beyond the initial handoff.
- Exchange handoff token for a session token on the add-on side if needed.
