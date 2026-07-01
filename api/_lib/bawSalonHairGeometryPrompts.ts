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
      '**PART OVERRIDE (UI L — critical):** The input may show a **different** part. **Discard** it. **UI L** = part groove **image RIGHT** (**right third** of forehead). **Forward sweep:** lengths from part/top-side cascade to **viewer’s LEFT** shoulder — **not** a behind-shoulder comb-over. **Success check failed if:** groove reads **image LEFT** (that is **UI R**, not **UI L**).'
    );
  }
  return (
    '**PART OVERRIDE (UI R — critical):** **Discard** center part or **image RIGHT** groove (**UI L**). **UI R** = part groove **image LEFT** (**left third** of forehead) on the **same side** as the **image LEFT** shoulder hair mass. **Comb-over:** shoulder bulk from **behind** the mannequin — **NOT** **UI L**’s top-of-head forward cascade. **Success check failed if:** part reads **image RIGHT**; or **image LEFT** shoulder shows **UI L** crown-forward drape instead of comb-over.'
  );
}

const bawBackFallCompactLine =
  '**BACK FALL:** length behind the bust falls **straight down the back** naturally — **FORBIDDEN:** sweeping all back hair sideways to one side.';

/** UI L — part image RIGHT; forward chest cascade to viewer’s LEFT shoulder (cross sweep). */
export function bawUiLeftPartForwardSweepBlock(): string {
  return [
    '**UI L (LEFT part) — forward sweep (NOT comb-over):** Part on **image RIGHT** scalp (**right third** of forehead). Lengths sweep **from the part / top-side** into a **forward chest cascade** over **viewer’s LEFT** shoulder (**image LEFT**). Part line and heaviest **forward** drape sit on **opposite** sides (part **image RIGHT**, cascade **image LEFT**).',
    bawBackFallCompactLine,
    '**FORBIDDEN:** part **image LEFT** (**UI R**). **FORBIDDEN:** comb-over-from-behind only on **image LEFT** shoulder.',
  ].join(' ');
}

/** UI R — part image LEFT; comb-over with shoulder mass from behind on same-side shoulder. */
export function bawUiRightPartCombOverBlock(): string {
  return [
    '**UI R (RIGHT part) — comb-over (NOT UI L):** Part groove on **image LEFT** scalp (**left third** of forehead) — **same side** as the shoulder with visible hair (**viewer’s LEFT** / **image LEFT** shoulder).',
    '**Shoulder mass = from BEHIND:** Heavy length on **image LEFT** shoulder reads as hair routed **from behind the mannequin** (nape/back panel **over** that shoulder) — a **comb-over**. **NOT** a thick **crown-to-chest forward waterfall** like **UI L**.',
    '**Top layers:** may sweep from the **image LEFT** part across temple/forehead; **do not** pour **crown/top** hair forward like **UI L**.',
    bawBackFallCompactLine,
    '**FORBIDDEN:** **UI L** (part **image RIGHT**). **FORBIDDEN:** copying **UI L** top-forward cascade for **UI R**. **Self-check failed if:** part reads **image RIGHT** or shoulder bulk looks like **UI L** top-sweep.',
  ].join(' ');
}

/** Part-specific drape — UI R uses comb-over; UI L forward sweep; MIDDLE uses legacy one-shoulder block. */
export function bawSalonDrapeBlockForPart(partSelection: NoirLayersPartSelection): string {
  if (partSelection === 'LEFT') {
    return ['**DRAPE (UI L):**', bawUiLeftPartForwardSweepBlock()].join(' ');
  }
  if (partSelection === 'RIGHT') {
    return ['**DRAPE (UI R):**', bawUiRightPartCombOverBlock()].join(' ');
  }
  return bawSalonOneShoulderDrapeBlock();
}

/** BAW NOIR live preview — forward cascade on viewer's LEFT; back length falls straight down naturally. */
export function bawLivePreviewAsymmetricDrapeCoreLines(): string[] {
  return [
    'Long hair uses **asymmetric front drape** — one shoulder gets the **forward chest cascade**; hair **behind** the mannequin falls **straight down the back** with natural gravity (not routed sideways).',
    '**PRIMARY FRONT CASCADE:** the **main forward panel** falls over the **viewer\'s LEFT shoulder** — **left side of the image** (closer to the **left edge**). This is the **chest/forward** section only — **not** the entire haircut piled forward.',
    '**BACK FALL (natural gravity):** length **behind** the bust falls **straight down the back** from the nape — **vertical**, **even**, natural — like long hair hanging down the mannequin\'s back. **FORBIDDEN:** sweeping **all** back hair sideways to one side; **FORBIDDEN:** thick ponytail-like clump routed behind one shoulder; **FORBIDDEN:** pushing the whole back section to **one edge** of the back.',
    '**CLEAR SHOULDER CAP:** on the **viewer\'s RIGHT shoulder** — **right side of the image** — shoulder/collarbone stays visible. Only **thin** face-framing strands there — **no** thick forward chest curtain.',
    '**FORBIDDEN:** symmetric **forward** twin waterfalls on **both** shoulders with equal heavy mass; mirror-image forward drapes; **all** hair forward on one shoulder with **nothing** falling down the back.',
    '**Shoulder still visible:** keep **gaps** or **semi-sheer** fall so the clear shoulder cap still reads — **FORBIDDEN** an opaque blanket fully hiding that shoulder.',
    '**Self-check failed if:** back hair is a **sideways sweep** piled on one side instead of **straight down the back**; or heavy drape on **viewer\'s RIGHT** (image RIGHT). **Correct if:** one forward chest cascade (**image LEFT**) + **natural vertical back fall** behind the bust.',
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
    'DRAPE: main forward panel over **viewer\'s LEFT** (image LEFT); back length falls **straight down the back** naturally — **FORBIDDEN** all hair swept/piled to one side behind the back.',
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
