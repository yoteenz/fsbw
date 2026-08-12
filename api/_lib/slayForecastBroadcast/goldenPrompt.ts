/** Canonical locked golden prompt — do not rewrite production instructions. */
export const SLAY_FORECAST_GOLDEN_PROMPT_VERSION = 'SLAY_FORECAST_GOLDEN_V1';

export const SLAY_FORECAST_GOLDEN_PROMPT_TEMPLATE = `Create one continuous Slay Forecast broadcast performance using the provided PSA reference image.
Preserve exactly:
- same woman and identity
- same face
- same copper hair
- same white/silver satin outfit
- same jewelry
- same seated position
- same desk
- same red-and-black forecast studio
- same lighting
- same camera angle
- same framing and composition
- same hand position
NAILS:
Preserve a consistent polished manicure:
- medium-long almond shape
- glossy solid deep red
- clean, elegant and realistic
- same manicure on every nail
- realistic fingers and nail anatomy
No nail art, rhinestones, charms, French tips, patterns, oversized nails, malformed fingers or inconsistent nails.
CAMERA COMPLETELY LOCKED.
No zoom.
No pan.
No tilt.
No dolly.
No reframing.
No cuts.
No camera shake.
This performance has THREE DISTINCT PHASES:
PHASE 1 — OPENING
PSA looks directly into the camera like a polished, confident beauty-news anchor.
She says naturally:
"{{OPENING_DIALOGUE}}"
Her delivery should be witty, warm, conversational and confident.
Do not overact.
After finishing the sentence, her mouth naturally closes.
Her expression gently settles into a faint, relaxed smirk.
PHASE 2 — SILENT FORECAST HOLD
PSA MUST STOP SPEAKING COMPLETELY.
This is an intentional broadcast pause where forecast graphics will later be added by the website.
Hold this silent section for several seconds.
During the hold:
- mouth remains closed
- no dialogue
- no mouthing words
- no lip movement suggesting speech
- direct but relaxed eye contact
- faint relaxed smirk
- soft friendly eyes
- subtle breathing
- occasional natural blink
- extremely small facial micro-movements only
She should look like she is watching the forecast graphics appear with the audience.
Do NOT make her grin.
Do NOT make her expression blank, cold, bored, irritated or sinister.
PHASE 3 — CLOSING
After the silent hold, PSA naturally resumes speaking without changing posture.
She says:
"{{CLOSING_DIALOGUE}}"
Deliver this with subtle knowing confidence, as though completing the thought from the opening.
After speaking, settle naturally back into the same faint relaxed expression.
CONTINUITY IS CRITICAL.
There should be no visible transition between phases.
PSA remains:
- in the same position
- at the same scale
- under the same lighting
- with the same posture
- with hands in the same position
Do not introduce gestures between sections.
BACKGROUND:
Keep the studio completely consistent.
Do not add:
- text
- captions
- weather graphics
- forecast graphics
- icons
- charts
- logos
- UI
- products
The website will add all forecast graphics separately.
FINAL FEEL:
This should look like one professionally recorded broadcast take:
PSA speaks →
PSA intentionally holds while graphics appear →
PSA finishes the forecast.
Natural.
Warm.
Polished.
Witty.
Controlled.
Broadcast-ready.
The silent pause must be unmistakably SILENT.`;

export type GoldenPromptInjection = {
  openingDialogue: string;
  closingDialogue: string;
  forecastWeek?: string;
};

export function injectGoldenPromptDialogue(input: GoldenPromptInjection): string {
  return SLAY_FORECAST_GOLDEN_PROMPT_TEMPLATE.replace(
    '{{OPENING_DIALOGUE}}',
    input.openingDialogue.trim(),
  ).replace('{{CLOSING_DIALOGUE}}', input.closingDialogue.trim());
}
