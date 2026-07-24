# Frontal Slayer UI Sonic Language

**Document:** UI_SONIC_LANGUAGE  
**Version:** 1.0  
**Status:** Canonical  
**Registry:** DOC-AUD-013  
**Parent theme:** THEME-UI

---

## 1. Purpose

Defines every **interface sound** across the Frontal Slayer ecosystem. UI audio is **Brand Sonic (L2)** — original, motivic, restrained.

**Design principle:** The interface should sound like **touching architectural glass**, not like a video game or SaaS template.

Aligns with **FDS** interaction taxonomy and **FSMS** motion timing (attack within ±30ms of visual feedback).

---

## 2. Sonic families (all UI sounds map here)

| Family | ID | Character |
| --- | --- | --- |
| Glass Tap | SF-GLASS | Crystal strike, < 200ms |
| Air Shift | SF-AIR | Breath-like motion, no HF harshness |
| Chime Statement | SF-CHIME | Discovery-derived |
| Warm Tone | SF-TONE | Soft single note |
| Structured Silence | SF-SILENCE | Mix duck / pause |

---

## 3. Complete UI sound taxonomy

### 3.1 Core interactions

| Sound ID | Label | Family | Trigger | Asset ID (planned) |
| --- | --- | --- | --- | --- |
| `UI-BTN-TAP` | Button tap | SF-GLASS | Primary/secondary press | `fs-brand-ui-btn-tap-v1` |
| `UI-BTN-HOVER` | Button hover | SF-TONE | Desktop hover / focus | `fs-brand-ui-btn-hover-v1` |
| `UI-GLASS-TAP` | Glass panel tap | SF-GLASS | Glass card/panel select | `fs-brand-ui-glass-tap-v1` |
| `UI-TOGGLE` | Toggle switch | SF-GLASS | On/off | `fs-brand-ui-toggle-v1` |

### 3.2 Drawers & modals

| Sound ID | Label | Family | Trigger | Asset ID |
| --- | --- | --- | --- | --- |
| `UI-DRAWER-OPEN` | Drawer open | SF-AIR | Bottom/side drawer | `fs-brand-ui-drawer-open-v1` |
| `UI-DRAWER-CLOSE` | Drawer close | SF-AIR | Drawer dismiss | `fs-brand-ui-drawer-close-v1` |
| `UI-MODAL-OPEN` | Modal open | SF-AIR | Luxury modal | `fs-brand-ui-modal-open-v1` |
| `UI-MODAL-CLOSE` | Modal close | SF-TONE | Modal dismiss | `fs-brand-ui-modal-close-v1` |

### 3.3 Feedback states

| Sound ID | Label | Family | Trigger | Asset ID |
| --- | --- | --- | --- | --- |
| `UI-CONFIRM` | Confirmation | SF-CHIME | Micro chime | `fs-brand-ui-confirm-v1` |
| `UI-ERROR` | Error | SF-TONE | Soft lower tone — not alarm | `fs-brand-ui-error-v1` |
| `UI-LOADING` | Loading | SF-SILENCE | **Prefer silence** or ambient score | — |
| `UI-NOTIFY` | Notification | SF-TONE | Single gentle tone | `fs-brand-ui-notify-v1` |

### 3.4 Concierge & hospitality

| Sound ID | Label | Family | Trigger | Asset ID |
| --- | --- | --- | --- | --- |
| `UI-CONCIERGE-IN` | Concierge appear | SF-AIR | PSA / concierge panel | `fs-brand-ui-concierge-in-v1` |
| `UI-CONCIERGE-MSG` | Concierge message | SF-TONE | New message | `fs-brand-ui-concierge-msg-v1` |
| `UI-CONCIERGE-SEND` | Concierge send | SF-GLASS | Guest sends | `fs-brand-ui-concierge-send-v1` |

### 3.5 Rewards & membership

| Sound ID | Label | Family | Trigger | Asset ID |
| --- | --- | --- | --- | --- |
| `UI-REWARD-EARN` | Reward earned | SF-CHIME | Points / perk | `fs-brand-ui-reward-earn-v1` |
| `UI-MEMBER-UNLOCK` | Membership unlock | SF-CHIME | Half Discovery Chime | `fs-brand-chime-half-v1` |
| `UI-ACHIEVE` | Achievement unlock | SF-CHIME | Achievement badge | `fs-brand-ui-achieve-v1` |

### 3.6 Mansion navigation

| Sound ID | Label | Family | Trigger | Asset ID |
| --- | --- | --- | --- | --- |
| `UI-ELEVATOR-TRAVEL` | Elevator travel | SF-AIR + score | Zone transition | `fs-brand-ui-elevator-travel-v1` |
| `UI-ELEVATOR-ARRIVE` | Elevator arrival | SF-CHIME micro | Floor arrive | `fs-brand-ui-elevator-arrive-v1` |
| `UI-TRANSITION` | Page transition | SF-AIR | Route change | `fs-brand-ui-transition-v1` |
| `UI-NAV` | Navigation select | SF-GLASS | Tab / nav item | `fs-brand-ui-nav-v1` |

---

## 4. Interaction rules

### 4.1 Rate limiting

| Rule | Value |
| --- | --- |
| Min gap between same sound | 120ms |
| Min gap between any UI sounds | 60ms |
| Max UI sounds per 10s (idle browsing) | 8 |
| Full Chime per session | 1 (see DISCOVERY_CHIME_SPEC) |

### 4.2 Loading states

**Default: no loading sound.** Options in priority order:

1. Structured silence  
2. Existing score hold (Mansion/Flagship)  
3. If required: ultra-soft SF-AIR loop **−36 LUFS** — must pass fatigue test  

**Never:** ticking, spinning sfx, progress beeps.

### 4.3 Error states

- One SF-TONE downgrade — lower pitch, softer attack  
- Follow with 300ms SF-SILENCE before next sound  
- No repetition on same error within 2s  

### 4.4 Confirmations

| Weight | Sound |
| --- | --- |
| Light (toggle, save preference) | SF-GLASS |
| Medium (add to bag, booking step) | SF-CHIME micro |
| Heavy (purchase complete, membership) | Half or Full Chime per spec |

---

## 5. FDS component mapping (future implementation)

| FDS component | Primary UI sounds |
| --- | --- |
| PrimaryButton | UI-BTN-TAP |
| GlassButton / GlassCard | UI-GLASS-TAP |
| DrawerPanel | UI-DRAWER-OPEN / CLOSE |
| LuxuryModalPanel | UI-MODAL-OPEN / CLOSE |
| FloatingAcrylicPanel | UI-GLASS-TAP (light) |
| NotificationPanel | UI-NOTIFY |
| FdsLayout transition | UI-TRANSITION |

---

## 6. FSMS motion sync

| FSMS phase | UI sonic behavior |
| --- | --- |
| Sparkle | Optional SF-TONE at −34 LUFS |
| Sweep | No UI sound (visual leads) |
| Hold | Silence |
| Dissolve | SF-AIR if transition sound needed |

---

## 7. Accessibility

- All UI sounds **respect `prefers-reduced-motion`** → **`prefers-reduced-sound`** (future media query) → silence  
- Visual feedback **required** — sound never sole signal  
- Volume follows system media volume; no override above Volume Hierarchy caps  

---

## 8. Admin surfaces

Frontal Slayer Admin (`/admin/dashboard`, clients, etc.) uses **UI Theme** on Frontal Slayer-branded interactions only. Default: **UI sounds off** in admin unless Founder enables — admin is work mode, not cinematic mode.

---

## 9. QA checklist (per UI sound)

- [ ] Derives from Discovery Chime partials  
- [ ] Correct family assignment  
- [ ] Passes 20-repeat fatigue test  
- [ ] Mobile speaker intelligible  
- [ ] Peak within Volume Hierarchy  
- [ ] Synced to FDS/FSMS if applicable  
- [ ] Registered in AUDIO_ASSET_LIBRARY  
