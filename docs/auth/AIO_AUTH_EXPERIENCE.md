# AIO Auth Experience

**All In One Enterprises Inc.** · Customer authentication UX  
**Date:** 2026-08-16

---

## Public navigation

| State | Desktop | Mobile header | Mobile menu |
|-------|---------|---------------|-------------|
| Logged out | Log In (outline) + Sign Up (gold) | Log In | Account section: Log In + Sign Up CTA |
| Logged in | Portal + Log Out | Portal shortcut via menu | My Portal + Log Out |

Canonical labels: **Log In**, **Sign Up** (not Client Login / Sign In mix).

---

## Routes

| Route | Page | Notes |
|-------|------|-------|
| `/login` | Login | Welcome back, return URL preserved |
| `/signup` | Sign up (canonical) | 3-step registration |
| `/sign-up` | Redirect → `/signup` | Legacy alias |
| `/forgot-password` | Password reset request | Supabase reset email |
| `/reset-password` | New password | Token from email link |
| `/verify-email` | Email verification | Provider flow |
| `/onboarding` | Post-signup intent selector | Routes to journey / Road Ready / portal |

---

## Sign up flow

1. **Your Account** — name, email, optional phone, password + confirm  
2. **Your Business** — existing vs getting started, optional business name/structure, terms + marketing consent  
3. **Get Started** — carrier / shipper / not sure  

Organization created via Supabase with `organization_owner` role only (no staff/admin selection).

---

## Post-signup onboarding

Intent options:

- Start My Trucking Business → `/start-your-business`
- Check What I Need → Road Ready public
- Existing business → Portal
- Request a Service → services or preserved return URL
- Shipper → `/shipper`

---

## Deep links

Query param: `?return=/services/bookkeeping/assessment`  
Validated by `sanitizeReturnUrl()` — internal paths only.

---

## Demo mode

- Full signup UX without Supabase user creation  
- Verification screen labeled demo  
- Draft stored in `sessionStorage` (`aio_demo_signup_draft`)  
- Continue → onboarding intents  

---

## Security

- Passwords via Supabase Auth only  
- Public signup role: `organization_owner`  
- No client-selectable internal roles  
- Return URLs validated against allowlist  
- Friendly error mapping in `friendlyAuthError()`
