# Golden prompts — Build-a-Wig / Frontal Slayer

**Purpose:** Store **prompts that worked** in this project—copy-paste ready or with minimal edits. Pair each prompt with the **golden model** named in `motherboard/golden-models/`.

**When to add:**
- Product owner confirms output is production-quality.
- Include: model, Fal slug, input images, resolution, and **what task** (PSA avatar, NOIR color, lobby scene, etc.).

**When not to duplicate:** Long wig-preview templates already live in `scripts/wig-preview/promptTemplate.mjs` and `COPY-PASTE-PROMPTS.txt` — golden-prompts here should **point to those** or hold **new** winning prompts (e.g. PSA, marketing one-offs).

---

## Index

| File | Model | Task |
|------|--------|------|
| `psa-avatar-likeness-nbp.md` | NBP | PSA character generation (reference photo) |
| `psa-avatar-background-removal-ideogram.md` | Ideogram | PSA transparent cutout after generation |
| `psa-avatar-expressions-nbp.md` | NBP | Expression variants from base avatar |
| `psa-founder-voice.md` | — | Founder clone personality (wired in `api/_lib/psaInstructions.ts`) |
