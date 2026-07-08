# Department Assembly — Studio OS v1

**Stage:** 06 — Department Assembly™  
**Role:** Cursor as Runtime Engineer  
**Pilot:** Creative Direction Studio™

---

## Purpose

**Cursor assembles** the department from `DepartmentPackage.zip` — wiring modular assets into a living scene.

Cursor **connects**. Cursor **never designs**.

---

## Assembly Law

| Law | Rule |
|-----|------|
| **No baked screenshots** | No single image stands in for the room |
| **No flattened backgrounds** | Environment is shell + floor + ceiling — not one texture |
| **Every object modular** | Each asset mounts independently · replaceable |
| **Every interaction editable** | Verb bindings from `interaction-manifest.json` — not hardcoded |
| **Genome at runtime** | Brand visuals via slots — not baked into meshes |
| **Zone-anchor assembly** | Objects bind to `zoneId` anchors — not free-floating |
| **Cursor reads manifests** | `15_runtime/assembly-manifest.json` is source of truth |

---

## Assembly Inputs

| Input | Path in Package |
|-------|-----------------|
| Assembly manifest | `15_runtime/assembly-manifest.json` |
| Scene blueprint | `departments/creative-direction-studio/scene-assembly-blueprint.md` |
| Interaction manifest | `interaction-manifest.json` (from Definition) |
| Registry resolutions | `package-manifest.json` → `registryResolutions[]` |
| Dependency graph | `14_metadata/dependency-graph.json` |
| Navigation | `14_metadata/navigation/` · `camera-paths-cds` |
| Content seeds | `seed-mood-cds` · `seed-brief-cds` · `seed-library-cds` |

---

## Assembly Sequence

```
1. LOAD package-manifest.json — verify Build Health ≥ 80
         ↓
2. RESOLVE registry refs — pin versions from registryResolutions[]
         ↓
3. MOUNT environment layer (stage order 1-2)
   - env-shell-cds → root anchor
   - env-floor-cds → walk collision
   - env-ceiling-cds · env-window-cds · env-alcove-cds
         ↓
4. MOUNT lighting rig (stage 3)
   - lighting-rig-cds → zone coverage map
         ↓
5. MOUNT furniture layer (stage 4)
   - table-timeline-cds · table-sandbox-cds · shelf-library-cds
         ↓
6. MOUNT zone objects (stage 5-6)
   - wall-mood-cds (hero) · wall-brief-cds · observatory-cds
   - screen-compare-cds · pedestals · orb · inspiration drop
         ↓
7. MOUNT glass + UI (stage 7-8)
   - glass-panels-cds · panel-context-float-cds · panel-founder-notes-cds
         ↓
8. MOUNT atmosphere (stage 9-11)
   - particles-ambient-cds · audio-* · animation metadata
         ↓
9. WIRE interactions
   - Bind verbs per interaction-manifest.json
   - Connect ceremonies · approval · walk markers
         ↓
10. INJECT content seeds
    - mood · brief · library boot content
         ↓
11. VERIFY no missing dependencies — assembly report
```

---

## Zone Assembly Map (CDS)

| Zone ID | Anchored Assets | Primary Verbs |
|---------|-----------------|---------------|
| `entry` | `portal-entry-cds` | arrive · orient |
| `mood-wall` | `wall-mood-cds` · `screen-compare-cds` | pin · cluster · compare · approve |
| `brief-wall` | `wall-brief-cds` | annotate · scroll |
| `timeline` | `table-timeline-cds` | branch · scrub · spawn |
| `sandbox` | `table-sandbox-cds` | isolate · experiment |
| `reference-library` | `shelf-library-cds` · `env-window-cds` | reference-drop · browse |
| `observatory` | `observatory-cds` · `env-alcove-cds` | inspect-genome |
| `orb-command` | `orb-cds` · `pedestal-orb-cds` | speak · command |
| `inspiration-drop` | `zone-inspiration-drop-cds` | drop · paste · upload |
| `approval` | `pedestal-approval-cds` · `ceremony-approval-cds` | approve · reject |
| `founder-notes` | `panel-founder-notes-cds` | chronicle · voice |
| `exit-discover` | `portal-exit-cds` | discover-department |
| `walk-path` | `markers-walk-room-cds` | walk · critique-anchor |

---

## Cursor Responsibilities

| Cursor Does | Cursor Does Not |
|-------------|-----------------|
| Read `assembly-manifest.json` | Invent new objects |
| Mount GLB/shader per asset path | Bake lighting into textures |
| Wire interaction verbs to handlers | Redesign zone layout |
| Connect genome slot resolvers | Hardcode brand colors |
| Bind concierge routing to Orb | Write creative prompts |
| Configure camera paths | Skip interaction manifest |
| Report assembly errors | Flatten scene to screenshot |

---

## Interaction Wiring

From `interaction-manifest.json`:

```yaml
wiring_steps:
  1. Load verbRegistry — validate verbs exist in SDK
  2. Per zone: bind objects → verbs → handlers
  3. Ceremonies: approval-ceremony → pedestal + mood wall + audio-ceremony
  4. Orb: route speak → concierge selector
  5. Walk the Room: markers-walk-room-cds → path + critique anchors
  6. Inspiration: zone-inspiration-drop → reference-drop pipeline
  7. Branch: timeline table → sandbox isolation toggle
```

Every binding must be **editable** — change manifest, re-wire, no scene rebuild.

---

## Genome Injection at Assembly

Assembly prepares genome slot bindings — Runtime resolves live values:

```
Per asset with genomeSlots[]:
  1. Read slot names from assembly-manifest
  2. Map to Company Genome snapshot keys
  3. Attach resolvers (material · color · voice)
  4. Do NOT bake values into mesh materials
```

Room DNA slider values from compile-time snapshot passed as `roomDnaContext` in runtime manifest.

---

## Assembly Verification

| Check | Pass |
|-------|------|
| Asset count | 35 mounted |
| Hero visible | `wall-mood-cds` in mood-wall zone |
| Orb mounted | `orb-cds` on pedestal · greeting test hook |
| No flat bg | Camera orbit shows modular depth |
| Walk collision | Floor mesh blocks below-stage |
| Portals | Entry arrival · exit discover wired |
| Interactions | All manifest verbs have handlers |
| Concierges | 3 AI routes reachable from Orb |
| Content seeds | Mood · brief · library non-empty at boot |

---

## Assembly Report

```markdown
# Assembly Report — pkg-creative-direction-golden-v1

| Metric | Value |
|--------|-------|
| Assets mounted | 35/35 |
| Interactions wired | 42/42 |
| Registry refs resolved | 14 |
| Genome slots bound | 28 |
| Assembly errors | 0 |
| Warnings | 0 |

Status: ASSEMBLY_COMPLETE
```

---

## Failure Handling

| Failure | Action |
|---------|--------|
| Missing artifact | Block assembly · return to Stage 03 |
| Registry ref unresolved | Check Stage 05 · re-resolve |
| Interaction verb missing | Check Definition · add handler or fix manifest |
| Zone anchor mismatch | Fix placement per scene-assembly-blueprint |
| Genome slot unbound | Fix assembly-manifest · not mesh regen |

---

## Stage 06 Gate

**Assembly Complete** when assembly report shows 0 errors · all verification checks pass · handoff package prepared for Runtime boot.

---

_Department Assembly — Cursor connects the place, never paints it flat._
