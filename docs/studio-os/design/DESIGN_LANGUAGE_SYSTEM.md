# Design Language System™

**Version:** 1.0.0  
**Status:** Ratified  
**Parent:** [Studio Design Constitution™](./STUDIO_DESIGN_CONSTITUTION.md)  
**Nature:** Permanent principles — survives complete redesigns

---

> This document defines **how Studio OS should feel** — not how today's UI looks.

---

## 1. Experience Philosophy

Studio OS is experienced as a **living headquarters** — not a dashboard.

| Tenet | Expression |
|-------|------------|
| **Arrival** | Every entry is ceremonial · never "logged in" |
| **Presence** | Intelligence is ambient · surfaces breathe |
| **Depth** | Complexity invisible · power revealed progressively |
| **Continuity** | Marble · glass · light persist across products |
| **Narrative** | Environmental storytelling before explanatory copy |
| **Agency** | Users author · AI collaborates · neither dominates |

---

## 2. Emotional Goals

Every surface should evoke:

| Emotion | Design lever |
|---------|--------------|
| **Calm confidence** | White space · slow motion · no alarm colors |
| **Premium trust** | Material quality · precision alignment |
| **Creative possibility** | Open canvas · soft glow on opportunity |
| **Executive clarity** | Hierarchy · metadata discipline |
| **Warm intelligence** | Conversational tone · not robotic chrome |
| **Respect** | Life & Culture sensitivity · no assumptions |

**Anti-goals:** Anxiety · clutter · cheap novelty · gamification noise · SaaS gray fatigue

---

## 3. Interaction Philosophy

| Principle | Rule |
|-----------|------|
| **Conversation before configuration** | Orb · Director · dialogue precede forms |
| **Direct manipulation second** | Canvas · drag · inline edit when visual |
| **Precision on demand** | Inspectors dock · never permanent sidebars |
| **Keyboard fluency** | Command palette for power users |
| **One focus** | One primary action per viewport moment |
| **Forgiving** | Undo · revert · Remix — never trap |
| **Touch-respectful** | 44px minimum touch · safe areas |

---

## 4. Luxury Philosophy

Luxury in Studio OS is **restraint**, not ornament.

| Luxury is | Luxury is not |
|-----------|---------------|
| Generous space | Dense data walls |
| Material honesty (glass, marble) | Fake skeuomorphism |
| Editorial typography | Display fonts everywhere |
| Slow confident motion | Bouncy micro-interactions |
| Few perfect components | Many mediocre widgets |
| Invisible engineering | Visible complexity |

**Luxury score** is measured in Design Health™ — see [DESIGN_HEALTH.md](./DESIGN_HEALTH.md).

---

## 5. Simplicity Philosophy

| Layer | Simplicity rule |
|-------|-----------------|
| **Default** | Show minimum viable chrome |
| **Progressive** | Reveal depth on intent |
| **Persistent** | Never hide critical state |
| **Recoverable** | Always a path back to calm |

Simplicity ≠ minimalism that hides power. Executives need depth — delivered calmly.

---

## 6. AI Collaboration Philosophy

| Rule | Rationale |
|------|-----------|
| AI proposes · human approves | No silent mutation |
| Critique includes *why* | Creative Director model |
| AI UI uses same components | No "AI skin" |
| Suggestions are ephemeral chips | Not persistent clutter |
| Voice and text equal citizens | Orb-centric |
| Genome constrains tone | Organizational respect |

---

## 7. Spatial Hierarchy

```
Environment (marble · atmosphere)
    ↓
Workspace (floating glass shell)
        ↓
Canvas / Primary content (70–90% viewport)
        ↓
Ephemeral docks (inspector · library · director)
        ↓
HUD metadata (thin · uppercase · peripheral)
        ↓
Studio Orb™ (persistent · bottom-weighted)
```

**Rule:** Primary content owns the center. Chrome never competes.

---

## 8. Information Density

| Context | Density |
|---------|---------|
| Executive overview | Low — scan in 3 seconds |
| Builder canvas | Minimal chrome · content-rich center |
| Inspector | Medium — labeled fields |
| Data tables | High available · progressive columns |
| Mobile | Low — one column · one dock |

**Metadata style:** Thin uppercase · wide letter-spacing · small size — never competes with content headlines.

---

## 9. Typography System

### 9.1 Roles (Permanent)

| Role | Purpose | Survives redesign as |
|------|---------|---------------------|
| **Display** | Hero · editorial moments | Role persists · face may change |
| **UI Label** | Metadata · navigation · buttons | Always uppercase option |
| **Body** | Reading · descriptions | Comfortable · 1.5 leading |
| **Accent** | Human warmth · quotes | Optional script/accent |
| **Monospace** | Code · IDs · registry | Sparse use |

### 9.2 Scale Philosophy

- Modular scale anchored to **content rhythm**, not arbitrary px
- Display may be dramatic · UI labels remain disciplined
- Organization **Design DNA™** may swap display/body families — not UI structural roles

### 9.3 Rules

- Maximum two families per surface (display + UI)
- Line length 45–75 characters for body
- Headlines breathe — margin above > margin below

---

## 10. Color Philosophy

| Layer | Philosophy |
|-------|------------|
| **Environment** | Light · luminous · marble-white base |
| **Brand accent** | Single decisive accent (Studio red canon + org primary) |
| **Semantic** | Red = action/brand · never decorative noise |
| **Glass** | White transparency · not dark mode glass |
| **Text** | Near-black primary · muted metadata |
| **State** | Subtle tint shifts · not saturated badges |

**Dark environments** reserved for cinematic moments (awakening · theater) — not default chrome.

Organization palettes **harmonize** within philosophy — they do not replace OS structure colors.

---

## 11. Motion Philosophy

Motion communicates **state change** and **presence** — never decoration.

| State | Motion character |
|-------|------------------|
| Arrival | Slow fade · blur · scale-in |
| Departure | Faster fade · respect attention |
| Thinking | Pulse · breathe |
| Opportunity | Soft glow · no shake |
| Error | Stillness + clear copy · no frantic animation |

---

## 12. Animation Philosophy

| Category | Guideline |
|----------|-----------|
| **Duration** | 120ms micro · 400–600ms cinematic |
| **Easing** | Ease-out entrances · ease-in exits |
| **Stagger** | 30–50ms for lists — max 5 items |
| **Loop** | Only breathe · loading · ambient |
| **Reduced motion** | Instant cut · no penalty |

Experience DNA™ `motion` slider scales amplitude — never removes accessibility.

---

## 13. Glassmorphism Philosophy

Glass is **architecture** — not a trend overlay.

| Property | Intent |
|----------|--------|
| Frosted blur | Depth separation without walls |
| White transparency | Light passes through |
| Thin border | Crystal edge definition |
| Soft shadow | Float · not elevation cards |
| Layer limit | Max 3 glass layers stacked |

**Anti-pattern:** Illegible glass on glass · contrast failure · dark glass stacks

---

## 14. Lighting Philosophy

Studio OS is **lit from within** — luminous headquarters.

| Concept | Application |
|---------|-------------|
| Ambient fill | Marble environment provides base |
| Crystal refraction | Accent glow on intelligence |
| No harsh shadows | Soft diffuse only |
| Highlight | Top-edge glass catch light |
| Warmth | Optional org atmosphere tint |

---

## 15. White-Space Rules

| Rule | Measurement philosophy |
|------|------------------------|
| **Section breathing** | Minimum 1.5× headline height between sections |
| **Panel padding** | Generous · never cramped forms |
| **Canvas margin** | Content never touches viewport edge |
| **Dock offset** | Float away from canvas — never overlap primary CTA |
| **Mobile** | Maintain breath — reduce columns not padding |

White space is **active design** — not empty failure.

---

## 16. Accessibility Philosophy

| Commitment | Implementation |
|------------|----------------|
| Perceivable | Contrast floors · not color-only state |
| Operable | Keyboard · focus visible · touch targets |
| Understandable | Plain language · consistent patterns |
| Robust | Semantic structure · screen reader labels |

Accessibility is **constitutional** — see Design Health™ accessibility dimension.

Target: WCAG 2.2 AA minimum for all production (Stable channel) surfaces.

---

## 17. Desktop Expression

| Property | Guideline |
|----------|-----------|
| Canvas ratio | 70–90% primary content |
| Docks | Float · right or bottom |
| Multi-panel | Max 2 simultaneous docks |
| Keyboard | Command palette always available |
| Hover | Reveal secondary actions |
| Pointer precision | Dense inspector acceptable |

---

## 18. Tablet Expression

| Property | Guideline |
|----------|-----------|
| Canvas | Full width |
| Docks | Bottom sheets |
| Touch | Primary modality |
| Split | Avoid permanent split views |
| Orb | Safe-area anchored |

---

## 19. Mobile Expression

| Property | Guideline |
|----------|-----------|
| Single focus | One dock · one modal |
| Orb-primary | Radial menu · voice |
| Thumb zone | Actions bottom-weighted |
| Scroll | Content scrolls · chrome fixed minimal |
| Typography | Scale down display · maintain body readability |

---

## 20. Future XR Expression

Reserved principles for spatial computing:

| Principle | Intent |
|-----------|--------|
| **Volumetric glass** | Panels exist in space · not flat overlays |
| **Gaze + gesture** | Orb becomes spatial anchor |
| **Depth hierarchy** | Z-axis = importance |
| **Comfort** | No aggressive parallax |
| **Shared canon** | Same typography roles · spatial layout |

XR rules extend this document via VDR — not separate product style guides.

---

## Survival Across Redesigns

When Studio OS visually reinvents:

| Survives | May change |
|----------|------------|
| All §1–§6 philosophies | Token values |
| Hierarchy model (§7) | Component dimensions |
| Typography roles (§9.1) | Typefaces |
| Color philosophy (§10) | Hex values |
| Motion meaning (§11–§12) | Durations |
| Glass intent (§13) | Opacity recipes |
| Accessibility floor (§16) | Technique |
| Platform expressions (§17–§20) | Layout breakpoints |

---

## References

- [Component Catalog™](./COMPONENT_CATALOG.md) — component application
- [Design Registry™](./DESIGN_REGISTRY.md) — versioned tokens
- [Design Health™](./DESIGN_HEALTH.md) — compliance measurement
- [Experience Architecture](../master-spec/experience-architecture.yaml) — experiential layer

---

*Design Language System™ — permanent feeling · evolvable expression.*
