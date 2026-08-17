# Mobile Authentication Experience Report

**Sprint:** AIO Mobile Authentication Experience Redesign  
**Date:** 2026-08-17  
**Scope:** Login, Sign Up, Forgot/Reset Password, Verify Email — UI/UX only (auth logic preserved)

## Summary

Replaced the generic white-card auth layout with a premium dark/gold **Auth Shell** system. Authentication pages now feel like a secure entrance to the AIO client platform, aligned with the mobile service-page redesign.

## New components

| Component | Path |
|-----------|------|
| AuthShell | `src/components/auth/AuthShell.tsx` |
| AuthHeader | `src/components/auth/AuthHeader.tsx` |
| AuthBrandPanel | `src/components/auth/AuthBrandPanel.tsx` |
| AuthBrandIntro | `src/components/auth/AuthBrandIntro.tsx` |
| AuthInput | `src/components/auth/AuthInput.tsx` |
| AuthPasswordInput | `src/components/auth/AuthPasswordInput.tsx` |
| AuthPrimaryButton | `src/components/auth/AuthPrimaryButton.tsx` |
| AuthSecondaryButton | `src/components/auth/AuthSecondaryButton.tsx` |
| AuthCheckbox | `src/components/auth/AuthCheckbox.tsx` |
| AuthError | `src/components/auth/AuthError.tsx` |
| AuthTransition | `src/components/auth/AuthTransition.tsx` |
| DemoPortalAccess | `src/components/auth/DemoPortalAccess.tsx` |
| PasswordRequirements | `src/components/auth/PasswordRequirements.tsx` |

## Styles

- **`src/styles/aio-auth.css`** — premium auth shell, dark inputs, gold focus; login hero from `assets.loginHeroImage` (Supabase CDN), desktop split-screen (brand left / form right ≥1024px)
- Imported in `src/App.tsx`

## Pages updated

- `src/layouts/AIOAuthLayout.tsx` — uses AuthShell (removed Back to Home, duplicate Sign Up/Log In header switch)
- `src/pages/auth/LoginPage.tsx` — brand intro, integrated form, branded errors, post-login transition, demoted demo
- `src/pages/auth/SignUpPage.tsx` — same visual system; 3-step flow preserved
- `src/pages/auth/ForgotPasswordPage.tsx` — reset + masked email success state
- `src/pages/auth/ResetPasswordPage.tsx` — password requirements UI
- `src/pages/auth/VerifyEmailPage.tsx` — shell-aligned verify state

## Preserved (unchanged logic)

- `authService` signIn / signUp / sendPasswordReset / updatePassword
- `returnUrl.ts` sanitizeReturnUrl + `?return=` on login/signup links
- Remember Me UI (presentation only; no backend persistence added)
- Demo mode via `isDemoMode()` — Demo Portal only in demo
- Sign-up payload fields and 3-step business onboarding separation
- Password rules: 8+ characters (matches existing validation)

## QA

| Check | Result |
|-------|--------|
| `npm run build` | PASS |
| Mobile login 375px — gold LOG IN always visible | PASS (button reset fix) |
| Reference hierarchy (logo, headline, form panel) | PASS |
| Forgot password same shell | PASS |
| Sign up dark theme + steps | PASS |
| Desktop split layout 1280px | PASS |
| Demo portal demoted | PASS (demo mode) |

## Polish pass (2026-08-17)

- Fixed invisible LOG IN: excluded `.aio-auth-premium__btn` from global button reset
- Login-specific hero composition, glass form panel, input icons, OR divider
- BACK preserves `returnUrl` when set

## Login hero asset (2026-08-17)

- Canonical login hero: `appConfig.assets.loginHeroImage` (Supabase `live-preview/AIO/00E0E628-...png`)
- Login-only: CSS var `--aio-auth-login-hero-url`; responsive `background-position` 58–68% by breakpoint
- Auth pages (non-login): dark gradient only — old homepage truck removed from auth bg
- Login header: back-only (no logo); lighter directional overlay preserves sunset/truck

## Mobile preview

AIO standalone: port **5173** — `/login`, `/sign-up`, `/forgot-password`
