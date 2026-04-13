/**
 * Single source for T2I prompt text. Edit here when art direction changes; bump `promptVersion` in manifest.
 * @param {{ unitKey: string; length: string; density: string; texture: string; lace: string; hairline: string; color: string; styling: string; addOns: string[] }} s
 */
export function buildWigPreviewPrompt(s) {
  const addons =
    Array.isArray(s.addOns) && s.addOns.length
      ? s.addOns.map((a) => String(a).toUpperCase()).join(', ')
      : 'NONE';
  return [
    'Professional e-commerce product photograph, single forward-facing studio shot.',
    'Subject: high-end lace front wig on a neutral mannequin head (no real person, no identifiable face).',
    `Unit line: ${s.unitKey}.`,
    `Hair: ${s.texture} texture, color ${s.color}, length ${s.length}, density ${s.density}.`,
    `Lace: ${s.lace}. Hairline: ${s.hairline}. Styling: ${s.styling}. Add-ons: ${addons}.`,
    'Lighting: soft even studio light, subtle shadow, clean catalog look.',
    'Background: seamless light gray cyclorama, minimal props, sharp focus on hair.',
    'No text, no watermark, no logos.',
  ].join(' ');
}
