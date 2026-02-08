# Comprehensive Comparison: NOIR vs SOFT-WAVE Product Pages

## 1. MAIN CARD SETTINGS

### NOIR (Line 2260-2269):
```tsx
<div
  className="border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm"
  style={{ 
    borderWidth: '1.3px', 
    minWidth: '100%', 
    maxWidth: 'none', 
    overflow: 'hidden',  // ⚠️ DIFFERENT: 'hidden' vs 'visible'
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingBottom: '34px'
  }}
>
```

### SOFT-WAVE (Line 1144-1153):
```tsx
<div
  className="border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm"
  style={{ 
    borderWidth: '1.3px', 
    minWidth: '100%', 
    maxWidth: 'none', 
    overflow: 'visible',  // ✅ CORRECT: 'visible'
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingBottom: '34px'
  }}
>
```

**DIFFERENCES:**
- ❌ NOIR: `overflow: 'hidden'` (should be `'visible'`)

---

## 2. ADD TO BAG BUTTON SETTINGS

### NOIR (Line 3427-3452):
```tsx
{/* ADD TO BAG BUTTON */}
<div className="px-0 md:px-0" style={{ marginTop: '2px' }}>
  <button
    onClick={handleAddToBag}
    disabled={addToBagState === 'adding'}
    className={`border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold ${
      addToBagState === 'adding' ? 'bg-white cursor-not-allowed' : 
      addToBagState === 'added' ? 'bg-white cursor-pointer' : 'bg-white cursor-pointer hover:bg-gray-50'
    }`}
    style={{ 
      borderWidth: '1.3px', 
      color: '#EB1C24',
      fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',  // ⚠️ DIFFERENT: extra font fallbacks
      backgroundColor: '#FFFFFF'
    }}
  >
```

### SOFT-WAVE (Line 1969-1994):
```tsx
{/* ADD TO BAG BUTTON */}
<div className="px-0 md:px-0" style={{ marginTop: '2px' }}>
  <button
    onClick={handleAddToBag}
    disabled={addToBagState === 'adding'}
    className={`border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold ${
      addToBagState === 'adding' ? 'bg-white cursor-not-allowed' : 
      addToBagState === 'added' ? 'bg-white cursor-pointer' : 'bg-white cursor-pointer hover:bg-gray-50'
    }`}
    style={{ 
      borderWidth: '1.3px', 
      color: '#EB1C24',
      fontFamily: '"Futura PT Medium"',  // ✅ CORRECT: simpler font family
      backgroundColor: '#FFFFFF'
    }}
  >
```

**DIFFERENCES:**
- ❌ NOIR: `fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif'` (extra fallbacks)
- ✅ SOFT-WAVE: `fontFamily: '"Futura PT Medium"'` (simpler)

---

## 3. CUSTOMIZE BUTTON SETTINGS

### NOIR (Line 3454-3535):
```tsx
{/* CUSTOMIZE IN BUILD-A-WIG BUTTON */}
<div className="px-0 md:px-0" style={{ marginTop: '10px' }}>
  <button
    onClick={() => { ... }}
    className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
    style={{ 
      borderWidth: '1.3px', 
      color: '#EB1C24',
      fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif'  // ⚠️ DIFFERENT: extra font fallbacks
    }}
  >
```

### SOFT-WAVE (Line 1996-2085):
```tsx
{/* CUSTOMIZE IN BUILD-A-WIG BUTTON */}
<div className="px-0 md:px-0" style={{ marginTop: '10px' }}>
  <button
    onClick={() => { ... }}
    className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
    style={{ 
      borderWidth: '1.3px', 
      color: '#EB1C24',
      fontFamily: '"Futura PT Medium"'  // ✅ CORRECT: simpler font family
    }}
  >
```

**DIFFERENCES:**
- ❌ NOIR: `fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif'` (extra fallbacks)
- ✅ SOFT-WAVE: `fontFamily: '"Futura PT Medium"'` (simpler)

---

## 4. TABS SECTION SETTINGS

### NOIR (Line 2941-2983):
```tsx
{/* Tabs Section */}
<div className="mt-6" style={{ transform: 'translateY(-20px)' }}>
  {/* Tab Navigation */}
  <div className="flex justify-center">
    <button ... style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px' }}>  // ⚠️ DIFFERENT: extra font fallbacks
  </div>

  {/* Tab Content */}
  <div className="mt-4 space-y-4" style={{ maxWidth: 'none', width: '100%', marginBottom: '-93px' }}>
```

### SOFT-WAVE (Line 1789-1831):
```tsx
{/* Tabs Section */}
<div className="mt-6" style={{ transform: 'translateY(-20px)' }}>
  {/* Tab Navigation */}
  <div className="flex justify-center">
    <button ... style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px' }}>  // ✅ CORRECT: simpler font family
  </div>

  {/* Tab Content */}
  <div className="mt-4 space-y-4" style={{ maxWidth: 'none', width: '100%', marginBottom: '-93px' }}>
```

**DIFFERENCES:**
- ❌ NOIR: Tab buttons have `fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif'` (extra fallbacks)
- ✅ SOFT-WAVE: Tab buttons have `fontFamily: '"Futura PT Medium"'` (simpler)
- ✅ Both have same `marginBottom: '-93px'` on tab content

---

## 5. STRUCTURAL DIFFERENCES

### Indentation Levels:

**NOIR:**
- Main card opening: 10 spaces
- WIG PREVIEW: 10 spaces (inside main card)
- PRODUCT SHOTS: 10 spaces (inside main card)  
- Tabs Section: 10 spaces (inside main card)
- ADD TO BAG BUTTON: 10 spaces (should be outside, but same level as content)

**SOFT-WAVE:**
- Main card opening: 10 spaces
- WIG PREVIEW: 12 spaces (nested inside main card)
- PRODUCT SHOTS: 12 spaces (nested inside main card)
- Tabs Section: 14 spaces (nested deeper inside main card)
- ADD TO BAG BUTTON: 10 spaces (back to main card level - clearly outside)

### Extra Closing Div:

**NOIR:**
- Line 3536: Extra `</div>` (8 spaces) after CUSTOMIZE button
- This closes something that SOFT-WAVE doesn't have

**SOFT-WAVE:**
- No extra closing div after CUSTOMIZE button
- Goes directly to SIMILAR PRODUCTS section

---

## SUMMARY OF DIFFERENCES:

1. **Main Card Overflow:**
   - ❌ NOIR: `overflow: 'hidden'` (should be `'visible'`)

2. **Font Family (All Buttons & Tabs):**
   - ❌ NOIR: `'"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif'` (extra fallbacks)
   - ✅ SOFT-WAVE: `'"Futura PT Medium"'` (simpler)

3. **Structural - Extra Closing Div:**
   - ❌ NOIR: Has extra `</div>` at line 3536 (8 spaces) after CUSTOMIZE button
   - ✅ SOFT-WAVE: No extra closing div

4. **Everything else is IDENTICAL:**
   - ✅ Both have `paddingBottom: '34px'` on main card
   - ✅ Both have `marginTop: '2px'` on ADD TO BAG button
   - ✅ Both have `marginTop: '10px'` on CUSTOMIZE button
   - ✅ Both have `marginBottom: '-93px'` on tab content
   - ✅ Both have same button wrapper structure

