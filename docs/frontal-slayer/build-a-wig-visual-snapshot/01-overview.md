# Overview

When a customer builds a Signature Collection unit in Build-A-Wig, the **Visual Snapshot System** attaches a configured image and metadata to the cart line. That snapshot persists through checkout into order history.

## Goals

- Show the customer's **exact configuration** (especially color) in cart, wishlist, checkout, order confirmation, account orders, and admin order detail.
- Never silently show the wrong image — use **FALLBACK_USED** with clear text labels when the exact variant is not generated yet.
- Preserve historical accuracy on orders even when assets are updated later.

## Snapshot statuses

| Status | Meaning |
|--------|---------|
| **READY** | Exact configured visual available |
| **MISSING** | No variant asset yet |
| **GENERATING** | Asset Factory job in progress (future) |
| **FALLBACK_USED** | Base unit image + configuration labels |
| **NEEDS_REVIEW** | Admin QA required (future) |

## Trigger

`attachVisualSnapshotToCartLine()` runs in Build-A-Wig **Add to Bag** and **Edit save** flows (`src/pages/build-a-wig/page.tsx`).

## Data on cart / order lines

- `visualSnapshot` — full snapshot object
- `visualSnapshotAssetId` — e.g. `soft-wave_cherry_cart`
- `visualSnapshotUrl` — resolved image URL
- `visualSnapshotStatus`
- `baseUnitId` — unit slug
- `selectedColorHex` — approved palette hex

## Master asset source

Approved hero portraits and derivative crops (cart, wishlist, checkout, order, admin) from Milestone 21 Photography Derivative Engine.
