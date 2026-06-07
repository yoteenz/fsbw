/**
 * PSA avatar expression manifest — NBP edit prompts + filenames.
 * Used by scripts/generate-psa-avatar-expressions.mjs and golden-prompts docs.
 */

export const PSA_AVATAR_STYLE_LOCK = `STYLE LOCK — PSA AVATAR (do not drift):
- Treat the input as a photograph to preserve: same identity, face, skin tone, hair, outfit, jewelry, holographic rim glow, lighting, framing, and scale as the reference.
- Change ONLY the expression/pose described below. Do not change wardrobe, crop, or add UI.
- Bust or 3/4 portrait, centered, circular-FAB friendly.
- No text, logos, watermarks, phones, or chat bubbles.

Do not change anything else beyond the stated expression/pose edit.`;

export const PSA_AVATAR_NEGATIVE_PROMPT =
  'different person, wrong likeness, plastic skin, cartoon, extra fingers, new outfit, text, logo, full body tiny figure';

/** @typedef {{ slug: string, filename: string, promptLine: string, v5?: boolean }} PsaAvatarExpressionDef */

/** @type {PsaAvatarExpressionDef[]} */
export const PSA_AVATAR_EXPRESSION_MANIFEST = [
  {
    slug: 'neutral',
    filename: 'psa-avatar-neutral.png',
    promptLine:
      'Neutral relaxed expression, soft closed-mouth smile, eyes at camera, hands relaxed — default idle FAB.',
  },
  {
    slug: 'neutral-smiling',
    filename: 'psa-avatar-neutral-smiling.png',
    promptLine: 'Warm open smile, eyes bright, approachable concierge idle in chat.',
  },
  {
    slug: 'waving',
    filename: 'psa-avatar-waving.png',
    promptLine: 'Friendly wave with one hand raised near shoulder, welcoming smile.',
  },
  {
    slug: 'listening',
    filename: 'psa-avatar-listening.png',
    promptLine: 'Attentive listening — slight head tilt, soft smile, eyes focused as if reading the member.',
  },
  {
    slug: 'thinking-smiling',
    filename: 'psa-avatar-thinking-smiling.png',
    promptLine: 'Soft smile while thinking — eyes slightly down as if composing a reply while member types.',
  },
  {
    slug: 'thinking',
    filename: 'psa-avatar-thinking.png',
    promptLine: 'Focused thinking — eyes slightly down, lips gently pressed, waiting on a reply.',
  },
  {
    slug: 'delighted',
    filename: 'psa-avatar-delighted.png',
    promptLine: 'Genuinely delighted smile — bright eyes, subtle happy energy after good news.',
  },
  {
    slug: 'sorry',
    filename: 'psa-avatar-sorry.png',
    promptLine: 'Apologetic but warm — soft concerned eyes, slight sympathetic frown, hands open.',
  },
  {
    slug: 'pointing',
    filename: 'psa-avatar-pointing.png',
    promptLine: 'Helpful point off to the side with one hand — guiding member to a page or next step.',
  },
  {
    slug: 'talking',
    filename: 'psa-avatar-talking.png',
    promptLine: 'Mid-sentence talking — mouth slightly open, engaged conversational energy.',
  },
  {
    slug: 'presenting',
    filename: 'psa-avatar-presenting.png',
    promptLine: 'Palm-up presenting gesture — showcasing a product or recommendation with confident smile.',
  },
  // —— PSA v5 expressions (new PNGs) ——
  {
    slug: 'remembering',
    filename: 'psa-avatar-remembering.png',
    v5: true,
    promptLine:
      'Soft warm smile, gentle knowing eyes as if recalling something personal — one hand lightly at chest, "I remember you" energy.',
  },
  {
    slug: 'curator',
    filename: 'psa-avatar-curator.png',
    v5: true,
    promptLine:
      'Composed half-smile, one eyebrow slightly raised — boutique curator energy, subtle hand gesture as if offering a private selection.',
  },
  {
    slug: 'honest-pushback',
    filename: 'psa-avatar-honest-pushback.png',
    v5: true,
    promptLine:
      'Thoughtful serious expression, slight head tilt, one palm up in respectful "let me be real with you" gesture — honest pushback, not angry.',
  },
  {
    slug: 'archetype-reveal',
    filename: 'psa-avatar-archetype-reveal.png',
    v5: true,
    promptLine:
      'Bright confident smile, both hands slightly raised in a small reveal — proud "your archetype is…" unveiling energy.',
  },
  {
    slug: 'red-carpet',
    filename: 'psa-avatar-red-carpet.png',
    v5: true,
    promptLine:
      'Glamorous confident smile, shoulders back, elegant poised gesture — red carpet event concierge, luxury and poise.',
  },
  {
    slug: 'blueprint',
    filename: 'psa-avatar-blueprint.png',
    v5: true,
    promptLine:
      'Focused expert smile, one hand tracing an invisible plan or both hands framing a concept — architect of a full event look blueprint.',
  },
  {
    slug: 'celebrating',
    filename: 'psa-avatar-celebrating.png',
    v5: true,
    promptLine:
      'Joyful restrained celebration — open smile, subtle clap or small fist pump kept luxury-toned, milestone win energy.',
  },
  {
    slug: 'reassuring',
    filename: 'psa-avatar-reassuring.png',
    v5: true,
    promptLine:
      'Calm warm smile, soft eyes, both palms slightly forward in gentle "you are okay" reassurance — no pity, just steady confidence.',
  },
  {
    slug: 'spotlight',
    filename: 'psa-avatar-spotlight.png',
    v5: true,
    promptLine:
      'Confident direct gaze, knowing smile, decisive chin-up or subtle point — founder conviction "this is what I would pick" energy.',
  },
];

export function buildPsaAvatarNbpPrompt(promptLine) {
  return `${PSA_AVATAR_STYLE_LOCK}\n\nEXPRESSION EDIT:\n${promptLine}`;
}

export function manifestBySlug(slug) {
  return PSA_AVATAR_EXPRESSION_MANIFEST.find((e) => e.slug === slug);
}
