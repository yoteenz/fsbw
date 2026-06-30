/**
 * Shared BAW salon hair geometry — part mirror rule + asymmetric drape.
 * **BAW live preview** (NOIR mannequin) and **HA client portraits** use **opposite** forward-drape sides:
 * BAW = viewer's LEFT (image LEFT); HA = model's LEFT (image RIGHT).
 */

export type NoirLayersPartSelection = 'MIDDLE' | 'LEFT' | 'RIGHT';

/** UI L / UI R vs image edges — same mirror rule as `partPlacementPromptLine` in HA display. */
export function salonPartDirectionSemanticsBlock(): string {
  return (
    '**PART vs image (simple):** **image LEFT** / **image RIGHT** = toward that edge of the photo. **UI L** = part on **image RIGHT**. **UI R** = part on **image LEFT** (opposite of **UI L**). Match the customer’s **UI L** or **UI R** — do not swap them.'
  );
}

/** Side parts: color-tier WebPs often bake in a default part — force re-part from prompt. */
export function salonPartMustOverrideInputReferenceBlock(partSelection: NoirLayersPartSelection): string {
  if (partSelection === 'MIDDLE') return '';
  if (partSelection === 'LEFT') {
    return (
      '**PART OVERRIDE (critical — ignore the color preview’s part line):** The input may show a **different** part (center, **image LEFT**, or weak/off-center). **Discard** it. **UI L** needs the **visible part groove** in the **right third** of the forehead/top (**closer to the image’s RIGHT edge**). **Re-part** the roots to match — **do not** preserve the reference photo’s part placement. **Success check:** if the groove reads on the **image LEFT** half → wrong (that is **UI R**, not **UI L**).'
    );
  }
  return (
    '**PART OVERRIDE (critical — ignore the color preview’s part line):** Whatever part the preview shows — **discard** it. **UI R** = **visible part groove** in the **left third** of the forehead/top (**closer to the image’s LEFT edge**), **opposite** of **UI L**. **Re-part** the roots to match — **do not** keep the reference part line.'
  );
}

/** BAW NOIR live preview — primary forward drape on **viewer's LEFT** (image LEFT). */
export function bawLivePreviewAsymmetricDrapeCoreLines(): string[] {
  return [
    'Long hair uses a **one-forward-shoulder drape** — only one side gets the forward chest cascade; the opposite side keeps visible hair **behind the shoulder / down the back**, not another forward curtain.',
    '**PRIMARY FRONT CASCADE:** as you **face** the mannequin in the photo, almost **all** long hair falls **forward over the viewer\'s LEFT shoulder only** — **left side of the image** (closer to the **left edge**). This is the single chest cascade.',
    '**CLEAR SHOULDER CAP:** on the **viewer\'s RIGHT shoulder** — **right side of the image** — shoulder/collarbone stays mostly visible. Hair on this side reads as a **thin tuck**, hair **behind** the shoulder, or down the back — **no thick forward chest curtain**.',
    '**FORBIDDEN:** symmetric **forward** twin waterfalls on **both** shoulders with equal heavy mass on both collarbones; mirror-image forward drapes; piling **all** hair forward on one shoulder with **zero** back/behind-shoulder hair.',
    '**Shoulder still visible:** keep **gaps**, **separation between strands**, or **semi-sheer** fall so the clear shoulder cap still reads — **FORBIDDEN** an opaque blanket fully hiding that shoulder.',
    '**Self-check failed if:** there is a forward hair curtain covering each collarbone, or heavy drape on **viewer\'s RIGHT** (image RIGHT). **Correct if:** one forward chest cascade (**image LEFT** / viewer\'s LEFT) + minimal/behind hair on **viewer\'s RIGHT**.',
  ];
}

/** HA client portrait — primary forward cascade on **model's LEFT** = **image RIGHT**. */
export function haAnalysisAsymmetricDrapeCoreLines(): string[] {
  return [
    'Long hair uses a **one-forward-shoulder drape** — only one side gets the forward chest cascade; the opposite side keeps visible hair **behind the shoulder / down the back**, not another forward curtain.',
    '**PRIMARY FRONT CASCADE:** visible length falls **forward over the model\'s LEFT shoulder** — **right side of the image** (viewer\'s right). This is the single chest cascade.',
    '**BACK + BEHIND PANEL (required):** keep a visible secondary mass sweeping **behind** the model\'s RIGHT shoulder and down the **upper back** — **left side of the image** (viewer\'s left).',
    '**CLEAR SHOULDER CAP:** on the model\'s **RIGHT shoulder** — **left side of the image** (viewer\'s left) — shoulder/collarbone stays mostly visible. Hair on this side reads as behind-the-shoulder/back hair, with at most thin face-framing strands — **no thick forward chest curtain**.',
    '**FORBIDDEN:** symmetric **forward** twin waterfalls on **both** shoulders with equal heavy mass on both collarbones; mirror-image forward drapes; piling **all** hair forward on one shoulder with **zero** back/behind-shoulder hair.',
    '**Shoulder still visible:** keep **gaps**, **separation between strands**, or **semi-sheer** fall so the clear shoulder cap still reads — **FORBIDDEN** an opaque blanket fully hiding that shoulder.',
    '**Self-check failed if:** there is a forward hair curtain covering each collarbone, or if all hair is piled on the primary shoulder. **Correct if:** one forward chest cascade (**image RIGHT**) + one visible behind/back panel (**image LEFT**) with the opposite shoulder mostly clear.',
  ];
}

/** @deprecated Prefer `bawLivePreviewAsymmetricDrapeCoreLines` for BAW; `haAnalysisAsymmetricDrapeCoreLines` for HA. */
export function bawSalonAsymmetricDrapeCoreLines(): string[] {
  return bawLivePreviewAsymmetricDrapeCoreLines();
}

/** BAW mannequin/brick live styling — asymmetric shoulder sweep (viewer's LEFT / image LEFT). */
export function bawSalonOneShoulderDrapeBlock(): string {
  return ['**DRAPE SIDE (fixed — all parts):**', ...bawLivePreviewAsymmetricDrapeCoreLines()].join(' ');
}

export function bawOneShoulderDrapeCompactLock(): string {
  return [
    'ONE-FORWARD-SHOULDER DRAPE: heavy length **only** over **viewer\'s LEFT shoulder** (image LEFT) — **FORBIDDEN** thick forward drape on **viewer\'s RIGHT** (image RIGHT).',
  ].join(' ');
}

export function haOneShoulderDrapeCompactLock(): string {
  return [
    'ONE-FORWARD-SHOULDER DRAPE: one forward chest cascade on **image RIGHT** (model\'s LEFT); **image LEFT** shoulder stays mostly clear with visible hair routed behind shoulder/down the back — **FORBIDDEN** twin thick **forward** curtains and **FORBIDDEN** all hair forward with no back panel.',
  ].join(' ');
}

/** @deprecated BAW uses `bawOneShoulderDrapeCompactLock`; HA uses `haOneShoulderDrapeCompactLock`. */
export function oneShoulderDrapeCompactLock(): string {
  return bawOneShoulderDrapeCompactLock();
}

/** @deprecated Use `bawSalonOneShoulderDrapeBlock` — kept for script grep parity during migration. */
export function salonOneShoulderDrapeBlock(): string {
  return bawSalonOneShoulderDrapeBlock();
}
