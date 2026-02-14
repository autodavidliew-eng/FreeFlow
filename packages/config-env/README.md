# @freeflow/config-env

Shared environment configuration and validation for FreeFlow monorepo.

## Features

- ✅ Type-safe configuration with Zod validation
- ✅ Separate schemas for Next.js and NestJS
- ✅ Public vs server-only variable distinction
- ✅ Fail-fast validation at startup
- ✅ TypeScript types auto-generated from schemas

## Installation

```bash
# Already installed as workspace dependency
pnpm add @freeflow/config-env
```

## Usage

### Next.js (Frontend)

```typescript
// In server component or API route
import { loadWebServerConfig } from '@freeflow/config-env';

const config = loadWebServerConfig();
console.log(config.SESSION_SECRET); // ✅ Available

// In client component
import { getWebPublicConfig } from '@freeflow/config-env';

const config = getWebPublicConfig();
console.log(config.NEXT_PUBLIC_API_URL); // ✅ Available
```

### NestJS (Backend)

```typescript
// In main.ts
import { loadApiConfig } from '@freeflow/config-env';

async function bootstrap() {
  const config = loadApiConfig(); // Validates at startup

  const app = await NestFactory.create(AppModule);
  await app.listen(config.PORT);
}

// In any service
import { getApiConfig } from '@freeflow/config-env';

const config = getApiConfig();
const jwtSecret = config.JWT_SECRET;
```

### Custom Validation

```typescript
import { ApiEnvSchema } from '@freeflow/config-env';

// Extend the schema
const CustomSchema = ApiEnvSchema.extend({
  MY_CUSTOM_VAR: z.string().min(1),
});

// Validate
const config = CustomSchema.parse(process.env);
```

## Available Schemas

- `BaseEnvSchema` - Common variables (NODE_ENV, LOG_LEVEL)
- `ApiEnvSchema` - NestJS API configuration
- `WebPublicEnvSchema` - Next.js public variables (NEXT_PUBLIC_*)
- `WebServerEnvSchema` - Next.js server-only variables
- `WebEnvSchema` - Combined Next.js schema

## Constants

```typescript
import { URLS, COOKIE_DOMAINS, DEFAULTS } from '@freeflow/config-env';

// Get URLs for environment
const urls = URLS.production;
console.log(urls.api); // https://api.freeflow.dev

// Get cookie domain
const domain = COOKIE_DOMAINS.production; // .freeflow.dev

// Get defaults
const port = DEFAULTS.PORT; // 4000
```
