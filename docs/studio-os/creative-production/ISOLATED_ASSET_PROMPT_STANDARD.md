# Isolated Asset Prompt Standard™

**Version:** `isolated-asset-prompt.v2`  
**Applies to:** `signature-landmark`, `furniture-objects`

## Structure (Signature Landmark™)

1. **TASK IDENTITY** — isolated production asset for later compositing  
2. **OUTPUT SUBJECT** — exact landmark description only  
3. **OUTPUT PURPOSE** — not a room, environment, or completed scene  
4. **REFERENCE RESTRICTION** — placement metadata only; no environment reproduction  
5. **OUTPUT REQUIREMENTS** — transparent alpha, margins, neutral lighting, no room geometry  
6. **FORBIDDEN CONTENT** — architecture, background, wide shots, shell recreation  
7. **FINAL EMPHASIS** — separately manufactured object in invisible studio  
8. **PLACEMENT METADATA** — anchor, scale, perspective (Scene Stack owns mount)

## Builders

| Layer | Builder ID | Module |
|-------|------------|--------|
| Signature Landmark™ | `signature-landmark-isolated-prompt.v2` | `isolated-asset-prompt.ts` |
| Furniture Objects™ | `furniture-objects-isolated-prompt.v2` | `isolated-asset-prompt.ts` |

Shell prompts (`environment-shell-prompt.v1`) are **never** reused for isolated assets.

## Negative prompt

Dedicated `ISOLATED_NEGATIVE_PROMPT` — architecture, full room, opaque backdrop, checkerboard, scene rerender terms.

## Pre-dispatch assertions

`assertIsolatedPromptBeforeDispatch()` rejects:

- Prohibited scene language in positive prompt  
- Missing required isolated markers  
- Dominant img2img references when `textToImageOnly` is required

## Regeneration escalation (attempt 2)

- Strengthens "do not reproduce environment" language  
- Removes all appearance references (metadata only)  
- Routes to `fal-ai/nano-banana-pro` text-to-image (no marble, no shell)
