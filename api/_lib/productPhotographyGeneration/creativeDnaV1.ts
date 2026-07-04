/**
 * Server-side Creative DNA v1.0 content mirror.
 * Keep in sync with src/studio-os/product-photography/CreativeDna*.ts
 */

export const CREATIVE_DNA_APPROVED_PROMPT_BODY = `FRONTAL SLAYER SIGNATURE COLLECTION — MASTER PRODUCT PHOTOGRAPHY SYSTEM (PROMPT v2.0)

OBJECTIVE
Create an ultra-premium luxury studio Master Hero Portrait for the Frontal Slayer Signature Collection. This is the canonical 1:1 square commercial product photograph used across the website, email, cart, wishlist, checkout, admin, and all downstream derivative assets. Output must match broadcast-quality luxury beauty advertising — minimal, timeless, elegant, museum-quality presentation.

MANNEQUIN IDENTITY LOCK — OFFICIAL FRONTAL SLAYER DISPLAY BUST v1.0
Use the provided Official Display Bust reference image as the permanent mannequin identity lock.
Preserve exactly:
- Editorial gray plaster bust material and surface finish
- Frontal Slayer chest logo — placement, scale, and legibility
- Bust proportions, neck line, shoulder geometry, and facial form
- Stand hardware may exist on set but must NOT appear in the approved hero export
- Transparent background-removed cutout quality when compositing
Do NOT replace the mannequin with a generic stock bust, faceless fashion dummy, or alternate brand bust.
Do NOT retexture the bust to waxy CGI plastic.
Do NOT remove, relocate, or alter the chest logo.

COMPOSITION — LOCKED (1:1 MASTER HERO PORTRAIT)
- Aspect ratio: 1:1 square
- Master resolution: 4096×4096 pixels (or highest available output)
- Pure white seamless studio background — RGB 255,255,255 target
- Front-facing camera — eye-level angle — no high or low hero angles
- Centered composition — vertical centerline aligned to bust center
- 15–18% white space margin on left, right, and top edges
- Product occupies 55–65% of frame height from bust crown through mid-length hair fall
- Hair continues beyond the bottom frame edge — hair ends must NOT be visible in frame
- Breathing room above crown; minimal floor shadow if any
- Symmetrical presentation where texture allows

CAMERA SYSTEM — LOCKED
- Camera height: eye level
- Lens: fixed studio standard focal length — no wide distortion, no telephoto compression drift
- Crop: center-weighted product crop — no ad-hoc reframing per SKU
- No handheld or casual angles for master portraits
- No lens changes between Signature units — texture and unit identity differences only

LIGHTING — LOCKED (LUXURY EDITORIAL STUDIO)
- Soft diffused key light: large source, 45° front-left, eye level
- Soft fill light: controlled bounce — preserve lace and texture shadow detail
- Subtle rim lighting: gentle hair-edge separation — no harsh halo
- Even pure white background — no gradient falloff on master
- Luxury editorial lighting quality inspired by Apple product photography, Dior Beauty, Chanel Beauty, Louis Vuitton, Aesop, and Vogue Beauty editorial campaigns
- NO orange lighting
- NO yellow or warm gel lighting
- NO mixed color temperatures
- NO harsh shadows
- NO dark background
- NO colored gels on product masters
- NO heavy beauty retouch that alters texture truth

BACKGROUND — LOCKED
- Pure white seamless studio cyclorama
- Clean, clutter-free, maximum negative space
- Environmental marble, acrylic, rose, brick, or campaign treatments belong ONLY in downstream marketing crops — never in the locked master hero

PRODUCT / HAIR FIDELITY
Apply the provided product reference image as the hair identity lock:
- Match unit texture, wave/curl pattern, length impression, density, and color truth
- Natural hairline visible; lace edge clean and readable — not over-retouched
- Lace specification must remain legible where applicable (e.g. 13×6 Ultra Thin HD Film Lace)
- Texture truth over saturation — photoreal hair fiber detail, not plastic CGI
- Unit metadata (collection number, texture origin, length, density, lace) informs spec accuracy but must not appear as text in the image

PROHIBITED ELEMENTS — LOCKED
- No props
- No acrylic displays or holographic exhibits
- No text overlays, watermarks, or typography
- No diamonds, roses, or decorative graphics
- No clutter
- No people
- No busy backgrounds
- No orange/yellow color cast
- No stock photography artifacts

OUTPUT QUALITY
Photoreal luxury commercial advertising quality. Crisp commercial detail. Soft diffused editorial lighting. Large negative space. Gentle realistic shadows where needed for dimension. Premium white studio presentation suitable for e-commerce hero, email Signature Collection modules, and StudioOS Product Photography Bible approval.

ATTACHMENT ORDER (GENERATION PACKAGE)
1. Official Frontal Slayer Display Bust v1.0 (mannequin identity lock)
2. Product reference image (hair texture / unit identity lock)
3. Editorial reference image (lighting, composition, negative space, premium photographic quality ONLY — never replaces mannequin or product identity)

This prompt is the permanent production recipe for Signature Collection units 001–006 and all future Frontal Slayer product lines that inherit Creative DNA v1.0.`;

export const CREATIVE_DNA_EDITORIAL_REFERENCE_PROMPT = `Create a clean minimalist luxury studio product photography reference image.

The image should show an ultra-premium beauty product photographed on a pure white seamless background with soft diffused editorial lighting, large negative space, gentle realistic shadows, subtle rim lighting, crisp commercial detail, and museum-quality luxury presentation.

The style should feel inspired by Apple product photography, Dior Beauty, Chanel Beauty, Louis Vuitton, Aesop, and Vogue Beauty editorial campaigns.

Minimal, timeless, elegant, premium, white studio lighting, luxury commercial advertising quality.

No clutter.
No harsh shadows.
No dark background.
No orange lighting.
No busy props.
No people.
No text-heavy design.`;

export const PRODUCT_PHOTOGRAPHY_POC_UNIT = {
  slug: 'soft-wave',
  label: 'SOFT WAVE',
  collectionNumber: '003',
  texture: 'Raw Indian',
  length: '24"',
  density: '200%',
  lace: '13×6 Ultra Thin HD Film Lace',
  productLine: 'signature-collection',
  version: 'v1',
  displayBustFront: '/assets/2D WAVY FRONT.png',
  defaultProductRef: '/assets/2D WAVY FRONT.png',
  benchmarkHeroSrc: '/assets/2D WAVY FRONT.png',
} as const;

export const DISPLAY_BUST_BY_SLUG: Record<string, string> = {
  noir: '/assets/natural front.png',
  blanco: '/assets/2D BLANCO FRONT.png',
  'soft-wave': '/assets/2D WAVY FRONT.png',
  'beach-wave': '/assets/2D WAVY FRONT.png',
  'soft-curl': '/assets/2D CURLY FRONT.png',
  'ocean-curl': '/assets/2D CURLY FRONT.png',
};

export function resolveDisplayBustFront(unitSlug: string): string {
  return DISPLAY_BUST_BY_SLUG[unitSlug] ?? PRODUCT_PHOTOGRAPHY_POC_UNIT.displayBustFront;
}
