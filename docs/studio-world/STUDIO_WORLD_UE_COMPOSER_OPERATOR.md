# Studio World — UE Composer Operator

**Sprint:** `P0.STUDIOWORLD.UE-COMPOSER-OPERATOR.MIGRATION-BOOTSTRAP1`  
**Default operator:** Cursor **Composer** (not founder manual UE)  
**Premium models:** Opus/Astra only for high-cost visual/spatial review — not routine transforms.

---

## Canon

| Plane | Role |
|-------|------|
| **FSBW `Unreal/StudioWorld/`** | Canonical active UE + Etta + vertical slice |
| **SITE00 repo** | Historical calibration + 2D/TS character pipelines — **reference only** |
| **FSBW `studio-world-residents/`** | Identity canon (`SW-RESIDENT-001` Etta Vale) — above MetaHuman |

---

## Authority hierarchy

1. **Founder** — final creative authority  
2. **Approved north star / spatial bible** — visual experience authority  
3. **Opus** — optional convergence review  
4. **Composer** — primary UE implementation + operation  
5. **Unreal** — runtime  
6. **OpenArt / Grok / Fab** — asset suppliers  

Composer must **not** invent substitute visual language.

---

## Operator modes

| Mode | Purpose | Allowed |
|------|---------|---------|
| **A — Blockout** | Fast structure | Greybox, nav, collision, temp materials |
| **B — World design** | Authority → space | Modules, materials, light, identity — **preserve** nav/logic |
| **C — Convergence** | QA vs north star | Scale, sightlines, density, human feel |

---

## Connection stack (preference order)

1. **Unreal MCP** → Cursor MCP config (see `.cursor/mcp.json.example`)  
2. **Python** → `Unreal/StudioWorld/Scripts/StudioWorld/*.py` (Editor Scripting)  
3. **Remote Control** → viability only this sprint  

### MCP template

Copy `.cursor/mcp.json.example` → `.cursor/mcp.json` (local, gitignored). Start Unreal Editor with MCP plugin per Epic docs for your engine version. Run tool discovery from Cursor **before** claiming PASS.

### Python fallback

1. Open `Unreal/StudioWorld/StudioWorld.uproject` in matching UE **5.4+** (adjust `EngineAssociation` if needed).  
2. Enable **Python Editor Script Plugin** + **Editor Scripting Utilities**.  
3. **Tools → Execute Python Script** or `-ExecutePythonScript=...`  
4. Scripts: `spawn_test_actor.py`, `create_vertical_slice_greybox.py`, `validate_slice.py`, `capture_qa_screenshot.py`

---

## Maps

| Map | Path | Use |
|-----|------|-----|
| Etta Test Sandbox | `/Game/StudioWorld/Maps/ETtaTestSandbox` | Embodiment QA only |
| Vertical Slice 01 | `/Game/StudioWorld/Maps/SW_VerticalSlice_01` | World greybox |

---

## Proof artifacts

`artifacts/ue-composer-operator-migration-bootstrap1/` — screenshots, logs, PROOF_MATRIX.md

---

## Recovery

- **MCP drops:** fall back to Python; restart MCP server in editor.  
- **Wrong engine version:** align `EngineAssociation` with installed UE.  
- **Missing SITE00 parity:** update `site00-external-control-manifest.local.json` — do not delete SITE00 control.

---

## Founder manual actions still required (Bootstrap1)

- Register external SITE00 `.uproject` path in local manifest  
- Install UE + open FSBW project  
- Import MetaHuman / maps from control project  
- Enable MCP (if used) on local machine  
- Run PIE for locomotion proof  

Cloud agents **cannot** complete UE/MCP/PIE verification without a founder UE host.
