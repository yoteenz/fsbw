# WebAuthn (Passkey / Face ID) Setup

Passkeys let users sign in with Face ID, Touch ID, or Windows Hello in **Chrome**, **Safari**, and **Edge**. The frontend is already set up; you need a backend that stores credentials and verifies assertions.

## Why a backend is required

- The browser never sends your password to the server when using a passkey; instead it signs a **challenge** from your server.
- Your server must **generate that challenge**, and later **verify the signature** using the public key stored when the user registered the passkey.
- Without this, passkey sign-in cannot work in a secure way (and Safari’s “Face ID” for this site is just its password manager autofill, not WebAuthn).

## Step-by-step: Add passkey support

### 1. Backend endpoints

Implement two endpoints (e.g. Vercel serverless, Netlify, or your own server):

| Endpoint | Method | Purpose |
|----------|--------|--------|
| `GET /webauthn/signinRequest` | GET | Return WebAuthn options: `{ challenge, rpId, allowCredentials?, userVerification? }`. `challenge` must be Base64URL-encoded random bytes (e.g. 32 bytes). |
| `POST /webauthn/signinResponse` | POST | Body: JSON from `credential.toJSON()`. Verify the assertion (see below), then return your app’s user/session (e.g. `{ email, firstName, ... }`). |

For **registration** (create passkey), add:

| Endpoint | Method | Purpose |
|----------|--------|--------|
| `POST /webauthn/registerRequest` | POST | Body: `{ email }`. Return WebAuthn creation options (challenge, rp, user.id/user.name/user.displayName). |
| `POST /webauthn/registerVerify` | POST | Body: credential JSON. Verify attestation, store credential id + public key for that user. |

### 2. Challenge and verification

- **signinRequest**: Generate a random challenge (e.g. `crypto.getRandomValues(new Uint8Array(32))`), store it server-side keyed by session/cookie, then return it Base64URL-encoded in the JSON. Use `allowCredentials: []` (or omit) for discoverable credentials so the browser shows all passkeys for your site.
- **signinResponse**: Decode the credential from the request body. Look up the stored public key by `credential.id`. Verify the signature over the challenge and authenticator data using a WebAuthn server library (e.g. [@simplewebauthn/server](https://simplewebauthn.dev/docs/packages/server)), then clear the challenge and return the user/session.

Use a **relying party (RP) library** on the server for verification; do not hand-roll crypto. Examples:

- **Node**: [@simplewebauthn/server](https://www.npmjs.com/package/@simplewebauthn/server)
- **Python**: [py_webauthn](https://github.com/duo-labs/py_webauthn)

### 3. Storage

Store, per user (e.g. by email or user id):

- Credential id (from the credential)
- Public key (from the credential’s `response.getPublicKey()` or equivalent in your library)
- Optional: counter, transports

You need a database or persistent store (e.g. Vercel Postgres, Supabase, Firebase).

### 4. Enable in the frontend

Set the API base URL so the app can call your backend:

- **Vite**: In `.env` or `.env.local` add  
  `VITE_WEBAUTHN_API_URL=https://your-api.com`  
  (or relative path like `/api` if same origin.)
- **CRA**: Use `REACT_APP_WEBAUTHN_API_URL` instead.

The sign-in page will then:

1. On load, if the browser supports conditional UI and `VITE_WEBAUTHN_API_URL` is set, start a conditional WebAuthn `get()` (passkey autofill).
2. The email/password fields use `autocomplete="username webauthn"` and `autocomplete="current-password webauthn"` so the browser can show passkeys in the autofill UI.
3. If the user picks a passkey and your backend verifies it, the frontend receives the user payload and signs them in (same flow as password sign-in).

### 5. Response shape from `signinResponse`

Return JSON that matches what the app expects for a signed-in user, for example:

```json
{
  "email": "user@example.com",
  "firstName": "...",
  "lastName": "...",
  "membershipType": "BASIC",
  "role": "user"
}
```

The frontend will set `currentUser` and `isSignedIn` from this and redirect to the account page (or `state.from` if present).

### 6. Optional: registration (create passkey)

After a successful password sign-in (or right after sign-up), call your `registerRequest` with the user’s email, then `credentials.create()` with the returned options, then send the result to `registerVerify`. Store the credential id and public key for that user so future sign-ins can use `signinRequest` / `signinResponse`.

---

## Chrome vs Safari: passwords

- **Safari** can use Face ID to unlock **saved passwords** (Keychain) and autofill the form. That is **not** WebAuthn; it’s the browser’s password manager. The form now has `autocomplete="email"` and `autocomplete="current-password"` so Safari (and Chrome) can offer to save and fill passwords.
- **Chrome** does not use Face ID for web logins; it uses its own password manager. To have “Face ID–style” login in Chrome you need **passkeys** (WebAuthn), which require the backend above.
- **“Correct password not accepted” in Chrome** is usually because the account was created in another browser or device. This app stores users in `localStorage`, which is per-origin and per-browser. So in Chrome you must either create an account (same email/password) or sign in once so Chrome has the user. The app now shows a clear message when no account is found in this browser and normalizes email/password so autofill quirks don’t break matching.
