# Genome Events™ — Milestones Become History

**Module:** `studio.living-company-genome.v1.events`  
**Status:** Permanent chapter recording

---

## Law

> The genome updates whenever meaningful milestones occur. Every event permanently becomes part of company history.

---

## Event Categories

### Origin Events

| Event | DNA Impact | World Eligibility |
|-------|------------|-------------------|
| **Company Founded™** | All strands initialize | Genesis HQ shell |
| **First Headquarters™** | Architectural · Creative | Arrival sequence |
| **Organization Inauguration™** | Leadership · Culture · Brand | Charter display |

---

### Product & Customer Events

| Event | DNA Impact | World Eligibility |
|-------|------------|-------------------|
| **First Product™** | Innovation · Brand · Customer | Product exhibit nook |
| **First Customer™** | Customer · Culture | Customer story seed |
| **100 Customers™** | Customer · Operational | Gallery expansion |
| **1,000 Customers™** | Customer · Brand | Signature Collection™ showroom |

---

### Team & Space Events

| Event | DNA Impact | World Eligibility |
|-------|------------|-------------------|
| **First Employee™** | Culture · Operational | Hiring wing · Talent Observatory™ |
| **First Office™** | Architectural · Culture | Wing unlock |
| **International Expansion™** | Customer · Operational | Globe · timezone displays |

---

### Brand & Creative Events

| Event | DNA Impact | World Eligibility |
|-------|------------|-------------------|
| **Brand Refresh™** | Brand · Creative | Founder Hall™ new chapter · Time Capsule prior brand |
| **Major Launch™** | Brand · Innovation · Customer | Launch Gallery™ · celebration atmosphere |
| **Golden Build™ Certified™** | Creative · Architectural | Department exhibit upgrade |
| **Award™** | Brand · Culture | Wall of Milestones™ |

---

### Business Events

| Event | DNA Impact | World Eligibility |
|-------|------------|-------------------|
| **Patent Filed™** | Innovation | Innovation Museum™ |
| **Funding™** | Leadership · Operational · Architectural | Investor wall · material upgrade tier |
| **Acquisition™** | Leadership · Brand · Culture | Integration corridor · dual-branding period |
| **Expansion™** | Operational · Architectural | New department wing · skyline change |

---

## Event Schema

```yaml
GenomeEvent:
  eventId: string
  type: GenomeEventType
  orgId: string
  title: string
  narrative: string                 # founder-facing story line
  occurredAt: datetime
  recordedAt: datetime
  source: platform | integration | founder | expedition
  strandUpdates:
    - strandId: string
      maturityDelta: number
      chapterId: string
      modifiers: Modifier[]
  artifacts:
    - type: logo | campaign | product | scene | blueprint | document
      ref: string
      capsuleIncluded: boolean
  worldTriggers:
    - evolutionOfferId: string
      eligible: boolean
      earned: boolean
  legacyAnchor:
    quote: string                   # "This was the launch that changed everything."
    locationHint: string            # department · wing · landmark
  immutable: true                   # never delete — archive only
```

---

## Detection Sources

| Source | Examples |
|--------|----------|
| **Platform milestones** | Golden Build certified · department live |
| **Expeditions™** | Stage complete · expedition complete |
| **Integrations** | Stripe MRR tier · employee HRIS count |
| **Founder declared** | With evidence attachment |
| **Memory Engine™** | Confirmed business outcomes |
| **Pulse™** | Customer · revenue thresholds |

---

## Event → Time Capsule

Every significant event triggers **Time Capsule™** snapshot:

```
Genome Event recorded
    ↓
Seal: genome state + active blueprint + HQ snapshot + key scenes
    ↓
Legacy Vault™ stores immutable chapter
```

See [time-capsule.md](./time-capsule.md).

---

## Event Narrative (Legacy Layer™)

Each event may receive a **Legacy Anchor™**:

> *"This was our first logo."*  
> *"This was the room where Version 1 was born."*  
> *"This was the launch that changed everything."*

Anchors bind to **locations** in Studio World™ — architecture becomes storytelling.

---

## Forbidden

| Action | Why |
|--------|-----|
| Delete events | History is permanent |
| Fake events without evidence (when required) | Trust |
| Silent events (no timeline entry) | Founders must see chapters |
| Event without strand update | Incomplete genome |

---

_Genome Events™ — milestones become permanent chapters._
