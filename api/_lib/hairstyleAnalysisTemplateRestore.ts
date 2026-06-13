import type { PixelRect } from './hairstyleAnalysisLayoutSlots.js';

export async function extractSlotPatch(templateBuf: Buffer, slot: PixelRect): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  return sharp(templateBuf)
    .extract({
      left: Math.max(0, slot.left),
      top: Math.max(0, slot.top),
      width: slot.width,
      height: slot.height,
    })
    .png()
    .toBuffer();
}

/** Paste template patches over Fal output — restores pre-rendered art (e.g. EDM rose icons). */
export async function restoreTemplateSlots(
  baseBuf: Buffer,
  templateBuf: Buffer,
  slots: PixelRect[]
): Promise<Buffer> {
  if (slots.length === 0) return baseBuf;
  const sharp = (await import('sharp')).default;
  const layers = await Promise.all(
    slots.map(async (slot) => ({
      input: await extractSlotPatch(templateBuf, slot),
      left: slot.left,
      top: slot.top,
    }))
  );
  return sharp(baseBuf).composite(layers).png().toBuffer();
}
