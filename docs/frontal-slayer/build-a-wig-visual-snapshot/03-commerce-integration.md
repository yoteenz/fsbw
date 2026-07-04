# Commerce Integration

## Surfaces updated (Milestone 21.5)

| Surface | Thumbnail resolver | Config labels |
|---------|-------------------|---------------|
| Cart dropdown | `cart-dropdown` | `BawVisualSnapshotConfigMeta` compact |
| Shopping bag | `cart-page` | compact |
| Checkout strip | `checkout` via `orderStripThumbnailSrc` | existing line copy + snapshot thumb |
| Order confirmation | `checkout` | same strip |
| Account orders | `order-history` | expanded order products |
| Admin clients / revenue | `admin-order` | full config + fallback notice |

## Order persistence

`buildPersistedLineItemsFromCart()` now stores:

- Full `options` (color, length, density, lace, cap size, texture, hairline, styling, parting, add-ons)
- `visualSnapshot`, `visualSnapshotUrl`, `visualSnapshotStatus`, `baseUnitId`
- Order-level `productImage` uses `primaryVisualSnapshotUrlFromCart()` at checkout

## UX rule

Customers always see text configuration labels — **never rely on the image alone**. Even with `FALLBACK_USED`, lines show `Color: Cherry`, `Length: 24"`, etc.
