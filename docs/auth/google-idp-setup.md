# Google Identity Provider Setup for Keycloak

Complete guide for adding Google as an Identity Provider (IdP) in Keycloak, enabling "Sign in with Google" for FreeFlow users.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Part 1: Google Cloud Console Setup](#part-1-google-cloud-console-setup)
- [Part 2: Keycloak Configuration](#part-2-keycloak-configuration)
- [Part 3: Attribute Mapping](#part-3-attribute-mapping)
- [Part 4: Testing](#part-4-testing)
- [Advanced Configuration](#advanced-configuration)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)

## Overview

### What is Social Login?

Social login (also called federated identity or social identity provider) allows users to sign in to FreeFlow using their existing Google account instead of creating a new password.

**Benefits:**
- ✅ Improved user experience (one-click login)
- ✅ Reduced password fatigue
- ✅ Leverages Google's security (2FA, etc.)
- ✅ Automatic email verification
- ✅ Pre-filled profile information

### Authentication Flow

```
┌──────────┐                 ┌──────────┐                 ┌──────────┐
│          │                 │          │                 │          │
│ FreeFlow │                 │ Keycloak │                 │  Google  │
│   App    │                 │          │                 │          │
│          │                 │          │                 │          │
└────┬─────┘                 └────┬─────┘                 └────┬─────┘
     │                            │                            │
     │ 1. Click "Sign in          │                            │
     │    with Google"            │                            │
     ├────────────────────────────>                            │
     │                            │                            │
     │ 2. Redirect to Google      │                            │
     │    (with OAuth params)     │                            │
     │                            ├────────────────────────────>
     │                            │                            │
     │                            │ 3. User logs in            │
     │                            │    to Google               │
     │                            │                            │
     │                            │ 4. Authorization granted    │
     │                            <────────────────────────────┤
     │                            │    (with auth code)        │
     │                            │                            │
     │                            │ 5. Exchange code for tokens│
     │                            ├────────────────────────────>
     │                            │                            │
     │                            │ 6. Access token + ID token │
     │                            <────────────────────────────┤
     │                            │    (with user claims)      │
     │                            │                            │
     │ 7. Create/update user      │                            │
     │    in Keycloak             │                            │
     │    (based on Google ID)    │                            │
     │                            │                            │
     │ 8. Keycloak session        │                            │
     │    established             │                            │
     <────────────────────────────┤                            │
     │                            │                            │
```

## Prerequisites

### Required Access

- ✅ Google Account (to create OAuth credentials)
- ✅ Keycloak Admin Console access
- ✅ Realm admin permissions in Keycloak

### Domain Requirements

- Public domain for production (e.g., `freeflow.com`)
- Localhost works for development testing

## Part 1: Google Cloud Console Setup

### Step 1: Create Google Cloud Project

1. **Navigate to Google Cloud Console**:
   ```
   https://console.cloud.google.com/
   ```

2. **Create a new project**:
   - Click the project dropdown (top left)
   - Click "New Project"
   - Project Name: `FreeFlow`
   - Organization: Select your organization (optional)
   - Click "Create"

3. **Select your project**:
   - Click the project dropdown
   - Select "FreeFlow"

### Step 2: Configure OAuth Consent Screen

1. **Navigate to OAuth consent screen**:
   ```
   APIs & Services > OAuth consent screen
   ```

2. **Choose user type**:
   - **Internal**: Only for Google Workspace users in your organization
   - **External**: For public applications (choose this for FreeFlow)
   - Click "Create"

3. **App Information**:
   - **App name**: `FreeFlow`
   - **User support email**: `support@freeflow.com`
   - **App logo**: Upload your logo (120x120px recommended)
   - **Application home page**: `https://freeflow.com`
   - **Application privacy policy**: `https://freeflow.com/privacy`
   - **Application terms of service**: `https://freeflow.com/terms`
   - **Authorized domains**:
     ```
     freeflow.com
     staging.freeflow.com
     ```
   - **Developer contact**: `dev@freeflow.com`
   - Click "Save and Continue"

4. **Scopes**:
   - Click "Add or Remove Scopes"
   - Select the following scopes:
     - `.../auth/userinfo.email` - View your email address
     - `.../auth/userinfo.profile` - View your basic profile info
     - `openid` - OpenID Connect authentication
   - Click "Update"
   - Click "Save and Continue"

5. **Test users** (for External apps in testing):
   - Add test user emails if your app is not yet published
   - Click "Add Users"
   - Enter email addresses
   - Click "Save and Continue"

6. **Summary**:
   - Review your configuration
   - Click "Back to Dashboard"

### Step 3: Create OAuth 2.0 Credentials

1. **Navigate to Credentials**:
   ```
   APIs & Services > Credentials
   ```

2. **Create credentials**:
   - Click "Create Credentials"
   - Select "OAuth client ID"

3. **Application type**:
   - Select "Web application"

4. **Name**:
   ```
   FreeFlow Keycloak Integration
   ```

5. **Authorized JavaScript origins**:
   ```
   http://localhost:8080
   https://auth.freeflow.com
   https://auth-staging.freeflow.com
   ```

6. **Authorized redirect URIs**:

   Format: `{KEYCLOAK_URL}/realms/{REALM_NAME}/broker/google/endpoint`

   **Development**:
   ```
   http://localhost:8080/realms/freeflow/broker/google/endpoint
   ```

   **Staging**:
   ```
   https://auth-staging.freeflow.com/realms/freeflow/broker/google/endpoint
   ```

   **Production**:
   ```
   https://auth.freeflow.com/realms/freeflow/broker/google/endpoint
   ```

7. **Create**:
   - Click "Create"
   - **Save your credentials**:
     - **Client ID**: `1234567890-abcdef123456.apps.googleusercontent.com`
     - **Client Secret**: `GOCSPX-aBcDeFgHiJkLmNoPqRsTuVwXyZ`
   - ⚠️ **Store these securely** - you'll need them for Keycloak

### Step 4: Enable Google+ API (Optional but Recommended)

1. **Navigate to API Library**:
   ```
   APIs & Services > Library
   ```

2. **Search for "Google+ API"**:
   - Click on "Google+ API"
   - Click "Enable"
   - This provides access to extended profile information

## Part 2: Keycloak Configuration

### Step 1: Access Keycloak Admin Console

1. **Navigate to Keycloak**:
   ```
   http://localhost:8080 (development)
   https://auth.freeflow.com (production)
   ```

2. **Login**:
   - Username: `admin`
   - Password: Your admin password

3. **Select Realm**:
   - Click realm dropdown (top left)
   - Select "freeflow"

### Step 2: Add Google Identity Provider

1. **Navigate to Identity Providers**:
   ```
   Identity Providers (left sidebar)
   ```

2. **Add provider**:
   - Click "Add provider"
   - Select "Google"

3. **Basic Settings**:

   **Alias** (required):
   ```
   google
   ```
   ⚠️ This becomes part of the redirect URI - don't change after creation!

   **Display name** (optional):
   ```
   Google
   ```

   **Enabled**:
   ```
   ✅ ON
   ```

   **Store tokens**:
   ```
   ✅ ON (recommended for accessing Google APIs later)
   ```

   **Stored tokens readable**:
   ```
   ❌ OFF (security best practice)
   ```

   **Trust email**:
   ```
   ✅ ON (trust email verification from Google)
   ```

   **Account linking only**:
   ```
   ❌ OFF (allow new user creation)
   ```

   **Hide on login page**:
   ```
   ❌ OFF (show "Sign in with Google" button)
   ```

   **First login flow**:
   ```
   first broker login (default)
   ```

   **Post login flow**:
   ```
   (leave empty)
   ```

   **Sync mode**:
   ```
   import (update user on each login)
   ```

4. **OAuth Settings**:

   **Client ID**:
   ```
   Paste your Google Client ID from Step 3
   Example: 1234567890-abcdef123456.apps.googleusercontent.com
   ```

   **Client Secret**:
   ```
   Paste your Google Client Secret from Step 3
   Example: GOCSPX-aBcDeFgHiJkLmNoPqRsTuVwXyZ
   ```

   **Default scopes**:
   ```
   openid profile email
   ```

   **Accepts prompt=none forward from client**:
   ```
   ❌ OFF
   ```

5. **Advanced Settings**:

   **Pass login_hint**:
   ```
   ❌ OFF
   ```

   **Pass current locale**:
   ```
   ✅ ON (pass user's language preference to Google)
   ```

   **Forwarded query parameters**:
   ```
   (leave empty)
   ```

6. **Save**:
   - Click "Save"
   - Note the **Redirect URI** displayed at the top
   - Verify this matches what you configured in Google Console

### Step 3: Copy Redirect URI

After saving, Keycloak displays the redirect URI:

```
Redirect URI: http://localhost:8080/realms/freeflow/broker/google/endpoint
```

**Important**: This must match EXACTLY one of the URIs you configured in Google Console.

## Part 3: Attribute Mapping

### Understanding User Attributes

Google provides these claims in the ID token:

| Claim | Description | Example |
|-------|-------------|---------|
| `sub` | Unique Google user ID | `1234567890123456789` |
| `email` | User's email | `user@gmail.com` |
| `email_verified` | Email verification status | `true` |
| `name` | Full name | `John Doe` |
| `given_name` | First name | `John` |
| `family_name` | Last name | `Doe` |
| `picture` | Profile picture URL | `https://...` |
| `locale` | User's locale | `en` |

### Step 1: Configure Attribute Mappers

1. **Navigate to Mappers**:
   ```
   Identity Providers > google > Mappers
   ```

2. **Add built-in mappers** (recommended):
   - Click "Add mapper"
   - Select from predefined mappers:

#### Email Mapper

- **Name**: `google-email`
- **Mapper Type**: `Attribute Importer`
- **Social Profile JSON Field Path**: `email`
- **User Attribute Name**: `email`
- Click "Save"

#### First Name Mapper

- **Name**: `google-first-name`
- **Mapper Type**: `Attribute Importer`
- **Social Profile JSON Field Path**: `given_name`
- **User Attribute Name**: `firstName`
- Click "Save"

#### Last Name Mapper

- **Name**: `google-last-name`
- **Mapper Type**: `Attribute Importer`
- **Social Profile JSON Field Path**: `family_name`
- **User Attribute Name**: `lastName`
- Click "Save"

#### Profile Picture Mapper

- **Name**: `google-picture`
- **Mapper Type**: `Attribute Importer`
- **Social Profile JSON Field Path**: `picture`
- **User Attribute Name**: `picture`
- Click "Save"

#### Locale Mapper

- **Name**: `google-locale`
- **Mapper Type**: `Attribute Importer`
- **Social Profile JSON Field Path**: `locale`
- **User Attribute Name**: `locale`
- Click "Save"

### Step 2: Configure Username Template

By default, Keycloak creates usernames like `google.1234567890`.

To use email as username:

1. **Navigate back to Google IdP settings**:
   ```
   Identity Providers > google
   ```

2. **Scroll to "Advanced Settings"**:

   **Username template**:
   ```
   ${CLAIM.email}
   ```

   Or for email prefix only:
   ```
   ${CLAIM.email_prefix}
   ```

3. **Save**

### Step 3: Automatic Role Assignment (Optional)

To automatically assign roles to Google users:

1. **Create Role Mapper**:
   - Click "Add mapper"
   - **Name**: `google-default-role`
   - **Mapper Type**: `Hardcoded Role`
   - **Role**: Select role (e.g., `Viewer`)
   - Click "Save"

Or use advanced role mapping:

1. **Create Advanced Role Mapper**:
   - **Name**: `google-role-from-domain`
   - **Mapper Type**: `Advanced Attribute to Role`
   - **Social Profile JSON Field Path**: `email`
   - **Regex Pattern**: `.*@freeflow\.com$`
   - **Role**: `Operator`
   - Click "Save"

This assigns "Operator" role to anyone with @freeflow.com email.

## Part 4: Testing

### Step 1: Test the Login Flow

1. **Open FreeFlow in incognito/private window**:
   ```
   http://localhost:3000
   ```

2. **Click "Sign In"**:
   - Should redirect to Keycloak login page

3. **Click "Sign in with Google"**:
   - Should redirect to Google login

4. **Login with Google**:
   - Enter Google credentials
   - Grant permissions if prompted

5. **First-time user flow**:
   - Keycloak may show "Update Account Information" page
   - Review and update profile if needed
   - Click "Submit"

6. **Verify redirect**:
   - Should redirect back to FreeFlow
   - User should be logged in

### Step 2: Verify User in Keycloak

1. **Navigate to Users**:
   ```
   Keycloak Admin > Users
   ```

2. **Search for user**:
   - Enter email or username
   - Click "Search"

3. **Check user details**:
   - **Username**: Should match template
   - **Email**: Should match Google email
   - **Email verified**: Should be `true`
   - **First/Last name**: Should be populated

4. **Check Federated Identity**:
   - Click on user
   - Go to "Federated Identity" tab
   - Should show Google identity with ID

5. **Check attributes**:
   - Go to "Attributes" tab
   - Should show `picture`, `locale`, etc.

### Step 3: Test Subsequent Logins

1. **Logout from FreeFlow**

2. **Login again with Google**:
   - Should be instant (no account info update)
   - Should use existing Keycloak user

3. **Verify attributes are updated**:
   - Change name on Google
   - Login again to FreeFlow
   - Check if name updated in Keycloak (if sync mode is "import")

## Advanced Configuration

### Account Linking

Allow users to link existing Keycloak accounts with Google:

1. **Enable account linking**:
   ```
   Identity Providers > google > Settings
   ```

2. **First login flow**:
   ```
   Select: first broker login
   ```

3. **Configure "First Broker Login" flow**:
   ```
   Authentication > Flows > first broker login
   ```

4. **Add "Detect existing account" execution** (if not present):
   - This prompts users to link accounts

### Custom Claims Mapping

To map custom Google claims:

1. **Request additional scopes** in Google IdP settings:
   ```
   Default scopes: openid profile email https://www.googleapis.com/auth/user.birthday.read
   ```

2. **Create mapper** for custom claim:
   - **Mapper Type**: `Attribute Importer`
   - **Social Profile JSON Field Path**: `birthday`
   - **User Attribute Name**: `birthdate`

### Domain Restrictions

Restrict Google login to specific domains:

1. **Create Domain Validator**:
   ```
   Authentication > Flows > first broker login
   ```

2. **Add "Condition - User Attribute" execution**:
   - **Attribute name**: `email`
   - **Expected value**: `.*@freeflow\.com$` (regex)
   - **Negate**: `false`
   - **Alias**: `domain-check`

### Disable Local Login

Force users to login only with Google:

1. **Hide login form**:
   ```
   Realm Settings > Themes > Login Theme
   ```
   - Customize theme to hide username/password form

2. **Or redirect directly to Google**:
   - Configure in your application
   - Use `kc_idp_hint=google` parameter

## Troubleshooting

### Issue: Redirect URI Mismatch

**Error**: `redirect_uri_mismatch` from Google

**Solution**:
1. Copy exact redirect URI from Keycloak IdP settings
2. Add it to Google Console > Credentials > Authorized redirect URIs
3. Ensure no typos, trailing slashes, or protocol mismatches

### Issue: Email Already Exists

**Error**: "User with email already exists"

**Solution**:
1. Enable account linking in First Broker Login flow
2. Or manually link accounts in Keycloak Admin
3. Or delete duplicate user

### Issue: Attributes Not Mapping

**Problem**: User attributes are empty in Keycloak

**Solution**:
1. Check mapper configuration in Keycloak
2. Verify JSON field path matches Google's claim names
3. Check if scopes include required data (profile, email)
4. Enable "Store Tokens" to debug raw token contents

### Issue: Invalid Client Error

**Error**: `invalid_client` or `unauthorized_client`

**Solution**:
1. Verify Client ID and Secret are correct
2. Check Client Secret hasn't expired
3. Ensure project is enabled in Google Console
4. Verify OAuth consent screen is configured

### Issue: User Not Created

**Problem**: Google login succeeds but user not created in Keycloak

**Solution**:
1. Check Keycloak logs for errors
2. Verify "Account linking only" is OFF
3. Check First Broker Login flow configuration
4. Ensure user doesn't already exist with same email

### Issue: Session Not Created

**Problem**: Successful Google login but no FreeFlow session

**Solution**:
1. Check NextAuth configuration includes Google provider
2. Verify NEXTAUTH_URL environment variable
3. Check browser console for errors
4. Ensure cookies are being set (check browser settings)

## Security Considerations

### ✅ Best Practices

1. **Client Secret Protection**:
   - Store in environment variables
   - Never commit to version control
   - Rotate regularly (every 90 days)

2. **Scope Minimization**:
   - Only request necessary scopes
   - Don't request `https://www.googleapis.com/auth/...` unless needed

3. **Email Verification**:
   - Keep "Trust Email" ON (Google verifies emails)
   - Reduces fraud and fake accounts

4. **Token Storage**:
   - Enable "Store Tokens" only if you need to call Google APIs
   - Otherwise, leave OFF to reduce attack surface

5. **HTTPS Only**:
   - Use HTTPS in production
   - Configure authorized origins correctly

6. **Regular Updates**:
   - Keep Keycloak updated
   - Monitor Google OAuth security advisories

### ⚠️ Common Pitfalls

**DON'T**:
- ❌ Commit Client Secret to Git
- ❌ Use HTTP in production
- ❌ Share Client ID/Secret publicly
- ❌ Use same credentials across all environments
- ❌ Ignore consent screen configuration

**DO**:
- ✅ Use environment-specific credentials
- ✅ Configure OAuth consent screen properly
- ✅ Set up domain verification in Google Console
- ✅ Monitor for suspicious login attempts
- ✅ Implement account linking properly

### Privacy Considerations

1. **Data Minimization**:
   - Only map attributes you actually use
   - Don't store unnecessary Google data

2. **Consent**:
   - Google shows consent screen on first login
   - Make sure your privacy policy is accurate

3. **Data Retention**:
   - Configure token expiration properly
   - Delete user data when requested

4. **GDPR Compliance**:
   - Document what data you collect from Google
   - Allow users to disconnect Google account
   - Provide data export functionality

## Environment-Specific Configuration

### Development (.env.local)

```bash
# Google OAuth - Development
GOOGLE_CLIENT_ID=1234567890-dev.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-development-secret

# Keycloak
KEYCLOAK_ISSUER=http://localhost:8080/realms/freeflow
```

### Staging (.env.staging)

```bash
# Google OAuth - Staging
GOOGLE_CLIENT_ID=1234567890-staging.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-staging-secret

# Keycloak
KEYCLOAK_ISSUER=https://auth-staging.freeflow.com/realms/freeflow
```

### Production (.env.production)

```bash
# Google OAuth - Production
GOOGLE_CLIENT_ID=1234567890-prod.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-production-secret

# Keycloak
KEYCLOAK_ISSUER=https://auth.freeflow.com/realms/freeflow
```

⚠️ **Never commit these files to Git!** Add to `.gitignore`.

## User Experience Tips

### Customize Login Button

In your Next.js app:

```typescript
import { signIn } from "next-auth/react";

export function LoginButtons() {
  return (
    <div>
      {/* Direct Google login */}
      <button
        onClick={() => signIn("keycloak", {
          callbackUrl: "/dashboard",
          // Pre-select Google
          keycloak: {
            idpHint: "google"
          }
        })}
        className="google-button"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      {/* Or regular Keycloak login */}
      <button onClick={() => signIn("keycloak")}>
        Sign in
      </button>
    </div>
  );
}
```

### Skip Account Info Update

To skip the "Update Account Information" page:

1. **Configure First Broker Login flow**:
   ```
   Authentication > Flows > first broker login
   ```

2. **Disable "Review Profile" execution**:
   - Set to "Disabled"

3. **Or make it conditional**:
   - Add condition based on email domain
   - Only require review for external domains

## Monitoring and Analytics

### Track Google Login Usage

1. **Enable event listeners** in Keycloak:
   ```
   Realm Settings > Events > Event Listeners
   ```

2. **Add `jboss-logging`** (if not present)

3. **Enable user events**:
   - LOGIN
   - LOGIN_ERROR
   - IDENTITY_PROVIDER_LOGIN

4. **Query events via Admin API**:
   ```bash
   curl -X GET \
     "http://localhost:8080/admin/realms/freeflow/events" \
     -H "Authorization: Bearer $TOKEN" \
     | jq '.[] | select(.type == "IDENTITY_PROVIDER_LOGIN")'
   ```

### Analyze Login Patterns

Monitor:
- Google vs. local login ratio
- Failed Google logins
- Account linking attempts
- First-time vs. returning users

## Quick Reference

### Keycloak Google IdP Checklist

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Redirect URIs added to Google Console
- [ ] Google IdP added to Keycloak
- [ ] Client ID configured
- [ ] Client Secret configured
- [ ] Attribute mappers created
- [ ] Email mapper configured
- [ ] Name mappers configured
- [ ] "Trust Email" enabled
- [ ] "Store Tokens" configured (optional)
- [ ] Tested login flow
- [ ] Verified user creation
- [ ] Tested subsequent logins
- [ ] Checked attribute mapping

### Common Keycloak URLs

```
Admin Console:    {KEYCLOAK_URL}/admin
Realm Settings:   {KEYCLOAK_URL}/admin/master/console/#/freeflow
Identity Providers: {KEYCLOAK_URL}/admin/master/console/#/freeflow/identity-providers
Users:            {KEYCLOAK_URL}/admin/master/console/#/freeflow/users
Events:           {KEYCLOAK_URL}/admin/master/console/#/freeflow/events
```

### Google Console URLs

```
Console:          https://console.cloud.google.com/
OAuth Consent:    https://console.cloud.google.com/apis/credentials/consent
Credentials:      https://console.cloud.google.com/apis/credentials
API Library:      https://console.cloud.google.com/apis/library
```

## References

- [Keycloak Identity Providers Documentation](https://www.keycloak.org/docs/latest/server_admin/#_identity_broker)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OpenID Connect Core Specification](https://openid.net/specs/openid-connect-core-1_0.html)
- [Google Identity Platform](https://developers.google.com/identity)

## Support

For issues specific to:
- **Google OAuth**: Check Google Cloud Console support
- **Keycloak configuration**: Check Keycloak documentation
- **FreeFlow integration**: Check main project documentation
