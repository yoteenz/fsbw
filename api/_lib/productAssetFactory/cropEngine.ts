import sharp from 'sharp';
import type { FactoryCropTemplate } from './factoryCropTemplates.js';

function positionFromAnchor(anchor: FactoryCropTemplate['cropAnchor']): sharp.Position {
  if (anchor === 'top') return 'top';
  if (anchor === 'attention') return 'attention';
  return 'centre';
}

/** Crop and resize derivative from master using reusable template (normalized region). */
export async function renderFactoryDerivative(
  sourceBuffer: Buffer,
  template: FactoryCropTemplate
): Promise<Buffer> {
  const meta = await sharp(sourceBuffer).metadata();
  const srcW = meta.width ?? 4096;
  const srcH = meta.height ?? 4096;

  const pad = template.padding;
  const region = template.cropRegion;
  const x = Math.max(0, Math.round((region.x - pad) * srcW));
  const y = Math.max(0, Math.round((region.y - pad) * srcH));
  const w = Math.min(srcW - x, Math.round((region.width + pad * 2) * srcW));
  const h = Math.min(srcH - y, Math.round((region.height + pad * 2) * srcH));

  let pipeline = sharp(sourceBuffer)
    .extract({ left: x, top: y, width: Math.max(1, w), height: Math.max(1, h) })
    .resize(
      Math.round(template.outputWidth * template.scale),
      Math.round(template.outputHeight * template.scale),
      { fit: 'cover', position: positionFromAnchor(template.cropAnchor) }
    );

  if (template.transparency || template.exportFormat === 'png') {
    return pipeline.png().toBuffer();
  }
  return pipeline.webp({ quality: 90 }).toBuffer();
}
