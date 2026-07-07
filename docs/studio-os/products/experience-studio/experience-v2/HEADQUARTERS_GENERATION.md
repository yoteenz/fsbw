# Headquarters Generation Experience — Part 2

**Version:** 2.0.0  
**Parent:** [EXPERIENCE_STUDIO_2.0_SPEC.md](./EXPERIENCE_STUDIO_2.0_SPEC.md) §3  
**Inherits:** Workspace DNA™ · Design DNA™ · Company Onboarding Intelligence™

---

## Design Intent

HQ generation feels like **watching your business materialize** — not submitting a form.

---

## Discovery Questions

| # | Question | Input type | Maps to |
|---|----------|------------|---------|
| 1 | What kind of world are you building? | Industry chips + freeform | Org identity |
| 2 | What do you create or deliver? | Multi-select offerings | Department seed |
| 3 | How should people feel encountering your brand? | Feeling chips | Experience DNA™ |
| 4 | Whisper luxury or declare it? | Slider · spectrum | Design DNA™ |
| 5 | How immersive should your headquarters feel? | Immersion scale | Experience Engine mode |
| 6 | What must run on day one? | Department checkboxes | Initial staffing |
| 7 | What might you grow into? | Expansion interests | Marketplace seed |

**Skip path:** Industry template pre-fills 4–7 from Knowledge Graph.

---

## Generation Outputs

```yaml
headquartersGeneration:
  outputs:
    campus:
      name: "{Org Name} Headquarters"
      wings: [innovation, operations, knowledge, legacy]
      initialActive: [innovation]
    departments:
      staffed: [creative-direction, development, publishing-preview]
      ghosted: [discover, assembly, intelligence, ...]
    workspaces:
      - creative-wing
      - executive-lobby
    conciergeTeam:
      - role: chief-concierge
      - role: creative-concierge
    aiSpecialists:
      - role: creative-director
      - role: art-director
    suggestedExpansions:
      - production-wing-full
      - marketplace-integrations
```

---

## Magical Moment — Generation Ceremony

| Phase | Duration | Visual | Director copy |
|-------|----------|--------|---------------|
| Intent received | 0ms | Orb → thinking | "Building your campus…" |
| Blueprint | 800ms | Lines draw on marble | "Mapping your wings…" |
| First wing | 600ms | Innovation rises | "Creative Direction Studio is ready." |
| Department lights | 400ms | Stagger 120ms | "Your team is at their stations." |
| Concierge appear | 400ms | Fade at doors | "Your concierges will guide you." |
| Complete | 600ms | Bloom · settle | "Step inside." |

**Skippable:** After 4s · "Enter now" — generation completes in background.

---

## Conversation UX (Not Form UX)

| Form pattern (reject) | Conversation pattern (canonical) |
|-----------------------|----------------------------------|
| 12 fields visible | One glass panel · one question |
| Required asterisks | Director: "This helps me place your departments." |
| Submit button | "Continue" · or voice |
| Validation errors | Director clarifies warmly |
| Progress bar % | Progress dots |

---

## Preview Before Commit

Before finalizing, optional **ghost walk**:

- 15-second camera path through generated campus
- Director narrates what each wing will do
- "Adjust" returns to relevant question — not start over

---

## Post-Generation

| Action | Result |
|--------|--------|
| Enter HQ | Arrival Experience™ (M73.6) |
| Adjust DNA | Executive Office → Design DNA™ (later) |
| Add department | Marketplace or settings — not regen |

---

*Headquarters Generation — conversation that becomes architecture.*
