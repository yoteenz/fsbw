# UE Composer Operator — Proof Matrix (Bootstrap1)

**Environment:** Cursor Cloud agent VM — **no Unreal Editor installed** (2026-10-02).

| Capability | Method | Status | Proof | Notes |
|------------|--------|--------|-------|-------|
| Forensic SITE00 audit | Git + `/home/ubuntu/SITE00` search | **PASS** | `docs/studio-world/ETTA_UE_MIGRATION_AUDIT.md` | No `.uproject` in SITE00 git |
| FSBW UE scaffold | Repo files | **PASS** | `Unreal/StudioWorld/` | Maps not binary-committed |
| Unreal MCP connect | Cursor MCP | **BLOCKED** | — | No UE on VM |
| List actors / spawn via MCP | MCP | **BLOCKED** | — | |
| Spawn test blocks | Python | **DEFERRED** | `spawn_test_actor.py` | Run on founder UE |
| Vertical slice greybox | Python | **DEFERRED** | `create_vertical_slice_greybox.py` | |
| Validate slice labels | Python | **DEFERRED** | `validate_slice.py` | |
| Screenshot automation | Python | **DEFERRED** | `capture_qa_screenshot.py` | |
| Material instance change | MCP/Python | **BLOCKED** | — | |
| Navmesh verify | Editor | **BLOCKED** | — | |
| Run PIE | Editor | **MANUAL** | — | Founder machine |
| Etta load / parity | Content migration | **BLOCKED** | — | External control path unknown |
| Remote Control probe | Plugin enabled in uproject | **READY** | `StudioWorld.uproject` | Not exercised |

**Composer ready as primary UE operator:** **PARTIAL** — workflow documented; runtime proof requires founder UE host.
