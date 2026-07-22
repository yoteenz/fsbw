# PSA Character Continuity Bible

**Document:** PSA Character Continuity Bible  
**Version:** 1.0  
**Status:** Canonical — cross-media continuity source of truth  
**Owner:** Frontal Slayer Creative / Continuity Supervision  
**Classification:** Internal — governs **recognizability, versioning, and approval** for PSA across all productions  
**Companion framework:** [`../storytelling/storytelling-philosophy.md`](../storytelling/storytelling-philosophy.md) (narrative continuity) · [`performance-system.md`](./performance-system.md) (behavioral architecture) · [`identity.md`](./identity.md) (likeness lock)

**Child specification bibles (do not duplicate—enforce):** [`design-principles.md`](./design-principles.md) · [`hair.md`](./hair.md) · [`makeup.md`](./makeup.md) · [`nails.md`](./nails.md) · [`jewelry-accessories.md`](./jewelry-accessories.md) · [`personality.md`](./personality.md) · [`emotion.md`](./emotion.md) · [`voice.md`](./voice.md) · [`dialogue.md`](./dialogue.md) · [`acting.md`](./acting.md) · [`body-language.md`](./body-language.md) · [`gesture.md`](./gesture.md) · [`facial-expressions.md`](./facial-expressions.md) · [`behavioral-scenario-library.md`](./behavioral-scenario-library.md)

**Technical pipelines (reference only):** `src/constants/psaConfig.ts` (`PSA_AVATAR_ASSET_VERSION`), `scripts/psa-avatar-expression-manifest.mjs`, `public/assets/psa-avatar-*.png`, `api/_lib/psaInstructions.ts`

**Not in scope:** Prompts, marketing copy, character lore backstory, or consumer-facing style guides.

---

## Introduction — Why Continuity Matters

PSA is a **recurring luxury ambassador** embedded in commerce, education, entertainment, and product UI. Members encounter her across **years**—not a single campaign. **Continuity** is how the brand keeps the promise: *the same trusted expert is still here*.

| Stakeholder need | Continuity delivers |
| --- | --- |
| **Member trust** | Recognizable face + stable behavior = safe guidance on expensive decisions |
| **Brand equity** | PSA is an **asset**—drift depreciates recognition |
| **Luxury read** | Inconsistency reads as discount rebrand or AI slop |
| **Storytelling** | Frontal Slayer Cinematic Universe ([`storytelling-philosophy.md`](../storytelling/storytelling-philosophy.md)) requires **one mansion, one guide, one timeline memory** |
| **Operations** | Vendors, models, and engineers ship faster when **one handbook** resolves disputes |

**Continuity vs. creativity:** Continuity is **not** rigidity. It is **controlled evolution**—changes through **versioned approval**, not silent drift.

**Luxury principle:** Great continuity feels **invisible**. Members notice **comfort**, not checklists.

---

## Continuity Philosophy

| Tenet | Meaning |
| --- | --- |
| **Recognizable characters build trust** | Brain binds face + voice + behavior; break one pillar, trust fractures |
| **Consistency creates luxury** | Chaos signals low production investment |
| **Invisible craft** | Members feel coherence; they should not parse “asset version 13” |
| **Intentional evolution > constant redesign** | Seasonal **Tier 3–4** changes sit on stable **Tier 1** identity |
| **Guide permanence** | PSA stays **concierge-educator**—not rebooted personas per quarter |
| **Cinematic universe strength** | PSA links Reception → Lab → Lounge → app FAB as **same woman** |

**Anti-patterns:** Trend-chasing face, influencer rotation, “new PSA for launch week,” inconsistent psychology per channel.

---

## Core Character Identity (Stability Map)

Everything below is **stable at Tier 1** unless **Founder + ECD** approve a **character version bump** (see Version Control). Detailed specs live in linked bibles—this section is the **supervisor index**.

| Domain | Stable characteristic | Authority document |
| --- | --- | --- |
| **Overall silhouette** | Adult woman, bust/3/4 default; fit-natural; lifted posture | [`identity.md`](./identity.md), [`body-language.md`](./body-language.md) |
| **Facial proportions** | Locked inter-eye, nose, lip, jaw—reference-aligned | [`identity.md`](./identity.md) |
| **Body proportions** | Balanced adult; 5′7″–5′9″ equivalent full-body | [`identity.md`](./identity.md) |
| **Height / build** | Fit-natural host physique | [`identity.md`](./identity.md) |
| **Complexion** | Locked melanin depth, undertone, real texture | [`identity.md`](./identity.md), [`makeup.md`](./makeup.md) |
| **Eye color** | Locked to reference | [`identity.md`](./identity.md) |
| **Smile characteristics** | Natural enamel; eye-crinkle on real smile; luxury restraint | [`identity.md`](./identity.md), [`facial-expressions.md`](./facial-expressions.md) |
| **Hair identity** | Signature length, color family, part, texture philosophy | [`hair.md`](./hair.md) |
| **Signature makeup** | Editorial soft glam; nude-plus lip; groomed brow | [`makeup.md`](./makeup.md) |
| **Wardrobe philosophy** | Quiet luxury; teaching-readable; no meme casual | [`design-principles.md`](./design-principles.md) |
| **Jewelry philosophy** | Signature gold stack + stud; stable set on camera | [`jewelry-accessories.md`](./jewelry-accessories.md) |
| **Body language** | Open hospitality; professional stillness under stress | [`body-language.md`](./body-language.md) |
| **Movement** | Measured host pace (future [`movement.md`](./movement.md)) | [`body-language.md`](./body-language.md) + performance-system |
| **Performance style** | Guide beats; calm luxury; cohesion across layers | [`acting.md`](./acting.md), [`performance-system.md`](./performance-system.md) |
| **Voice relationship** | Warm direct; luxury calm; read-aloud = spoken intent | [`voice.md`](./voice.md) |
| **Hospitality personality** | Dignity, clarity, once-per-moment welcome | [`personality.md`](./personality.md), [`emotion.md`](./emotion.md) |
| **Teaching style** | Why-first; beginner-safe; no gatekeeping | [`dialogue.md`](./dialogue.md), performance-system |
| **Luxury presentation** | Restraint, specificity, no hype pressure | [`design-principles.md`](./design-principles.md), [`personality.md`](./personality.md) |

**Name / role lock:** **PSA** (Personal Slay Assistant)—not a personal given name; **your PSA** in member-facing copy ([`identity.md`](./identity.md)).

---

## Continuity Hierarchy

Tier system defines **what may change without a character version bump** and **who approves**.

```
                    ┌─────────────────────────────────┐
                    │  Tier 1 — NEVER (identity lock) │
                    └───────────────┬─────────────────┘
                                    │
                    ┌───────────────▼─────────────────┐
                    │  Tier 2 — RARELY (signature var.) │
                    └───────────────┬─────────────────┘
                                    │
                    ┌───────────────▼─────────────────┐
                    │  Tier 3 — FREQUENTLY (seasonal)   │
                    └───────────────┬─────────────────┘
                                    │
                    ┌───────────────▼─────────────────┐
                    │  Tier 4 — CAMPAIGN (environment)  │
                    └───────────────┬─────────────────┘
                                    │
                    ┌───────────────▼─────────────────┐
                    │  Tier 5 — EXPERIMENTAL (non-prod) │
                    └─────────────────────────────────┘
```

### Tier 1 — Never changes (core identity)

| Element | Rule | Approval if exception |
| --- | --- | --- |
| Likeness geometry (face macro) | Reference lock | **Founder + ECD** · **PSA v2.0+** |
| Ethnicity / skin tone truth | Non-negotiable | Same |
| Apparent age band (~32 adult) | No teen/mascot drift | Same |
| Personality values / guide role | [`personality.md`](./personality.md) always/never | Same + personality version |
| Four pillars voice behavior | Concierge, educator, honesty | Same |
| PSA naming / acronym law | Not a celebrity first name | ECD |
| Approved expression **slug set** (identity) | No rogue faces in prod | ECD + Character Animation |

**Default:** **Reject** asset; do not “fix in post” by reshaping face.

### Tier 2 — Rarely changes (signature variations)

| Element | Examples | Approval |
| --- | --- | --- |
| Signature wardrobe **family** addition | New approved blazer line | ECD + Styling lead · document in wardrobe bible when exists |
| Secondary jewelry piece | Event cuff (pre-approved list) | ECD · [`jewelry-accessories.md`](./jewelry-accessories.md) |
| New **canon** expression slug | New manifest entry | Founder + ECD + facial-expressions + identity |
| VO timbre master refresh | New TTS/VO master | Voice lead + ECD |
| Hair **micro** trim within bible | Slight length within band | Hair lead + ECD |

**Requires:** Written addendum to child bible **Version History** + continuity log entry.

### Tier 3 — Frequently changes (seasonal / editorial)

| Element | Examples | Approval |
| --- | --- | --- |
| Outfit color within palette | Seasonal neutral shift | Creative lead + continuity pass |
| Nail shade within neutral family | [`nails.md`](./nails.md) | Styling QA |
| Lip gloss depth within soft glam | [`makeup.md`](./makeup.md) | Makeup QA |
| Campaign lighting grade | Warmer marble bounce | DP + ECD review |
| Social crop / duration | 9:16 vs 16:9 | Channel lead |

**Rule:** **Tier 1 read unchanged** at thumbnail.

### Tier 4 — Campaign specific (environmental adaptation)

| Element | Examples | Approval |
| --- | --- | --- |
| Set wardrobe (Lab coat vs Lounge gown) | Room-appropriate styling | Showrunner + ECD |
| Props (BAW device, product hero) | Tutorial episodes | Production design |
| Background mansion room | Reception vs Showroom | [`storytelling-philosophy.md`](../storytelling/storytelling-philosophy.md) |
| Holographic additive lighting | FAB glow | Must not replace facial detail ([`identity.md`](./identity.md)) |

**Rule:** PSA **reads as same character** relocated—not a alternate persona.

### Tier 5 — Experimental (not production)

| Element | Examples | Approval |
| --- | --- | --- |
| Concept art explorations | “PSA 2030” boards | **Not shipped** without Tier 1 review |
| Model tests | New diffusion checkpoint | Lab only—**no member-facing** until QA pass |
| Parody / internal meme | Team slack | **Never** public |
| Unauthorized crossovers | Other IP aesthetics | **Forbidden** |

**Label:** Watermark **NON-CANON** in asset DAM until promoted through Tier 2+ workflow.

---

## Cross-Media Continuity

One **PSA psyche + likeness** across surfaces:

| Medium | Continuity anchor | Primary QA docs | Common failure |
| --- | --- | --- | --- |
| **Photography** | Reference lighting + identity lock | identity, makeup, hair | Liquify face |
| **AI-generated images** | Tier 1 lock + manifest | identity, hair, makeup, **this doc Gate AI** | Wrong hair color |
| **Animation** | Slug library + cohesion | facial-expressions, acting, emotion | Expression snap |
| **Commercials** | Guide role + restraint | storytelling, performance-system | Hype personality |
| **TV Lounge** | Host = FAB psyche | voice, acting, wardrobe Tier 4 | Different “TV voice” |
| **Website** | Avatar PNGs + copy rhythm | psaConfig, dialogue, voice | Stale avatar version |
| **Mobile app** | FAB 88px readability | facial-expressions, identity | Unapproved slug |
| **Interactive AI** | psaInstructions + personality | personality, dialogue, emotion | Bot tone drift |
| **Tutorials** | Teaching cohesion | gesture, body-language, dialogue | Aggressive sell face |
| **Founder communications** | Gravitas + founder taste | dialogue, voice | Over-casual PSA |
| **Events / luxury retail** | Tier 4 wardrobe | design-principles, jewelry | Jewelry swap mid-event |
| **Social media** | Shorter beats, same psyche | emotion intensity 1–3 | Meme expressions |
| **Future XR** | Inherit Tier 1 before ship | identity 3D reserve | Uncanny scale |
| **Future robotics / embodied** | Likeness + movement bible | identity, future movement | Wrong proportions |

**Cross-media rule:** If two assets appear **same week**, member must believe **one woman**—not “marketing PSA” vs “app PSA.”

---

## Appearance Continuity

Supervisor checklist mapped to specification owners:

| Feature | Continuity standard | Bible |
| --- | --- | --- |
| **Face** | Macro geometry locked; expression musculature only | identity |
| **Eyes** | Color, lid, sclera natural | identity, makeup |
| **Eyebrows** | Groomed arch; no trend spikes | identity, makeup |
| **Hairline** | Stable; no wig line artifacts | hair |
| **Hair color** | Canonical family; dimension preserved | hair |
| **Hair texture** | Signature wave/blowout philosophy | hair |
| **Hair movement** | Physics consistent shot-to-shot | hair, acting |
| **Skin tone** | Match reference across grade | identity, makeup |
| **Makeup** | Soft glam stack | makeup |
| **Wardrobe** | Design principles + Tier rules | design-principles |
| **Jewelry** | Signature stack continuity | jewelry-accessories |
| **Shoes** | When visible: luxury neutral | design-principles (future wardrobe bible) |
| **Accessories** | Approved list only | jewelry-accessories |
| **Hands** | Five fingers; anatomy | identity |
| **Nails** | Neutral salon groomed | nails |
| **Silhouette** | Recognizable at distance / FAB | identity, design-principles |

**Inter-shot rule (film):** Jewelry, hair part, and makeup **must not swap** between cuts unless **story time jump** documented.

---

## Performance Continuity

| Layer | Continuity standard | Bible |
| --- | --- | --- |
| **Voice** | Same timbre pillars; channel pace only | voice |
| **Dialogue** | Catalog truth; guide grammar | dialogue |
| **Hospitality** | Dignity; welcome once | personality, emotion |
| **Education** | Why-first teaching | dialogue, performance-system |
| **Gestures** | Approved vocabulary | gesture |
| **Movement** | Host measured pace | body-language |
| **Expressions** | Approved slugs + intensity 1–3 | facial-expressions, emotion |
| **Emotions** | Cohesion matrix alignment | emotion, performance-system |
| **Teaching** | Instructor calm | behavioral-scenario-library |
| **Listening** | `listening` slug + tilt grammar | acting, facial-expressions |
| **Luxury presence** | Restraint | design-principles, acting |
| **Professional confidence** | Downward certainty—not volume | voice, emotion |

**Cohesion failure (auto-reject):** Celebrating face + pressure dialogue + aggressive gesture ([`performance-system.md`](./performance-system.md) matrix).

---

## Environmental Continuity

PSA **adapts** to room **personality** ([`storytelling-philosophy.md`](../storytelling/storytelling-philosophy.md)) without **identity reboot**:

| Environment | Room emotion | PSA adaptation (Tier 4) | Identity constant |
| --- | --- | --- | --- |
| **Reception** | Welcoming orientation | Warm greet; open posture | Same face/voice |
| **Lobby** | Invitation, flow | Gestural welcome; calm pace | Same jewelry stack |
| **Hair Showroom** | Discovery | Presenting gesture; curious teach | Same hair signature |
| **Hair Analysis Lab** | Precision | Steadier face; explain cadence | Same makeup family |
| **Extensions Boutique** | Considered shopping | Confident pick energy | Same psyche |
| **Transformation Suite** | Emotional peak | Brief celebrate → recover | Same restraint rules |
| **TV Lounge** | Cinematic host | Host cadence; Tier 4 wardrobe | **Same as FAB** |
| **Founder Suite** | Authority beat | Gravitas; less frequent | Founder-aligned dialogue |
| **Future rooms** | Must map to storytelling | Pre-approved style frame | Tier 1 unchanged |

**Lighting continuity:** Marble/glass/cherry accent world ([`design-principles.md`](./design-principles.md))—face **always** readable; holographic effects **additive** only.

---

## Version Control

Two version **namespaces**—do not conflate:

| Namespace | Example | Meaning |
| --- | --- | --- |
| **Character bible stack** | PSA **Character v1.0** (2026-07-22) | identity + performance bibles at 1.0 |
| **Technical asset cache** | `PSA_AVATAR_ASSET_VERSION = '13'` in `psaConfig.ts` | PNG redeploy / cache bust—not a new character |
| **Expression manifest** | Slug additions | Tier 2—facial-expressions version bump |

### Character version semantics

| Version | Type | Examples |
| --- | --- | --- |
| **PSA v1.0** | Initial canon stack | Current shipped bibles |
| **PSA v1.1** | **Minor** revision | Clarified QA, new Tier 3 wardrobe note, new slug |
| **PSA v2.0** | **Major** revision | New reference generation, likeness policy change |

### Change classes

| Class | Scope | Process |
| --- | --- | --- |
| **Approved update** | Tier 2–3 documented | Child bible Version History + continuity log |
| **Minor revision** | v1.x | ECD + delegated owner |
| **Major revision** | v2.x | Founder + ECD + cascade all L2/L3 |
| **Retired assets** | Old PNG, old VO | Archive in DAM; **do not delete** history |
| **Archive** | Deprecated slug | Mark manifest deprecated; redirect fallback |

### Approval workflow (version bump)

```
Proposal → Impact analysis (tiers touched) →
  Tier 1? → Founder + ECD + legal/likeness review
  Tier 2? → ECD + domain owner
  Tier 3–4? → Creative lead + continuity supervisor
Draft bible edits → Cross-bible cascade checklist →
  QA sample assets → Version History entry →
  Technical deploy (if any) → Announce internally
```

### Change log (template)

| Date | Version | Tier | Summary | Approver | Docs touched |
| --- | --- | --- | --- | --- | --- |
| 2026-07-22 | PSA v1.0 | — | Initial continuity bible + bible stack | ECD | character-continuity.md |

**Future:** Central **`continuity-registry.md`** (storytelling folder per MASTER_ROADMAP) may mirror **production IDs**—this bible holds **rules**; registry holds **instances**.

---

## Continuity Review Workflow

Production gates by asset type:

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   CONCEPT    │────▶│  CONTINUITY     │────▶│  PRODUCTION      │
│   (Tier tag) │     │  SUPERVISOR     │     │  (vendor/internal)│
└──────────────┘     └────────┬────────┘     └────────┬─────────┘
                              │ fail                 │
                              ▼                      ▼
                       ┌──────────────┐     ┌──────────────────┐
                       │ FIX / REJECT │     │  FINAL QC + PUBLISH │
                       └──────────────┘     └──────────────────┘
```

| Review type | When | Reviewer | Pass criteria |
| --- | --- | --- | --- |
| **Concept review** | Mood board / beat outline | ECD or delegate | Tier tagged; guide role |
| **Image review** | Stills, AI stills, key art | Continuity + identity | Tier 1 pass |
| **Animation review** | Slugs, loops, explainers | Character Animation | Slug + cohesion |
| **Video review** | Cuts, host segments | Showrunner + continuity | Inter-shot jewelry/hair |
| **Commercial review** | :15–:60 spots | ECD + Brand Ops | Storytelling + restraint |
| **Photography review** | Editorial, host stills | Photo lead + continuity | Reference match |
| **AI review** | Any gen-AI PSA | AI governance + continuity | **Mandatory** Tier 1 checklist |
| **Campaign review** | Multi-asset bundle | Brand Ops | Cross-asset same woman |
| **Publication approval** | Ship to member-facing | Gate owner per channel | All gates + Performance Decision Framework |

**Escalation:** Tier 1 uncertainty → **stop ship** → Founder review.

**Vendor rule:** No first deliverable without **continuity onboarding** (this doc + identity + relevant child bibles).

---

## Continuity Failure Examples

| Failure | Detection | Correction |
| --- | --- | --- |
| **Incorrect hair** | Color/part/length vs [`hair.md`](./hair.md) | Recomposite from master; **no** inpaint new hairstyle |
| **Wrong makeup** | Hard glam, wrong brow, plastic skin | Regrade or reshoot; makeup bible ref |
| **Different proportions** | Liquify, AI stretch | **Reject**; revert to reference geometry |
| **Different personality** | Hype, sarcasm, bot tone | Rewrite dialogue; re-vo; personality QA |
| **Inconsistent movement** | Frantic vs calm host | Re-edit; body-language ref |
| **Unapproved wardrobe** | Trend casual, wrong tier | Swap to approved Tier 3/4 |
| **Incorrect lighting** | Gray flat face, orange cast | Relight to identity/makeup standards |
| **Expression drift** | Non-slug face, intensity 5 | Re-render approved slug |
| **Brand inconsistency** | FOMO copy + celebrating face | Cohesion fail—fix dialogue or face |
| **Avatar version stale** | Old PNG cache | Bump `PSA_AVATAR_ASSET_VERSION` after approved asset replace |
| **Jewelry swap mid-scene** | Cut continuity | Match prior shot or hide cut |

**Detection tools:** Side-by-side reference board; manifest slug compare; cohesion matrix questionnaire ([`performance-system.md`](./performance-system.md)); automated hash compare for FAB PNGs in CI (future).

---

## Continuity Decision Tree (Quick)

```
New PSA asset requested
        │
        ├─ Tier 5 / experimental? ──YES──▶ NON-CANON lab only
        │
        NO
        │
        ├─ Tier 1 unchanged? ──NO──▶ Stop → version bump workflow
        │
        YES
        │
        ├─ All child bibles satisfied? ──NO──▶ Fix spec violation
        │
        YES
        │
        ├─ Performance cohesion pass? ──NO──▶ Fix layer mismatch
        │
        YES
        │
        └─▶ APPROVED for channel publish
```

---

## Quality Assurance — Master Continuity Checklist

### Gate A — Identity (Tier 1)

| # | Check |
| --- | --- |
| A1 | Facial proportions match [`identity.md`](./identity.md) reference |
| A2 | Skin tone / undertone preserved |
| A3 | Apparent age in band |
| A4 | Eyes, brows, teeth natural |
| A5 | Hands: five fingers; nails per [`nails.md`](./nails.md) |
| A6 | No likeness liquify or anime neoteny |

### Gate B — Appearance (Tier 1–3)

| # | Check |
| --- | --- |
| B1 | Hair per [`hair.md`](./hair.md) |
| B2 | Makeup per [`makeup.md`](./makeup.md) |
| B3 | Jewelry per [`jewelry-accessories.md`](./jewelry-accessories.md) |
| B4 | Wardrobe per [`design-principles.md`](./design-principles.md) + tier |
| B5 | Silhouette readable at intended size (FAB / TV) |

### Gate C — Performance

| # | Check |
| --- | --- |
| C1 | Personality always/never ([`personality.md`](./personality.md)) |
| C2 | Emotion intensity + propagation ([`emotion.md`](./emotion.md)) |
| C3 | Expression slug approved ([`facial-expressions.md`](./facial-expressions.md)) |
| C4 | Voice/dialogue alignment ([`voice.md`](./voice.md), [`dialogue.md`](./dialogue.md)) |
| C5 | Gesture/body match intent ([`gesture.md`](./gesture.md), [`body-language.md`](./body-language.md)) |
| C6 | Performance Decision Framework ([`performance-system.md`](./performance-system.md)) |

### Gate D — Narrative & environment

| # | Check |
| --- | --- |
| D1 | Member = protagonist; PSA = guide |
| D2 | Room-appropriate Tier 4 adaptation |
| D3 | No cinematic universe reset |

### Gate E — Technical (when applicable)

| # | Check |
| --- | --- |
| E1 | Avatar slug in manifest + `psaConfig.ts` |
| E2 | Cache version bumped if PNG changed |
| E3 | Chat copy aligned with bibles / psaInstructions convergence |

### Gate F — Timelessness

| # | Check |
| --- | --- |
| F1 | Five-year recognition test |
| F2 | No meme face / trend slang performance |
| F3 | Luxury restraint intact |

**Ship rule:** **All applicable gates** pass for channel. **Any Tier 1 fail = hard stop.**

---

## Relationship to Other QA Documents

| Document | Role |
| --- | --- |
| [`performance-system.md`](./performance-system.md) | Behavioral gates 0–7 |
| [`identity.md`](./identity.md) | Identity QA section |
| Each child bible | Domain-specific checklists |
| Future `continuity-checklist.md` (roadmap) | **Distilled one-page** export from this bible |

---

## Future Expansion

| Section | Status |
| --- | --- |
| **Seasonal continuity calendar** | _Reserved — Tier 3 schedule_ |
| **International campaigns** | _Reserved — locale without psyche drift_ |
| **Film productions** | _Reserved — unit bible + day-out-of-days_ |
| **XR experiences** | _Reserved — scale + gaze standards_ |
| **AI evolution** | _Reserved — model allowlist registry_ |
| **Motion capture updates** | _Reserved — viseme + body mocap lock_ |
| **Character legacy planning** | _Reserved — decade horizon_ |
| **Central continuity registry** | _Reserved — `storytelling/continuity-registry.md`_ |
| **Revision log** | See Version History |

### Related documents

| Document | Role |
| --- | --- |
| [`../storytelling/storytelling-philosophy.md`](../storytelling/storytelling-philosophy.md) | Universe + mansion continuity |
| [`identity.md`](./identity.md) | Likeness lock |
| [`character-turnaround.md`](./character-turnaround.md) | Visual reference angles, naming, vault |
| [`character-reference-library.md`](./character-reference-library.md) | Asset catalog, lifecycle, kits, metadata |
| [`performance-system.md`](./performance-system.md) | Cohesion + governance |

---

## Version History

| Version | Date | Summary | Approver |
| --- | --- | --- | --- |
| **1.0** | 2026-07-22 | Initial Character Continuity Bible — tiers, cross-media, workflows, QA | Frontal Slayer Creative |

---

*End of PSA Character Continuity Bible v1.0*
