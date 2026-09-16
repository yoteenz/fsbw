# Astra Test 01 — Astral World World-Entry Screen

**Paste this brief (with the compact pack + references) into ChatGPT Work.**

---

## OBJECTIVE

Create **one** immersive **Astral World world-entry / title-screen** prototype for the flagship district **Astréa**.

---

## BENCHMARK QUESTION

Can you make this feel like **entering Astréa** rather than **visiting a website**?

---

## SCOPE (strict)

| In scope | Out of scope |
|----------|----------------|
| Single opening / lobby / title screen | Full Astral World build |
| Spatial reinterpretation of entry CTAs | Full game, all rooms built |
| Use supplied references + canon docs | Backend rewrite, production auth |
| Preserve functional product truth (routing semantics, entry verbs) | Multiple concept explorations |

---

## USE AS AUTHORITY (in order)

1. **Visual:** REFERENCE A (desktop 1672×941) + REFERENCE B (mobile 941×1672)
2. **World entry composition:** AW_D_01 / AW_M_01 final-composition references (if provided)
3. **Canon docs:** `01`–`12` in this pack
4. **Current code:** functional evidence only — **do not** faithfully reproduce template drift

**Doctrine:** KEEP THE FUNCTION · REBUILD THE LOOK · REFERENCE = DESIGN AUTHORITY

---

## PRESERVE (functional)

- Entry verbs: **Enter Astréa**, three destinations, **Who's Here**, **Take Me Somewhere**, **Find My Reader**, path to **Friends/Journal/Profile**
- Experience routes under `/projects/astral-world/experience/home` (conceptually — your prototype may be standalone HTML/React)
- Distinction: world product, not SITE 00 red chrome homepage
- Social/presence **concepts** (inhabited world, not empty landing)

---

## REINVENT (creative freedom)

- Spatial composition, title-screen choreography, camera/framing
- Where controls live **inside** the environment
- Ambient motion, lighting, depth, transition into first action
- How destinations appear as **places**, not SaaS cards

See `deep-appendix/ASTRA_CREATIVE_FREEDOM.md`

---

## DO NOT

- Build a normal website homepage, SaaS dashboard, or hero+cards landing
- Stack generic feature sections
- Flatten Astréa to a static wallpaper with floating UI
- Invent new destinations beyond Tarot Suite, Astral Mall, Coffee Shop (Astréa)
- Remove reader / friend / presence concepts
- Build entire platform, realtime backend, or expand scope without founder approval

See `deep-appendix/ASTRA_PROHIBITIONS.md`

---

## DELIVERABLES (Test 01 only)

Produce **exactly one** focused response cycle:

1. **One** proposed world-entry experience (single concept)
2. **One** functioning/renderable prototype if the Work environment allows (HTML/CSS/React mock acceptable)
3. **One** visual proof (screenshot or exported frame) — desktop **or** mobile, founder-specified if needed; ideally show both only if zero extra generation cost
4. **Concise** explanation of spatial interaction (how entry verbs are discovered and activated)
5. **No more than one** correction iteration before founder review

**Do not** deliver multiple alternate concepts in Test 01.

---

## BUDGET GUARD (mandatory)

**This is a cost-controlled benchmark.**

- Do not repeatedly regenerate assets
- Do not create dozens of images
- Do not build downstream rooms (Suite/Mall/Coffee interiors)
- Do not create unused systems
- Do not expand scope automatically

Before any substantial scope expansion: **ask the founder.**

---

## SUCCESS CRITERIA (founder review)

The entry screen should communicate:

- Welcome to **Astral World**
- You are entering **Astréa**
- Three destinations exist as **places**
- The world feels **inhabited** (Who's Here / presence signal)
- Clear world verbs: **Take Me Somewhere**, **Find My Reader**, paths to social/journal

Emotional bar: **title screen / lobby**, not **marketing page**.

---

## START MESSAGE (copy below into ChatGPT Work)

```
You are performing a cost-controlled WORLD-INCEPTION benchmark for Astral World.

Read the supplied context pack and visual references before doing anything.

This is NOT a website homepage task. Treat the screen as the opening title / world-entry screen of a living digital world whose flagship district is Astréa.

Preserve documented product functionality and entry verbs (destinations, Who's Here, Take Me Somewhere, Find My Reader, routes to friends/journal/profile).

You MAY radically rethink spatial presentation to match REFERENCE A (desktop) and REFERENCE B (mobile) as independent authorities.

Current React implementation is evidence only — references and screen masters override incorrect layout.

Produce ONE focused prototype, ONE visual proof, and a short spatial interaction explanation. Do not expand scope without my approval.
```
