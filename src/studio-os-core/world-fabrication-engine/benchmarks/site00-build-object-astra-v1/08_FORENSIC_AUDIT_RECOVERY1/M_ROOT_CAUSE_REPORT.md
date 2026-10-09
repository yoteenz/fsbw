# M — Root cause report

| ID | Category | Status | Evidence summary |
|----|----------|--------|------------------|
| RC-01 | **INCOMPLETE_CREATIVE_BRIEF** | CONFIRMED | Prompt prioritized deliverable checklist, triangle band, one revision, $10 conservatism over measurable reference match gates (`codex-assignment-prompt.txt`). |
| RC-02 | **IMAGE_NOT_INSPECTED** (pre-blockout) | NOT VERIFIED / LIKELY | `-i` attach confirmed; no transcript proof of reference-driven measurements before `build_astra_v1.py`; parametric template used. |
| RC-03 | **CAMERA_MISMATCH** | CONFIRMED | Orthographic hero vs perspective reference (`camera-manifest.json` vs reference JPG). |
| RC-04 | **GEOMETRY_SIMPLIFICATION** | CONFIRMED | Repeated `pavilion()` / box primitives vs reference asymmetric red blade + dense interior (`build_astra_v1.py`). |
| RC-05 | **CHARACTER_ASSET_LIMITATION** | CONFIRMED | Ellipsoid placeholders by design (source comment). |
| RC-06 | **INSUFFICIENT_RENDER_ITERATION** | CONFIRMED | One revision; 3/5 renders left on initial-pass materials (`founder-contact-sheet.md`). |
| RC-07 | **EARLY_COMPLETION** | CONFIRMED | Session ended on deliverable validator + `WFE_ASTRA_V1_COMPLETE` (`codex-exec.log` footer). |
| RC-08 | **TECHNICAL_QA_ONLY** | CONFIRMED | WFE ingestion PASS; creative fidelity self-rated partial **after** the fact. |
| RC-09 | **BUDGET_BOUNDARY** | LIKELY | “One build + one revision” + token session cap shaped scope. |
| RC-10 | Context pollution | CONFIRMED | Massive unrelated motherboard/CORE text in same Codex session log after assignment. |
| RC-11 | **GLB_RENDERER_LIMITATION** | LIKELY | Founder reviewed GLB in viewer — may under-represent Cycles glass (separate from construction failure). |

**Primary failure combination (evidence-backed):**  
**INCOMPLETE_CREATIVE_BRIEF + GEOMETRY_SIMPLIFICATION + CAMERA_MISMATCH + CHARACTER_ASSET_LIMITATION + EARLY_COMPLETION**, with **unverified** but **likely** weak reference-driven vision during blockout despite `-i` attach.

**Not primary:** model identity (`gpt-6-astra` verified).
