# FreeFlow Configuration Strategy

## Overview

This document defines the environment and configuration strategy for FreeFlow across all environments (development, staging, production). The strategy prioritizes security, type safety, and developer experience.

## Core Principles

1. **Safe by Default** - Secrets never committed to version control
2. **Type-Safe** - All config validated with Zod schemas
3. **Environment-Specific** - Clear separation between dev/staging/prod
4. **Explicit Public/Private** - Clear distinction between client and server variables
5. **Fail Fast** - Invalid config causes startup failure, not runtime errors

---

## Environment Overview

| Environment | Frontend URL | API URL | Purpose |
|-------------|--------------|---------|---------|
| **Development** | http://localhost:3000 | http://localhost:4000 | Local development |
| **Staging** | https://staging.freeflow.dev | https://api.staging.freeflow.dev | Pre-production testing |
| **Production** | https://freeflow.dev | https://api.freeflow.dev | Live production |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Configuration Strategy                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│   Next.js Frontend   │         │   NestJS API Gateway │
│                      │         │                      │
│  Public Variables    │         │  Server Variables    │
│  NEXT_PUBLIC_*       │◄────────┤  Database URLs       │
│  - API_URL           │  HTTP   │  - JWT Secrets       │
│  - APP_NAME          │  Req    │  - Service Keys      │
│                      │         │                      │
│  Server Variables    │         │  Config Module       │
│  - SESSION_SECRET    │         │  @nestjs/config      │
│  - API_KEY           │         │  + Zod Validation    │
└──────────────────────┘         └──────────────────────┘
         │                                  │
         │                                  │
         ▼                                  ▼
┌──────────────────────────────────────────────────────┐
│         @freeflow/config-env (Shared Package)        │
│                                                       │
│  - Zod schemas for validation                        │
│  - Type-safe config loaders                          │
│  - Environment variable parsers                      │
│  - Shared constants (URLs, timeouts, etc.)          │
└──────────────────────────────────────────────────────┘
```

---

## Next.js Configuration

### Public vs Server Variables

Next.js has two types of environment variables:

#### 1. **Public Variables** (Client-Side)
- Prefix: `NEXT_PUBLIC_*`
- Exposed to browser
- Embedded at build time
- **Use for**: API URLs, feature flags, public app settings

```typescript
// ✅ GOOD - Public variable, safe for client
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ❌ BAD - Private variable, will be undefined
const secret = process.env.SESSION_SECRET; // undefined in browser!
```

#### 2. **Server Variables** (Server-Side Only)
- No prefix required
- Only available in server components, API routes, getServerSideProps
- **Use for**: Secrets, API keys, database URLs

```typescript
// In API route or server component
const sessionSecret = process.env.SESSION_SECRET; // ✅ Available
const dbUrl = process.env.DATABASE_URL; // ✅ Available
```

### Variable Categories

| Category | Prefix | Exposed to Browser | Examples |
|----------|--------|-------------------|----------|
| **Public Config** | `NEXT_PUBLIC_` | ✅ Yes | API URL, App Name, Version |
| **Server Secrets** | None | ❌ No | Session Secret, API Keys |
| **Server Config** | None | ❌ No | Database URL, Redis URL |

### Build-Time vs Runtime

- **Build-Time**: `NEXT_PUBLIC_*` variables are embedded during `next build`
- **Runtime**: Server variables are read at runtime from environment

⚠️ **Important**: Changing `NEXT_PUBLIC_*` requires rebuild!

---

## NestJS Configuration

### Config Module Pattern

NestJS uses `@nestjs/config` for environment management:

```typescript
// app.module.ts
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate, // Zod validation function
      cache: true,
    }),
  ],
})
export class AppModule {}
```

### Configuration Service

```typescript
// config.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get port(): number {
    return this.configService.get<number>('PORT', 4000);
  }

  get databaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL')!;
  }

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET')!;
  }
}
```

### Type-Safe Config

```typescript
// config/configuration.ts
export default () => ({
  app: {
    port: parseInt(process.env.PORT || '4000', 10),
    environment: process.env.NODE_ENV || 'development',
  },
  database: {
    url: process.env.DATABASE_URL,
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },
});
```

---

## Secret Handling

### What is a Secret?

**Secrets** are sensitive values that must never be committed to version control:

| Type | Examples | Storage |
|------|----------|---------|
| **Credentials** | Database passwords, API keys | `.env.local`, Vault, K8s Secrets |
| **Tokens** | JWT secrets, OAuth client secrets | `.env.local`, Vault, K8s Secrets |
| **Encryption Keys** | Session secrets, encryption keys | `.env.local`, Vault, K8s Secrets |
| **Connection Strings** | Database URLs with passwords | `.env.local`, Vault, K8s Secrets |

**Not Secrets** (Safe to commit in `.env.example`):
- API endpoint URLs (public)
- Port numbers
- Feature flag defaults
- Public app names/versions

### Secret Naming Convention

```bash
# ✅ GOOD - Clear what is secret
JWT_SECRET=...
DATABASE_PASSWORD=...
OAUTH_CLIENT_SECRET=...
SESSION_SECRET=...

# ❌ BAD - Ambiguous
KEY=...
TOKEN=...
SECRET=...
```

### Secret Hierarchy

```
Development (Least Sensitive)
├── .env.local (git-ignored, local overrides)
├── .env.development (git-ignored, team defaults)
└── .env.example (committed, no secrets)

Staging (More Sensitive)
├── K8s Secrets (encrypted at rest)
├── AWS Secrets Manager / HashiCorp Vault
└── Environment variables in CI/CD

Production (Most Sensitive)
├── K8s Secrets (encrypted at rest)
├── AWS Secrets Manager / HashiCorp Vault (recommended)
└── Hardware Security Modules (enterprise)
```

---

## Local Development

### Setup Process

1. **Copy example files**:
```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env.local
```

2. **Fill in secrets** (obtain from team lead):
```bash
# apps/api/.env.local
DATABASE_URL="postgresql://user:password@localhost:5432/freeflow_dev"
JWT_SECRET="your-dev-jwt-secret-min-32-chars"
SESSION_SECRET="your-dev-session-secret-min-32-chars"
```

3. **Start services**:
```bash
pnpm dev
```

### Secret Generation for Development

```bash
# Generate secure random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use openssl
openssl rand -hex 32
```

### .gitignore Rules

```gitignore
# Ignore all .env files except examples
.env
.env.local
.env.*.local

# Allow example files
!.env.example
!.env.*.example
```

---

## Staging Environment

### Deployment Strategy

**Kubernetes Secrets** (Recommended):

```yaml
# k8s/staging/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: freeflow-api-secrets
  namespace: staging
type: Opaque
data:
  DATABASE_URL: <base64-encoded>
  JWT_SECRET: <base64-encoded>
  SESSION_SECRET: <base64-encoded>
```

**Inject into Pod**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: freeflow-api
spec:
  template:
    spec:
      containers:
      - name: api
        envFrom:
        - secretRef:
            name: freeflow-api-secrets
```

### Environment Variables

- Managed in CI/CD (GitHub Actions, GitLab CI)
- Encrypted at rest
- Access logged and audited

---

## Production Environment

### Secret Management Options

#### Option 1: Kubernetes Secrets (Basic)
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: freeflow-api-secrets
  namespace: production
type: Opaque
stringData:
  DATABASE_URL: "postgresql://..."
  JWT_SECRET: "..."
```

#### Option 2: HashiCorp Vault (Recommended)
```typescript
// Fetch secrets from Vault at startup
const vault = new Vault({ endpoint: 'https://vault.freeflow.dev' });
const secrets = await vault.read('secret/freeflow/prod');

process.env.JWT_SECRET = secrets.data.JWT_SECRET;
process.env.DATABASE_URL = secrets.data.DATABASE_URL;
```

#### Option 3: AWS Secrets Manager
```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'us-east-1' });
const response = await client.send(
  new GetSecretValueCommand({ SecretId: 'freeflow/prod/api' })
);
const secrets = JSON.parse(response.SecretString);
```

### Production Checklist

- [ ] All secrets stored in external secret manager
- [ ] Secrets encrypted at rest and in transit
- [ ] Secret rotation enabled (90-day cycle)
- [ ] Access logs enabled and monitored
- [ ] Least-privilege access (RBAC)
- [ ] No secrets in container images
- [ ] No secrets in logs or error messages
- [ ] Secrets validated on startup

---

## Session Management Strategy

### HttpOnly Cookie Approach (Chosen)

#### Why HttpOnly Cookies?

✅ **Pros**:
- Immune to XSS attacks (not accessible via JavaScript)
- Automatically sent with requests
- Can set Secure flag for HTTPS-only
- Built-in CSRF protection with SameSite attribute

❌ **Cons**:
- Requires same domain or CORS setup
- Not suitable for mobile apps (use OAuth2 flow instead)

#### Configuration

**Frontend (Next.js)**:
```typescript
// No manual token handling needed
// Cookies sent automatically with fetch/axios

fetch('/api/v1/me', {
  credentials: 'include', // Important: Send cookies
});
```

**Backend (NestJS)**:
```typescript
// Set cookie on login
@Post('login')
async login(@Res({ passthrough: true }) response: Response) {
  const token = await this.authService.login(credentials);

  response.cookie('access_token', token, {
    httpOnly: true,      // Not accessible via JS
    secure: true,        // HTTPS only
    sameSite: 'strict',  // CSRF protection
    maxAge: 900000,      // 15 minutes
    path: '/',
  });

  return { success: true };
}

// Verify cookie on protected routes
@UseGuards(JwtAuthGuard)
@Get('me')
async getProfile(@Req() request: Request) {
  const token = request.cookies['access_token'];
  // ... validate token
}
```

#### Cookie Settings by Environment

| Environment | Secure | SameSite | Domain | MaxAge |
|-------------|--------|----------|--------|--------|
| **Development** | `false` | `lax` | `localhost` | 15 min |
| **Staging** | `true` | `strict` | `.staging.freeflow.dev` | 15 min |
| **Production** | `true` | `strict` | `.freeflow.dev` | 15 min |

#### Refresh Token Flow

1. Access token (15 min) stored in httpOnly cookie
2. Refresh token (7 days) stored in separate httpOnly cookie
3. On access token expiry, frontend calls `/auth/refresh`
4. Backend validates refresh token, issues new access token
5. New access token set in cookie

---

## Configuration Validation

### Zod Schema Example

```typescript
// packages/config-env/src/schemas/api.schema.ts
import { z } from 'zod';

export const ApiConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  PORT: z.coerce.number().min(1000).max(65535).default(4000),

  // Database
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  DB_POOL_SIZE: z.coerce.number().min(1).max(100).default(10),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 chars'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Session
  SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 chars'),

  // CORS
  CORS_ORIGIN: z.string().url().default('http://localhost:3000'),

  // Redis
  REDIS_URL: z.string().url().optional(),
});

export type ApiConfig = z.infer<typeof ApiConfigSchema>;
```

### Validation at Startup

```typescript
// apps/api/src/config/env.validation.ts
import { ApiConfigSchema } from '@freeflow/config-env';

export function validate(config: Record<string, unknown>) {
  const result = ApiConfigSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.format();
    console.error('❌ Invalid environment configuration:');
    console.error(JSON.stringify(errors, null, 2));
    throw new Error('Invalid environment configuration');
  }

  return result.data;
}
```

### Benefits

✅ **Type Safety** - Full TypeScript types from schema
✅ **Validation** - Invalid config fails at startup, not runtime
✅ **Documentation** - Schema serves as documentation
✅ **Defaults** - Sensible defaults for optional variables
✅ **Coercion** - Automatic string-to-number conversion

---

## Variable Reference

### Frontend Variables (Next.js)

| Variable | Type | Secret? | Description | Example |
|----------|------|---------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Public | ❌ | API Gateway URL | `http://localhost:4000` |
| `NEXT_PUBLIC_APP_NAME` | Public | ❌ | Application name | `FreeFlow` |
| `NEXT_PUBLIC_APP_VERSION` | Public | ❌ | Version string | `1.0.0` |
| `NEXT_PUBLIC_SENTRY_DSN` | Public | ❌ | Sentry DSN (optional) | `https://...` |
| `SESSION_SECRET` | Server | ✅ | Session encryption key | `<32+ char random>` |
| `API_KEY` | Server | ✅ | Internal API key | `<32+ char random>` |

### Backend Variables (NestJS API)

| Variable | Type | Secret? | Description | Example |
|----------|------|---------|-------------|---------|
| `NODE_ENV` | Config | ❌ | Environment name | `production` |
| `PORT` | Config | ❌ | Server port | `4000` |
| `DATABASE_URL` | Secret | ✅ | PostgreSQL connection | `postgresql://...` |
| `DB_POOL_SIZE` | Config | ❌ | Connection pool size | `10` |
| `REDIS_URL` | Secret | ✅ | Redis connection | `redis://...` |
| `JWT_SECRET` | Secret | ✅ | JWT signing key | `<32+ char random>` |
| `JWT_EXPIRES_IN` | Config | ❌ | Token expiry | `15m` |
| `SESSION_SECRET` | Secret | ✅ | Session signing key | `<32+ char random>` |
| `CORS_ORIGIN` | Config | ❌ | Allowed origins | `https://freeflow.dev` |
| `LOG_LEVEL` | Config | ❌ | Logging level | `info` |

---

## Best Practices

### DO ✅

- Use `.env.example` files with dummy values
- Validate all environment variables at startup
- Use Zod or Joi for schema validation
- Fail fast on missing required variables
- Use explicit variable names (`JWT_SECRET` not `SECRET`)
- Generate secrets with cryptographically secure methods
- Rotate secrets regularly (90 days recommended)
- Use different secrets per environment
- Document what each variable does
- Use TypeScript types derived from schemas

### DON'T ❌

- Commit `.env` files to version control
- Store secrets in code
- Use weak or predictable secrets
- Share production secrets in Slack/email
- Log sensitive values
- Include secrets in error messages
- Use same secrets across environments
- Hard-code API URLs in components
- Skip validation for "just testing"

---

## Troubleshooting

### Common Issues

#### "Cannot find environment variable"

```bash
# Check if variable is defined
echo $DATABASE_URL

# Check if .env.local exists
ls -la apps/api/.env.local

# Verify variable is in .env.local
cat apps/api/.env.local | grep DATABASE_URL
```

#### "Environment validation failed"

```bash
# Run validation manually
pnpm --filter @freeflow/api dev

# Check console output for specific error:
# ❌ Invalid environment configuration:
# {
#   "JWT_SECRET": {
#     "_errors": ["String must contain at least 32 character(s)"]
#   }
# }
```

#### "NEXT_PUBLIC_* variable is undefined"

- Rebuild the app: `pnpm build`
- `NEXT_PUBLIC_*` variables are embedded at build time
- Changing them requires rebuild

#### "Cookie not being set"

- Check `Secure` flag (must be HTTPS in production)
- Check `SameSite` attribute (strict vs lax)
- Check domain matches (`.freeflow.dev` vs `freeflow.dev`)
- Verify `credentials: 'include'` in fetch requests

---

## Migration Guide

### From No Config Validation

1. Install dependencies:
```bash
pnpm add zod
pnpm add -D @types/node
```

2. Create schema file:
```typescript
// config/env.schema.ts
import { z } from 'zod';
export const EnvSchema = z.object({ /* ... */ });
```

3. Add validation function:
```typescript
// config/env.validation.ts
export function validate(config: Record<string, unknown>) {
  return EnvSchema.parse(config);
}
```

4. Update module:
```typescript
ConfigModule.forRoot({ validate });
```

### From Joi to Zod

```typescript
// Before (Joi)
const schema = Joi.object({
  PORT: Joi.number().required(),
});

// After (Zod)
const schema = z.object({
  PORT: z.coerce.number(),
});
```

---

## Security Checklist

- [ ] All secrets in `.env.local` (git-ignored)
- [ ] `.env.example` has no real secrets
- [ ] Secrets validated at startup
- [ ] Production secrets in K8s Secrets or Vault
- [ ] HttpOnly cookies for sessions
- [ ] Secure flag enabled in production
- [ ] SameSite=strict for CSRF protection
- [ ] CORS properly configured
- [ ] No secrets in logs
- [ ] No secrets in error messages
- [ ] No secrets in frontend bundle
- [ ] Secret rotation policy defined
- [ ] Access to secrets is audited

---

## Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [Zod Documentation](https://zod.dev/)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
