# Frontal Slayer Audio Asset Library

**Document:** AUDIO_ASSET_LIBRARY  
**Version:** 1.0  
**Status:** Canonical — registry architecture (assets TBD)  
**Registry:** DOC-AUD-015

---

## 1. Purpose

Master registry for **every audio asset** in the Frontal Slayer ecosystem. No asset ships without a registry entry.

This document defines **structure, metadata schema, storage layout, and workflow** — not the assets themselves.

---

## 2. Storage architecture (planned)

```
/audio-assets/                          # Production storage (future — not in repo)
├── masters/                            # 48kHz/24-bit WAV
│   ├── brand/                          # fs-brand-*
│   ├── score/                          # fs-score-*
│   └── environmental/                  # env-*
├── deliverables/
│   ├── web/                            # AAC/Opus
│   ├── mobile/                         # AAC + ogg
│   └── film/                           # WAV stems + 5.1 optional
├── stems/                              # Score stem exports
└── registry/
    └── audio-asset-registry.json       # Machine-readable catalog
```

**Repo reference only (v1.0):** `brand-bible/audio/registry/` — YAML/JSON index files as documentation stubs.

---

## 3. Asset layers

| Layer | Prefix | Count (planned v1) | Owner |
| --- | --- | --- | --- |
| Brand Sonic | `fs-brand-*` | ~35 UI + 4 Chime variants | Audio Direction |
| Score | `fs-score-*` | ~25 stems (5 themes × ~5) | Composer |
| Environmental | `env-*` | ~15 beds/foley | Sound designer |

---

## 4. Metadata schema

Every asset entry **must** include:

| Field | Type | Required | Example |
| --- | --- | --- | --- |
| `id` | string | Yes | `fs-brand-ui-btn-tap-v1` |
| `layer` | enum | Yes | `brand` \| `score` \| `environmental` |
| `family` | string | Brand only | `SF-GLASS` |
| `theme` | string | Score only | `THEME-MANSION` |
| `version` | semver | Yes | `1.0.0` |
| `duration_ms` | number | Yes | 180 |
| `lufs_peak` | number | Yes | -26 |
| `lufs_integrated` | number | Score/loop | -28 |
| `loop` | boolean | Yes | false |
| `channels` | enum | Yes | `mono` \| `stereo` |
| `sample_rate` | number | Master | 48000 |
| `tags` | string[] | Yes | `[ui, button, glass]` |
| `fscs_cue_id` | string | Optional | Maps to cinematic system |
| `fds_component` | string | Optional | Maps to design system |
| `status` | enum | Yes | `planned` \| `draft` \| `approved` \| `deprecated` |
| `approved_by` | string | If approved | Founder / Audio Direction |
| `master_path` | string | If exists | `/audio-assets/masters/...` |
| `derivatives` | object | If exists | `{ web: "...", mobile: "..." }` |

---

## 5. Registry index (v1.0 — planned assets)

### 5.1 Brand Sonic — Discovery Chime

| ID | Status |
| --- | --- |
| `fs-brand-chime-full-v1` | planned |
| `fs-brand-chime-half-v1` | planned |
| `fs-brand-chime-micro-v1` | planned |
| `fs-brand-chime-tail-v1` | planned |

### 5.2 Brand Sonic — UI (see UI_SONIC_LANGUAGE)

All `fs-brand-ui-*` IDs listed in UI_SONIC_LANGUAGE §3 — status **planned**.

### 5.3 Score stems (see THEME_LIBRARY)

All `fs-score-*` IDs listed per theme — status **planned**.

### 5.4 Environmental (see ENVIRONMENTAL_AUDIO_LIBRARY)

All `env-*` IDs — status **planned**.

---

## 6. Versioning & deprecation

| Action | Rule |
| --- | --- |
| Patch (v1.0.1) | Level/EQ fix, same identity |
| Minor (v1.1) | New variant, same role |
| Major (v2.0) | Identity change — Founder approval for Chime |
| Deprecate | Keep 12 months; registry `status: deprecated` |

**Never delete** master files — archive to `/audio-assets/archive/`.

---

## 7. Workflow

```
Brief (theme/UI doc)
    ↓
Compose / design
    ↓
Internal QA (Music Bible checklist)
    ↓
Registry entry (status: draft)
    ↓
Mix per MIXING_GUIDELINES
    ↓
Founder listen (Chime + theme stems)
    ↓
Approve → status: approved
    ↓
Export derivatives
    ↓
Implementation handoff (IMPLEMENTATION_STRATEGY)
```

---

## 8. Machine-readable registry (future)

Planned file: `brand-bible/audio/registry/audio-asset-registry.yaml`

Will sync to:

- `src/audio/` runtime loader (future code — not v1.0)  
- FSCS audio cue resolver  
- Studio World experience compiler  
- AI generation pipeline metadata  

---

## 9. Cross-system IDs

| System | ID format | Example |
| --- | --- | --- |
| FSMSS | `fs-brand-*` / `fs-score-*` / `env-*` | `fs-brand-chime-full-v1` |
| FSCS | cue slug | `music-main`, `door-chime` |
| UI_SONIC | sound slug | `UI-BTN-TAP` |

Mapping table maintained in registry YAML — one UI slug → one asset ID.
