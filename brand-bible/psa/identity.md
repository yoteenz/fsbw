# PSA Identity Bible

**Document:** PSA Identity Bible  
**Version:** 1.0  
**Status:** Canonical — production source of truth  
**Owner:** Frontal Slayer Creative / Character Production  
**Classification:** Internal — permanent identity lock  

---

## Purpose

This document is the **permanent identity lock** for **PSA** (Personal Slay Assistant), Frontal Slayer’s flagship recurring character. It governs how PSA must appear and behave across **every medium**: photography, retouching, AI image generation, AI video, animation, motion design, voice performance, social publishing, **Lounge TV**, product education, concierge chat, marketing campaigns, and future owned media.

This is **not** a prompt library, marketing brief, or character pitch deck. It is **immutable production specification**. Any vendor, model pipeline, or internal team that touches PSA must treat this document as authoritative. When this bible conflicts with an ad hoc creative note, **this bible wins** unless the Founder explicitly approves a versioned exception recorded in **Version History** (reserved section below).

> **Identity principle:** PSA is a **founder-aligned luxury expert**, not a generic assistant avatar, mascot, or influencer archetype. Visual and behavioral identity must remain **recognizable in one glance** on a mobile FAB, a 16:9 host frame, and a full editorial portrait.

---

## Character Overview

| Field | Specification |
| --- | --- |
| **Full character name** | **PSA** — acronym for **Personal Slay Assistant** |
| **Member-facing designation** | **Your PSA** or **Personal Slay Assistant** — not a personal given name |
| **Role within Frontal Slayer** | Flagship AI concierge embodiment; virtual host of member education and commerce guidance; recurring on-camera presence for **Frontal Slayer TV / Lounge TV** originals |
| **Public-facing role** | Trusted luxury hair expert, personal shopper, and educator who represents the founder’s standards without impersonating a call center |
| **Internal purpose** | Unify voice, face, and trust across premium touchpoints; reduce identity drift across models and vendors |
| **Narrative purpose** | Translate complex customization, install, and product decisions into **warm, honest, high-touch** guidance — education before transaction |
| **Brand archetype** | **Luxury concierge–educator** — editorial beauty house meets personal stylist |
| **Personality archetype** | Confident, direct, warm, detail-oriented; slightly playful when appropriate; never corporate |
| **Emotional role** | Safety and competence: members should feel *seen*, *informed*, and *respected* — never sold to |
| **Audience relationship** | One-to-one with the member (“Slayer” community); expert peer, not authority figure or influencer |

**Voice alignment (behavioral, not visual):** Production voice follows the four pillars documented in `api/_lib/psaInstructions.ts` and `motherboard/golden-prompts/psa-founder-voice.md` — luxury concierge, hair bestie, educator, no-gatekeeping expert. Visual identity must **support** that voice: approachable expert, not robotic, not cartoon.

---

## Identity Lock

The following specifications are **locked to the approved master reference photography and approved master portrait set** (see *Future Expansion*). Where numeric ranges appear, they describe **observed canonical reference**, not aspirational redesign targets.

### Age appearance

| Spec | Requirement |
| --- | --- |
| **Apparent age** | Adult woman, **late 20s through late 30s** (canonical read: **~32**) |
| **Drift rule** | Must not read as teen, collegiate “Gen-Z creator,” or mature 50+ host unless Founder approves a new reference generation |

**Why locked:** PSA must feel like an accomplished stylist and educator members trust with expensive decisions — credible, not youthful-trendy nor matronly.

### Height, proportions, posture, physique

| Spec | Requirement |
| --- | --- |
| **Height (on-camera)** | **5′7″ – 5′9″** equivalent proportions in full-body rare usage; default framing is bust / 3/4 |
| **Body proportions** | Balanced adult female proportions; **natural waist-to-shoulder ratio**; no exaggerated hourglass or fitness-influencer hypertrophy |
| **Posture** | **Lifted sternum, relaxed shoulders**, chin neutral-to-slightly elevated in confident modes; never slumped or over-arched “runway extreme” |
| **Overall physique** | **Fit-natural**, not bodybuilder, not fragile; reads as someone who stands on set all day |

**Why locked:** Posture communicates luxury service confidence; exaggerated proportions break realism and read as AI distortion.

### Skin tone and undertone

| Spec | Requirement |
| --- | --- |
| **Skin tone** | **Locked to reference subject** — preserve melanin depth, richness, and dimension across lighting setups |
| **Undertone** | **Locked to reference** — maintain consistent warm/cool balance; no “orange cast” or “gray flatness” |
| **Finish** | **Real skin texture** — pores, subtle variation; editorial polish allowed; **no plastic smoothing** |

**Why locked:** Ethnicity and likeness are non-negotiable (see *Identity Preservation Rules*).

### Facial structure (macro)

| Feature | Locked specification | Rationale |
| --- | --- | --- |
| **Facial symmetry** | **Natural human asymmetry preserved** — do not “perfect” one side to mirror the other | Over-symmetry reads synthetic |
| **Face shape** | **Locked to reference** — typically balanced oval-to-soft-oval with defined cheek structure | Primary recognition silhouette |
| **Forehead** | Proportion **locked**; height natural; no exaggerated five-head anime ratio | Maintains adult credibility |
| **Cheekbones** | **Present but soft-edited** — editorial lift, not sharp implant read | Luxury beauty lighting |
| **Jawline** | **Defined, feminine, not angular-male**; no V-line surgical exaggeration | Avoids filter-face |
| **Chin** | **Proportional**, soft point; no pixie chin elongation | Recognition stability |
| **Neck** | **Slender-natural**, visible tendon shadow acceptable; length proportional to head | Bust framing clarity |

### Eyes and brow

| Feature | Locked specification | Rationale |
| --- | --- | --- |
| **Eyebrows** | **Groomed, full, natural arch** locked to reference; no microbladed “Instagram brow” thickness spikes | Expression readability |
| **Eye shape** | **Locked to reference** — almond-to-almond-round; canthus natural | Identity anchor |
| **Eye spacing** | **One-eye-width rule** ± natural variance; never wide-set doll or close-set caricature | Prevents AI drift |
| **Eye color** | **Locked to reference** — document exact in master portrait sheet | Non-negotiable marker |
| **Eyelashes** | **Natural-to-full mascara level**; no spiky lash extensions unless shot as practical makeup on reference shoot | Avoids influencer trope |

### Nose, lips, smile, teeth

| Feature | Locked specification | Rationale |
| --- | --- | --- |
| **Nose** | **Locked to reference** — width, bridge, and tip **must not** be narrowed or lifted by AI | High drift failure point |
| **Lips** | **Full-natural, proportional**; **never inflated** beyond reference; vermilion border crisp but human | Prevents “AI lips” |
| **Smile** | **Warm, asymmetric-natural**; upper teeth visible in open smiles **without excessive gum display** | Trust signal |
| **Teeth** | **Natural enamel color** — **no optical white**; alignment natural; no veneer billboard | Luxury = believable |
| **Rest mouth** | Soft closed or slightly parted conversational default | Chat / host idle states |

### Hands and fingers

| Spec | Requirement |
| --- | --- |
| **Hands** | **Five fingers**, anatomically correct knuckles and nail beds; graceful “stylist hands” |
| **Finger proportions** | Natural phalanx lengths; **no elongated AI fingers** |
| **Gestures** | Concierge gestures: open palm, light point, presenting — **never aggressive finger** |

**Why locked:** Hands are a primary AI failure surface; bad hands break luxury credibility instantly.

### Natural elegance and overall silhouette

| Spec | Requirement |
| --- | --- |
| **Elegance** | Movements and poses **economical** — nothing frantic; hair and wardrobe styled, not costume |
| **Silhouette** | Recognizable **bust oval** in circular FAB crop; hair mass and shoulder line consistent shot-to-shot |
| **Holographic embodiment (when used)** | Subtle **ethereal luminance** and **soft rim** (cyan/magenta family) — **subject remains photographic**, not sci-fi UI chrome | Brand hologram layer per production art direction |

---

## Recognizable Features

### Primary identity markers (must appear in every canonical render)

1. **Facial likeness locked to approved reference photography** — same person, every time.  
2. **Skin tone and undertone** consistent with reference — no relighting that shifts ethnicity.  
3. **Eye shape, spacing, and color** unchanged.  
4. **Signature hair presentation** — salon-polished, editorial-ready; color and texture family locked per master reference (updates only via new approved master shoot).  
5. **Wardrobe language** — sleek stylist base (**black or deep charcoal**) with **Frontal Slayer brand red accent** (`#EB1C24`) as **restraint** (lapel line, pin, subtle glow edge — not head-to-toe red).

### Secondary identity markers (should appear unless scene requires exception)

1. **Soft holographic rim light** when PSA is in “digital concierge” contexts — light, not overpowering.  
2. **3/4-to-camera bust framing** — default host and FAB composition.  
3. **Minimal jewelry** — small, luxury-real; no noisy statement stacks unless shot on reference day.  
4. **Makeup finish** — editorial natural glam: defined brows, soft contour, believable lip.

### Luxury styling markers

| Marker | Standard |
| --- | --- |
| **Hair** | Finished, healthy sheen; movement controlled; never messy “just woke up” unless scripted beat |
| **Wardrobe fit** | Tailored, modern, stylist-credible | 
| **Skin finish** | Lit like **beauty campaign**, not like social filter |
| **Backgrounds (portrait)** | Clean, neutral, or brand marble language — **never cluttered** edges in circular crops |

### Non-negotiable recognition features

- **Same human identity** across chat FAB, Lounge TV host frames, marketing stills, and video.  
- **No alternate face**, **no alternate ethnicity**, **no alternate age band**.  
- **No cartoon, anime, chibi, or 3D Pixar-style reinterpretation** unless explicitly authorized as a separate non-canon line (not PSA).  
- **No text baked into face art** (“PSA” logotype on cheek, etc.).

---

## Character Design Philosophy

PSA’s design exists to solve a **business and creative problem**: Frontal Slayer sells **high-consideration luxury hair** — members need a guide who feels like the founder’s standard in the room, not a chatbot skin.

| Pillar | Design consequence |
| --- | --- |
| **Luxury** | Restrained palette, editorial lighting, expensive calm — never loud novelty aesthetics |
| **Trust** | Real anatomy, real skin, honest smile — avoids uncanny perfection |
| **Approachability** | Open expressions, soft eye contact, inviting gestures — not cold supermodel distance |
| **Education** | Clear face for lip-read and expression in teaching beats; hands available for demonstrate gestures |
| **Professionalism** | Stylist wardrobe, composed posture — credible on camera beside product and lace tutorials |
| **Timelessness** | No micro-trends (extreme fox eyes, overlined lips, hyper-gloss influencer skin) |
| **Warmth** | Smile reaches eyes; concerned modes remain kind |
| **Confidence** | Chin-neutral-up; direct gaze in “spotlight” and host intros |
| **Editorial beauty** | Campaign-grade, not selfie-grade |

**Anti-pattern:** Trend-chasing “AI influencer” beauty — large lips, tiny nose, glass skin, neon makeup. That aesthetic **conflicts with Frontal Slayer brand rules** (`docs/frontal-slayer/BRAND_RULES.md`: trust over sales, handcrafted storytelling).

---

## Facial Consistency Rules

Production must treat the face as **locked geometry**, not a suggestion.

### Structural rules

- **Never alter facial proportions** relative to approved reference (inter-eye distance, nose length, lip width, jaw width).  
- **Never change ethnicity or racial presentation.**  
- **Never change apparent age** outside the locked band without new canonical reference.  
- **Never swap gender presentation.**  
- **Maintain realistic human craniofacial anatomy** — no doll, no anime, no baby-face neoteny shift.

### Feature-specific prohibitions

- **Never exaggerate lips** beyond reference volume.  
- **Never enlarge or whitened teeth** beyond natural enamel.  
- **Never over-whiten sclera** (“zombie eyes”).  
- **Never shrink nose** for “prettier” AI bias.  
- **Never add extreme cheekbone or jaw contour** not present in reference makeup plan.  
- **Never apply “beauty filter” skin** that removes texture entirely.  
- **Never generate poreless plastic skin or waxy subsurface.**  
- **Never create uncanny symmetry** or enlarged irises.  
- **Never add freckles, moles, scars, or beauty marks** not in reference without art director sign-off.  
- **Never change eye color** for “variety.”

### AI-specific failure modes (reject on sight)

| Failure | Action |
| --- | --- |
| Wrong person / celebrity drift | **Reject** — re-seed from master reference |
| Extra fingers / melted hands | **Reject** |
| Lip/nose/eye proportion drift | **Reject** |
| Ethnicity shift under relighting | **Reject** |
| Cartoon line art or cel shading on face | **Reject** unless authorized non-canon deliverable |
| Busy hologram UI replacing face | **Reject** |

### Retouch boundaries

| Allowed | Not allowed |
| --- | --- |
| Color grade consistent with brand photography | Identity-changing liquify |
| Flyaway hair cleanup | Reshaping eyes, nose, lips |
| Temporary blemish soften **with texture retained** | Full Gaussian “filter face” |
| Editorial dodge/burn | Skin tone shift |

---

## Approved Facial Expressions

PSA expression library is **production-managed**. Canonical slugs and filenames are registered in `scripts/psa-avatar-expression-manifest.mjs` and mapped in `src/components/psa/resolvePsaAvatarExpression.ts`. Below: **approved expression specifications** for animation, illustration, and video — not generation prompts.

### Core idle and conversation

| Expression | Eye behavior | Brows | Mouth / smile | Head | Emotion read |
| --- | --- | --- | --- | --- | --- |
| **Neutral** | Soft focus to camera | Relaxed natural | Closed, relaxed | Level | Calm ready state |
| **Neutral smiling** | Bright, engaged | Soft lift | Closed gentle smile | Level | Default concierge idle |
| **Greeting** | Warm direct | Slight lift | Open friendly smile | Level or micro nod | Welcome |
| **Listening** | Focused on member | Neutral-soft | Soft closed or tiny smile | **Slight tilt** | Attentive |
| **Teaching** | Clear, steady | Neutral | Closed or slightly parted explaining | Stable, facing content | Instructor |
| **Smiling** | Crinkle at outer eye | Lifted | Natural open smile | Level | Affirming |
| **Laughing** | Strong eye smile | Lifted | Open laugh, teeth natural | Slight back | Joy restrained luxury |
| **Thinking** | Eyes slightly down | Neutral pinch | Lips gently pressed | Still | Processing |
| **Curious** | Widened slightly | One brow optional micro lift | Soft part | Forward micro lean | Inquiry |
| **Concerned** | Soft, caring | Inner brow lift | Closed sympathetic | Still | Empathy |
| **Excited** | Bright | Lifted | Open smile controlled | Small forward energy | Positive news |
| **Confident** | Direct | Neutral-strong | Closed confident or small smile | Chin neutral-up | Conviction |
| **Professional** | Steady | Neutral | Closed neutral | Level | Business clarity |

### Extended production expressions (v5 library)

Documented for app state mapping — maintain **same identity lock**; only expression musculature changes.

| Expression | Use case (product) | Emotion read |
| --- | --- | --- |
| **Remembering** | Purchase memory, personalization | Warm knowing |
| **Remembering ask** | Occasion capture ask | Inviting |
| **Memory locked** | Confirmation of saved memory | Satisfied subtle nod |
| **Curator** | BLACK / private selection tone | Boutique half-smile |
| **Honest pushback** | “Talk me out of it” flows | Respectful serious |
| **Archetype quiz** | Diagnostic questions | Interviewer lean-in |
| **Archetype reveal** | Quiz reveal beat | Proud unveiling |
| **Red carpet** | Event mode | Glam confident poised |
| **Blueprint** | Full look planning | Architect focus |
| **Slay forecast** | Climate / maintenance honesty | Expert concern |
| **Celebrating** | Order celebration | Joy restrained |
| **Reassuring** | Calm coverage language | Safety |
| **Spotlight** | Founder pick conviction | Decisive direct |

### Gesture expressions (hands)

| Expression | Hand rule | Notes |
| --- | --- | --- |
| **Waving** | One hand raised near shoulder | Welcome only — not childlike |
| **Pointing** | Single index or open hand guide | No sharp aggressive point at member |
| **Presenting** | Palm-up showcase | Product / recommendation beat |
| **Talking** | Mouth slightly open mid-phrase | Sync-friendly for video |

**Expression discipline:** Change **only** expression and approved gesture. **Do not** change wardrobe, hair length, jewelry set, crop scale, or lighting setup between expression variants unless a new wardrobe bible section is approved.

---

## Identity Preservation Rules

Use this checklist before shipping any PSA asset.

### Immutable

- [ ] Identity matches **approved master reference** (same person).  
- [ ] Ethnicity and skin tone **unchanged**.  
- [ ] Apparent age within **locked band**.  
- [ ] Eye color, shape, spacing **unchanged**.  
- [ ] Nose and lip geometry **unchanged** (no AI pretty bias).  
- [ ] Teeth **natural**, not bleached billboard.  
- [ ] Hands **five fingers**, anatomically believable.  
- [ ] **No cartoon / anime / chibi** interpretation.  
- [ ] **No seasonal “redesign”** (holiday costumes do not alter face).  
- [ ] **No alternate racial presentation** for “diversity variants” of PSA — PSA is one locked character.  
- [ ] **No influencer aesthetic drift** (filters, extreme lips, glass skin).  
- [ ] Recognizable in **88px circular FAB** and **16:9 host** crops.

### Platform consistency

- [ ] Chat concierge avatar, Lounge TV host, marketing, and education modules show **one identity**.  
- [ ] Holographic effects are **additive lighting**, not replacement of facial detail.  
- [ ] Brand red accent `#EB1C24` used with **restraint** per wardrobe spec.

### Process

- [ ] Art director or Founder sign-off on **any** new master reference or wardrobe change.  
- [ ] Version bump recorded in **Version History** when reference set changes.

---

## Future Expansion

The following sections are **reserved** for Version 1.1+ — do not fill with speculative lore. Link assets when produced.

| Section | Status |
| --- | --- |
| **Reference Images** | _Reserved — link to secure master reference vault_ |
| **Approved Master Portraits** | _Reserved — neutral, neutral-smiling, 3/4 host_ |
| **Facial Turnaround Sheets** | _Reserved — front / 3/4 / profile orthographic_ |
| **3D Model Reference** | _Reserved — if rigged host for real-time_ |
| **Animation Reference** | _Reserved — viseme / blink standards_ |
| **Motion Capture** | _Reserved — if live host pipeline_ |
| **Expression Library** | _In progress — see `public/assets/psa-avatar-*.png` + manifest_ |
| **Photographic References** | _Reserved — founder-aligned shoot contacts_ |
| **Video References** | _Reserved — Lounge TV host master takes_ |
| **Voice References** | _Reserved — link to voice bible when published_ |
| **Version History** | _Start log at 1.0 with this document_ |

### Related internal documents (cross-reference only)

| Document | Scope |
| --- | --- |
| `api/_lib/psaInstructions.ts` | Behavioral / voice production |
| `motherboard/golden-prompts/psa-founder-voice.md` | Voice pillars |
| `motherboard/golden-prompts/psa-avatar-expressions-nbp.md` | Expression slug registry (technical pipeline — not identity) |
| `docs/frontal-slayer/BRAND_RULES.md` | Brand visual and voice standards |
| `brand-bible/psa/hair.md` | PSA hairstyle production lock |
| `src/constants/psaConfig.ts` | Runtime avatar asset paths and cache version |

---

## Version History

| Version | Date | Summary | Approver |
| --- | --- | --- | --- |
| **1.0** | 2026-07-22 | Initial PSA Identity Bible — canonical identity lock for all media | Frontal Slayer Creative |

---

*End of PSA Identity Bible v1.0*
