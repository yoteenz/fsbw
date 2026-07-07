# 11 — Regeneration Rules

**Engine Module:** `studio.asset-compiler.v1.regeneration`  
**Status:** Surgical regeneration specification  
**Philosophy:** Change one thing → regenerate one thing. Nothing else.

---

## Core Principle

> If the founder changes the lighting, only lighting regenerates. If the founder changes the Mood Wall, only the Mood Wall regenerates. If the founder changes the Orb, only the Orb regenerates. Nothing else should regenerate.

Full department rebuilds are the exception — not the default.

---

## Regeneration Trigger Map

| Founder Changes | Assets Regenerated | Pipeline Stages | Other Assets |
|-----------------|-------------------|-----------------|-------------|
| **Lighting** | `lighting-rig`, `ibl-environment` | 2 | Untouched |
| **Mood Wall** | `mood-wall-surface` | 7 | Untouched |
| **Orb** | `orb` (or pedestal if custom) | 8 | Untouched |
| **Timeline** | `timeline` furniture mesh | 4 | Untouched |
| **Glass Table** | `glass-table` mesh + glass shader | 4, 6 | Untouched |
| **Environment** | `environment-shell`, `windows` | 1 | Furniture may need reposition validation |
| **Materials** | All `material-set-*` | 3 | Untouched (geometry unchanged) |
| **Ambient Audio** | `ambient-loop` | 10 | Untouched |
| **Approval Sound** | `ceremony-sfx/approve-*` | 10 | Untouched |
| **Particles** | `particles-ambient`, `particles-ceremony` | 9 | Untouched |
| **Camera** | `camera-presets` | 11 (deterministic) | Untouched |
| **Animations** | Specific animation clip | 11 | Untouched |
| **Interactions** | `interactions.json`, `ai-triggers.json` | 12 (deterministic) | Untouched |
| **Approval Station** | `approval-station` mesh | 7 | Untouched |
| **Asset Shelf** | `asset-shelf` mesh | 4 | Untouched |
| **Decor** | `decor-accents` | 5 | Untouched |
| **Full Genome Refresh** | All Genome-dependent assets | 2, 3, 7, 9, 10, 13 | Structural unchanged |
| **Department Anatomy** | All affected objects | Varies | Unaffected objects untouched |
| **Project Mood** | `mood-wall-surface`, `ambient-loop` | 7, 10 | Untouched |

---

## Regeneration Process

```
Step 1: IDENTIFY changed element from founder action
Step 2: LOOKUP regeneration map → affected assetIds
Step 3: RETRIEVE original Input Manifest (immutable)
Step 4: MERGE change into Input Manifest (update specific domain)
Step 5: RECOMPUTE PromptStacks for affected assets only (03)
Step 6: EXECUTE pipeline stages for affected assets only (04)
Step 7: VERSION increment for each regenerated asset (10)
Step 8: UPDATE package (swap current, archive previous)
Step 9: VALIDATE regenerated assets (12)
Step 10: HOT-SWAP in Runtime (if department active)
```

---

## Hot-Swap (Live Department)

When a department is active and an asset regenerates:

| Asset Category | Hot-Swap Method |
|----------------|----------------|
| Materials | Runtime shader update — no reload |
| Lighting | Runtime parameter update — no reload |
| Audio | Crossfade to new audio file |
| 3D mesh (furniture) | Load new GLB → swap at same placement node |
| Mood Wall | Crossfade imagery (2s) |
| Particles | Restart particle system with new definition |
| Interactions | Reload interaction map — no visual change |
| Environment | Requires brief loading ritual — not true hot-swap |

**User experience:** Regeneration happens in background. User sees subtle transition — never a full department reload (except environment changes).

---

## Regeneration Modes

```yaml
RegenerateRequest:
  departmentId: string
  targets: RegenerateTarget[]
  reason: string
  useLatestGenome: boolean          # true = use current Genome; false = original
  useLatestProject: boolean
  approvalRequired: boolean
  preserveVersions: boolean         # true = archive old; false = replace in-place (dev only)

RegenerateTarget:
  type: enum                        # asset | category | genome-domain | anatomy-field
  id: string                        # asset ID, category, or domain name
```

| Mode | Targets | Use Case |
|------|---------|----------|
| **Single asset** | One assetId | "Change the mood wall" |
| **Category** | All assets in category | "Regenerate all audio" |
| **Genome domain** | All assets affected by domain | "Brand colors changed" |
| **Anatomy field** | All assets affected by anatomy change | "Added new object to department" |

---

## Dependency-Aware Regeneration

Some regenerations trigger **dependency validation** but not regeneration:

| Changed Asset | Dependent Assets | Action |
|---------------|-----------------|--------|
| Environment | Furniture placements | Validate positions — regenerate only if invalid |
| Materials | All geometry | Hot-swap materials — no geometry regeneration |
| Lighting | Previews | Regenerate preview renders only |
| Furniture | Interactions | Validate bindings — update if object ID changed |
| Anatomy (add object) | New object only | Generate new object — existing untouched |
| Anatomy (remove object) | Removed object | Archive — no regeneration |

**Rule:** Dependencies are validated, not automatically regenerated.

---

## Cost Control

| Regeneration Scope | Estimated Cost | Approval |
|-------------------|----------------|----------|
| Single asset | Low | Auto-approve if under budget |
| Category (≤ 5 assets) | Medium | Auto-approve if under budget |
| Genome domain (≤ 10 assets) | Medium-high | Human approval |
| Full department | High | Human approval required |
| Environment (cascading validation) | Medium | Human approval |

---

## Regeneration Audit

Every regeneration creates an audit record:

```yaml
RegenerationAudit:
  id: string
  departmentId: string
  triggeredBy: string               # user or system event
  reason: string
  targets: string[]                 # asset IDs regenerated
  previousVersions: VersionRef[]
  newVersions: VersionRef[]
  inputManifestId: string
  genomeProfileId: string
  cost: number
  duration: number
  status: enum                      # completed | failed | partial
  createdAt: datetime
```

---

## Forbidden Regeneration Patterns

| Pattern | Why Forbidden |
|---------|---------------|
| Full rebuild when one asset changed | Violates surgical principle |
| Regenerate without version increment | Loses history |
| Regenerate without Input Manifest | Non-reproducible |
| Regenerate with hardcoded prompts | Must use Prompt Compiler |
| Delete previous version on regenerate | Versions are immutable |
| Regenerate during active ceremony | Queue until ceremony completes |

---

_Next: [12 — QA Validation](./12_QA_VALIDATION.md)_
