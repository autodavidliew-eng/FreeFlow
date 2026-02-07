# FreeFlow Keycloak Realm Configuration

Minimal Keycloak realm configuration for FreeFlow development environment.

## Realm Overview

- **Realm Name**: `freeflow`
- **Client**: `freeflow-web` (Next.js with PKCE)
- **Roles**: `Admin`, `Operator`, `Viewer`
- **Test Users**: 3 users (one per role)

## Client Configuration

### freeflow-web (Next.js Application)

- **Type**: Public client
- **Protocol**: OpenID Connect
- **Flow**: Authorization Code with PKCE (S256)
- **Redirect URIs**: `http://localhost:3000/*`
- **Web Origins**: `http://localhost:3000`

**Security Features**:
- PKCE required (S256 challenge method)
- Standard flow enabled
- Implicit flow disabled
- Direct access grants disabled

## Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| `Admin` | Full administrative access | Full |
| `Operator` | Operational permissions | Write |
| `Viewer` | Read-only access | Read |

## Test Users

| Username | Email | Password | Role |
|----------|-------|----------|------|
| `admin` | admin@freeflow.dev | `admin` | Admin |
| `operator` | operator@freeflow.dev | `operator` | Operator |
| `viewer` | viewer@freeflow.dev | `viewer` | Viewer |

⚠️ **Warning**: These credentials are for development only. Change them before production use.

## Import in Docker Compose

### Method 1: Automatic Import on Startup

The Docker Compose setup is pre-configured to import this realm automatically.

1. **Ensure file is in the correct location**:
   ```bash
   ls -l infra/keycloak/freeflow-realm.json
   ```

2. **Update docker-compose.yml** to mount the realm file:
   ```yaml
   keycloak:
     volumes:
       - ./../../keycloak/freeflow-realm.json:/opt/keycloak/data/import/freeflow-realm.json:ro
   ```

3. **Start Keycloak** with import flag:
   ```bash
   cd infra/compose
   docker compose up -d keycloak
   ```

4. **Verify import** in logs:
   ```bash
   docker compose logs keycloak | grep -i "import"
   ```

### Method 2: Manual Import via Admin Console

1. **Start Keycloak**:
   ```bash
   cd infra/compose
   docker compose up -d keycloak
   ```

2. **Wait for Keycloak to be ready**:
   ```bash
   # Wait about 30 seconds, then check health
   curl http://localhost:8080/health/ready
   ```

3. **Access Admin Console**:
   - URL: http://localhost:8080
   - Username: `admin`
   - Password: `admin` (from docker-compose.yml)

4. **Import Realm**:
   - Click dropdown in top-left (says "master")
   - Click "Create Realm"
   - Click "Browse" and select `freeflow-realm.json`
   - Click "Create"

### Method 3: Import via CLI

```bash
cd infra/compose

# Copy realm file into container
docker compose cp ../../keycloak/freeflow-realm.json keycloak:/tmp/freeflow-realm.json

# Import using Keycloak CLI
docker compose exec keycloak /opt/keycloak/bin/kc.sh import \
  --file /tmp/freeflow-realm.json \
  --override false
```

## Update docker-compose.yml for Auto-Import

To enable automatic realm import, update `infra/compose/docker-compose.yml`:

```yaml
keycloak:
  image: quay.io/keycloak/keycloak:23.0
  command:
    - start-dev
    - --import-realm  # Enable import
  volumes:
    # Mount the realm file from infra/keycloak/
    - ../../keycloak/freeflow-realm.json:/opt/keycloak/data/import/freeflow-realm.json:ro
  environment:
    # ... existing env vars ...
```

Then restart Keycloak:
```bash
cd infra/compose
docker compose restart keycloak
docker compose logs -f keycloak
```

## Verify Import

### Via Admin Console

1. Go to http://localhost:8080
2. Login with admin credentials
3. Switch to "freeflow" realm (dropdown top-left)
4. Check:
   - **Clients** → Should see `freeflow-web`
   - **Realm roles** → Should see `Admin`, `Operator`, `Viewer`
   - **Users** → Should see 3 test users

### Via API

```bash
# Get admin token
TOKEN=$(curl -X POST 'http://localhost:8080/realms/master/protocol/openid-connect/token' \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

# Check if freeflow realm exists
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/admin/realms/freeflow | jq '.realm'

# List clients
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/admin/realms/freeflow/clients | jq '.[].clientId'

# List roles
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/admin/realms/freeflow/roles | jq '.[].name'
```

## Test Authentication

### Get Access Token

```bash
# Login as admin user
curl -X POST 'http://localhost:8080/realms/freeflow/protocol/openid-connect/token' \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=freeflow-web" \
  -d "username=admin" \
  -d "password=admin" \
  -d "grant_type=password" | jq
```

**Note**: This uses password grant for testing. In production, use authorization code flow with PKCE.

### Test with Next.js

Install `next-auth` or `@auth/core`:

```bash
npm install next-auth
```

Configure in `apps/web/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from "next-auth"
import KeycloakProvider from "next-auth/providers/keycloak"

const handler = NextAuth({
  providers: [
    KeycloakProvider({
      clientId: "freeflow-web",
      clientSecret: "", // Not needed for public clients
      issuer: "http://localhost:8080/realms/freeflow",
    })
  ],
})

export { handler as GET, handler as POST }
```

## Troubleshooting

### Realm not imported

```bash
# Check Keycloak logs
docker compose logs keycloak | tail -50

# Verify file is mounted
docker compose exec keycloak ls -l /opt/keycloak/data/import/

# Check import directory permissions
docker compose exec keycloak ls -la /opt/keycloak/data/
```

### Import fails with "Realm already exists"

```bash
# Remove existing realm and re-import
# WARNING: This deletes all realm data

# Via Admin Console: Select realm → Realm Settings → Action → Delete

# Or via CLI:
TOKEN=$(curl -X POST 'http://localhost:8080/realms/master/protocol/openid-connect/token' \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

curl -X DELETE "http://localhost:8080/admin/realms/freeflow" \
  -H "Authorization: Bearer $TOKEN"

# Then restart Keycloak to re-import
docker compose restart keycloak
```

### Client credentials not working

- Public clients (like `freeflow-web`) don't use client secrets
- Ensure PKCE is enabled in your OAuth client library
- Check redirect URIs match exactly

### CORS errors in browser

- Verify `webOrigins` in realm JSON includes your app URL
- Check browser console for specific CORS errors
- Ensure Keycloak is accessible from browser

## Customization

### Add More Redirect URIs

Edit `freeflow-realm.json`:

```json
"redirectUris": [
  "http://localhost:3000/*",
  "http://localhost:4200/*",
  "http://localhost:5173/*"
]
```

### Add More Roles

```json
"roles": {
  "realm": [
    {
      "name": "CustomRole",
      "description": "Custom role description",
      "composite": false,
      "clientRole": false
    }
  ]
}
```

### Add More Users

```json
"users": [
  {
    "username": "newuser",
    "email": "newuser@freeflow.dev",
    "emailVerified": true,
    "enabled": true,
    "credentials": [
      {
        "type": "password",
        "value": "password",
        "temporary": false
      }
    ],
    "realmRoles": ["Viewer"]
  }
]
```

After making changes, delete and re-import the realm.

## Production Considerations

⚠️ **This configuration is for development only**. For production:

1. **Enable SSL**: Set `sslRequired: "external"` or `"all"`
2. **Strong Passwords**: Use complex passwords, not simple ones
3. **Remove Test Users**: Don't use development users in production
4. **Enable MFA**: Add two-factor authentication
5. **Configure SMTP**: Set up email for password resets
6. **Brute Force Protection**: Review and tighten settings
7. **Session Timeouts**: Configure appropriate timeout values
8. **Use Secrets**: Store client secrets in secure vault
9. **HTTPS Only**: Use HTTPS for all redirect URIs
10. **Regular Backups**: Export realm regularly

## References

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Importing and Exporting Realms](https://www.keycloak.org/server/importExport)
- [OpenID Connect with PKCE](https://oauth.net/2/pkce/)
- [Next-Auth Keycloak Provider](https://next-auth.js.org/providers/keycloak)

## Quick Reference

```bash
# Start Keycloak
cd infra/compose && docker compose up -d keycloak

# View logs
docker compose logs -f keycloak

# Access admin console
open http://localhost:8080

# Test realm endpoint
curl http://localhost:8080/realms/freeflow/.well-known/openid-configuration | jq

# Get access token
curl -X POST 'http://localhost:8080/realms/freeflow/protocol/openid-connect/token' \
  -d "client_id=freeflow-web" \
  -d "username=admin" \
  -d "password=admin" \
  -d "grant_type=password"
```
