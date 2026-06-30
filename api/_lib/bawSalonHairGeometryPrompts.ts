/**
 * Shared BAW salon hair geometry — part mirror rule + asymmetric drape aligned with
 * hairstyle analysis (`hairstyleAnalysisFalPrompt.ts`). Single source of truth for live
 * styling prompts and HA Fal prompts.
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

/** Core asymmetric drape lines — HA-aligned (model LEFT forward = image RIGHT). */
export function bawSalonAsymmetricDrapeCoreLines(): string[] {
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

/** BAW mannequin/brick live styling — asymmetric shoulder sweep (matches HA). */
export function bawSalonOneShoulderDrapeBlock(): string {
  return ['**DRAPE SIDE (fixed — all parts):**', ...bawSalonAsymmetricDrapeCoreLines()].join(' ');
}

export function oneShoulderDrapeCompactLock(): string {
  return [
    'ONE-FORWARD-SHOULDER DRAPE: one forward chest cascade on **image RIGHT** (model\'s LEFT); **image LEFT** shoulder stays mostly clear with visible hair routed behind shoulder/down the back — **FORBIDDEN** twin thick **forward** curtains and **FORBIDDEN** all hair forward with no back panel.',
  ].join(' ');
}

/** @deprecated Use `bawSalonOneShoulderDrapeBlock` — kept for script grep parity during migration. */
export function salonOneShoulderDrapeBlock(): string {
  return bawSalonOneShoulderDrapeBlock();
}
