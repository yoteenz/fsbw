# Golden models — Build-a-Wig / Frontal Slayer

**Purpose:** Curated notes on **Fal (and related) models that work best** in this project’s stack. Use when choosing a model for image generation, edits, or background removal—before experimenting with new ones.

**When to update:** After a task succeeds in production or QA and the product owner confirms the model is a keeper, add or edit a file here (one model per file, kebab-case slug).

**Related:** Successful **prompt text** lives in `motherboard/golden-prompts/` (cross-link model + prompt files).

---

## Index (quick reference)

| Model | Fal slug (typical) | Best for |
|-------|-------------------|----------|
| **NBP** | `fal-ai/nano-banana-pro/edit` | Mannequins, people, **text accuracy** |
| **GPT Image 2** | `openai/gpt-image-2/edit` | **Detailed scenes** (complex relight / environment) |
| **Ideogram** | Ideogram on Fal (background removal) | **Removing backgrounds** (clean alpha PNGs) |

See individual files for stack context, env (`FAL_KEY`), and when **not** to use each model.
