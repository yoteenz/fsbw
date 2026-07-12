# Full-Scene Layer Root Cause Analysis

**Compile run:** `run-1783893880377-6ymov2`  
**Layer:** Signature Landmark™  
**Error:** `QUALITY_REGENERATE_REQUIRED` / `LANDMARK_VALIDATION_FAILED`

## Documented facts

1. Shell pipeline succeeded (generate, register, persist, verify).  
2. Landmark validation failed — full-scene background detected.  
3. Shell remained valid.  
4. UI correctly identified Layer 1 landmark validation failure.  
5. Production visual was a complete room render, not an isolated object plate.

## Proven effective request (pre-repair)

| Field | Value |
|-------|-------|
| Prompt builder | `scene-stack.v3-isolated` (generic isolated clauses) |
| Model | `fal-ai/nano-banana-pro/edit` |
| Reference | marble-half.png img2img fallback (shell stripped) |
| generationMode | `isolated-single-object` (contract) but img2img path |
| Output | PNG requested, opaque full-scene received |

## Root cause

**COMBINED:**

1. **MODEL-DOMINANT** — `/edit` endpoint requires `image_urls`; forces img2img repaint  
2. **REFERENCE-DOMINANT** — marble fallback acted as dominant composition source  
3. **PROMPT** — generic isolated clauses insufficient against img2img model behavior

## Repair shipped

- Dedicated `signature-landmark-isolated-prompt.v2`  
- `fal-ai/nano-banana-pro` text-to-image for landmark + furniture  
- Zero `image_urls` for isolated layers  
- Placement metadata in prompt (not baked scene)  
- Effective-request tracing (`effective-generation-request.v1`)  
- Pre-dispatch prompt assertions  
- Real regeneration with `jobId` exposure in pipeline HUD

## Production verification

Pending founder mobile compile beyond Layer 1.
