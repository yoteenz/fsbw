# Prompt and assignment audit (§14)

**Executed prompt:** `execution-runs/creative-v1/codex-assignment-prompt.txt` (also `B_EXACT_EXECUTED_PROMPT.txt` copy in this folder).

## Founder creative requirements vs assignment

| Requirement | In prompt? | Notes |
|-------------|------------|-------|
| Close reference matching | **Weak** | “Match:” one bullet list; no measurable tolerances |
| Prohibit generic placeholder architecture | **No** | Allows “meaningful triangle budget” |
| Red portal geometry fidelity | **Implied** only | No silhouette gate |
| Realistic glass | **Yes** | Materials line |
| Interior density | **Implied** | “dense” in bullet |
| Camera-matched comparison | **Contradicted** | Hero name says REFERENCE_MATCH but ortho not forbidden |
| Photorealistic figures | **No** | Not mentioned |
| Image inspection required | **Yes** | “inspect attached image” |
| Render-based revisions | **Yes** | One revision only |
| Creative failure conditions | **No** | |
| Mesh/triangle/export focus | **Yes** | Explicit 50k–250k tris, GLB, JSON reports |
| Speed/budget | **Yes** | $10, one revision, conservative |

## Conclusion (CONFIRMED)

The assignment **encouraged premature technical completion**: long deliverables list + triangle target + single revision cap **outweighed** enforceable reference-matching gates. Astra rationally optimized for **checklist completion** under budget.

**Composer launcher** also injected full repo agent context (motherboard) into Codex session — **amplifies TECHNICAL_QA_ONLY bias**.
