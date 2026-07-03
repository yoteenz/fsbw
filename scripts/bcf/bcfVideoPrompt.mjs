/** BCF product hero video prompt — keep in sync with docs/BCF_VIDEO_GENERATION.md */
export const BCF_VIDEO_PROMPT_VERSION = 'v2';

export const BCF_VIDEO_PROMPT = `Recreate the attached product exactly on a pure white (#FFFFFF) seamless background.

The first frame and every frame must match the reference image's hair color, brightness, saturation, exposure, and white balance exactly — do NOT darken, mute, or shift the hair color at any point.

Preserve every strand, texture, density, curl pattern, wave pattern, lace detail, taper, and overall silhouette exactly.

The hair should remain front-facing throughout the animation.

Do NOT rotate the hair.
Do NOT spin it.
Do NOT flip it.
Do NOT twist it.
Do NOT orbit the camera.
Do NOT zoom.
Do NOT change the framing.
Do NOT change exposure, contrast, or color grading.

The only animation should be a slow, elegant, natural side-to-side sway, as though someone is gently holding the product just outside the frame.

Movement should be extremely subtle:
- 2–4° total sway
- smooth easing
- no abrupt direction changes
- premium studio product photography feel

Maintain on every frame:
- identical hair color brightness and saturation as the reference
- identical lighting
- identical shadows
- identical white background (#FFFFFF, no gray cast)
- photorealistic strand movement
- luxury beauty campaign quality

Length: 4–6 seconds
Loop: perfect seamless loop with no visible jump.`;

export const BCF_VIDEO_NEGATIVE_PROMPT = [
  'rotation',
  'spin',
  'flip',
  'twist',
  'orbit',
  'zoom',
  'camera movement',
  'pan',
  'tilt',
  'warping',
  'flicker',
  'blur',
  'low quality',
  'compression artifacts',
  'background change',
  'gradient background',
  'gray background',
  'shadow change',
  'color shift',
  'hair color change',
  'darkened hair',
  'darker hair',
  'muted hair color',
  'desaturated hair',
  'exposure change',
  'contrast change',
  'color grading',
  'vignette',
  'texture change',
  'density change',
  'flyaway change',
  'silhouette change',
  'crop change',
  'lighting change',
].join(', ');
