# Keycloak Client Integration for Next.js

Complete guide for integrating Keycloak authentication with Next.js using PKCE (Proof Key for Code Exchange) flow.

## Table of Contents

- [Overview](#overview)
- [Client Configuration](#client-configuration)
- [Environment Setup](#environment-setup)
- [Installation](#installation)
- [Implementation](#implementation)
- [Usage](#usage)
- [Role-Based Access Control](#role-based-access-control)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)

## Overview

### What is PKCE?

PKCE (Proof Key for Code Exchange, RFC 7636) is an OAuth 2.0 extension that provides additional security for public clients like SPAs and mobile apps. It prevents authorization code interception attacks.

**Why PKCE for Next.js?**
- ✅ No client secret needed (public client)
- ✅ Secure against authorization code interception
- ✅ Recommended for all OAuth 2.0 public clients
- ✅ Required by OAuth 2.1 specification

### Authentication Flow

```
┌──────────┐                                  ┌──────────┐
│          │                                  │          │
│  Next.js │                                  │ Keycloak │
│   App    │                                  │  Server  │
│          │                                  │          │
└────┬─────┘                                  └────┬─────┘
     │                                             │
     │ 1. Generate code_verifier & code_challenge │
     │    (SHA256 hash of verifier)               │
     │                                             │
     │ 2. Authorization Request                   │
     │    (with code_challenge)                   │
     ├────────────────────────────────────────────>
     │                                             │
     │ 3. User Login                               │
     │    (Keycloak UI)                           │
     │                                             │
     │ 4. Authorization Code                       │
     │    (callback with code)                    │
     <────────────────────────────────────────────┤
     │                                             │
     │ 5. Token Request                            │
     │    (code + code_verifier)                  │
     ├────────────────────────────────────────────>
     │                                             │
     │ 6. Verify code_challenge                    │
     │    matches code_verifier                   │
     │                                             │
     │ 7. Access Token + ID Token                  │
     <────────────────────────────────────────────┤
     │                                             │
```

## Client Configuration

### Keycloak Client Settings

**Client ID**: `freeflow-web`

**Client Type**: Public (no secret required)

**Key Security Features**:
- ✅ PKCE Required: `S256` (SHA-256)
- ✅ Standard Flow: Enabled
- ✅ Implicit Flow: Disabled (less secure)
- ✅ Direct Access Grants: Disabled (prevents password grant)

### Redirect URIs (Multi-Environment)

The realm is configured for development, staging, and production:

**Development:**
- `http://localhost:3000/*`
- `http://localhost:3000/api/auth/callback/keycloak`
- `http://127.0.0.1:3000/*`
- `http://dev.freeflow.local:3000/*`

**Staging:**
- `https://staging.freeflow.com/*`
- `https://staging.freeflow.com/api/auth/callback/keycloak`

**Production:**
- `https://freeflow.com/*`
- `https://freeflow.com/api/auth/callback/keycloak`
- `https://www.freeflow.com/*`
- `https://www.freeflow.com/api/auth/callback/keycloak`

### Web Origins (CORS)

Allowed origins for CORS:
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `https://dev.freeflow.com`
- `https://staging.freeflow.com`
- `https://freeflow.com`
- `https://www.freeflow.com`

### Post Logout Redirect URIs

Users are redirected here after logout:
- `http://localhost:3000/`
- `https://staging.freeflow.com/`
- `https://freeflow.com/`
- `https://www.freeflow.com/`

## Environment Setup

### Environment Variables

Create `.env.local` in your Next.js app:

```bash
# Keycloak Configuration
KEYCLOAK_ID=freeflow-web
KEYCLOAK_ISSUER=http://localhost:8080/realms/freeflow
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-random-secret-here

# For production, use:
# KEYCLOAK_ISSUER=https://auth.freeflow.com/realms/freeflow
# NEXTAUTH_URL=https://freeflow.com
```

### Generate NextAuth Secret

```bash
openssl rand -base64 32
```

### Environment-Specific Configuration

**Development** (`.env.local`):
```bash
KEYCLOAK_ISSUER=http://localhost:8080/realms/freeflow
NEXTAUTH_URL=http://localhost:3000
```

**Staging** (`.env.staging`):
```bash
KEYCLOAK_ISSUER=https://auth-staging.freeflow.com/realms/freeflow
NEXTAUTH_URL=https://staging.freeflow.com
```

**Production** (`.env.production`):
```bash
KEYCLOAK_ISSUER=https://auth.freeflow.com/realms/freeflow
NEXTAUTH_URL=https://freeflow.com
```

## Installation

### 1. Install NextAuth.js

```bash
pnpm add next-auth@beta
```

**Note**: Use NextAuth.js v5 (beta) for Next.js 14+ with App Router support.

### 2. Install Additional Dependencies (Optional)

```bash
pnpm add jose  # For JWT verification
pnpm add @auth/core  # Core types
```

## Implementation

### App Router (Next.js 14+)

#### 1. Configure NextAuth

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

export const authOptions: NextAuthConfig = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID!,
      clientSecret: "", // Empty for public clients
      issuer: process.env.KEYCLOAK_ISSUER,
      authorization: {
        params: {
          // Force PKCE
          code_challenge_method: "S256",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and roles to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }

      // Add user roles from Keycloak
      if (profile) {
        token.roles = profile.realm_access?.roles || [];
      }

      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string;
      session.user.roles = token.roles as string[];
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

#### 2. Extend NextAuth Types

Create `types/next-auth.d.ts`:

```typescript
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      roles?: string[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    roles?: string[];
  }
}
```

#### 3. Create Session Provider

Create `components/providers/session-provider.tsx`:

```typescript
"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export function SessionProvider({ children }: { children: ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
```

#### 4. Wrap App in Provider

Update `app/layout.tsx`:

```typescript
import { SessionProvider } from "@/components/providers/session-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

### Pages Router (Next.js 13 and below)

#### 1. Configure NextAuth

Create `pages/api/auth/[...nextauth].ts`:

```typescript
import NextAuth, { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID!,
      clientSecret: "", // Empty for public clients
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      if (profile) {
        token.roles = (profile as any).realm_access?.roles || [];
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      (session.user as any).roles = token.roles;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};

export default NextAuth(authOptions);
```

#### 2. Wrap App in Provider

Update `pages/_app.tsx`:

```typescript
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
```

## Usage

### Client-Side Usage

#### Check Authentication Status

```typescript
"use client";

import { useSession } from "next-auth/react";

export function ProfileButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <p>Welcome, {session?.user?.name}</p>
      <p>Email: {session?.user?.email}</p>
      <p>Roles: {session?.user?.roles?.join(", ")}</p>
    </div>
  );
}
```

#### Sign In / Sign Out

```typescript
"use client";

import { signIn, signOut } from "next-auth/react";

export function AuthButtons() {
  return (
    <div>
      <button onClick={() => signIn("keycloak")}>
        Sign in with Keycloak
      </button>
      <button onClick={() => signOut()}>
        Sign out
      </button>
    </div>
  );
}
```

### Server-Side Usage (App Router)

#### Protect Server Components

```typescript
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div>
      <h1>Protected Page</h1>
      <p>Welcome, {session.user?.name}</p>
    </div>
  );
}
```

#### API Route Protection

```typescript
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ data: "Protected data" });
}
```

### Middleware Protection

Create `middleware.ts` in root:

```typescript
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
  const isProtectedPage = req.nextUrl.pathname.startsWith("/dashboard");

  if (isProtectedPage && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

## Role-Based Access Control

### Check Roles in Components

```typescript
"use client";

import { useSession } from "next-auth/react";

export function AdminPanel() {
  const { data: session } = useSession();

  const isAdmin = session?.user?.roles?.includes("Admin");

  if (!isAdmin) {
    return <div>Access Denied: Admin role required</div>;
  }

  return <div>Admin Panel Content</div>;
}
```

### Create Role Check Utility

Create `lib/auth.ts`:

```typescript
import { Session } from "next-auth";

export function hasRole(session: Session | null, role: string): boolean {
  return session?.user?.roles?.includes(role) ?? false;
}

export function hasAnyRole(session: Session | null, roles: string[]): boolean {
  return roles.some((role) => hasRole(session, role));
}

export function hasAllRoles(session: Session | null, roles: string[]): boolean {
  return roles.every((role) => hasRole(session, role));
}
```

Usage:

```typescript
import { hasRole } from "@/lib/auth";
import { useSession } from "next-auth/react";

export function FeatureButton() {
  const { data: session } = useSession();

  if (!hasRole(session, "Admin")) {
    return null;
  }

  return <button>Admin Feature</button>;
}
```

### Server-Side Role Check

```typescript
import { auth } from "@/auth";
import { hasRole } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();

  if (!hasRole(session, "Admin")) {
    redirect("/unauthorized");
  }

  return <div>Admin Page</div>;
}
```

### Create HOC for Role Protection

```typescript
"use client";

import { useSession } from "next-auth/react";
import { ComponentType } from "react";

export function withRole<P extends object>(
  Component: ComponentType<P>,
  requiredRole: string
) {
  return function WithRoleComponent(props: P) {
    const { data: session, status } = useSession();

    if (status === "loading") {
      return <div>Loading...</div>;
    }

    if (!session?.user?.roles?.includes(requiredRole)) {
      return <div>Access Denied</div>;
    }

    return <Component {...props} />;
  };
}
```

Usage:

```typescript
const AdminDashboard = withRole(DashboardComponent, "Admin");
```

## Troubleshooting

### Common Issues

#### 1. PKCE Error

**Error**: `PKCE code challenge method not supported`

**Solution**: Ensure PKCE is enabled in Keycloak client settings:
```json
"attributes": {
  "pkce.code.challenge.method": "S256"
}
```

#### 2. Redirect URI Mismatch

**Error**: `Invalid redirect_uri`

**Solution**:
1. Check `NEXTAUTH_URL` matches your redirect URI
2. Verify redirect URIs in Keycloak client include your callback URL
3. Ensure trailing slashes match

#### 3. CORS Errors

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**: Add your origin to Web Origins in Keycloak client settings.

#### 4. Token Not Persisting

**Problem**: Session lost on refresh

**Solution**:
1. Ensure `session.strategy = "jwt"` is set
2. Check `NEXTAUTH_SECRET` is configured
3. Verify cookies are being set (check browser dev tools)

#### 5. Roles Not Appearing

**Problem**: `session.user.roles` is undefined

**Solution**:
1. Ensure JWT callback extracts roles from profile
2. Check Keycloak realm roles are assigned to users
3. Verify "roles" scope is included in client scopes

### Testing Authentication Locally

```bash
# 1. Start Keycloak
make up

# 2. Verify Keycloak is running
curl http://localhost:8080/realms/freeflow/.well-known/openid-configuration

# 3. Start Next.js app
pnpm dev

# 4. Test login flow
# Navigate to http://localhost:3000
# Click "Sign in"
# Should redirect to Keycloak login
```

### Debug Mode

Enable debug mode in NextAuth:

```typescript
export const authOptions: NextAuthConfig = {
  debug: process.env.NODE_ENV === "development",
  // ... other options
};
```

Check logs for detailed OAuth flow information.

## Security Considerations

### ✅ Best Practices

1. **Use PKCE**: Always use S256 code challenge method
2. **HTTPS in Production**: Never use HTTP in production
3. **Secure Cookies**: NextAuth automatically uses secure cookies in production
4. **Token Expiration**: Configure appropriate session timeouts
5. **Logout Handling**: Always call `signOut()` to clear tokens

### ⚠️ Important Security Notes

**Never**:
- ❌ Store access tokens in localStorage
- ❌ Expose client secrets in frontend code
- ❌ Use implicit flow (deprecated)
- ❌ Disable PKCE
- ❌ Allow wildcards in redirect URIs

**Always**:
- ✅ Use PKCE with S256
- ✅ Validate tokens on the server
- ✅ Use HTTPS in production
- ✅ Keep dependencies updated
- ✅ Configure CORS properly

### Token Security

**Access Token**:
- Stored in session (JWT)
- Short-lived (5 minutes default)
- Used for API calls

**Refresh Token**:
- Stored in session (JWT)
- Long-lived (30 days default)
- Used to refresh access tokens

**ID Token**:
- Contains user information
- Used for authentication
- Validated by NextAuth

### Session Management

```typescript
// Refresh token before expiration
export const authOptions: NextAuthConfig = {
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.expiresAt = Date.now() + (account.expires_at ?? 0) * 1000;
      }

      // Refresh token if expiring soon
      if (Date.now() < token.expiresAt - 60000) {
        return token;
      }

      // Refresh logic here
      return token;
    },
  },
};
```

## Testing Credentials

Use these test accounts (development only):

| Username | Password | Role | Email |
|----------|----------|------|-------|
| `admin` | `admin` | Admin | admin@freeflow.dev |
| `operator` | `operator` | Operator | operator@freeflow.dev |
| `viewer` | `viewer` | Viewer | viewer@freeflow.dev |

⚠️ **Change these credentials before production deployment!**

## References

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [OAuth 2.0 PKCE (RFC 7636)](https://datatracker.ietf.org/doc/html/rfc7636)
- [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html)

## Quick Reference

### Environment Variables Checklist

```bash
✅ KEYCLOAK_ID              # Client ID (freeflow-web)
✅ KEYCLOAK_ISSUER          # Realm URL
✅ NEXTAUTH_URL             # Your app URL
✅ NEXTAUTH_SECRET          # Random secret (32+ chars)
```

### Common Commands

```bash
# Generate secret
openssl rand -base64 32

# Test Keycloak configuration
curl http://localhost:8080/realms/freeflow/.well-known/openid-configuration | jq

# Start development
pnpm dev

# Check session
# Visit http://localhost:3000/api/auth/session
```

### URLs by Environment

| Environment | Keycloak Issuer | App URL |
|-------------|-----------------|---------|
| Development | `http://localhost:8080/realms/freeflow` | `http://localhost:3000` |
| Staging | `https://auth-staging.freeflow.com/realms/freeflow` | `https://staging.freeflow.com` |
| Production | `https://auth.freeflow.com/realms/freeflow` | `https://freeflow.com` |
