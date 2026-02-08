# Checkout Page Spacing Reference

## Current Local Settings

### Parent Container (Line 1578)
```tsx
<div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
```

### Sections to Check:

1. **SHIPPING CALCULATOR** (Line 3221-3223)
   - Wrapper: `<div>` (no margin styles)
   - Should be direct child of parent container

2. **TIPPING SECTION** (Line 3662-3663)
   - Wrapper: `<div style={{ margin: 0 }}>`
   - Should be direct child of parent container

3. **ORDER SUMMARY** (Line 3817-3818)
   - Wrapper: `<div>` (no margin styles)
   - Should be direct child of parent container

4. **ORDER NOTES** (Line 3929-3930)
   - Wrapper: `<div>` (no margin styles)
   - Should be direct child of parent container

5. **CHECKBOXES** (Line 3958-3959)
   - Wrapper: `<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>`
   - Should be direct child of parent container

## What to Check on Deployed Site:

1. **Parent Container Gap**: Should be `24px`
2. **Section Wrapper Margins**: Should be `0` or `auto` (no negative margins)
3. **Actual Visual Spacing**: Measure the gap between sections
4. **Any CSS Overrides**: Check for global styles affecting these sections

## Browser DevTools Shortcuts (No F12 Required):

### Opening DevTools:
- **Right-click method**: Right-click anywhere → "Inspect" or "Inspect Element"
- **Keyboard shortcut**: `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Browser menu**: 
  - Chrome/Edge: Three dots (⋮) → More tools → Developer tools
  - Firefox: Three lines (☰) → More tools → Web Developer Tools

### Once DevTools is Open:
- **Select Element**: `Ctrl+Shift+C` (Windows) / `Cmd+Shift+C` (Mac)
- **Toggle Mobile View**: `Ctrl+Shift+M` (Windows) / `Cmd+Shift+M` (Mac)
- **Console**: `Ctrl+Shift+J` (Windows) / `Cmd+Option+J` (Mac)
