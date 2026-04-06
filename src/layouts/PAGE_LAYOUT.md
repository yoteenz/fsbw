# Page layout system

Standard structure for app pages (wishlist, lists, shopping bag, etc.) so layout and button placement stay consistent.

## Order of sections (top to bottom)

1. **Marble background** – full-bleed, fixed, `-z-10`
2. **Scrollable content** – `relative z-10`, flex column
3. **Nav bar** – bordered, centered title/breadcrumb, back + cart + hamburger
4. **Main card** – single bordered, blurred white card (`border border-black`, `bg-white/60 backdrop-blur-sm`, `p-4`, `mb-2`)
   - Card contains **only**: menu (when open) OR page-specific content (header, list, table, etc.)
   - **No primary action buttons inside the card.**
5. **Page actions (below the card)** – primary buttons for the page (VIEW LISTS, EMPTY WISHLIST, CREATE NEW LIST, etc.)
   - Sibling of the main card, same parent as the card.
   - First button: `marginTop: '2px'`. Additional buttons: `marginTop: '10px'` (or use `PageActionsBelowCard`).
   - Styling: full width, `border border-black` 1.3px, red text `#EB1C24`, Futura PT Medium, 11px, uppercase.

## Rule

**Page action buttons (VIEW LISTS, CREATE NEW LIST, EMPTY WISHLIST, etc.) MUST be rendered as siblings of the main card div, not inside it.**

Correct:

```jsx
<div className="flex flex-col py-5 px-4">
  <div>Nav bar</div>
  <div className="border border-black ... mb-2">
    {/* Card content only */}
  </div>
  {!showMobileMenu && (
    <div style={{ marginTop: '2px' }}><button>VIEW LISTS</button></div>
  )}
</div>
```

Wrong (button inside card):

```jsx
<div className="border border-black ...">
  {/* Card content */}
  <div><button>VIEW LISTS</button></div>  {/* NO - button inside card */}
</div>
```

## Shared pieces

- **Nav bar**: Back (or Account/Wishlist when menu open), center text (e.g. "WISHLIST > LISTS"), cart icon, hamburger. Border, `bg-white/60 backdrop-blur-sm`.
- **Main card**: `borderWidth: '1.3px'`, `backgroundColor: 'rgba(255, 255, 255, 0.6)'`, `minWidth: '100%'`. When menu open, use `menu-toggle-card` and **`MENU_TOGGLE_PANEL_HEIGHT`** from `layouts/menuToggleHeights.ts` (`calc(100dvh - 80px)`) for the flyout — same as Noir / shop product pages. Account main content columns (menu closed) may use **`ACCOUNT_MAIN_COLUMN_MIN_HEIGHT`** (`calc(100dvh - 160px)`).
- **Page actions**: Use `PageActionsBelowCard` from `@/layouts/PageActionsBelowCard` for consistent spacing and styling, or match its styles (marginTop 2px for first, 10px for rest; button styles above).
