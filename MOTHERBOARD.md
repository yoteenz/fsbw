# Motherboard – central reference

## Main card height & responsiveness

### Proportional scaling (same visual weight across viewports)

These pages use **`calc(100vh * [height] / [ref])`** so the card keeps the same proportion of the viewport as a fixed pixel height would at the reference viewport height.

| Page | Formula | Meaning |
|------|---------|--------|
| **Wishlist lists** (`/wishlist/lists`) | `calc(100vh * 520 / 745)` | Card = 520px tall when viewport height = 745px; scales with screen. |
| **Account Payment** (`/account/payment`) | `minHeight: calc(100vh * 510 / 900)` | Card min-height = 510px at 900px viewport. |
| **Account Shipping** (`/account/shipping`) | `minHeight: calc(100vh * 510 / 900)` | Same as Payment. |

### Viewport-minus-fixed (responsive, different logic)

| Page | Formula | Meaning |
|------|---------|--------|
| **Wishlist** (`/wishlist`) | `height/minHeight/maxHeight: calc(100vh - 270px)` | Card fills viewport minus 270px. |
| **Shopping bag** (`/shopping-bag`) | Same pattern | Card fills viewport minus fixed amount. |
| **Admin clients** (`/admin/clients`) | `minHeight: calc(100dvh - 160px)` | Uses `dvh`; no fixed height/maxHeight. |
| **Account** (menu open) | `minHeight: calc(100dvh - 160px)` | Same. |
| **Account Settings** (`/account/settings`) | `minHeight: calc(100dvh - 160px)` | Same. |

### Other pages

Build-a-wig, products, units, checkout, sign-in, etc. use the same bordered main-card styling; many do **not** set an explicit height on that card, so the card height follows content and viewport naturally.

---

**To make all main cards match the wishlist lists look:** use the proportional formula, e.g. `calc(100vh * 520 / 745)` (or `510 / 745` for payment/shipping-style cards), and apply it to Wishlist and Shopping bag (and any others that currently use `calc(100vh - 270px)` or similar).
