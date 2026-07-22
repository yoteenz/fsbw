# PSA Character Turnaround Bible

**Document:** PSA Character Turnaround Bible  
**Version:** 1.0  
**Status:** Canonical — master visual reference system  
**Owner:** Frontal Slayer Creative / Character Art Direction  
**Classification:** Internal — defines **how PSA appears from every angle and production condition**  
**Companion locks:** [`identity.md`](./identity.md) (likeness) · [`hair.md`](./hair.md) · [`makeup.md`](./makeup.md) · [`nails.md`](./nails.md) · [`jewelry-accessories.md`](./jewelry-accessories.md) · [`design-principles.md`](./design-principles.md)  
**Continuity & ship:** [`character-continuity.md`](./character-continuity.md) (tiers, versioning, gates) · [`facial-expressions.md`](./facial-expressions.md) (expression slugs)  
**Performance poses:** [`body-language.md`](./body-language.md) · [`gesture.md`](./gesture.md) · [`acting.md`](./acting.md)

**Runtime expression assets (partial turnaround subset):** `public/assets/psa-avatar-{slug}.png` · `src/constants/psaConfig.ts` · `scripts/psa-avatar-expression-manifest.mjs`

**Not in scope:** Prompts, concept art briefs, generative model sheets, marketing key art copy, or consumer-facing lookbooks.

---

## Introduction — Purpose of a Turnaround Bible

A **professional turnaround** is the **orthographic truth set** for a recurring character: the same woman from **every required angle**, under **documented light and camera**, in **approved poses**, with **stable proportions** and **stable grooming layers**. It is how studios prevent “correct face, wrong everything else.”

For PSA, the turnaround system serves three production laws:

1. **Recognition at any scale** — FAB (88px), 16:9 host, full-body rare, print.  
2. **Vendor alignment** — photographers, illustrators, 3D, and AI pipelines **match one handbook**, not individual taste.  
3. **Long-horizon asset equity** — reference sets **version**, archive, and replace through [`character-continuity.md`](./character-continuity.md)—not silent drift.

**Relationship to other bibles:** [`identity.md`](./identity.md) locks **what** PSA is. **This document** defines **how to photograph, frame, light, name, store, and approve** the **reference plates** that prove compliance. Child bibles (hair, makeup, jewelry) define **layer specs**; turnaround defines **angle-by-angle verification**.

**Secure vault:** Master **hero photography, orthographic sheets, and measured overlays** live in the **PSA Master Reference Vault** (secure DAM — URL reserved in identity Future Expansion). This markdown bible is the **index, standards, and workflow**; binary masters are **not** stored in git.

---

## Turnaround Philosophy

| Principle | Production meaning |
| --- | --- |
| **Visual consistency = trust** | Members assume the same expert; broken angles read as fake or cheap |
| **Every angle must match** | Profile nose must be the same woman as front portrait—no “good front only” assets |
| **Silhouette is icon** | Hair + shoulders + posture readable in outline before detail |
| **Standardized light & perspective** | Compare shots across years; avoid one-off “creative” reference that cannot be reused |
| **Neutrality for reference** | Reference plates prioritize **measurement and match**; campaign grade is **derived**, not canonical |
| **Intentional evolution** | New master set = **version bump**, not overwrite without archive |

**Anti-pattern:** Using a single flattering still as “the reference” with no profile, no rear hair, no jewelry scale check.

---

## Master Character Specifications

Document **conceptually**—numeric ranges appear only where [`identity.md`](./identity.md) already locks them. Turnaround photography **must match reference subject**, not idealized redesign.

### Overall height & presence

| Concept | Turnaround requirement |
| --- | --- |
| **On-camera height read** | Full-body plates use **5′7″–5′9″ equivalent** proportions ([`identity.md`](./identity.md)) |
| **Default production** | **Bust and 3/4** dominate; full-body **exception**, not default |
| **Presence** | Host-ready; fit-natural physique |

### Proportions (conceptual)

| Region | Canonical read | Turnaround check |
| --- | --- | --- |
| **Head** | Adult proportion; natural asymmetry preserved | Head width vs shoulders in front plate |
| **Neck** | Slender-natural; proportional to head | Profile neck length vs jaw |
| **Shoulders** | Relaxed width; not runway-extreme | Front silhouette line |
| **Torso** | Natural waist-to-shoulder ratio | 3/4 depth; no AI hourglass |
| **Legs** | Balanced adult (when full-body) | Walking plate knee alignment |
| **Hands** | Stylist hands; five fingers | Teaching / presentation plates |
| **Feet** | Luxury neutral footwear when visible | Event / full-body only |

### Balance, center of gravity, posture

| Concept | Standard |
| --- | --- |
| **Center of gravity** | Mid-foot standing; seated **stable**, not slouch |
| **Balance** | Weight even or subtle contrapposto—never twisted distortion |
| **Luxury posture** | Lifted sternum, relaxed shoulders ([`identity.md`](./identity.md), [`body-language.md`](./body-language.md)) |
| **Chin** | Neutral to slightly elevated in confident poses |

**Turnaround plate rule:** Reference poses use **identity-approved posture**, not fashion exaggeration.

---

## Canonical Reference Angles

Each row: **purpose**, **framing**, **expression default**, **continuity tier** ([`character-continuity.md`](./character-continuity.md)).

### Orthographic & rotation set

```
                    FRONT
                      │
         3/4 L ───────┼─────── 3/4 R
                      │
              PROFILE L    PROFILE R
                      │
         REAR 3/4 L ──┼── REAR 3/4 R
                      │
                    REAR
```

| Reference ID | Angle / pose | Framing | Primary use | Default expression |
| --- | --- | --- | --- | --- |
| **REF-ORTHO-FRONT-PORTRAIT** | Front, eye level | Head & shoulders | Likeness lock, FAB source | `neutral-smiling` |
| **REF-ORTHO-FRONT-FULL** | Front | Full body (rare) | Height/proportion proof | `neutral-smiling` |
| **REF-ORTHO-34-L** | Three-quarter left | Bust / 3/4 | Host, primary app angle | `neutral-smiling` |
| **REF-ORTHO-34-R** | Three-quarter right | Bust / 3/4 | Mirror coverage | `neutral-smiling` |
| **REF-ORTHO-PROFILE-L** | Left profile | Head & shoulders | Nose, jaw, brow projection | `neutral` |
| **REF-ORTHO-PROFILE-R** | Right profile | Head & shoulders | Asymmetry check | `neutral` |
| **REF-ORTHO-REAR** | Rear | Bust / upper back | Hair rear, wardrobe back | `neutral` (no face) |
| **REF-ORTHO-REAR-34** | Rear three-quarter | Bust | Hair volume rear oblique | `neutral` |

### Locomotion & posture

| Reference ID | Pose | Framing | Primary use | Performance ref |
| --- | --- | --- | --- | --- |
| **REF-POSE-STAND-NEUTRAL** | Standing relaxed | 3/4 bust default | Idle host | body-language |
| **REF-POSE-STAND-WALK** | Mid-walk | 3/4 or full | Movement continuity | body-language, future movement |
| **REF-POSE-SIT** | Seated consult | 3/4 | Tutorials, lounge | body-language |

### Role poses (production)

| Reference ID | Pose | Framing | Primary use | Performance ref |
| --- | --- | --- | --- | --- |
| **REF-POSE-TEACH** | Explain toward content | Bust + hands | Tutorials, Lab | gesture `pointing` / `presenting` |
| **REF-POSE-HOSPITALITY** | Open welcome | Bust | Reception, greet | gesture `waving` |
| **REF-POSE-PRESENT** | Present offer | Bust | Showroom, picks | gesture `presenting` |
| **REF-POSE-RELAX-NEUTRAL** | Calm idle | Bust | Chat idle, FAB | `neutral-smiling` |
| **REF-POSE-TOUCH-UI** | Light device / screen gesture | Bust + hands | App, interactive | gesture device rules |
| **REF-POSE-GREET-LUX** | Luxury greeting | Bust | Events, lobby | hospitality scenario |
| **REF-POSE-TV-HOST** | 16:9 host | Medium bust | Lounge TV | acting host cadence |
| **REF-POSE-FOUNDER** | Gravitas present | Bust | Founder Suite | dialogue + voice gravitas |
| **REF-POSE-EVENT** | Tier 4 wardrobe | 3/4 bust / selective full | Luxury events | character-continuity Tier 4 |

**Rule:** Role poses **do not** change Tier 1 likeness—only **pose, wardrobe tier, and expression slug**.

---

## Facial Turnaround

Facial orthographic set **in addition to** expression slug PNGs (`psa-avatar-*.png`).

| Plate | Content | Standards |
| --- | --- | --- |
| **Face front** | Neutral geometry | Eye spacing per identity; no liquify |
| **Face 3/4 L/R** | Cheek + nose bridge | Same nose width as front |
| **Face profile L/R** | Nose tip, lip projection | No surgical narrowing |
| **Smile reference** | Open smile natural teeth | [`facial-expressions.md`](./facial-expressions.md) intensity 2–3 |
| **Neutral reference** | Closed mouth rest | Chat idle |
| **Listening reference** | Soft eyes, micro tilt optional | Slug `listening` |
| **Teaching reference** | Steady gaze | Slug `talking` / teaching read |
| **Professional reference** | Composed, minimal smile | Concierge seriousness |

### Alignment & balance

| Check | Standard |
| --- | --- |
| **Eye alignment** | Horizontal inter-pupillary line level in front plate |
| **Eyebrow position** | Groomed arch per [`makeup.md`](./makeup.md); symmetric intent, natural asymmetry OK |
| **Facial balance** | No forced mirror symmetry in retouch |
| **Expression neutrality** | Reference ortho uses **minimal** muscle; performance slugs add delta **only** on expression plates |

**FAB crop safe zone:** Draw **88px and 256px circles** on master portrait—eyes and brow must remain readable.

---

## Hair Turnaround

Per [`hair.md`](./hair.md)—turnaround **proves** hair bible compliance from every angle.

| View | Document |
| --- | --- |
| **Front hairline** | Lace/part transition; density |
| **3/4 volume** | Signature wave; part side |
| **Profile** | Length endpoint; forehead hairline |
| **Rear** | Length, layer stack, no wig gap |
| **Rear 3/4** | Volume silhouette |
| **Resting state** | Settled blowout, not windstorm |
| **Walking** | Weighted movement; controlled flyaways |
| **Turning** | Continuity of part during 180° |
| **Wardrobe interaction** | Collar clears hair; no clip errors |
| **Lighting interaction** | Dimension preserved; no flat brown blob |

**Motion reference (video loops):** Reserved — `REF-VID-HAIR-WALK`, `REF-VID-HAIR-TURN` in vault.

---

## Wardrobe Turnaround

Wardrobe philosophy: [`design-principles.md`](./design-principles.md). **Measured wardrobe families** — future `wardrobe-standards.md` (MASTER_ROADMAP).

| View | Document |
| --- | --- |
| **Front / back / sides / 3/4** | Same garment continuity in multi-cut scenes |
| **Fabric behavior** | Luxury drape; no stiff costume |
| **Wrinkles** | Editorial press; natural sit lines at elbow |
| **Tailoring** | Quiet luxury fit; teaching-readable sleeves |
| **Buttons / sleeves** | Consistent placement shot-to-shot |
| **Shoes** | Neutral luxury when feet visible |
| **Accessories (non-jewelry)** | Props per scenario—Tier 4 approval |
| **Seasonal references** | Tier 3 palette within principles |

**Turnaround plate:** One **canonical host outfit** (Tier 2) documented as **REF-WARDROBE-CANON-HOST** front/back/34.

---

## Jewelry Turnaround

Per [`jewelry-accessories.md`](./jewelry-accessories.md)—**scale and placement** must read at thumbnail.

| Piece | Turnaround views |
| --- | --- |
| **Stud earrings** | Front + 3/4 scale vs ear |
| **Necklace / chain stack** | Front, 3/4, seated lean |
| **Bracelets** | Presenting gesture hands |
| **Rings** | Pointing gesture close-up |
| **Watch** | If approved on list—rare |
| **Material** | Warm gold family consistent |
| **Lighting** | Specular **controlled**—not disco |

**Inter-cut rule:** Jewelry **must match** ortho plate set within same production ID.

---

## Lighting Standards

Reference lighting **standardizes comparison**; campaign lighting **derives** from these roles.

### Core roles

| Light | Role | PSA reference intent |
| --- | --- | --- |
| **Key** | Primary shape on face | Soft editorial beauty; 30–45° horizontal typical |
| **Fill** | Shadow lift | Preserve skin dimension—no gray flat |
| **Rim / kicker** | Hair and shoulder separation | Subtle; marble-world friendly |
| **Ambient** | Room bounce | Warm neutral; champagne family |

### Color temperature

| Context | Temperature philosophy |
| --- | --- |
| **Studio reference** | **Locked profile** documented in vault (`REF-LIGHT-STUDIO-MASTER`) |
| **Commercial / photo** | Match studio profile ± approved grade |
| **Website / app** | Consistent with avatar PNG master |
| **Animation** | Paint keys aligned to reference stills |
| **Interactive AI** | UI glow **additive**—face detail preserved ([`identity.md`](./identity.md)) |
| **Future XR** | Inherit studio key direction before ship |

**Consistency requirement:** Same woman under reference key = same melanin read—no orange or ash drift.

---

## Camera Standards

| Parameter | Reference standard | Notes |
| --- | --- | --- |
| **Lens (portrait)** | **85–105mm equivalent** personality; **50mm** max for environmental host | Avoid wide distortion on nose |
| **Lens (full-body rare)** | **70–85mm** | Reduce limb stretch |
| **Perspective** | Eye-level default | Confident modes: micro chin up, not camera down |
| **Portrait framing** | Head room **minimal**; eyes upper third | FAB crop |
| **Full-body framing** | Toes optional; posture priority | Rare |
| **Distance** | Consistent for ortho set—document stand-off | Enables overlay |
| **Depth of field** | Eyes sharp; hair sharp enough for lace check | Not heavy blur reference |
| **Composition** | Face primary; negative space luxury | No clutter |
| **Background** | **Neutral**: ivory, soft gray, marble blur | Not storyline background in ortho set |

**16:9 TV host:** Safe title + caption zones documented on **REF-POSE-TV-HOST** overlay template.

---

## Approved Reference Library

Structured catalog—**vault asset IDs** register here when photography exists. Status: **PLANNED vault** unless noted.

| Library role | Asset ID | Status | Primary angle / slug |
| --- | --- | --- | --- |
| **Master Hero Image** | `REF-HERO-MASTER-v1` | _Vault reserved_ | Best 3/4 host |
| **Canonical Portrait** | `REF-PORTRAIT-CANON` | _Partial — expression PNGs_ | Front `neutral-smiling` |
| **Canonical Full Body** | `REF-FULLBODY-CANON` | _Vault reserved_ | Front full |
| **Official Greeting** | `REF-POSE-HOSPITALITY` | _Vault reserved_ | `waving` |
| **Official Teaching** | `REF-POSE-TEACH` | _Vault reserved_ | `talking` / present |
| **Official Hospitality** | `REF-POSE-GREET-LUX` | _Vault reserved_ | Open welcome |
| **Official TV Lounge** | `REF-POSE-TV-HOST` | _Vault reserved_ | 16:9 host |
| **Official Founder** | `REF-POSE-FOUNDER` | _Vault reserved_ | Gravitas |
| **Official Promotional** | `REF-PROMO-TIER4-*` | _Per campaign_ | Tier 4 only |
| **Official Neutral** | `REF-ORTHO-FRONT-PORTRAIT` | _Vault + `psa-avatar-neutral*` | Neutral set |
| **Official Animation** | `REF-ANIM-ORTHO-PACK` | _Vault reserved_ | Ortho + line-up |
| **Official Lighting** | `REF-LIGHT-STUDIO-MASTER` | _Vault reserved_ | Gray card + face |

**Expression PNGs (shipped):** `public/assets/psa-avatar-{slug}.png` — **2D performance turnaround subset**; not a substitute for full orthographic photography.

---

## Asset Naming Convention

### File name pattern

```
psa-{class}-{subject}-{angle-or-slug}_{variant}_v{major}.{minor}.{patch}_{status}.{ext}
```

| Token | Values |
| --- | --- |
| **class** | `ref` (reference plate), `avatar` (runtime FAB), `expr` (expression variant), `vid`, `3d` |
| **subject** | `ortho`, `pose`, `hair`, `face`, `wardrobe`, `light`, `hero` |
| **angle-or-slug** | `front`, `34l`, `profile-r`, or manifest slug e.g. `listening` |
| **variant** | `canon`, `host`, `event`, optional campaign code |
| **version** | Semantic `v1.0.0` — align with **PSA Character v1.x** ([`character-continuity.md`](./character-continuity.md)) |
| **status** | `APPROVED`, `REVIEW`, `DEPRECATED`, `ARCHIVE` |
| **ext** | `png`, `exr`, `jpg`, `mp4`, `glb`, etc. |

**Runtime avatar (canonical today):**

```
public/assets/psa-avatar-{slug}.png
```

Cache bust: `PSA_AVATAR_ASSET_VERSION` in `src/constants/psaConfig.ts` — **technical**, not character version.

### Resolution standards

| Asset type | Min resolution | Color |
| --- | --- | --- |
| **Orthographic portrait** | 4096 px long edge | sRGB or documented ACES workflow |
| **Expression PNG** | Per manifest; FAB-legible at 256 | sRGB, alpha |
| **Full-body reference** | 4096+ height | sRGB |
| **Video loop** | 1080p min; 4K preferred | Rec.709 or agreed |

### Metadata (required)

| Field | Example |
| --- | --- |
| `psa_character_version` | `1.0` |
| `continuity_tier` | `1`–`5` |
| `ref_id` | `REF-ORTHO-34-L` |
| `approver` | ECD / Founder |
| `approval_date` | ISO date |
| `supersedes` | prior asset ID |
| `linked_bibles` | identity, hair, makeup, … |

### Folder hierarchy (DAM)

```
psa-reference-vault/
├── v1.0/
│   ├── orthographic/
│   ├── poses/
│   ├── expressions/          # masters (source of psa-avatar exports)
│   ├── hair/
│   ├── wardrobe/
│   ├── jewelry/
│   ├── lighting/
│   └── deprecated/
├── campaigns/                # Tier 4 — subfolders per campaign ID
└── experimental/             # Tier 5 — NON-CANON
```

**Git repo:** Only **manifests, hashes, and this bible**—not multi-GB masters.

### Archive procedures

| Action | Rule |
| --- | --- |
| **Replace** | New version; mark old `DEPRECATED`; keep in `deprecated/` |
| **Retire slug** | Manifest + facial-expressions + bump avatar version |
| **Never delete** | Founder/legal likeness history |

---

## Production Workflow

```
Brief (ref_id + tier) → Capture or generate →
  Match ortho lighting/camera →
    Continuity + identity QA →
      ECD / Founder (Tier 1–2) →
        Register in vault + metadata →
          Export derivatives (avatar PNG, thumbnails) →
            Update manifest / psaConfig if runtime →
              Publish to pipeline
```

| Stage | Owner | Output |
| --- | --- | --- |
| **Request** | Production | Ref ID, tier, linked scenario |
| **Create** | Photo / illustration / 3D | Raw plates |
| **Review** | Continuity supervisor | Gates A–B ([`character-continuity.md`](./character-continuity.md)) |
| **Approve** | ECD; Founder if Tier 1 | `APPROVED` metadata |
| **Distribute** | Brand Ops / Eng | Manifest, CDN paths |
| **Replace** | Same workflow + `supersedes` link |

**AI-generated references:** **Mandatory** human QC against ortho overlays—AI does not auto-promote to `APPROVED`.

---

## Quality Assurance

### Visual match checklist

| # | Check | Authority |
| --- | --- | --- |
| 1 | Proportions match identity reference | identity |
| 2 | Hair ortho views match hair bible | hair |
| 3 | Makeup matches makeup bible | makeup |
| 4 | Nails/hands match nails + identity | nails, identity |
| 5 | Jewelry scale/placement | jewelry-accessories |
| 6 | Wardrobe tier + design principles | design-principles, continuity |
| 7 | Lighting matches REF-LIGHT profile | this doc |
| 8 | Camera/lens in band | this doc |
| 9 | Expression = approved slug or ortho neutral | facial-expressions |
| 10 | Pose matches body-language / gesture | body-language, gesture |
| 11 | Materials read real | design-principles |
| 12 | Continuity tier tagged | character-continuity |
| 13 | Metadata complete | this doc |
| 14 | Version registered | character-continuity |
| 15 | FAB / 16:9 safe zones tested | this doc |

**Fail any Tier 1 item → hard stop.**

### Overlay QA (recommended)

Side-by-side **REF-ORTHO-FRONT-PORTRAIT** opacity overlay on candidate still—reject if geometry drifts.

---

## Future Expansion

| Section | Status |
| --- | --- |
| **3D model sheets** | _Reserved — topology + scale ortho_ |
| **Motion reference sheets** | _Reserved — walk, turn, sit loops_ |
| **Facial rig references** | _Reserved — blend shapes ↔ slugs_ |
| **Animation rig references** | _Reserved — bone naming convention_ |
| **Photogrammetry** | _Reserved — scan vs sculpt policy_ |
| **Digital doubles** | _Reserved — film/legal_ |
| **Volumetric capture** | _Reserved — XR stage_ |
| **XR reference pack** | _Reserved — scale + gaze_ |
| **Secure vault URL** | _Register in identity Future Expansion_ |
| **Revision log** | See Version History |

### Related documents

| Document | Role |
| --- | --- |
| [`identity.md`](./identity.md) | Likeness lock |
| [`character-continuity.md`](./character-continuity.md) | Tiers, versioning, ship |
| [`facial-expressions.md`](./facial-expressions.md) | Slug performance |
| [`../visual-language/visual-language.md`](../visual-language/visual-language.md) | Brand-world light/material |

---

## Version History

| Version | Date | Summary | Approver |
| --- | --- | --- | --- |
| **1.0** | 2026-07-22 | Initial Turnaround Bible — angles, poses, naming, workflow, QA | Frontal Slayer Creative |

---

*End of PSA Character Turnaround Bible v1.0*
