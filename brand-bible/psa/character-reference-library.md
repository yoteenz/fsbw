# PSA Character Reference Library

**Document:** PSA Character Reference Library  
**Version:** 1.0  
**Status:** Canonical — master index of approved PSA reference assets  
**Owner:** Frontal Slayer Creative / Digital Asset Management  
**Classification:** Internal — **catalog and governance only** (not binary storage)  

**This document is the central catalog—not the assets themselves.** Binaries live in the **PSA Master Reference Vault** (secure DAM), **`public/assets/`** (approved runtime derivatives), and approved production storage per [`character-turnaround.md`](./character-turnaround.md).

**Companion bibles:** [`character-turnaround.md`](./character-turnaround.md) (visual capture standards, REF IDs, naming grammar) · [`character-continuity.md`](./character-continuity.md) (tiers, versioning, ship gates) · [`identity.md`](./identity.md) (likeness lock) · [`facial-expressions.md`](./facial-expressions.md) (expression performance rules)

**Technical registries (implementation):** `scripts/psa-avatar-expression-manifest.mjs` · `src/constants/psaConfig.ts` · `src/components/psa/resolvePsaAvatarExpression.ts`

**Not in scope:** Prompts, marketing copy, concept art folders in git, or unauthorized Dropbox links.

---

## Introduction — Purpose of a Production Reference Library

A **production reference library** is the **single authoritative index** of every approved PSA asset: what exists, where it lives, who approved it, what it replaces, and who may use it.

Without a central catalog, studios accumulate:

| Failure mode | Consequence |
| --- | --- |
| **Duplicate “masters”** | Teams match different faces in the same campaign |
| **Unofficial versions** | Slack exports become “the reference” |
| **Outdated plates** | New hires use pre-redesign stills |
| **Orphan assets** | No metadata → wrong channel, wrong tier |
| **AI pipeline drift** | Training sets mix Tier 5 experiments with Tier 1 canon |

**Frontal Slayer rule:** If an asset is **not registered in this library** (or linked child registry such as the expression manifest), it is **not approved for production**.

> **Hierarchy:** **Identity / child bibles** define *spec* → **Turnaround** defines *how to capture* → **Continuity** defines *what may change* → **This library** defines *what is approved and where*.

---

## Library Philosophy

| Principle | Operational meaning |
| --- | --- |
| **One source of truth** | One row per approved asset ID; one current `PUBLISHED` version per role |
| **No unofficial masters** | Personal drives, Figma exports, and model outputs stay **DRAFT** until cataloged |
| **Brand consistency at scale** | Marketing, product, TV, and AI pull from the **same collections** |
| **Future-ready** | Metadata and tags support search, automation, and allowlisted AI workflows |
| **Auditability** | Deprecation and archive preserve **history** without polluting active kits |
| **Separation of concerns** | Markdown catalog in git; **multi-GB masters** in DAM only |

**Relationship to AI:** Golden prompts and generation scripts (`motherboard/golden-prompts/`) **consume** library-registered references—they do not **define** approval.

---

## Library Organization

Scalable DAM hierarchy (vault root: **`psa-reference-vault/`**). Aligns with [`character-turnaround.md`](./character-turnaround.md); **this section is the canonical folder map**.

```
psa-reference-vault/
├── registry/                          # JSON/CSV exports of this catalog (optional automation)
├── v1.0/                              # PSA Character v1.0 active canon
│   ├── 01-hero/
│   ├── 02-portrait/
│   ├── 03-full-body/
│   ├── 04-turnaround/
│   ├── 05-wardrobe/
│   ├── 06-hair/
│   ├── 07-makeup/
│   ├── 08-jewelry/
│   ├── 09-nails/
│   ├── 10-expression/
│   ├── 11-gesture/
│   ├── 12-body-language/
│   ├── 13-movement/                   # Reserved
│   ├── 14-lighting/
│   ├── 15-camera/
│   ├── 16-environment/
│   ├── 17-commercial/
│   ├── 18-tv-lounge/
│   ├── 19-founder/
│   ├── 20-animation/
│   ├── 21-ai-training/                # Allowlisted sets only
│   └── 99-deprecated/                 # In-version deprecations
├── campaigns/                         # Tier 4 — {campaign-id}/
├── historical/                        # Archived major versions (v0.x, retired shoots)
├── experimental/                      # Tier 5 — NON-CANON
└── exports/                           # Published kits (read-only bundles)
```

**Runtime product path (derivatives, not vault):**

```
public/assets/psa-avatar-{slug}.png    # APPROVED expression derivatives — see § Shipped Catalog
```

---

## Asset Categories

Each category: **purpose**, **contents**, **approval**, **users**, **update frequency**, **relationships**, **dependencies**.

### Hero References (`01-hero`)

| Field | Detail |
| --- | --- |
| **Purpose** | Flagship brand-facing hero still(s) |
| **Contents** | `REF-HERO-MASTER-v1` and successors |
| **Approval** | Founder + ECD · Tier 1–2 |
| **Primary users** | Brand, ECD, key art leads |
| **Update frequency** | Rare (years) |
| **Relationships** | Source for downstream crops—not auto-master for ortho |
| **Dependencies** | identity, design-principles, turnaround light/camera |

### Portrait References (`02-portrait`)

| Field | Detail |
| --- | --- |
| **Purpose** | Likeness-critical head-and-shoulders masters |
| **Contents** | `REF-PORTRAIT-CANON`, ortho front |
| **Approval** | ECD + Continuity · Tier 1 |
| **Primary users** | Photo, retouch, AI QC, app |
| **Update frequency** | Rare |
| **Relationships** | Feeds expression masters in `10-expression` |
| **Dependencies** | identity, makeup, facial-expressions |

### Full Body References (`03-full-body`)

| Field | Detail |
| --- | --- |
| **Purpose** | Proportion proof (exception use) |
| **Contents** | `REF-FULLBODY-CANON` |
| **Approval** | ECD · Tier 1 geometry |
| **Primary users** | Styling, 3D (future), events |
| **Update frequency** | Rare |
| **Relationships** | Links to movement (future) |
| **Dependencies** | identity, body-language |

### Turnaround References (`04-turnaround`)

| Field | Detail |
| --- | --- |
| **Purpose** | Orthographic rotation set |
| **Contents** | All `REF-ORTHO-*` IDs ([`character-turnaround.md`](./character-turnaround.md)) |
| **Approval** | ECD + Continuity |
| **Primary users** | Illustration, 3D, AI overlay QC |
| **Update frequency** | Per major character version |
| **Relationships** | Superset of portrait; parent to expression alignment |
| **Dependencies** | turnaround bible, hair, jewelry |

### Wardrobe References (`05-wardrobe`)

| Field | Detail |
| --- | --- |
| **Purpose** | Canon host garment + Tier 3/4 variants |
| **Contents** | `REF-WARDROBE-CANON-HOST`, campaign folders |
| **Approval** | Styling lead + ECD · Tier 2–4 |
| **Primary users** | Photo, TV, events |
| **Update frequency** | Seasonal (Tier 3), per campaign (Tier 4) |
| **Relationships** | Must match jewelry/hair plates |
| **Dependencies** | design-principles, character-continuity tiers |

### Hair References (`06-hair`)

| Field | Detail |
| --- | --- |
| **Purpose** | Hairline, color, texture proof |
| **Contents** | Ortho hair plates, swatches (vault) |
| **Approval** | Hair lead + ECD |
| **Primary users** | Photo, AI QC, animation paint |
| **Update frequency** | Rare unless hair bible version bump |
| **Dependencies** | [`hair.md`](./hair.md) |

### Makeup References (`07-makeup`)

| Field | Detail |
| --- | --- |
| **Purpose** | Face chart alignment |
| **Contents** | Chart stills, lighting tests |
| **Approval** | Makeup lead + ECD |
| **Dependencies** | [`makeup.md`](./makeup.md) |

### Jewelry References (`08-jewelry`)

| Field | Detail |
| --- | --- |
| **Purpose** | Scale, placement, metal read |
| **Contents** | Front/3/4 jewelry proof |
| **Approval** | ECD |
| **Dependencies** | [`jewelry-accessories.md`](./jewelry-accessories.md) |

### Nails References (`09-nails`)

| Field | Detail |
| --- | --- |
| **Purpose** | Hand close-up continuity |
| **Contents** | Gesture companion stills |
| **Approval** | Styling QA |
| **Dependencies** | [`nails.md`](./nails.md), gesture |

### Expression References (`10-expression`)

| Field | Detail |
| --- | --- |
| **Purpose** | Approved face states for product + education |
| **Contents** | Vault masters + **`public/assets/psa-avatar-*.png`** |
| **Approval** | ECD + Character Animation · manifest change |
| **Primary users** | Product eng, animation, chat UI, AI gen QC |
| **Update frequency** | Per slug addition or master refresh |
| **Relationships** | Slugs in facial-expressions; runtime in psaConfig |
| **Dependencies** | facial-expressions, identity, manifest |

### Gesture References (`11-gesture`)

| Field | Detail |
| --- | --- |
| **Purpose** | Hand/arm vocabulary stills or loops |
| **Contents** | Point, present, wave proof |
| **Approval** | Performance direction |
| **Dependencies** | [`gesture.md`](./gesture.md), nails, jewelry |

### Body Language References (`12-body-language`)

| Field | Detail |
| --- | --- |
| **Purpose** | Posture, proximity, pose grammar |
| **Contents** | Stand, sit, lean plates |
| **Dependencies** | [`body-language.md`](./body-language.md) |

### Movement References (`13-movement`)

| Field | Detail |
| --- | --- |
| **Purpose** | Walk, turn, host transit |
| **Contents** | _Reserved_ — video loops |
| **Approval** | Animation / staging |
| **Dependencies** | future movement.md, turnaround walk ref |

### Lighting References (`14-lighting`)

| Field | Detail |
| --- | --- |
| **Purpose** | `REF-LIGHT-STUDIO-MASTER` and derivatives |
| **Contents** | Gray card, face key reference |
| **Approval** | DP + ECD |
| **Dependencies** | turnaround lighting standards |

### Camera References (`15-camera`)

| Field | Detail |
| --- | --- |
| **Purpose** | Lens, framing, safe zones |
| **Contents** | Overlay templates (FAB, 16:9) |
| **Dependencies** | turnaround camera |

### Environment References (`16-environment`)

| Field | Detail |
| --- | --- |
| **Purpose** | Mansion room context (PSA in frame) |
| **Contents** | Reception, Lab, Lounge, etc. |
| **Approval** | Showrunner + ECD · Tier 4 |
| **Dependencies** | storytelling-philosophy, character-continuity environmental |

### Commercial References (`17-commercial`)

| Field | Detail |
| --- | --- |
| **Purpose** | Spot-specific stills/video — Tier 4 |
| **Contents** | Per spot ID under `campaigns/` |
| **Approval** | Brand Ops + continuity |

### TV Lounge References (`18-tv-lounge`)

| Field | Detail |
| --- | --- |
| **Purpose** | Host master — **`REF-POSE-TV-HOST`** |
| **Contents** | 16:9 masters, title-safe overlays |
| **Approval** | Showrunner + ECD |

### Founder References (`19-founder`)

| Field | Detail |
| --- | --- |
| **Purpose** | Founder Suite / authority beats |
| **Contents** | `REF-POSE-FOUNDER` |
| **Approval** | Founder + ECD |

### Animation References (`20-animation`)

| Field | Detail |
| --- | --- |
| **Purpose** | Ortho packs, line-ups, rig snapshots |
| **Contents** | `REF-ANIM-ORTHO-PACK` (reserved) |
| **Approval** | Character Animation |

### AI Training References (`21-ai-training`)

| Field | Detail |
| --- | --- |
| **Purpose** | **Allowlisted** image sets for fine-tune / adapter / QC—not prompt text |
| **Contents** | Curated exports from Tier 1–2 only |
| **Approval** | Founder + ECD + AI governance (future) |
| **Rule** | **Exclude** Tier 5 experimental; document `usage_rights` |

### Historical Archives (`historical/`)

| Field | Detail |
| --- | --- |
| **Purpose** | Prior PSA Character versions (e.g. pre–v2.0) |
| **Approval** | Read-only retrieval; not for new production |

### Deprecated Assets (`99-deprecated/`)

| Field | Detail |
| --- | --- |
| **Purpose** | Superseded within current character version |
| **Rule** | Status `DEPRECATED`; must list `supersedes` / replaced-by |

### Experimental Concepts (`experimental/`)

| Field | Detail |
| --- | --- |
| **Purpose** | Tier 5 lab |
| **Rule** | **NON-CANON** watermark; never in published kits |

---

## Shipped Catalog — Expression Derivatives (Product)

**Authoritative slug list:** `PSA_AVATAR_EXPRESSION_MANIFEST` in `scripts/psa-avatar-expression-manifest.mjs`.

| Asset ID | Slug | Runtime path | Catalog status | Bible |
| --- | --- | --- | --- | --- |
| `PSA-AST-EXPR-neutral` | `neutral` | `public/assets/psa-avatar-neutral.png` | **PUBLISHED** | facial-expressions |
| `PSA-AST-EXPR-neutral-smiling` | `neutral-smiling` | `public/assets/psa-avatar-neutral-smiling.png` | **PUBLISHED** | facial-expressions |
| `PSA-AST-EXPR-waving` | `waving` | `public/assets/psa-avatar-waving.png` | **PUBLISHED** | facial-expressions |
| `PSA-AST-EXPR-listening` | `listening` | `public/assets/psa-avatar-listening.png` | **PUBLISHED** | facial-expressions |
| `PSA-AST-EXPR-thinking` | `thinking` | `public/assets/psa-avatar-thinking.png` | **PUBLISHED** | facial-expressions |
| `PSA-AST-EXPR-thinking-smiling` | `thinking-smiling` | `public/assets/psa-avatar-thinking-smiling.png` | **PUBLISHED** | facial-expressions |
| _…_ | _see manifest_ | `psa-avatar-{slug}.png` | **PUBLISHED** | _per slug_ |

**Cache bust:** `PSA_AVATAR_ASSET_VERSION` in `src/constants/psaConfig.ts` — update when **any** published PNG in set changes.

**Vault row:** Each slug should also register a **master** plate in `v1.0/10-expression/` when photography source exists (`master_vault_path` metadata).

---

## Asset Metadata Standards

**Required fields** for every catalog row (DAM + registry export):

| Field | Required | Description |
| --- | --- | --- |
| **Asset ID** | Yes | Stable ID e.g. `PSA-AST-EXPR-neutral`, `REF-ORTHO-34-L` |
| **Asset Name** | Yes | Human title |
| **Version Number** | Yes | Semantic `v1.0.0` + `psa_character_version` |
| **Creation Date** | Yes | ISO 8601 |
| **Approval Date** | If published | ISO 8601 |
| **Status** | Yes | Lifecycle enum (below) |
| **Department** | Yes | Owner team |
| **Creator** | Yes | Individual or vendor |
| **Software Used** | If digital | Capture/gen/edit tools |
| **Resolution** | Yes | WxH or long edge |
| **Aspect Ratio** | Yes | e.g. 1:1, 16:9 |
| **Color Space** | Yes | sRGB, ACEScg, etc. |
| **Usage Rights** | Yes | Internal / campaign / training allowlist |
| **Approved Platforms** | Yes | web, app, TV, social, AI-train, etc. |
| **Tags** | Yes | Search taxonomy (below) |
| **Keywords** | Recommended | Synonyms for search |
| **Related Assets** | Recommended | `supersedes`, `companion`, `derived_from` |
| **Revision Notes** | If version >1 | Change summary |
| **continuity_tier** | Yes | 1–5 ([`character-continuity.md`](./character-continuity.md)) |
| **ref_id** | If turnaround | Turnaround REF ID |
| **linked_bibles** | Yes | Which specs govern QA |
| **master_vault_path** | If binary | DAM path |
| **public_derivative_path** | If any | e.g. `public/assets/...` |

---

## Naming Convention

**Canonical grammar:** [`character-turnaround.md`](./character-turnaround.md) § Asset Naming Convention.

**Library Asset ID grammar (catalog):**

```
PSA-AST-{CATEGORY}-{descriptor}[-{variant}]
```

| CATEGORY | Use |
| --- | --- |
| `HERO`, `PORT`, `BODY`, `ORTHO`, `WARD`, `HAIR`, `MU`, `JWL`, `NAIL`, `EXPR`, `GEST`, `POSE`, `LIGHT`, `CAM`, `ENV`, `TV`, `FOUND`, `ANIM`, `AI`, `MKT`, `ARCH` | Maps to folder prefixes |

### Filename examples (vault)

| Type | Example filename |
| --- | --- |
| Portrait | `psa-ref-port-front_canon_v1.0.0_APPROVED.exr` |
| Commercial still | `psa-ref-mkt-spot-2026Q3-launch_34l_v1.0.0_APPROVED.jpg` |
| Full body | `psa-ref-body-front_canon_v1.0.0_APPROVED.jpg` |
| Expression master | `psa-ref-expr-listening_front_canon_v1.0.0_APPROVED.png` |
| Expression runtime | `psa-avatar-listening.png` (in repo) |
| Hair | `psa-ref-hair-profile-l_canon_v1.0.0_APPROVED.jpg` |
| Wardrobe | `psa-ref-ward-host-front_canon_v1.0.0_APPROVED.jpg` |
| Animation | `psa-ref-anim-ortho-pack_v1.0.0_REVIEW.zip` |
| Lighting | `psa-ref-light-studio-master_v1.0.0_APPROVED.dng` |
| Photography | `psa-ref-port-34l_canon_v1.0.0_APPROVED.cr3` |
| Marketing export | `psa-export-mkt-kit-v1.0.0.zip` |
| AI training set | `psa-ai-train-tier1-v1.0.0-ALLOWLIST.zip` |
| Archive | `psa-arch-v0.9-hero_DEPRECATED.zip` |

---

## Asset Lifecycle

```
DRAFT → INTERNAL_REVIEW → CREATIVE_APPROVAL → PRODUCTION_APPROVAL → PUBLISHED
                                                              ↓
                    RETIRED ← ARCHIVED ← DEPRECATED ← (superseded)
```

| Stage | Meaning | Responsible | Gate |
| --- | --- | --- | --- |
| **Draft** | Work in progress; not for production | Creator | — |
| **Internal Review** | Peer + continuity pre-QA | Department lead | Metadata complete |
| **Creative Approval** | ECD / art director sign-off | ECD delegate | Tier-appropriate bible QA |
| **Production Approval** | Ready for kits + pipelines | Brand Ops + Continuity | character-continuity gates |
| **Published** | Active canon; appears in kits | DAM admin | Registry row + DAM path |
| **Deprecated** | Superseded; do not use for new work | DAM admin | `supersedes` link required |
| **Archived** | Historical; retrieval only | Brand Ops | Move to `historical/` |
| **Retired** | Legal/version sunset | Founder + ECD | Document reason |

**Rule:** Only **`PUBLISHED`** assets enter **Reference Collections** (kits).

---

## Search Standards — Tagging Taxonomy

Tags are **lowercase, hyphenated**, multi-value.

| Dimension | Example tags |
| --- | --- |
| **Pose** | `pose-stand`, `pose-sit`, `pose-walk`, `pose-teach`, `pose-host` |
| **Outfit** | `wardrobe-host`, `wardrobe-event`, `campaign-{id}` |
| **Emotion** | `emotion-calm`, `emotion-celebrate`, `emotion-concern` |
| **Expression** | `expr-neutral`, `expr-listening`, slug mirror |
| **Environment** | `env-reception`, `env-lab`, `env-lounge`, `env-neutral` |
| **Camera angle** | `angle-front`, `angle-34l`, `angle-profile-r`, `angle-rear` |
| **Lighting** | `light-studio-master`, `light-marble-bounce` |
| **Campaign** | `campaign-none`, `campaign-{code}` |
| **Department** | `dept-product`, `dept-brand`, `dept-animation` |
| **Media type** | `type-png`, `type-video`, `type-3d`, `type-template` |
| **Version** | `char-v1.0`, `asset-v1.0.0` |
| **Season** | `season-core`, `season-holiday-tier4` |
| **Purpose** | `purpose-fab`, `purpose-tv-safe`, `purpose-ai-qc`, `purpose-training` |

**Search rule:** Product engineers may filter **`status:published`** + **`purpose-fab`** for avatar picks.

---

## Reference Collections (Curated Kits)

Read-only **exports** under `psa-reference-vault/exports/` — manifests list Asset IDs.

| Collection | Purpose | Typical contents |
| --- | --- | --- |
| **Master Production Kit** | Full Tier 1–2 ortho + expression masters + light | All `REF-ORTHO-*`, `REF-LIGHT-*`, expression vault masters |
| **Marketing Kit** | Brand-cleared stills Tier 3–4 | Hero + approved campaign stills |
| **Animation Kit** | Slugs + ortho + gesture | `10-expression`, `11-gesture`, `20-animation` |
| **Photography Kit** | Capture match targets | `14-lighting`, `15-camera`, portrait/turnaround |
| **AI Training Kit** | Allowlisted Tier 1 only | `21-ai-training` export — **explicit approval** |
| **Commercial Kit** | Per active campaign | `campaigns/{id}/` |
| **TV Lounge Kit** | Host masters | `18-tv-lounge`, TV overlays |
| **Social Media Kit** | Cropped derivatives | Published PNG/JPG with safe zones |
| **Developer Kit** | Runtime + manifest | `public/assets/psa-avatar-*.png`, manifest hash, psaConfig version |
| **Future XR Kit** | _Reserved_ | Scale references, volumetric |

**Developer Kit note:** Git tracks **derivatives**; Developer Kit manifest JSON should list **Asset ID → path → hash**.

---

## Archive Policy

| Rule | Detail |
| --- | --- |
| **Preserve history** | Never hard-delete Tier 1 masters; archive with metadata |
| **Active production uses PUBLISHED only** | Deprecated assets blocked in kit builds |
| **Retrieval** | Request via Brand Ops + reason; log access for Tier 1 |
| **Deprecation workflow** | New asset `PUBLISHED` → old asset `DEPRECATED` same day |
| **Major version** | Move prior version tree to `historical/psa-v{x}/` |
| **Experimental** | Never promoted without full Tier 1 workflow |

**Outdated reference error:** Using `DEPRECATED` or `historical/` in new work = **continuity failure** ([`character-continuity.md`](./character-continuity.md)).

---

## Production Workflow

| Step | Action | Owner | Output |
| --- | --- | --- | --- |
| **1 Create** | Brief with tier, ref_id, category | Requester | Draft asset |
| **2 Review** | Visual + metadata QA | Continuity | Pass/fail |
| **3 Approve** | Creative + production gates | ECD / Brand Ops | Status bump |
| **4 Catalog** | Register row in library + DAM path | DAM admin | Asset ID |
| **5 Distribute** | Publish to kits / CDN / repo | Eng / Brand Ops | PUBLISHED |
| **6 Update** | New version; link `supersedes` | Same pipeline | v1.0.1+ |
| **7 Replace** | Deprecate old; update derivatives | DAM + Eng | Manifest/config bump |
| **8 Archive** | Move to historical | Brand Ops | ARCHIVED |
| **9 Retire** | Legal/sunset | Founder + ECD | RETIRED |

**AI-generated assets:** Stay **DRAFT** until human QC passes turnaround overlay + continuity gates.

---

## Quality Assurance

### Catalog integrity

| # | Check |
| --- | --- |
| 1 | Asset ID unique |
| 2 | Metadata complete (required fields) |
| 3 | Status matches DAM location |
| 4 | Version matches `psa_character_version` policy |
| 5 | Naming follows turnaround grammar |
| 6 | `continuity_tier` correct |
| 7 | `linked_bibles` populated |
| 8 | Related assets (`supersedes` / `derived_from`) accurate |
| 9 | No duplicate PUBLISHED rows for same role |
| 10 | Deprecated assets absent from active kits |
| 11 | Public derivatives match vault master or approved gen pipeline |
| 12 | Expression slugs match manifest + psaConfig |
| 13 | Tier 5 not in production kits |
| 14 | Usage rights ≥ intended platform |
| 15 | Kit manifest hash matches files |

### Pre-publish gate (summary)

Align with [`character-continuity.md`](./character-continuity.md) Gates A–F + [`character-turnaround.md`](./character-turnaround.md) visual QA + [`character-qa-checklist.md`](./character-qa-checklist.md) master form.

---

## Registry Maintenance

| Event | Update |
| --- | --- |
| New expression slug | Manifest + psaConfig + **new catalog row** + facial-expressions bible |
| PNG replace | Bump `PSA_AVATAR_ASSET_VERSION` + catalog revision note |
| New ortho shoot | Turnaround REF IDs + vault paths + kit refresh |
| Campaign end | Deprecate campaign assets; keep in `campaigns/` archive |

**Owner:** DAM admin **weekly** audit — orphaned files, duplicate PUBLISHED, stale Developer Kit hash.

---

## Future Expansion

| Section | Status |
| --- | --- |
| **3D References** | _Category `22-3d/` — mesh, UV, scale_ |
| **Motion Capture** | _Linked to movement bible_ |
| **Volumetric Capture** | _XR stage assets_ |
| **AI Model Training** | _Governance doc + allowlist automation_ |
| **Robotics / embodied** | _Physical scale sheet_ |
| **XR Experiences** | _Future XR Kit expansion_ |
| **Automated registry JSON** | _Export from DAM to `registry/`_ |
| **Revision log** | See Version History |

### Related documents

| Document | Role |
| --- | --- |
| [`character-turnaround.md`](./character-turnaround.md) | REF IDs, capture standards, naming |
| [`character-continuity.md`](./character-continuity.md) | Tiers, versioning, ship |
| [`facial-expressions.md`](./facial-expressions.md) | Slug performance rules |
| [`../MASTER_ROADMAP.md`](../MASTER_ROADMAP.md) | Planned `continuity-registry.md` — may mirror production IDs |

---

## Version History

| Version | Date | Summary | Approver |
| --- | --- | --- | --- |
| **1.0** | 2026-07-22 | Initial Reference Library — DAM hierarchy, categories, metadata, lifecycle, kits, QA | Frontal Slayer Creative |

---

*End of PSA Character Reference Library v1.0*
