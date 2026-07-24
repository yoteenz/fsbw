# Environmental Audio Library

**Document:** ENVIRONMENTAL_AUDIO_LIBRARY  
**Version:** 1.0  
**Status:** Canonical  
**Registry:** DOC-AUD-014  
**Layer:** L3 — **NOT brand identity**

---

## 1. Purpose

Catalog **diegetic environmental audio** that supports realism without becoming Frontal Slayer brand identity. These sounds live in the world — they are not ownable sonic logos.

**Rule:** Environmental assets **never** use the `fs-brand-*` prefix. Use `env-*` prefix only.

---

## 2. Separation from score and brand sonic

| Type | Prefix | Brand? | Example |
| --- | --- | --- | --- |
| Score | `fs-score-*` | Yes | Arrival motif |
| Brand Sonic | `fs-brand-*` | Yes | Discovery Chime |
| Environmental | `env-*` | **No** | Birds, wind |

**Exception:** SET-001 entry bell = Discovery Chime (`fs-brand-chime-full-v1`) — intentional brand crossing at threshold.

---

## 3. Environmental categories

### 3.1 Nature

| Asset ID | Description | Typical use | Loop |
| --- | --- | --- | --- |
| `env-birds-morning-v1` | Soft morning birds, distant | Arrival district, film Act I | Yes |
| `env-wind-light-v1` | Gentle wind, no rumble | Exteriors, flagship approach | Yes |
| `env-wind-urban-v1` | Light urban air movement | Shopping district | Yes |

### 3.2 Urban / city

| Asset ID | Description | Typical use | Loop |
| --- | --- | --- | --- |
| `env-city-distant-v1` | Distant traffic hum, filtered | District approach | Yes |
| `env-city-mid-v1` | Moderate street ambience | Walking sequences | Yes |
| `env-footsteps-concrete-v1` | Single footsteps (foley) | Character walk | No |
| `env-footsteps-marble-v1` | Heels on marble | Flagship interior | No |

### 3.3 Hospitality / retail diegetic

| Asset ID | Description | Typical use | Loop |
| --- | --- | --- | --- |
| `env-cafe-interior-v1` | Espresso, murmur, cup clink | District background | Yes |
| `env-coffee-bell-v1` | Café service bell | **Environmental only** — not UI confirm | No |
| `env-boutique-room-tone-v1` | Quiet retail HVAC + air | Flagship interior bed | Yes |
| `env-door-automatic-v1` | Soft automatic door | SET-001 entry (under Chime) | No |

### 3.4 Interior tone

| Asset ID | Description | Typical use | Loop |
| --- | --- | --- | --- |
| `env-room-tone-soft-v1` | Neutral room tone | Universal bed | Yes |
| `env-room-tone-large-v1` | Large space air | Showroom double-height | Yes |

---

## 4. FSCS cue mapping (reference)

Maps to `FSCS_AUDIO_CUES` in `src/cinematic/` — environmental IDs only:

| FSCS cue ID | Environmental asset |
| --- | --- |
| `ambient-city` | `env-city-distant-v1` |
| `birds` | `env-birds-morning-v1` |
| `wind` | `env-wind-light-v1` |
| `footsteps` | `env-footsteps-concrete-v1` |
| `coffee-bell` | `env-coffee-bell-v1` |
| `room-tone` | `env-room-tone-soft-v1` |
| `door-chime` | **Not environmental** — use Discovery Chime at brand moments; `env-door-automatic-v1` for mechanical layer only |

---

## 5. Mixing environmental audio

| Parameter | Guidance |
| --- | --- |
| Level | −40 to −28 LUFS (see VOLUME_HIERARCHY) |
| Duck under score | −6dB |
| Duck under dialogue | −12dB |
| Duck under Discovery Chime | −3dB (never mute) |
| EQ | Roll off < 80Hz on mobile; no hyped HF |

---

## 6. Sourcing guidelines

| Method | Allowed | Notes |
| --- | --- | --- |
| Original field recording | Preferred | Document location, date |
| Licensed library | Yes | Must not be iconic (no Times Square bed cliché) |
| AI-generated ambience | Conditional | QA for artifacts; no recognizable voices |
| Stock "luxury loop" packs | Discouraged | Often off-brand |

---

## 7. Prohibited environmental usage

- Using café bell as UI confirmation  
- Using birds as notification sound  
- Layering environmental **over** Full Discovery Chime  
- Marketing "our signature bird sound" — **not ownable**  
- Looping footsteps  

---

## 8. Registry metadata (per asset)

```yaml
id: env-birds-morning-v1
layer: environmental
loop: true
duration: 120s
lufs_integrated: -32
tags: [nature, arrival, film-act-1]
brand_identity: false
source: field | library | commission
location: generic  # no real city names in metadata unless film-specific
```

---

## 9. Production status

All environmental assets: **⬜ Planned** — registry structure only in v1.0.
