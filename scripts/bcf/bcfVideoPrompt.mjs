/** BCF product hero video prompt — keep in sync with docs/BCF_VIDEO_GENERATION.md */
export const BCF_VIDEO_PROMPT_VERSION = 'v3';

const SHARED_TAIL = `Maintain on every frame:
- identical hair color brightness and saturation as the reference
- identical lighting
- identical shadows
- identical white background (#FFFFFF, no gray cast)
- photorealistic strand movement
- luxury beauty campaign quality

Length: 4–6 seconds
Loop: perfect seamless loop with no visible jump.`;

/** Bundles — subtle side sway, no rotation. */
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

${SHARED_TAIL}`;

/**
 * Closures & frontals — lace must never rotate; only rigid side-to-side shake.
 * Kling often "turns" lace frontals — this prompt is stricter than bundles.
 */
export const BCF_CF_VIDEO_PROMPT = `Recreate the attached lace closure or lace frontal product exactly on a pure white (#FFFFFF) seamless background.

The first frame and every frame must match the reference image's hair color, brightness, saturation, exposure, and white balance exactly — do NOT darken, mute, or shift the hair color at any point.

Preserve every strand, texture, density, curl pattern, wave pattern, lace detail, hairline, part line, taper, and overall silhouette exactly.

LACE LOCK (critical — highest priority):
- The lace must remain facing the camera exactly as in the reference on every single frame.
- Do NOT rotate, turn, spin, flip, twist, tilt, roll, or orbit the lace whatsoever.
- Do NOT show the back of the lace, the underside, the band edge rotating into view, or any 3/4 angle.
- The lace hairline, frontal edge, and part line must stay in the identical orientation as frame 1.
- The product moves only as one rigid unit — no independent lace or hair rotation.

CAMERA LOCK:
- Locked-off studio camera. No pan, tilt, zoom, orbit, or framing change.

The ONLY allowed motion is a gentle side-to-side shake/sway of the entire product as one rigid piece — like someone lightly rocking it left and right while holding it outside the frame.

Movement rules:
- 2–3° maximum horizontal sway only
- no Y-axis rotation, no roll, no pitch
- smooth easing, no abrupt direction changes
- premium studio product photography feel

Do NOT rotate the hair.
Do NOT spin it.
Do NOT flip it.
Do NOT twist it.
Do NOT turn the lace around.
Do NOT change exposure, contrast, or color grading.

${SHARED_TAIL}`;

const BASE_NEGATIVE = [
  'rotation',
  'spin',
  'flip',
  'twist',
  'turn around',
  'orbit',
  'zoom',
  'camera movement',
  'pan',
  'tilt',
  'roll',
  'yaw',
  'pitch',
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
];

const CF_LACE_NEGATIVE = [
  'lace rotation',
  'rotating lace',
  'turning lace',
  'lace flip',
  'lace spin',
  'showing back of lace',
  'lace underside',
  '3/4 rotation',
  'product rotation',
  'turning product around',
  'orbiting product',
  'y-axis rotation',
  'artificial movement',
  'cgi',
  'fake',
  'uncanny',
];

export const BCF_VIDEO_NEGATIVE_PROMPT = BASE_NEGATIVE.join(', ');

export const BCF_CF_VIDEO_NEGATIVE_PROMPT = [...BASE_NEGATIVE, ...CF_LACE_NEGATIVE].join(', ');

/** Pick prompt + negative prompt by PDP category. */
export function bcfVideoPromptFor(category) {
  if (category === 'closures' || category === 'frontals') {
    return {
      prompt: BCF_CF_VIDEO_PROMPT,
      negativePrompt: BCF_CF_VIDEO_NEGATIVE_PROMPT,
      cfgScale: 0.42,
    };
  }
  return {
    prompt: BCF_VIDEO_PROMPT,
    negativePrompt: BCF_VIDEO_NEGATIVE_PROMPT,
    cfgScale: 0.55,
  };
}
