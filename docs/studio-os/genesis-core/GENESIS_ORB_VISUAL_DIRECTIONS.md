# Genesis Orb — Three Visual Directions

**Version:** 1.0.0 · For founder review before production implementation

Static SVG prototypes: [`prototypes/`](./prototypes/)

---

## Direction A — Luminous Crystal Nucleus ✦ **RECOMMENDED**

### Concept

Minimal iconic sphere: **bright floating nucleus** inside **milky crystal shell**. Luxury executive intelligence — calm, confident, museum-grade.

### Structure

- Layer 1: Pinpoint warm-white core
- Layer 2: Soft cream diffusion halo
- Layer 3: Milky translucent body
- Layer 4: Thin glossy shell with single curved highlight
- Layer 5: Restrained bloom + 4 particles

### Silhouette

Pure circle with internal glow — reads at 16px as "warm star in glass."

### Evaluation

| Criterion | Score | Notes |
|-----------|-------|-------|
| Uniqueness | ★★★★☆ | Distinct from generic AI orbs; not Xbox |
| Recognizability | ★★★★★ | Simplest memorable form |
| Scalability | ★★★★★ | SVG/CSS native |
| Animation potential | ★★★★☆ | Breathe, compiler fill, audio waves |
| Luxury | ★★★★★ | Executive, restrained |
| Emotional intelligence | ★★★★★ | Calm presence |
| Technical feasibility | ★★★★★ | No WebGL required |
| Mobile performance | ★★★★★ | Best tier compliance |

### Risks

- Can look "simple" if layers poorly tuned — mitigated by 5-layer spec

---

## Direction B — Segmented Genesis Aperture

### Concept

**Original curved shell segments** (3–4 arcs) with internal light visible through gaps — architectural, structural, "Genesis aperture" without X geometry.

### Structure

- Segmented outer plates with gaps at 120° intervals
- Light channels between segments
- Brighter nucleus visible through apertures
- More geometric silhouette

### Silhouette

Circle with subtle triangular negative space — recognizable but busier at small sizes.

### Evaluation

| Criterion | Score | Notes |
|-----------|-------|-------|
| Uniqueness | ★★★★★ | Most architectural |
| Recognizability | ★★★★☆ | Strong at 32px+, weaker at 16px |
| Scalability | ★★★☆☆ | Segment math fragile on low DPI |
| Animation potential | ★★★★☆ | Segment illumination sequence maps to compiler |
| Luxury | ★★★★☆ | Technical luxury |
| Emotional intelligence | ★★★☆☆ | Slightly mechanical |
| Technical feasibility | ★★★☆☆ | More SVG paths, alignment issues |
| Mobile performance | ★★★★☆ | Still SVG-viable |

### Risks

- Segments may read as logo-like at wrong angles
- Higher implementation cost for compiler stage mapping

---

## Direction C — Living Energy Sphere

### Concept

**Organic internal currents** — layered energy flows, concentric rings, more "alive AI presence" while still refined.

### Structure

- Swirling diffusion layers (2–3 offset gradients)
- Concentric inner rings with phase offset
- Higher particle count (8–12)
- Subtle vertical energy axis

### Silhouette

Soft sphere with internal motion blur sensation — less crisp than A.

### Evaluation

| Criterion | Score | Notes |
|-----------|-------|-------|
| Uniqueness | ★★★★☆ | Distinct motion language |
| Recognizability | ★★★☆☆ | Motion-dependent identity |
| Scalability | ★★★☆☆ | Busy when static/small |
| Animation potential | ★★★★★ | Richest motion |
| Luxury | ★★★☆☆ | Risk of "sci-fi UI" |
| Emotional intelligence | ★★★★☆ | Expressive |
| Technical feasibility | ★★★☆☆ | Needs Canvas for best result |
| Mobile performance | ★★★☆☆ | Particle + animation cost |

### Risks

- Generic AI sparkle if overdone
- Reduced-motion fallback loses identity

---

## Comparison matrix

| | A — Nucleus | B — Aperture | C — Energy |
|---|:---:|:---:|:---:|
| Unique | ●●●●○ | ●●●●● | ●●●●○ |
| Small-size legibility | ●●●●● | ●●●○○ | ●●●○○ |
| Mobile | ●●●●● | ●●●●○ | ●●●○○ |
| Compiler stage story | ●●●●○ | ●●●●● | ●●●●○ |
| Luxury executive | ●●●●● | ●●●●○ | ●●●○○ |

---

## Canonical recommendation

### **Direction A — Luminous Crystal Nucleus**

**Rationale:**

1. Best mobile Safari path — layered SVG/CSS matches stack today (no Three.js)
2. Strongest brand recognition at favicon/small radial menu sizes
3. Internal-light sensation matches sprint brief without structural copying
4. Compiler accumulation maps naturally (core brightness fills inward)
5. Direction B aperture lighting can be **optional High-tier enhancement** later without changing silhouette
6. Direction C particle/flow language can inform **thinking/speaking** substates within A

### Hybrid evolution path (post-review)

- **v1:** Direction A full implementation
- **v1.5:** Borrow B's stage-lit aperture accents during `compiling` only
- **v2:** Optional Canvas energy currents for `thinking` (C-inspired), desktop High tier

---

## Review checklist for founder

- [ ] Silhouette approved at 16px, 40px, 80px
- [ ] No Xbox / gaming association
- [ ] Warm ivory — not yellow, not green
- [ ] Compiler accumulation understood
- [ ] Direction A confirmed or redirect to B/C

**Do not ship production `GenesisOrbRenderer` until checklist complete.**
