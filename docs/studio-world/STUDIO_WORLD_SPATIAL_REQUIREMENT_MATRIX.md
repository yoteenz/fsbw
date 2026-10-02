# Studio World — Spatial Requirement Matrix (Audit1)

Columns: **CAPABILITY** · **ACTOR** · **EXISTING SOURCE** · **STATUS** · **SPATIAL REQUIREMENT** · **ACCESS** · **MULTI-COMPANY** · **RESIDENT** · **MARKETING** · **RECOMMENDATION**

| Capability | Actor | Existing source | Status | Spatial requirement | Access | Multi-company | Resident | Marketing | Recommendation |
|------------|-------|-----------------|--------|---------------------|--------|---------------|----------|-----------|----------------|
| Org HQ / Mission Control | Founder | route-registry, mission-control | Partial immersive | BENEFITS_FROM_SPACE | FOUNDER | Per-org HQ | Low | Low | KEEP |
| Grand Atrium arrival | Founder, staff | CompanyGrandAtriumPage | Implemented | REQUIRES_LITERAL_SPACE | ORG | Per company | Medium | Medium | KEEP |
| Creative Direction Studio | Creative team | CDS routes | immersive-live | REQUIRES_LITERAL_SPACE | TEAM | Per company | Medium | Medium | KEEP |
| Studio Warehouse / generation | Production | asset-factory | Partial | REQUIRES_LITERAL_SPACE | TEAM | Shared vendor | Medium | Low | KEEP |
| Distribution / publishing | Marketing | distribution-network | Partial | BENEFITS_FROM_SPACE | TEAM | Per org | Low | HIGH | KEEP |
| Marketplace / packs | Founder | marketplace pavilion | Partial | REQUIRES_LITERAL_SPACE | ORG | Cross-org potential | Low | HIGH | EVOLVE |
| Casting / talent | Production, clients | casting routes + DB | Partial | REQUIRES_LITERAL_SPACE | TEAM | Client scoped | HIGH | MEDIUM | KEEP |
| Partner B2B onboarding | Agency | partnerOnboarding API | Debug | BENEFITS_FROM_SPACE | INVITE | Yes | Low | HIGH | EVOLVE |
| Resident home | Resident | life-os home ref | Logical only | REQUIRES_LITERAL_SPACE | PRIVATE | Per org | HIGH | Low | EVOLVE |
| Resident workplace | Resident | life-os-seed locations | Logical | REQUIRES_LITERAL_SPACE | TEAM | Per org | HIGH | Low | MERGE with dept map |
| Resident commute / movement | Resident | runtime simulation | Logical | BENEFITS_FROM_SPACE | RESIDENT | Per org | HIGH | Low | METAPHOR |
| Background simulation tick | System | life-os/runtime | Implemented | INVISIBLE_SYSTEM | SYSTEM | All | HIGH | Low | OS only |
| Return brief | Founder | return-brief service | Debug UI | UI_ONLY | FOUNDER | Per org | MEDIUM | Low | UI_ONLY |
| Event bus / workflow | System | Systems Dock rooms | Spatialized | SHOULD_REMAIN_UI_ONLY or INVISIBLE | SYSTEM | All | Low | Low | FOUNDER DECISION |
| Experience Lab validation | Founder eng | experience-lab | Active | BENEFITS_FROM_SPACE | FOUNDER | Global | Low | Low | OS lab room |
| World Compiler diagnostics | Eng | __world-compiler-investigation | Debug | INVISIBLE_SYSTEM | SYSTEM | — | — | — | OS |
| SITE 00 creation | Founder | site00 | Live product | REQUIRES_LITERAL_SPACE (SITE00) | FOUNDER | N/A | Low | Medium | SITE00 only |
| Business discovery blueprint | Founder | expedition hub | Partial | BENEFITS_FROM_SPACE | FOUNDER | Per org | Low | Medium | KEEP |
| Org entitlements | System | studio_world_entitlements | Schema | SPATIAL_METAPHOR (unlock) | ORG | Yes | Medium | Medium | EVOLVE |
| Social publishing OAuth | Marketing | social-accounts | Partial | UI_ONLY (connectors) | TEAM | Per org | Low | HIGH | UI_ONLY |
| Executive officer demo rooms | Founder | chief-* pages | Legacy demo | SPATIAL_METAPHOR | FOUNDER | — | Low | Low | DEPRECATE? |
| Knowledge graph / codex | All | knowledge-core, codex | Partial | BENEFITS_FROM_SPACE | ORG | Shared canon | Medium | Medium | KEEP |
| Meetings | Staff | 006_MEETING_SYSTEM.md | Doc + partial | REQUIRES_LITERAL_SPACE | SCHEDULED | Per org | HIGH | MEDIUM | EVOLVE |
| Public events / screenings | All | screening-room, shows | Partial | REQUIRES_LITERAL_SPACE | PUBLIC/TENANT | Cross-org | Medium | HIGH | KEEP |
| Training academy | Humans | studio-institute routes | Implemented | BENEFITS_FROM_SPACE | ROLE | Cross product | MEDIUM | Low | KEEP separate |
| Workforce training (residents) | Human employees | WORKFORCE_TRAINING_SYSTEM | Schema | UI_ONLY / ROOM | COMPLIANCE | Client scoped | HIGH | Low | KEEP |
| Documentary observation | Resident | season1-documentary | Canon | BENEFITS_FROM_SPACE | SYSTEM | Per org | HIGH | Low | METAPHOR |
| Frontal Slayer lounge | Customer | /lobby/lounge | FS live | REQUIRES_LITERAL_SPACE | PUBLIC | N/A | N/A | HIGH | NOT SW |

**Totals (this matrix sample):** REQUIRES_LITERAL_SPACE 12 · BENEFITS_FROM_SPACE 10 · SPATIAL_METAPHOR 3 · UI_ONLY 4 · INVISIBLE_SYSTEM 3 · UNKNOWN 0 (gaps marked in founder queue).

Full capability list extends via `studio-world-concept-registry.json` + `repo-audit/studio-world/05_systems.md`.
