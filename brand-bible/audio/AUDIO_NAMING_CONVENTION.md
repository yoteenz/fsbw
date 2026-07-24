# Frontal Slayer Audio Naming Convention

**Document:** AUDIO_NAMING_CONVENTION  
**Version:** 1.0  
**Status:** Canonical  
**Registry:** DOC-AUD-019

---

## 1. File naming pattern

```
{prefix}-{domain}-{descriptor}-{variant}-v{major}.{ext}
```

| Segment | Values | Example |
| --- | --- | --- |
| `prefix` | `fs-brand` \| `fs-score` \| `env` | `fs-brand` |
| `domain` | functional slug | `ui`, `chime`, `arrival`, `mansion` |
| `descriptor` | specific role | `btn-tap`, `full`, `hold` |
| `variant` | optional color | `v1` implicit in version |
| `major` | semver major | `v1` |
| `ext` | `wav`, `aac`, `opus`, `json` | `.wav` |

### Examples

```
fs-brand-chime-full-v1.wav
fs-brand-ui-drawer-open-v1.aac
fs-score-mansion-hold-v1.wav
fs-score-discovery-intro-v1.wav
env-birds-morning-v1.wav
env-city-distant-v1.loop.wav
```

---

## 2. ID vs filename

| Context | Format | Example |
| --- | --- | --- |
| Asset registry ID | kebab, no extension | `fs-brand-chime-full-v1` |
| UI sound slug | SCREAMING-KEBAB | `UI-DRAWER-OPEN` |
| FSCS cue ID | lowercase kebab | `music-main` |
| Theme ID | SCREAMING-KEBAB | `THEME-DISCOVERY` |
| Motif ID | SCREAMING-KEBAB | `MOTIF-DISCOVERY-01` |
| Transition ID | SCREAMING-KEBAB | `TX-CRYSTAL-FADE` |
| Sonic family | SCREAMING-KEBAB | `SF-GLASS` |

---

## 3. Prefix rules (mandatory)

| Prefix | Layer | Brand identity |
| --- | --- | --- |
| `fs-brand-*` | L2 Brand Sonic | Yes |
| `fs-score-*` | L1 Score | Yes |
| `env-*` | L3 Environmental | **No** |

**Forbidden prefixes:** `sfx-`, `ui-` (lowercase alone), `stock-`, `temp-`, `test-` in production paths.

---

## 4. Domain slugs (approved)

### Brand (`fs-brand-*`)

| Domain | Use |
| --- | --- |
| `chime` | Discovery Chime variants |
| `ui` | All interface sounds |
| `tx` | Brand-layer transition stings (rare) |

### Score (`fs-score-*`)

| Domain | Use |
| --- | --- |
| `arrival` | Theme 01 |
| `discovery` | Theme 02 |
| `flagship` | Theme 03 |
| `mansion` | Theme 04 |
| `logo` | End card / logo stems |

### Environmental (`env-*`)

| Domain | Use |
| --- | --- |
| `birds`, `wind`, `city` | Nature / urban |
| `footsteps` | Foley |
| `cafe`, `room-tone`, `door` | Interiors |

---

## 5. Descriptor verbs (UI)

| Verb | Meaning |
| --- | --- |
| `tap` | Press |
| `hover` | Focus/hover |
| `open` / `close` | Stateful panels |
| `confirm` / `error` | Feedback |
| `in` / `out` | Appear/disappear |
| `travel` / `arrive` | Elevator pair |

---

## 6. Version suffix

| Suffix | Meaning |
| --- | --- |
| `-v1`, `-v2` | Major identity version |
| `.loop` | Seamless loop master (environment/score beds) |
| `.stem` | Part of stem export set |
| `.mobile` | Derivative (optional — prefer folder not filename) |

**Do not** use `-final`, `-new`, `-fixed` in production names.

---

## 7. Registry & metadata files

```
brand-bible/audio/registry/
├── audio-asset-registry.yaml       # Master index
├── theme-manifest.yaml             # Theme → stem mapping
├── ui-sonic-manifest.yaml          # UI slug → asset ID
└── fscs-audio-map.yaml             # FSCS cue → asset ID
```

Machine filenames: lowercase kebab only.

---

## 8. Prohibited names

- `click.wav`, `beep.mp3`, `notification.aac` — too generic  
- `luxury-ui-sound-1.wav` — non-deterministic  
- `env-discovery-chime.wav` — Chime is brand, not env  
- Vendor stock filenames without rename  

---

## 9. Rename workflow

1. Propose new ID in registry (status: draft)  
2. Audio Direction approval  
3. Export with final name — never rename in place without registry update  
4. Deprecate old ID if replacing  

---

## 10. Quick reference card

```
Brand UI:     fs-brand-ui-{action}-v1
Chime:        fs-brand-chime-{full|half|micro|tail}-v1
Score theme:  fs-score-{theme}-{part}-v1
Environment:  env-{category}-{descriptor}-v1
UI slug:      UI-{CATEGORY}-{ACTION}
```
