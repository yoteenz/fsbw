# Sign Up / Register Refinement Report

**All In One Enterprises Inc.**  
**Date:** 2026-08-16  
**Status:** Complete

---

## Navbar changes

- Replaced single **Client Login** with **Log In** + **Sign Up**
- Desktop: outline Log In + gold Sign Up (primary)
- Mobile header: Log In only + hamburger
- Mobile menu: Account section with Log In + prominent Sign Up CTA
- Authenticated: Portal + Log Out

---

## Login route

`/login` — Welcome back copy, forgot password, Create Account cross-link, demo portal link, return URL preservation.

---

## Signup route

Canonical: `/signup`  
Legacy redirect: `/sign-up` → `/signup`

---

## Form fields

**Step 1:** First/last name, email, optional phone, password, confirm password  
**Step 2:** Getting started toggle, business name (optional if new), structure (optional), terms (required), marketing (optional)  
**Step 3:** Usage type — carrier / shipper / not sure  

---

## Verification

Supabase email verification when backend mode; demo simulates check-email screen.

---

## Post-signup onboarding

`/onboarding` — intent selector for startup journey, Road Ready, portal, services, shipper.

---

## Road Ready / Start Business integration

- Start My Trucking Business → Start Your Business journey (Refinement 06)
- Check What I Need → Road Ready public assessment
- Signup does not mark Road Ready milestones complete

---

## Deep links

`?return=` query param on login/signup; sanitized internal URLs only.

---

## Demo mode

Deterministic signup flow without real auth users; sessionStorage draft for QA.

---

## Responsive QA

Build PASS. Manual QA: homepage nav, login, signup steps, mobile menu auth section.

---

## Known issues

- Terms/Privacy link to contact page until dedicated public legal pages exist
- Service-page “Create account to continue” gate not yet on every service CTA (Get Started flow supports return URLs when linked manually)
