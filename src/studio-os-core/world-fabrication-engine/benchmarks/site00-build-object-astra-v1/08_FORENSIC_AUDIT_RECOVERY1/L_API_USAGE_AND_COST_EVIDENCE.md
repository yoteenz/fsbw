# L — API usage and cost evidence

| Metric | Value | Source |
|--------|-------|--------|
| Codex sessions | 1 | `codex-exec.log`, receipt JSON |
| Model | `gpt-6-astra` | Transcript header |
| Tokens | **94,346** | Transcript footer |
| Attributable USD for this run | **UNKNOWN** | CLI did not report dollars |
| Founder dashboard $4.87 | **NOT attributable** to this run without usage export | Founder note — do not infer |
| $10 ceiling technical enforcement | **NOT ENFORCED** | No API-side spend cap; prompt instruction only |
| Automatic retries | **None observed** (single session) | Transcript |
| Artlist / OpenArt / GPU | **None** | Session narrative + reports |

**$10_LIMIT_ENFORCEMENT:** **NOT_ENFORCED** (operational honor system + single session; token stop not wired).

**Blender cost:** local CPU only (~293 s fabrication/render wall time per `wfe-astra-fabrication-report.json`).
