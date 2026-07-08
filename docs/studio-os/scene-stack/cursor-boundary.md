# Cursor Boundary™

**Interaction Only — Never Visual Architecture**

---

## Law

**Cursor's responsibility begins only after visual layers exist.**

---

## Cursor OWNS (Layers 08–09)

| Responsibility | Technology |
|----------------|------------|
| Interaction hotspots | DOM positioned in world space |
| Camera movement | CSS transform track |
| Orb behavior | Minimal sphere + speech |
| Navigation | Floor nav buttons |
| Animations | State-driven · non-architectural |
| Runtime effects | Vignette · review wash |
| Voice · logic · state | React hooks · stores |

---

## Cursor FORBIDDEN

| Forbidden | Why |
|-----------|-----|
| CSS columns as architecture | Layer 01 job |
| Gradient "walls" | Layer 01 job |
| CSS floating tables as landmarks | Layer 02 job |
| Panel borders as "mission control walls" | Layer 03/04 job |
| Particle divs as atmosphere | Layer 05 job |
| Single-image scene generation | Scene Stack™ law |

**Acceptable CSS:** `backdrop-filter` on **interaction glass panels only** — not environmental structure.

---

## Scene Stack™ Viewport

Cursor composites `<img>` tags per approved layer — **no drawing**.

```tsx
approvedLayers.map(layer => (
  <img className={layer.composeClass} src={layer.publicUrl} />
))
```

---

## Migration Note

Environmental Pass V1 CSS architecture (`CdsZoneShell`, column gradients) is **retired** from active rendering path.

Scene Genesis™ single-plate approach is **superseded**.

---

## Benchmark

> *"If we removed all Cursor CSS, would the room still look like a luxury creative studio?"*

If **yes** (because FAL layers remain) → correct architecture.  
If **no** (because CSS was doing the visual work) → violation.
