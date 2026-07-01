/**
 * BAW live NOIR salon — part **placement** reference photos (not JET BLACK styling shape refs).
 * Use for **part groove position only**; drape/shoulder rules stay in prompt text (BAW asymmetric drape).
 */

const SUPABASE_LIVE_PREVIEW_PUBLIC_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview';

/** UI R / RIGHT part — front placement guide (part groove on image LEFT scalp). */
export const BAW_RIGHT_PART_PLACEMENT_REF_STORAGE_PATH = 'Ref Images/IMG_4665.jpeg';

export const BAW_RIGHT_PART_PLACEMENT_REF_PUBLIC_URL = `${SUPABASE_LIVE_PREVIEW_PUBLIC_BASE}/${encodeURI(
  BAW_RIGHT_PART_PLACEMENT_REF_STORAGE_PATH
)}`;

export function bawRightPartPlacementRefPublicUrl(): string {
  return process.env.WIG_PREVIEW_BAW_RIGHT_PART_PLACEMENT_REF_URL?.trim() || BAW_RIGHT_PART_PLACEMENT_REF_PUBLIC_URL;
}

/** Prompt block for the placement-guide IMAGE (part groove only — not ref hair drape). */
export function bawSalonRightPartPlacementRefPromptBlock(imageIndex: number): string {
  return [
    '**IMAGE ' +
      imageIndex +
      ' = UI R / RIGHT PART PLACEMENT GUIDE (part groove + part-side roots ONLY — NOT full hair drape):**',
    'Copy **only**: **where the part line sits** — visible groove on **image LEFT** scalp (**left third** of forehead, toward the **left edge** of the photo). Match this reference’s **part placement** and how roots lift on the **part side**.',
    '**IGNORE from IMAGE ' +
      imageIndex +
      ' (critical):** hair falling on **both shoulders**; symmetric twin drapes; total hair volume; hair **color**; mannequin **pose**, face, brick background, lighting, logo.',
    '**DRAPE (BAW live preview — overrides this reference):** **Only** **image LEFT** shoulder gets the visible hair mass (**UI R comb-over** from **behind**). **Image RIGHT** shoulder stays **mostly clear** (thin face-framing only). The placement guide may show hair on **both** shoulders — **do not copy that** — follow **UI R** drape rules in the text spec.',
    '**Color / curl-wave-crimp / length / salon finish:** from other IMAGE(s) + text spec — **not** from this placement guide.',
  ].join(' ');
}
