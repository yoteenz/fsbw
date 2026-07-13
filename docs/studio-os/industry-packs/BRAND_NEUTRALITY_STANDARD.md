# Brand Neutrality Standard

**Version:** `brand-neutrality.v1`

## Rule

Official Industry Packs must be **brand-neutral**. Studio World must never absorb a founder-created branded department, scene, feature, workflow, or concept into a default pack without an explicit rights transfer or licensing agreement.

## Validator

`validateOfficialPackBrandNeutrality()` — integrated into `validateIndustryPack()`.

**Error code:** `INDUSTRY_PACK_NOT_BRAND_NEUTRAL`

Rejects official packs containing:

- Founder-owned protected scenes (e.g. Build-A-Wig Atelier™)
- Branded room names
- Company logos or company-specific workflows
- Private organization materials
- Marketplace-only mods without platform license

## Build-A-Wig Atelier correction

Build-A-Wig Atelier™ was **removed** from:

- Official Hair Brand Pack
- Official Hair Salon Pack

It remains as a **Frontal Slayer founder mod** in `FRONTAL_SLAYER_FOUNDER_MODS`.

## Neutral Hair Brand departments

Reception · Lobby · Product Showroom · Consultation Room · Private Office · Inventory · Fulfillment / Shipping · Customer Lounge · Content Studio · Photography Studio · Training Room · Storage · Customer Service · Checkout / Commerce · Product Development

## Neutral Hair Salon departments

Reception · Waiting Lounge · Consultation Room · Styling Floor · Wash Area · Color Room · Product Retail · Staff Room · Inventory · Storage · Training Room · Private Office · Content / Photography Area · Checkout
