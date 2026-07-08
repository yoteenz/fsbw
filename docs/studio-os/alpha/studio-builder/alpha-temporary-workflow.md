# Alpha Temporary Workflow — Studio Builder™

**Sprint:** Alpha 002  
**Status:** Active until provider API integration  
**Gap:** Studio OS not yet connected to FAL / OpenAI directly

---

## Why This Exists

Alpha proves **orchestration and founder experience** before API automation.

Founder still visits external generator **once per asset** — but never touches docs or prompt assembly.

---

## Temporary Flow

```
[ Generate Environment ]
         ↓
Studio OS ingests all internal knowledge + genomes
         ↓
Studio OS compiles optimized prompt
         ↓
┌─────────────────────────────────────┐
│  PROMPT READY                       │
│                                     │
│  Environment Floor                  │
│                                     │
│  "Polished stone floor, 18×12m     │
│   editorial atelier, wide reflection│
│   …"                                │
│                                     │
│  [ Copy Prompt ]  [ Open Generator ]│
└─────────────────────────────────────┘
         ↓
Founder copies → pastes in FAL (or opens deep link)
         ↓
Founder generates image/mesh externally
         ↓
┌─────────────────────────────────────┐
│  UPLOAD RESULT                      │
│                                     │
│  Drop image or GLB here             │
│                                     │
│  [ Choose File ]                    │
└─────────────────────────────────────┘
         ↓
Studio OS validates
         ↓
✓ Complete → unlock dependents
```

---

## Prompt Ready Surface

| Element | Spec |
|---------|------|
| Title | `{Group} — {Asset display name}` |
| Summary | Human-readable 2–4 sentences |
| Copy button | Copies **full provider-ready** prompt to clipboard |
| Open Generator | Deep link `fal.ai` or configured provider with model hint |
| Technical detail | Collapsed accordion — optional |
| Edit prompt | **Not shown** |

Toast on copy: *"Prompt copied. Paste in your generator."*

---

## Open Generator Behavior

| Provider | Alpha behavior |
|----------|----------------|
| FAL | Open `fal.ai` in new tab · clipboard already has prompt |
| Future config | Org default provider URL |

Does **not** auto-fill FAL form (no API) — founder pastes once.

---

## Upload Result Surface

| Accept | Per asset type |
|--------|----------------|
| PNG · WebP | Textures · plates · previews |
| GLB | Meshes |
| MP3 | Audio (later groups) |

| Reject | Message |
|--------|---------|
| PDF · DOC | "Unsupported format" |
| > 50MB | "File too large" |

Drag-drop + mobile file picker.

---

## Status During External Gen

While founder at FAL:

```
ARCHITECTURE    Awaiting Upload
                Prompt ready — waiting for your image
```

Optional: **I'm still generating** — pauses ETA countdown.

No timeout penalty — founder-paced Alpha.

---

## Multi-Asset Groups

Architecture = 6 assets. Alpha options:

| Mode | UX |
|------|-----|
| **Sequential (default)** | Prompt Ready for `env-shell-cds` first → upload → next asset prompt auto-compiles |
| **Batch prompt (advanced)** | One combined prompt — single upload split later (v0.3) |

Alpha 002: **sequential** — one Prompt Ready at a time per group.

---

## What Studio OS Still Does (Alpha)

| Automated | Manual (founder) |
|-----------|----------------|
| Read all internal docs | — |
| Compile prompt | Paste in FAL |
| Dependency unlock | Upload file |
| Validation | Visit FAL site |
| Queue tracking | — |
| Registry write on approve | — |
| Generation history | — |

**~80% orchestration · ~20% external gen + upload**

---

## Transition Criteria to Future Workflow

Remove temporary workflow when:

- [ ] Provider adapter submit + poll works
- [ ] Artifact download to storage automated
- [ ] Upload UI hidden behind "Manual override"
- [ ] 3 consecutive jobs complete with zero copy/paste

See [future-automation.md](./future-automation.md).

---

## Founder Messaging

Banner on first Generate:

```
Alpha Production: Studio OS prepares your prompt. You'll paste it in FAL once, then upload the result. Full automation is coming.
```

Dismissible · not shown again per department.

---

## Anti-Regression

Forbidden even in Alpha temp workflow:

- Linking to `docs/studio-os/alpha/*.md` for founder to read
- Showing raw manifest JSON as primary UI
- Making founder pick which prompt fragment to use
- Manual dependency unlock toggle

---

_Alpha temporary workflow — one copy, one upload, zero doc hunting._
