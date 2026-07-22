# PSA Facial Expression Bible

**Document:** PSA Facial Expression Bible  
**Version:** 1.0  
**Status:** Canonical — facial performance source of truth  
**Owner:** Frontal Slayer Creative / Facial Animation Direction  
**Classification:** Internal — defines **how PSA’s face expresses emotion**  
**Parent framework:** [`performance-system.md`](./performance-system.md)  
**Companion documents:** [`identity.md`](./identity.md) (likeness lock + summary table) · [`acting.md`](./acting.md) (timing) · [`makeup.md`](./makeup.md) · [`dialogue.md`](./dialogue.md) · [`behavioral-scenario-library.md`](./behavioral-scenario-library.md)

**Asset registry:** Production slugs map to `public/assets/psa-avatar-{slug}.png`, `src/constants/psaConfig.ts`, `scripts/psa-avatar-expression-manifest.mjs`, `resolvePsaAvatarExpression.ts`. **New slugs require bible + manifest + identity review.**

**Not in scope:** Prompts, marketing copy, or unauthorized faces.

---

## Introduction

PSA’s **face is the trust interface**—especially at **88px FAB** and **16:9 host**. Expressions must read **luxury, human, and stable**: editorial soft glam ([`makeup.md`](./makeup.md)) with **muscle movement only**, never likeness drift.

This bible defines **how** approved expressions look, **when** to use them, **how intense** they may be, and **how** they continuity-lock across media.

> **Discipline:** Change **expression musculature only**—not hair, jewelry, wardrobe, crop, or identity geometry ([`identity.md`](./identity.md)).

---

## Facial Expression Philosophy

| Principle | Facial consequence |
| --- | --- |
| **Recognition through restraint** | Same woman; small muscle deltas |
| **Luxury = edited emotion** | Rarely exceed **intensity 3/5** |
| **Authenticity** | Asymmetry, eye crinkle, natural teeth |
| **Professional host** | No meme face, no influencer freeze-smile |
| **Guide role** | Face supports member story—not PSA stardom |
| **Cohesion** | Face matches dialogue + voice + body ([`performance-system.md`](./performance-system.md)) |

---

## Recognition Through Expression

Members should identify PSA from **brow + eye + smile grammar** even when hair is cropped:

| Marker | Read |
| --- | --- |
| **Groomed arch brows** | Stable frame |
| **Warm eye engagement** | Concierge |
| **Closed or soft-open smile default** | Calm luxury |
| **No cartoon exaggeration** | Adult host |

---

## Emotional Authenticity

| DO | DON'T |
| --- | --- |
| Micro muscle ramps (6–15 frames) | Snap emoji states |
| Eye smile on real smiles | Mouth-only grin |
| Natural enamel on laugh | Bleached teeth |
| Inner brow on empathy | Pity caricature |

---

## Luxury Emotional Restraint

**PSA rarely exceeds moderate intensity** because:

1. **Trust** — hype faces feel salesy.  
2. **Host permanence** — network anchors don’t mug.  
3. **Education** — clarity beats drama.  
4. **Timelessness** — extreme expressions date (meme surprise, shock face).

**Rule:** Peak celebration **≤ intensity 3** sustained; **≤ 4** for 12–24 frames only.

---

## Expression Intensity Scale (1–5)

| Level | Name | Facial read | PSA usage |
| --- | --- | --- | --- |
| **1** | **Minimal** | Near-neutral; micro brow | Idle, professional |
| **2** | **Subtle** | Soft smile, slight eye bright | Default concierge, listening |
| **3** | **Moderate** | Clear smile, eye crinkle | Teaching, celebrating, confident pick |
| **4** | **Elevated** | Open smile/laugh, strong eyes | **Brief only**—delighted, celebrating peak |
| **5** | **Maximum** | **Forbidden sustained** | Never hold; reject assets |

**Default operating band:** **1–3**. Level **4** = transient peak. Level **5** = **never** in canon PSA.

---

## Eye Language

| Signal | Eyes |
| --- | --- |
| **Trust** | Stable lid; natural sclera |
| **Listen** | Member-direction; soft focus |
| **Teach** | Steady; content or lens |
| **Pick** | Direct; outer crinkle optional |
| **Empathy** | Soft; inner brow synergy |
| **Prohibited** | Huge sclera, doll stare, wink spam |

---

## Eyebrow Language

| Signal | Brows |
| --- | --- |
| **Neutral** | Relaxed groomed arch |
| **Listen** | Neutral-soft |
| **Curious** | One micro lift optional |
| **Concern** | Inner lift |
| **Confident** | Neutral-strong, not angry V |
| **Prohibited** | Spock peak, meme raised brow forever |

---

## Smile Taxonomy

| Type | Muscles | Use |
| --- | --- | --- |
| **Closed gentle** | Soft mouth, eye engagement | Default idle `neutral-smiling` |
| **Open natural** | Upper teeth visible, eye crinkle | Affirm, celebrate brief |
| **Half / boutique** | Curator | `curator`, `red-carpet` |
| **Pressed soft** | Thinking | `thinking` |
| **Open talk** | Slight part | `talking`, explain |
| **Forbidden** | No teeth grimace, influencer over-smile |

---

## Lip Expressions

Per [`identity.md`](./identity.md): **full-natural proportional**—no AI inflation.  
**Vermilion** crisp; **nude-plus** makeup ([`makeup.md`](./makeup.md)).  
**Parted** for explain/talk; **pressed** for think; **sympathetic closed** for concern.

---

## Head Position

| Context | Head |
| --- | --- |
| **Default** | Level |
| **Listen** | Tilt 5–10° |
| **Confident pick** | Chin neutral-up |
| **Laugh** | Slight back **brief** |
| **Prohibited** | Excessive bobble |

---

## Eye Contact

| Context | Gaze |
| --- | --- |
| **FAB/host** | Warm camera/member |
| **Listen** | Off-camera member |
| **Teach** | Content ↔ member alternation |

See [`acting.md`](./acting.md) eye contact rules.

---

## Blink Behavior

| Rule | Standard |
| --- | --- |
| **Rate** | Human normal; not dry stare |
| **Emotion** | Slightly slower on empathy |
| **Animation** | Blink on transition down from peak |
| **AI** | Reject absent blinks in long video |

---

## Listening Expressions

**Primary slug:** `listening`.  
**Face:** tilt, soft mouth, focused eyes.  
**Intensity:** 2.  
**Scenarios:** All consult/discovery ([`behavioral-scenario-library.md`](./behavioral-scenario-library.md)).

---

## Teaching Expressions

**Slugs:** `talking`, `presenting`, `pointing` (with explain face).  
**Face:** steady eyes, slightly parted mouth optional, neutral brows.  
**Intensity:** 2–3.

---

## Greeting Expressions

**Slugs:** `waving`, `neutral-smiling`, `delighted` (brief).  
**Intensity:** 2–3 peak → recover to 2.

---

## Encouragement

**Slugs:** `reassuring`, `neutral-smiling`, `thinking-smiling`.  
**Intensity:** 2.

---

## Curiosity

**Slugs:** `archetype-quiz`, `remembering-ask`.  
**Intensity:** 2–3.

---

## Pride

**Slugs:** `archetype-reveal`, `celebrating` (member win).  
**Intensity:** 3 brief.

---

## Confidence

**Slugs:** `spotlight`, `red-carpet`, `curator`.  
**Intensity:** 3.

---

## Compassion

**Slugs:** `sorry`, `reassuring`, `slay-forecast`.  
**Intensity:** 2–3 soft.

---

## Thoughtfulness

**Slugs:** `thinking`, `thinking-smiling`, `blueprint`.  
**Intensity:** 1–2.

---

## Professional Seriousness

**Slugs:** `honest-pushback`, `blueprint`, `slay-forecast`.  
**Intensity:** 1–2.

---

## Delight

**Slug:** `delighted`.  
**Intensity:** 3–4 **brief** only.

---

## Celebration

**Slug:** `celebrating`.  
**Intensity:** 3 peak → **must** recover to 2.

---

## Reflection

**Slugs:** `remembering`, `memory-locked`.  
**Intensity:** 2.

---

## Transition Expressions

| Transition | Facial path |
| --- | --- |
| **Neutral → teach** | 8-frame brow settle; mouth to part |
| **Teach → listen** | Close mouth soft; tilt |
| **Peak → baseline** | 20–40 frames return to `neutral-smiling` |
| **Pushback → warm** | Through `professional` → `reassuring` |

---

## Neutral Expression

**Slug:** `neutral`.  
**Default FAB closed state.** Intensity **1**. Calm ready—**not** dead mask.

---

## Facial Recovery

After any **≥3** peak:

1. Release brow tension  
2. Close mouth to gentle or neutral  
3. Return eyes to soft engage  
4. Hold `neutral-smiling` for idle  

**Forbidden:** Stuck `celebrating` face for idle.

---

## Camera Awareness

| Crop | Rule |
| --- | --- |
| **88px FAB** | Read at **eyes + brow + mouth corner** |
| **16:9 bust** | Full expression; holographic rim additive only |
| **Macro** | Skin texture per makeup bible |

---

## Close-Up Standards

- Pores visible at hero resolution  
- No lip/nose AI drift  
- Teeth natural when shown  
- Catchlights consistent with scene key  

---

## Animation Standards

| Rule | Detail |
| --- | --- |
| **Ease** | Ease-in/out on all expression changes |
| **Hold** | Minimum 12 frames on slug for readability |
| **Viseme** | Mouth open slugs sync [`talking`] — future viseme doc |
| **No** | Pop between unrelated slugs without transition |

---

## Expression Continuity

| Rule | Detail |
| --- | --- |
| **Slug set locked** | Only manifest slugs |
| **Same makeup/hair/jewelry** | Per identity discipline |
| **Crossfade** | App crossfade between slugs; no identity morph |
| **404** | Fallback `neutral` per psaConfig |

---

## Prohibited Expressions

| Prohibited | Why |
| --- | --- |
| Exaggerated surprise (jaw drop) | Meme / intensity 5 |
| Influencer freeze-smile | Uncanny |
| **Constant smiling** | Untrustworthy |
| Dramatic sadness | Wrong genre |
| Fake excitement | Salesy |
| Aggressive anger | Not concierge |
| Caricature / chibi | Identity violation |
| Wink, tongue, eye roll | Trend / rude |
| Filter-face geometry change | Identity violation |

---

## Facial Performance Across Media

| Medium | Standard |
| --- | --- |
| **Photography** | Hold slug peak; identity lock |
| **Commercials** | Underplay; brief peaks |
| **TV Lounge** | Host 2–3 band |
| **Interactive AI** | Slug PNG + crossfade |
| **Animation** | This bible + timing from acting |
| **Tutorials** | `teaching`/`talking` family |
| **Social** | Crop-safe; intensity 2 |
| **Founder comms** | Listen tilt; subordinate to founder |
| **Future** | Performance Decision Framework |

---

## Expression Library (Production Slugs)

Each entry: **Purpose · Eyes · Brows · Smile · Lips · Jaw · Head · Breath · Psychology · Restraint · Usage · Situations · Continuity**

---

### `neutral`

| Field | Spec |
| --- | --- |
| **Purpose** | Idle ready state |
| **Eyes** | Soft focus camera |
| **Brows** | Relaxed natural arch |
| **Smile** | Closed relaxed |
| **Lips** | Soft closed |
| **Jaw** | Relaxed |
| **Head** | Level |
| **Breath** | Even |
| **Psychology** | Calm competence |
| **Restraint** | **1** |
| **Usage** | FAB default closed; recovery target |
| **Situations** | Between beats |
| **Continuity** | Fallback asset |

---

### `neutral-smiling`

| Field | Spec |
| --- | --- |
| **Purpose** | Default concierge idle |
| **Eyes** | Bright engaged |
| **Brows** | Soft lift |
| **Smile** | Closed gentle |
| **Intensity** | **2** |
| **Usage** | Primary idle when chat friendly |
| **Situations** | Most member interactions |
| **Continuity** | Default after welcome |

---

### `waving`

| Field | Spec |
| --- | --- |
| **Purpose** | Welcome (with hand) |
| **Eyes** | Warm direct |
| **Smile** | Open friendly |
| **Head** | Micro nod |
| **Intensity** | **2–3** |
| **Usage** | First welcome UI |
| **Situations** | First unlock, host hello |
| **Continuity** | Pair [`gesture.md`](./gesture.md) wave |

---

### `listening`

| Field | Spec |
| --- | --- |
| **Purpose** | Active attention |
| **Eyes** | Member direction |
| **Brows** | Neutral-soft |
| **Smile** | Tiny or closed soft |
| **Head** | **Tilt 5–10°** |
| **Intensity** | **2** |
| **Situations** | Discovery, upset member, consult |

---

### `thinking`

| Field | Spec |
| --- | --- |
| **Purpose** | Processing |
| **Eyes** | Slightly down |
| **Brows** | Neutral pinch |
| **Lips** | Gently pressed |
| **Head** | Still |
| **Intensity** | **1–2** |
| **Situations** | Before pick, blueprint |

---

### `thinking-smiling`

| Field | Spec |
| --- | --- |
| **Purpose** | Warm processing |
| **Eyes** | Soft down or up |
| **Smile** | Closed gentle |
| **Intensity** | **2** |
| **Situations** | Positive planning |

---

### `delighted`

| Field | Spec |
| --- | --- |
| **Purpose** | Positive surprise |
| **Eyes** | Bright widen then normalize |
| **Smile** | Open controlled |
| **Intensity** | **3–4 brief** |
| **Situations** | Good news beat |
| **Continuity** | Must recover quickly |

---

### `sorry`

| Field | Spec |
| --- | --- |
| **Purpose** | Empathy / soft regret |
| **Eyes** | Soft caring |
| **Brows** | Inner lift |
| **Smile** | Closed sympathetic |
| **Intensity** | **2** |
| **Situations** | Service recovery, bad news |

---

### `talking`

| Field | Spec |
| --- | --- |
| **Purpose** | Mid-speech sync |
| **Mouth** | Slightly open |
| **Eyes** | Engaged steady |
| **Intensity** | **2** |
| **Situations** | Video, explain |

---

### `pointing` / `presenting`

| Field | Spec |
| --- | --- |
| **Purpose** | Guide attention (with hands) |
| **Face** | Teaching or confident soft |
| **Eyes** | Content/direct |
| **Intensity** | **2–3** |
| **Situations** | Demo, recommend |

---

### `remembering` / `remembering-ask` / `memory-locked`

| Field | Spec |
| --- | --- |
| **Purpose** | Personalization memory beats |
| **Face** | Warm knowing → inviting ask → satisfied nod |
| **Intensity** | **2** |
| **Situations** | Memory capture, callbacks |
| **Continuity** | Sparingly per personality |

---

### `curator`

| Field | Spec |
| --- | --- |
| **Purpose** | BLACK / private selection |
| **Smile** | Boutique half-smile |
| **Intensity** | **2–3** |
| **Situations** | Premium collections |

---

### `honest-pushback`

| Field | Spec |
| --- | --- |
| **Purpose** | Respectful disagree |
| **Face** | Professional serious kind |
| **Brows** | Neutral-strong |
| **Intensity** | **2** |
| **Situations** | Talk Me Out Of It, wrong fit |

---

### `archetype-quiz` / `archetype-reveal`

| Field | Spec |
| --- | --- |
| **Purpose** | Quiz interviewer / reveal |
| **Face** | Curious lean-in / proud unveil |
| **Intensity** | **2–3** |

---

### `red-carpet`

| Field | Spec |
| --- | --- |
| **Purpose** | Event host polish |
| **Face** | Glam confident poised |
| **Intensity** | **3** (+10% polish, same psyche) |

---

### `blueprint` / `slay-forecast`

| Field | Spec |
| --- | --- |
| **Purpose** | Plan architect / honest climate |
| **Face** | Focus / expert concern |
| **Intensity** | **2** |
| **Situations** | Event Ready, forecast |

---

### `celebrating`

| Field | Spec |
| --- | --- |
| **Purpose** | Order / milestone win |
| **Smile** | Open joy **restrained** |
| **Intensity** | **3 peak → recover** |
| **Situations** | Order storytelling |

---

### `reassuring`

| Field | Spec |
| --- | --- |
| **Purpose** | Safety calm |
| **Face** | Soft warm steady |
| **Intensity** | **2** |

---

### `spotlight`

| Field | Spec |
| --- | --- |
| **Purpose** | Founder pick conviction |
| **Eyes** | Direct decisive |
| **Chin** | Neutral-up |
| **Intensity** | **3** |
| **Situations** | What Would You Pick |

---

## Conceptual ↔ Slug Map (Identity Bible aliases)

| Identity name | Primary slug(s) |
| --- | --- |
| Greeting | `waving`, `neutral-smiling` |
| Teaching | `talking`, `presenting` |
| Smiling | `neutral-smiling`, `delighted` |
| Laughing | **Rare video only**; brief `delighted` peak—not separate slug unless asset added |
| Curious | `archetype-quiz`, `remembering-ask` |
| Concerned | `sorry`, `reassuring`, `slay-forecast` |
| Excited | `delighted`, `celebrating` |
| Confident | `spotlight`, `red-carpet` |
| Professional | `honest-pushback`, `blueprint` |

**New slug approval:** Founder + ECD + update manifest + this bible + bump `PSA_AVATAR_ASSET_VERSION`.

---

## Quality Assurance Checklist

| # | Question |
| --- | --- |
| 1 | **Likeness** unchanged ([`identity.md`](./identity.md))? |
| 2 | **Approved slug** only? |
| 3 | **Intensity** in band 1–3 (4 brief OK)? |
| 4 | **Luxury restraint**—not mugging? |
| 5 | **Authentic** eye smile when smiling? |
| 6 | **Teeth** natural if visible? |
| 7 | **Cohesive** with dialogue/voice/body? |
| 8 | **FAB readable** at 88px? |
| 9 | **Recovery** to neutral-smiling after peaks? |
| 10 | **Prohibited** expressions absent? |
| 11 | **Makeup** still soft glam ([`makeup.md`](./makeup.md))? |
| 12 | **Timeless** five-year test? |
| 13 | Matches **scenario** intent ([`behavioral-scenario-library.md`](./behavioral-scenario-library.md))? |
| 14 | Passes **Performance Decision Framework**? |

---

## Future Expansion

| Section | Status |
| --- | --- |
| **Turnaround sheets** | _Reserved — per slug orthographic_ |
| **Viseme chart** | _Reserved — phoneme → mouth_ |
| **Blend shape rig** | _Reserved — 3D host_ |
| **Reference video loops** | _Reserved — slug previews_ |
| **Revision log** | See Version History |

### Related documents

| Document | Role |
| --- | --- |
| [`acting.md`](./acting.md) | Timing, micro-expression ramps |
| [`gesture.md`](./gesture.md) | Hand+face combo slugs |
| [`identity.md`](./identity.md) | Summary table + lock |

---

## Version History

| Version | Date | Summary | Approver |
| --- | --- | --- | --- |
| **1.0** | 2026-07-22 | Initial Facial Expression Bible — intensity scale, full slug library | Frontal Slayer Creative |

---

*End of PSA Facial Expression Bible v1.0*
