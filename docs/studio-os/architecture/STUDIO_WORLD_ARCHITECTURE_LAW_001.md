# Studio World Architecture Law #001

**Status:** P0 permanent platform invariant  
**Version:** `architecture-law-001.v1`  
**Spatial review:** `docs/studio-os/investigations/SPATIAL_ARCHITECTURE_REVIEW_ARCHITECTURE_LAW_001.md` (Approved 4.9)  
**Module:** `src/studio-os-core/architecture-law-001/`

---

## Law

**AI builds places. Studio World builds interfaces.**

Never allow an AI model to generate production UI.

---

## AI may generate

Architecture · walls · floors · ceilings · furniture · lighting · materials · glass · acrylic · chrome · environment props · Command Dock™ shell · Workbench™ shell · monitor bezels · display frames · control consoles · button housings · touch surfaces · dashboard shells · panel groupings · toolbar frames · viewport windows · graph containers · thumbnail frames · navigation rails · physical interaction zones · placeholder cards · placeholder buttons · empty display screens · embedded console architecture.

Premium, realistic, fully integrated into the room.

---

## AI must never generate

Typography · words · letters · numbers · dates · charts · graphs · status values · progress bars · notifications · icons · navigation labels · company names · department names · revision numbers · button captions · logos · brand names · breadcrumbs · menus · tooltips · badges · dashboard metrics · any readable production interface element.

---

## Display placeholders

Every AI-generated monitor/display: powered on · premium · glass · illuminated · reflective · active · **intentionally blank**.

Acceptable treatments: ambient gradients · subtle blueprint lines · abstract geometry · neutral scan patterns · glass reflections · soft emissive lighting · minimal wireframes · depth cues.

---

## Command Dock™ & Workbench™

| Layer | Owner |
|-------|-------|
| Physical shell (glass, acrylic, chrome, bezels, housings) | AI / Experience Lab |
| Live interface (labels, icons, commands, progress, permissions) | Studio World React runtime |

Every department inherits Command Dock + Workbench architecture. Only mounted functionality changes.

---

## UI Socket Registry™

Blueprint Author is source of truth. Every department exposes mounting sockets:

`HEADER_BAR` · `COMMAND_DOCK` · `WORKBENCH` · `LEFT_PANEL` · `RIGHT_PANEL` · `CENTER_STAGE` · `ACTION_BAR` · `STATUS_BAR` · `TOOL_GROUPS` · `BUTTON_ROWS` · `DISPLAY_A` · `DISPLAY_B` · `DISPLAY_C` · `TIMELINE` · `REVIEW_PANEL` · `VIEWPORT`

Each socket stores: position · dimensions · rotation · perspective · depth · corner radius · safe content area · animation origin · clipping mask.

Code: `ui-socket-registry.ts` · `blueprint-author/ui-mount-socket-system.ts`

---

## Render pipeline

```
Experience Lab → Department Architecture → Command Dock → Workbench
  → Display Placeholders → Socket Metadata → Founder Review → Approval
  → Blueprint Lock → CDS → Studio World Runtime mounts React UI → Interactive Department
```

At no point does AI generate production interface elements.

---

## Global design system (Studio World only)

Typography · buttons · icons · charts · graphs · animations · notifications · navigation · forms · tables · menus · status indicators · progress bars · badges · accessibility · localization · theme switching · brand styling.

Official fonts: Futura PT · Covered By Your Grace · Bohemy

---

## Immune System enforcement

Before any founder render approval, inspect for AI-generated UI.

| Detection | Action |
|-----------|--------|
| Text · letters · numbers · captions · logos · icons · menus · metrics | Reject |
| Code | `AI_UI_DETECTED` |
| Message | Studio World Architecture Law #001 prohibits AI-generated production interfaces. |

Code: `immune-ui-detection.ts` · `immune-system/architecture-law-validation.ts`

---

## Integration entry points

| Export | Role |
|--------|------|
| `buildArchitectureLawPositiveDirective()` | Environment generation prompts |
| `buildArchitectureLawNegativeDirective()` | Negative prompt block |
| `defineDefaultDepartmentUiSockets()` | Default socket blueprint |
| `detectAiGeneratedProductionUi()` | Immune System pre-approval gate |
| `validateMasterLandscapeApprovalGate()` | Master Founder Render approval |
| `attachUiSocketBlueprintToConstructionPlan()` | Blueprint Author session |

---

## Supabase

`20260713190000_architecture_law_001.sql` — `studio_department_ui_sockets`
