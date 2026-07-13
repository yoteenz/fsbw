# Current Handoff — Active Sprint State

**Capsule:** StudioOS_ContextCapsule_v0.1  
**Last updated:** 2026-07-13  
**Git reference:** pending post-deploy SHA

---

## Current sprint

**P0 — Experience Lab V2 Fixed-Viewport Application Shell**

**Status: SHIPPED — No-scroll immersive application on isolated V2 route**

**Shipped:**

- **Fixed application shell** — `elab-app-shell` CSS Grid fills viewport; `overflow: hidden` at route shell; `fixedViewport` on `DepartmentGoldenBuildShell` for V2 only
- **Mobile** — compact Command Dock (2 rows + status sheet); tabbed Founder Workbench (Brief/Review/Timeline/Diagnostics); view angles attached to viewport; compact tool tray + More sheet; approval blocker chip
- **Desktop** — fixed grid with internal sidebar scroll; integrated 4-zone workbench; no document scroll
- **Focus modes** — viewport/blueprint/render/review with Escape exit
- **Tests** — experience-lab-v2.test.ts 27/27 PASS; build PASS
- **Production `/admin/studio/experience-lab`** — unchanged

**Previous:** Experience Lab V2 Visual Reconstruction (`fe4199934`).

---

## Current blocker

| ID | Blocker | Status |
|----|---------|--------|
| **B1-ELabV2-LiveSPA** | Post-deploy live React screenshots / screen recordings on device | **Verify Pending** |
| **B1-FounderRender-API** | `founder-render-generate` cold-start 500 | **Fix shipped** — re-probe after deploy |

---

## References

- `docs/studio-os/experience-lab/EXPERIENCE_LAB_V2_TEST_ENVIRONMENT.md`
- `docs/studio-os/experience-lab/v2-screenshots/`
