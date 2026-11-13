# Google sign-in setup (Auth.js)

The Login and Signup pages use **Auth.js (NextAuth v5)** for Google OAuth.
Nothing is faked: the button redirects to Google's real consent screen.

Auth.js is used **only** as the OAuth broker. The application keeps its existing
`bookhaven_auth` JWT cookie as the single session of record, so password login,
cart/wishlist, orders and admin keep working unchanged.

> Facebook sign-in is intentionally not enabled. Only Google is configured.

## 1. Set the Auth.js environment variables

In `.env.local`:

```env
AUTH_SECRET="paste-a-long-random-string"

AUTH_GOOGLE_ID="xxxxxxxx.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="xxxxxxxxxxxxxxxx"
```

Generate a suitable secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

In production, `AUTH_SECRET` must be set. The app falls back to `JWT_SECRET` in
development only.

> Never put client secrets in frontend code. All OAuth secrets are read on the
> server inside `src/auth.ts`.

## 2. Google OAuth

1. Open <https://console.cloud.google.com/apis/credentials>.
2. Create a project (or select one), then configure the **OAuth consent screen**
   (External is fine; add yourself as a test user while in testing mode).
3. Go to **Credentials → Create credentials → OAuth client ID**.
4. Application type: **Web application**.
5. Add an **Authorized redirect URI**:

   ```
   http://localhost:3000/api/auth/callback/google
   ```

   For production add the HTTPS equivalent too:

   ```
   https://your-domain.com/api/auth/callback/google
   ```

6. Copy the **Client ID** and **Client secret** into `AUTH_GOOGLE_ID` and
   `AUTH_GOOGLE_SECRET`.

Google returns an `email_verified` flag. BookHaven only auto-links an existing
account when that flag is `true`.

## 3. Restart the server

Environment variables are read at server start, so restart Next.js:

```bash
npm run dev
```

Then click **Continue with Google** on `/login` or `/signup`.

## How it works

| Route | Purpose |
| --- | --- |
| `GET/POST /api/auth/*` | Auth.js provider handshake, callback and CSRF handling |
| `GET /api/auth/oauth-bridge` | After Auth.js succeeds, finds/creates the Mongoose user and mints the existing `bookhaven_auth` JWT cookie |

Account handling (`src/lib/oauthUser.ts`):

1. If the Google account is already linked → sign in to that user.
2. Else if a user with the same verified email exists → link Google to that
   account without changing the password, role, addresses, wishlist or purchases.
3. Else create a new customer. A random unusable password hash is stored so the
   existing required `passwordHash` field and password flows keep working.

A unique email index plus a duplicate-key retry prevents duplicate users if two
sign-ins race.

Logout clears both the app's `bookhaven_auth` cookie and the Auth.js session
cookies.

## Protected routes

`src/middleware.ts` verifies the existing `bookhaven_auth` JWT for:

- `/profile`
- `/orders`
- `/checkout`
- `/admin/*`

Unauthenticated visitors are redirected to `/login?next=<original-path>` and sent
back after signing in (password or Google).

## Legacy routes

The earlier hand-written OAuth implementation still exists at
`src/app/api/auth/social/[provider]/*` and `src/lib/oauth.ts`, but the UI no longer
uses it. It can be removed once you are happy with the Auth.js flow.
