# Release Process — Studio OS™

**Version:** 1.0.0  
**Parent:** [Developer Handbook](./README.md)  
**Authority:** Release Channel System™ (CA-001)

---

## Release Channels

| Channel | Audience | Stability | Feature scope |
|---------|----------|-----------|---------------|
| **Stable** | All orgs (default) | Production-grade | Ratified only |
| **Preview** | Opt-in orgs | Early access | Pre-Beta features |
| **Beta** | Opt-in orgs | Near-stable | Feature-complete candidates |
| **Experimental** | Internal / flagged | Unstable | Prototypes · VDR experimental |

**Source:** `master-spec/release-channel-system.yaml` · M127.14

---

## Channel Requirements

| Gate | Stable | Beta | Preview | Experimental |
|------|--------|------|---------|--------------|
| Architecture Validator™ | 0 errors | 0 errors | 0 errors | 0 errors |
| Design Health™ | PASS (≥85) | PASS | WARNING OK (≥70) | N/A |
| Product Health™ | PASS | PASS | WARNING OK | N/A |
| Accessibility | WCAG 2.2 AA | AA | AA plan | Best effort |
| QA sign-off | Required | Required | Required | Internal |
| Founder approval (product) | Required | Required | Required | Optional |
| Experimental components | ❌ | Flagged | Flagged | ✓ |

---

## Release Workflow

```
Development Complete
        ↓
┌───────────────────────────────────┐
│  QA_PROCESS — all checks          │
└───────────────┬───────────────────┘
                ↓
┌───────────────────────────────────┐
│  Product Health™ + Design Health™ │
└───────────────┬───────────────────┘
                ↓
┌───────────────────────────────────┐
│  LAUNCH_CHECKLIST 100%            │
└───────────────┬───────────────────┘
                ↓
┌───────────────────────────────────┐
│  Release Channel Assignment       │
│  (typically Preview first)        │
└───────────────┬───────────────────┘
                ↓
┌───────────────────────────────────┐
│  Org Opt-In Configuration         │
└───────────────┬───────────────────┘
                ↓
┌───────────────────────────────────┐
│  Deploy + Registry Registration   │
└───────────────┬───────────────────┘
                ↓
┌───────────────────────────────────┐
│  Monitor → Feedback → Iterate     │
└───────────────────────────────────┘
```

---

## Channel Promotion

```
Experimental → Preview → Beta → Stable
```

| Promotion | Requires |
|-----------|----------|
| Experimental → Preview | Internal QA · VDR for experimental components |
| Preview → Beta | Design Health™ PASS · 30-day Preview soak |
| Beta → Stable | Product Health™ PASS · full Definition of Done · no critical defects |

**Authority:** Release governance + Founder approval for Stable.

---

## QA Requirements per Channel

| Check | Stable | Beta | Preview |
|-------|--------|------|---------|
| Full QA_TEMPLATE | ✓ | ✓ | P0 only |
| Visual regression | ✓ | ✓ | Flagship |
| Cross-browser | ✓ | ✓ | P0 browsers |
| Cross-device | ✓ | Spot-check | Desktop + mobile |
| Conversation testing | ✓ | ✓ | ✓ |
| Voice testing | If feature | If feature | If feature |
| Security review | ✓ | ✓ | ✓ |
| Performance budgets | ✓ | ✓ | Documented |

---

## Rollback

| Scenario | Action | Data impact |
|----------|--------|-------------|
| Critical bug | Feature flag off | None |
| Channel demotion | Stable → Beta | Users notified |
| Bad publish | Revert to previous version | Draft preserved |
| Bad migration | Restore backup | Possible draft loss |

### Rollback Checklist

- [ ] Feature flag identified and tested
- [ ] Rollback procedure in LAUNCH_CHECKLIST
- [ ] Communication template ready
- [ ] Registry status update path documented
- [ ] Monitoring confirms recovery

---

## Migration

| Type | Process |
|------|---------|
| Storage key version bump | Migration script + rollback |
| Route change | Redirect + deprecation window |
| Component deprecation | VDR migration guide · 2-cycle support |
| Channel default change | Org notification · opt-in preserved |

---

## Versioning

| Artifact | Versioning |
|----------|------------|
| Platform (Foundation) | Frozen v1.1 — governed evolution |
| Design Governance | Semver via VDR |
| Products | Independent semver |
| Release | Channel + product version |
| Storage | `_v{n}` key suffix |

### Release Notes

Required for every channel promotion:
- User-facing changes
- Known limitations
- Channel eligibility
- Breaking changes + migration

---

## Org Configuration

Release Channel assignment is **per organization** via org profile:

| Setting | Effect |
|---------|--------|
| `releaseChannel: stable` | Default features only |
| `releaseChannel: preview` | Preview+ features visible |
| Feature flags | Per-module overrides within channel |

**Module:** M127.14 Release Channel System™

---

## Current Product Channels

| Product / Module | Channel |
|------------------|---------|
| Studio Orb™ | Preview |
| Conversation Engine™ | Preview |
| Voice Mode™ | Preview |
| Experience Studio™ (future) | Preview |
| Design Governance experimental comps | Preview only |

---

## Cross-References

| Document | Path |
|----------|------|
| Release Channel System™ | `release-channel-system.yaml` |
| QA Process | [QA_PROCESS.md](./QA_PROCESS.md) |
| Launch Checklist | `product-starter-pack/LAUNCH_CHECKLIST.md` |
| Definition of Done | `product-starter-pack/DEFINITION_OF_DONE.md` |

---

*Release Process — deliberate rollout · channel gates · safe rollback.*
