# Studio OS Dependency Map™

**Project:** Genesis.md  
**Phase:** Dependency Map  
**Status:** Canonical execution blueprint draft for Genesis review  
**Version:** 1.0.0  
**Authority:** Genesis.md  
**Depends on:** Constitutional Core™, Canonical Object Model™, Universal Interaction Model™, Universal Decision Architecture™, Core Systems Blueprint™  
**Constitutional posture:** Studio OS now moves from invention into disciplined execution. Build order must follow dependency truth, not feature excitement.

---

## 0. Doctrine

The Studio OS Dependency Map™ is the master sequencing blueprint for core system implementation.

Its purpose is to answer:

1. Which systems must exist first.
2. Which systems can run independently.
3. Which systems depend on other systems for correctness, authority, context, or data.
4. Which systems should wait until the foundation is stable.
5. Which circular dependency risks must be prevented before implementation begins.

This map does **not** invent new product functionality. It names missing foundation systems only when a requested system cannot be safely implemented without them.

### 0.1 Execution rules

1. Build foundational truth systems before experience systems.
2. Build identity and authority before command, automation, production, marketplace, or generation.
3. Build graph/search/event visibility before intelligent orchestration.
4. Build minimal registries before rich interfaces.
5. Orb™, Atlas™, Company Headquarters™, Career Worlds™, Studio Exchange™, and Simulation Engine™ should consume platform state before they become source-of-truth systems.
6. Analytics Engine™ observes; it must not mutate operational systems.
7. Notification Engine™ signals; it must not own workflow, mission, or decision truth.
8. Experience Engine™ renders and composes experiences; it must not own canonical platform state.

---

## 1. Build phases

| Phase | Name | Purpose | Systems |
|-------|------|---------|---------|
| 0 | Kernel truth | Canonical law, object identity, interactions, decisions, system boundaries | Genesis™, Canonical Object Model™, Universal Interaction Model™, Universal Decision Architecture™, Studio OS Dependency Map™ |
| 1 | Knowledge substrate | Shared source graph, canonical knowledge, retention, discovery backbone | Codex™, Knowledge Core™, World Graph™, Institute of Knowledge™, Knowledge Retention™ |
| 2 | Trust and tenancy | Multi-company identity, ownership, authority, access | Identity Engine™, Permissions Engine™, Company Registry™ |
| 3 | Operational spine | Command, mission, workflow, production coordination, notifications | Command Center™, Mission Control™, Production Board™, Production Orchestrator™, Notification Engine™ |
| 4 | Navigation and executive surfaces | Founder/company operating interfaces consuming stable platform state | Company Headquarters™, Orb™, Atlas™ |
| 5 | Creation substrate | Experience composition, asset truth, recipes, scenes, compiling | Experience Engine™, Asset Registry™, Generation Recipes™, Scene Graph™, World Compiler™, Studio Foundry™ |
| 6 | Intelligence and professions | Research, profession-specific cognition, memory, simulation | Research Engine™, Profession Brains™, Professional Memory™, Simulation Engine™ |
| 7 | Learning and economy surfaces | Career and marketplace product surfaces | Career Worlds™, Studio Exchange™ |
| 8 | Insight optimization | Measurement, reporting, trend detection, prioritization evidence | Search Engine™, Analytics Engine™ |

---

## 2. Full dependency map

**Legend**

- **Priority:** P0 = must build first; P1 = early foundation; P2 = operational layer; P3 = experience/product layer; P4 = postpone until substrate is stable.
- **Risk:** Low / Medium / High / Critical readiness risk.
- **MVV:** Minimum viable version needed before downstream systems can depend on it.

| System | Purpose | Upstream dependencies | Downstream dependents | Data owned | Events emitted | Events consumed | Must never directly depend on | MVV | Risk | Priority | Build phase |
|--------|---------|-----------------------|-----------------------|------------|----------------|-----------------|-------------------------------|-----|------|----------|-------------|
| Genesis™ | Canonical source-of-truth kernel and governance authority. | None | Every system | Canonical articles, proposals, ADRs, review status, compile manifests | Genesis Object Created™, Article Canonicalized™, ADR Accepted™, Compile Completed™ | Proposal Submitted™, Review Completed™ | Product surfaces, marketplace state, generation runtime | Charter + registry + review/ADR pipeline | Low | P0 | 0 |
| Codex™ | Compiled developer/architect knowledge projection from Genesis and canonical sources. | Genesis™, Knowledge Core™ | Institute of Knowledge™, Orb™, Search Engine™, Research Engine™ | Compiled reference entries, API/spec projections, canonical excerpts | Codex Entry Published™, Projection Updated™ | Genesis Compile Completed™, Knowledge Artifact Approved™ | Company Headquarters™, Studio Exchange™, Career Worlds™ | Read-only projection index | Medium | P1 | 1 |
| Institute of Knowledge™ | Learning and publishing institution for canonical knowledge. | Genesis™, Knowledge Core™, Codex™, World Graph™ | Career Worlds™, Profession Brains™, Research Engine™, Orb™ | Curricula, knowledge programs, learning paths, instructional artifacts | Knowledge Program Published™, Curriculum Revised™ | Knowledge Artifact Approved™, Research Finding Approved™ | Studio Exchange™ transactions, Production Orchestrator™ | Publish/read model tied to Knowledge Core | Medium | P2 | 1 |
| Canonical Object Model™ | Universal ontology and relationship envelope for all Studio World objects. | Genesis™ | World Graph™, Identity Engine™, Company Registry™, Asset Registry™, Mission Control™, every registry | Object schemas, object types, relationship language | Object Type Registered™, Object Validated™ | Genesis Article Canonicalized™ | Experience Engine™, Orb™, Analytics Engine™ | Base object envelope + validation | Low | P0 | 0 |
| Universal Interaction Model™ | Shared grammar for interactions, events, commands, workflows, and audit. | Genesis™, Canonical Object Model™ | Command Center™, Mission Control™, Notification Engine™, Production Orchestrator™, Orb™ | Interaction records, event contracts, workflow primitives, audit events | Interaction Submitted™, Event Emitted™, Workflow Advanced™ | Object Validated™, Command Requested™ | Studio Exchange™ revenue logic, Generation Recipes™ | Event bus + command/workflow primitives | Medium | P0 | 0 |
| Universal Decision Architecture™ | Shared reasoning model for recommendations, priorities, confidence, evidence, review, and learning. | Genesis™, Canonical Object Model™, Universal Interaction Model™ | Orb™, Command Center™, Automation/Production systems, Analytics Engine™, Mission Control™ | Decisions, recommendations, priorities, evidence, confidence, audit, learning feedback | Decision Proposed™, Recommendation Delivered™, Priority Ranked™ | Evidence Submitted™, Analytics Signal Raised™ | Experience Engine™ rendering, Studio Exchange™ transaction execution | Decision registry + evidence/confidence model | Medium | P0 | 0 |
| World Graph™ | Relationship graph connecting objects, systems, companies, places, knowledge, missions, and assets. | Canonical Object Model™, Genesis™ | Atlas™, Search Engine™, Knowledge Core™, Company Headquarters™, Orb™, Analytics Engine™ | Graph nodes, graph edges, graph metadata, dependency overlays | Graph Node Added™, Relationship Linked™, Graph Projection Compiled™ | Object Registered™, System Registered™, Knowledge Artifact Approved™ | Analytics Engine™ metrics ownership, Studio Exchange™ transactions | Typed graph nodes/edges + query interface | High | P1 | 1 |
| Identity Engine™ | Trusted identity fabric for humans, AI workers, companies, roles, credentials, and agents. | Canonical Object Model™, Company Registry™ (minimal) | Permissions Engine™, Command Center™, Studio Exchange™, Career Worlds™, Professional Memory™ | Identities, profiles, roles, credentials, affiliations | Identity Created™, Role Assigned™, Credential Linked™ | Company Registered™, Permission Scope Requested™ | Orb™ recommendations, Analytics Engine™ aggregation | Identity records + actor resolver | High | P1 | 2 |
| Permissions Engine™ | Authority, scope, delegation, approval, and access decisions. | Identity Engine™, Universal Decision Architecture™, Genesis™ | Command Center™, Production Orchestrator™, Studio Exchange™, Company Headquarters™, Automation | Policies, grants, denials, scopes, delegations, approval requirements | Permission Granted™, Permission Denied™, Delegation Revoked™ | Identity Updated™, Command Requested™, Risk Raised™ | Command Center™ execution state, marketplace listings | Policy registry + allow/deny evaluator | Critical | P1 | 2 |
| Company Registry™ | System of record for companies, headquarters, departments, workspaces, memberships, and ownership. | Canonical Object Model™, Identity Engine™ (minimal actor link) | Company Headquarters™, Mission Control™, Permissions Engine™, Analytics Engine™, Studio Exchange™ | Company records, departments, memberships, workspace metadata | Company Registered™, Department Created™, Membership Updated™ | Identity Created™, Role Assigned™ | Company Headquarters™ UI state, marketplace transactions | Company envelope + membership graph | High | P1 | 2 |
| Command Center™ | Safe command intake, validation, routing, monitoring, rollback, and audit. | Universal Interaction Model™, Universal Decision Architecture™, Permissions Engine™, Identity Engine™ | Orb™, Company Headquarters™, Production Orchestrator™, Mission Control™, Notification Engine™ | Command history, execution state, approval/rollback metadata | Command Issued™, Command Approved™, Command Executed™, Command Failed™ | Permission Granted/Denied™, Recommendation Delivered™, Workflow Advanced™ | Orb™ conversation memory, Experience Engine™ rendering | Command registry + permission gate + audit trail | Critical | P2 | 3 |
| Company Headquarters™ | Founder/company operating environment and executive surface. | Company Registry™, Command Center™, Mission Control™, World Graph™, Analytics Engine™ (minimal), Permissions Engine™ | Orb™, Atlas™, executives, operators | HQ layout state, executive summaries, room composition, dashboard view state | Headquarters Opened™, Briefing Requested™, Room Entered™ | Mission Advanced™, Metric Updated™, Command Executed™ | Studio Foundry™ generation internals, Studio Exchange™ transaction state | Read-only executive shell with command hooks | High | P3 | 4 |
| Orb™ | Intelligent companion and command interface coordinating systems. | Command Center™, Universal Decision Architecture™, Knowledge Core™, Identity Engine™, Permissions Engine™, World Graph™ | Company Headquarters™, Career Worlds™, Studio Exchange™, operators | Conversation context, intent interpretations, routing metadata, memory candidates | Orb Request Created™, Approval Requested™, Memory Candidate Created™ | Command Resulted™, Recommendation Delivered™, Knowledge Artifact Approved™ | Source-of-truth company data, asset binary storage, marketplace transaction ledger | Intent router + explainable recommendation handoff | Critical | P3 | 4 |
| Atlas™ | Navigational/structural map of Studio OS systems, companies, worlds, rooms, and dependencies. | World Graph™, Search Engine™ (minimal), Company Registry™, Core Systems Registry | Company Headquarters™, Orb™, Career Worlds™ | Map overlays, route metadata, structural navigation state | Route Requested™, Map Layer Opened™, Dependency Viewed™ | Graph Projection Compiled™, Search Submitted™ | Permissions Engine™ policy ownership, Analytics Engine™ metrics computation | Graph-backed map projection | Medium | P3 | 4 |
| Mission Control™ | Mission state, progress, ownership, blockers, outcomes, and learning. | Company Registry™, Universal Interaction Model™, Universal Decision Architecture™, Command Center™, Permissions Engine™ | Company Headquarters™, Orb™, Production Board™, Notification Engine™, Analytics Engine™ | Missions, assignments, blockers, outcomes, lessons | Mission Created™, Mission Advanced™, Blocker Raised™, Mission Completed™ | Command Executed™, Priority Ranked™, Workflow Advanced™ | Company Headquarters™ layout, Studio Exchange™ listings | Mission registry + status workflow | High | P2 | 3 |
| Experience Engine™ | Composes and renders interactive/spatial/product experiences from canonical state. | World Graph™, Identity Engine™, Permissions Engine™, Asset Registry™ (minimal) | Company Headquarters™, Career Worlds™, Studio Exchange™, Studio Foundry™ | Experience definitions, layout composition state, presentation contracts | Experience Opened™, Scene Requested™, Experience Updated™ | Graph Projection Compiled™, Asset Registered™ | Mission truth, command execution, analytics mutation | Renderer contract + experience envelope | High | P3 | 5 |
| Studio Foundry™ | Creation environment for producing worlds, assets, scenes, and generated experiences. | Asset Registry™, Generation Recipes™, Scene Graph™, World Compiler™, Permissions Engine™ | Career Worlds™, Studio Exchange™, Production Orchestrator™ | Foundry project state, creation sessions, output manifests | Foundry Session Started™, Asset Requested™, Build Submitted™ | Recipe Approved™, Asset Registered™, Compile Completed™ | Identity credentials, marketplace transaction ledger | Project/session shell connected to asset + compile pipeline | High | P4 | 5 |
| Asset Registry™ | Source of truth for assets, files, components, provenance, rights, versions, and usage. | Canonical Object Model™, Identity Engine™, Permissions Engine™ | Studio Foundry™, Experience Engine™, Scene Graph™, Studio Exchange™, World Compiler™ | Asset metadata, provenance, versions, licenses, usage references | Asset Registered™, Asset Versioned™, Asset Licensed™ | Identity Verified™, Permission Granted™ | Generation runtime execution, marketplace checkout ledger | Asset metadata registry + provenance | High | P2 | 5 |
| Generation Recipes™ | Reusable generation instructions, constraints, prompts, templates, and review requirements. | Universal Decision Architecture™, Knowledge Core™, Asset Registry™, Permissions Engine™ | Studio Foundry™, Production Orchestrator™, World Compiler™ | Recipes, constraints, input/output specs, review rules | Recipe Created™, Recipe Approved™, Recipe Deprecated™ | Evidence Submitted™, Asset Registered™ | Orb™ conversation memory, Studio Exchange™ listings | Recipe schema + approval workflow | High | P3 | 5 |
| Scene Graph™ | Structured scene/world composition graph for spatial and experience assembly. | World Graph™, Asset Registry™, Experience Engine™ | World Compiler™, Studio Foundry™, Career Worlds™, Simulation Engine™ | Scene nodes, scene edges, placements, environment metadata | Scene Node Added™, Scene Linked™, Scene Graph Validated™ | Asset Registered™, Experience Updated™ | Identity Engine™, marketplace transactions | Scene object model + validator | High | P3 | 5 |
| World Compiler™ | Compiles graph/scene/asset/experience inputs into deployable world outputs. | Scene Graph™, Asset Registry™, Experience Engine™, Generation Recipes™ | Studio Foundry™, Career Worlds™, Studio Exchange™ | Compile manifests, build outputs, validation reports | World Compile Started™, World Compile Completed™, Compile Failed™ | Scene Graph Validated™, Recipe Approved™, Asset Versioned™ | Identity roles, company membership truth | Compile pipeline + manifest output | High | P3 | 5 |
| Studio Exchange™ | Marketplace/economy surface for packaging, listing, selling, licensing, and fulfillment. | Identity Engine™, Permissions Engine™, Company Registry™, Asset Registry™, Search Engine™, Analytics Engine™ (minimal) | Career Worlds™, Studio Foundry™ monetization, external customers | Listings, offers, entitlements, fulfillment state, marketplace pages | Listing Published™, Offer Purchased™, Entitlement Granted™ | Asset Licensed™, Permission Granted™, Search Submitted™ | Command Center™ internal execution, Professional Memory™ private records | Listing/entitlement shell | Critical | P4 | 7 |
| Profession Brains™ | Profession-specific cognition, standards, workflows, examples, and recommendations. | Institute of Knowledge™, Knowledge Core™, Research Engine™, Professional Memory™ | Career Worlds™, Orb™, Simulation Engine™, Studio Foundry™ | Profession models, competency maps, standards, templates | Profession Brain Updated™, Competency Linked™ | Research Finding Approved™, Memory Summarized™ | Marketplace transaction ledger, Company Headquarters™ UI state | Profession model registry | High | P4 | 6 |
| Knowledge Core™ | Canonical knowledge store and retrieval substrate. | Genesis™, Canonical Object Model™, World Graph™ | Codex™, Institute of Knowledge™, Research Engine™, Profession Brains™, Orb™, Search Engine™ | Knowledge artifacts, citations, source status, semantic metadata | Knowledge Artifact Added™, Knowledge Approved™, Knowledge Linked™ | Genesis Article Canonicalized™, Research Finding Submitted™ | Orb™ conversation state, analytics dashboards | Artifact registry + citation model | High | P1 | 1 |
| Research Engine™ | Captures research questions, sources, findings, evidence, and review status. | Knowledge Core™, Codex™, Universal Decision Architecture™ | Institute of Knowledge™, Profession Brains™, Orb™, Analytics Engine™ | Research projects, sources, findings, evidence packages | Research Started™, Finding Submitted™, Finding Approved™ | Knowledge Gap Raised™, Decision Evidence Requested™ | Studio Exchange™ commerce state, Mission execution | Research finding workflow + evidence package | Medium | P3 | 6 |
| Career Worlds™ | Learning/career experience worlds for professions, missions, simulations, and portfolios. | Experience Engine™, Profession Brains™, Identity Engine™, Permissions Engine™, Mission Control™, Asset Registry™ | Studio Exchange™, Professional Memory™, Analytics Engine™ | Career world progress, learner missions, portfolio state, experience state | Career World Entered™, Lesson Completed™, Portfolio Updated™ | Profession Brain Updated™, Mission Completed™, Asset Registered™ | Studio Exchange™ payment ledger, Generation Recipes™ authoring | Minimal learner world shell | Critical | P4 | 7 |
| Simulation Engine™ | Safe what-if environments for decisions, worlds, careers, production, and scenarios. | Universal Decision Architecture™, Scene Graph™, Experience Engine™, Analytics Engine™ (minimal) | Career Worlds™, Orb™, Production Orchestrator™, Research Engine™ | Simulation scenarios, assumptions, outputs, confidence records | Simulation Started™, Simulation Completed™, Scenario Compared™ | Decision Proposed™, Scene Graph Validated™, Metric Updated™ | Permissions policy ownership, marketplace transactions | Scenario runner + result envelope | High | P4 | 6 |
| Professional Memory™ | Long-term profession-specific memory and lessons learned. | Identity Engine™, Knowledge Retention™, Profession Brains™, Knowledge Core™ | Profession Brains™, Career Worlds™, Orb™ | Memory records, lessons, summaries, applicability metadata | Professional Memory Captured™, Lesson Promoted™ | Mission Completed™, Learning Feedback Recorded™ | Search ranking ownership, marketplace transaction state | Memory capture + retrieval envelope | High | P4 | 6 |
| Knowledge Retention™ | Retains, summarizes, ages, promotes, and archives knowledge/memory over time. | Knowledge Core™, Universal Decision Architecture™, Analytics Engine™ (minimal) | Professional Memory™, Orb™, Institute of Knowledge™, Research Engine™ | Retention policies, summaries, archived knowledge, promotion signals | Knowledge Summarized™, Knowledge Archived™, Retention Review Requested™ | Knowledge Artifact Added™, Learning Feedback Recorded™ | Command execution, identity credentials | Retention policy + summary workflow | Medium | P2 | 1 |
| Production Orchestrator™ | Coordinates production execution across recipes, assets, missions, commands, permissions, and compiles. | Command Center™, Permissions Engine™, Mission Control™, Production Board™, Generation Recipes™, Asset Registry™ | Studio Foundry™, World Compiler™, Notification Engine™, Analytics Engine™ | Production runs, job state, execution logs, rollback plans | Production Started™, Step Completed™, Production Failed™, Rollback Requested™ | Command Approved™, Mission Advanced™, Recipe Approved™ | Orb™ conversation memory, marketplace checkout | Run/job coordinator with audit | Critical | P3 | 3 |
| Production Board™ | Operational board for work queues, statuses, blockers, approvals, and production visibility. | Mission Control™, Universal Interaction Model™, Company Registry™, Permissions Engine™ | Production Orchestrator™, Company Headquarters™, Notification Engine™ | Board columns, cards, status views, blocker metadata | Production Card Created™, Status Changed™, Blocker Raised™ | Mission Created™, Workflow Advanced™, Permission Granted™ | Asset binary ownership, generation runtime | Board state + mission links | Medium | P2 | 3 |
| Notification Engine™ | Meaningful alerts, prompts, reminders, digests, and attention orchestration. | Universal Interaction Model™, Identity Engine™, Permissions Engine™, Mission Control™ | Orb™, Company Headquarters™, Career Worlds™, Studio Exchange™ | Notifications, delivery state, preference signals, read/action history | Notification Created™, Notification Delivered™, Notification Acted™ | Mission Advanced™, Command Failed™, Permission Requested™ | Mission truth, decision truth, analytics computation | Notification record + delivery contract | Medium | P2 | 3 |
| Search Engine™ | Finds objects, knowledge, systems, assets, missions, people, and marketplace offerings. | World Graph™, Knowledge Core™, Permissions Engine™, Asset Registry™ (for asset search) | Atlas™, Orb™, Studio Exchange™, Company Headquarters™, Career Worlds™ | Indexes, query history, result metadata, relevance signals | Search Submitted™, Result Opened™, No Result Found™ | Object Registered™, Graph Projection Compiled™, Asset Registered™ | Permissions policy ownership, analytics source-of-truth metrics | Permission-aware object/knowledge index | High | P2 | 8 |
| Analytics Engine™ | Observes events, computes metrics, trends, health, and decision evidence. | Universal Interaction Model™, World Graph™, Mission Control™ (minimal), Company Registry™ | Company Headquarters™, Orb™, Mission Control™, Studio Exchange™, Simulation Engine™ | Metrics, reports, observations, trend summaries, evidence packages | Metric Updated™, Trend Detected™, Risk Signal Raised™, Briefing Generated™ | Event Emitted™, Mission Completed™, Search Submitted™ | Operational mutation in Command Center/Mission Control/Marketplace | Read-only event ingestion + metric snapshots | High | P3 | 8 |

---

## 3. Build order

### 3.1 Strict order

1. **Genesis™**
2. **Canonical Object Model™**
3. **Universal Interaction Model™**
4. **Universal Decision Architecture™**
5. **Core Systems Registry / Studio OS Dependency Map™**
6. **Knowledge Core™**
7. **World Graph™**
8. **Codex™**
9. **Knowledge Retention™**
10. **Identity Engine™**
11. **Company Registry™**
12. **Permissions Engine™**
13. **Mission Control™**
14. **Production Board™**
15. **Command Center™**
16. **Notification Engine™**
17. **Production Orchestrator™**
18. **Search Engine™**
19. **Analytics Engine™**
20. **Company Headquarters™**
21. **Atlas™**
22. **Orb™**
23. **Asset Registry™**
24. **Experience Engine™**
25. **Generation Recipes™**
26. **Scene Graph™**
27. **World Compiler™**
28. **Studio Foundry™**
29. **Research Engine™**
30. **Institute of Knowledge™**
31. **Profession Brains™**
32. **Professional Memory™**
33. **Simulation Engine™**
34. **Career Worlds™**
35. **Studio Exchange™**

### 3.2 Systems that can run independently early

These can be built as minimal registries/services without full downstream product surfaces:

- Genesis™
- Canonical Object Model™
- Universal Interaction Model™
- Universal Decision Architecture™
- Knowledge Core™
- World Graph™
- Codex™
- Knowledge Retention™
- Identity Engine™
- Company Registry™
- Permissions Engine™
- Asset Registry™

### 3.3 Systems that should remain consumers at first

These should initially consume existing registries rather than own deep source-of-truth data:

- Company Headquarters™
- Orb™
- Atlas™
- Experience Engine™
- Studio Foundry™
- Career Worlds™
- Studio Exchange™
- Simulation Engine™
- Analytics Engine™

---

## 4. Systems that must be built first

### 4.1 Non-negotiable foundations

1. **Canonical Object Model™** — without object identity, every registry invents its own envelope.
2. **Universal Interaction Model™** — without events/commands/workflows, cross-system behavior becomes hidden coupling.
3. **Universal Decision Architecture™** — without evidence/confidence/review, Orb, automation, ranking, and command approval become untraceable.
4. **Knowledge Core™** — without source-backed knowledge, Codex, Orb, research, professions, and Institute content fragment.
5. **World Graph™** — without relationships and dependencies, Atlas/Search/Analytics/Orb cannot reason over structure.
6. **Identity Engine™** — without actor identity, permissions and ownership are unsafe.
7. **Company Registry™** — without company/workspace context, Headquarters and missions lack a tenancy boundary.
8. **Permissions Engine™** — without authority, Command Center, production, marketplace, and automation are unsafe.

### 4.2 First production-capable operational layer

After the foundations above:

1. Mission Control™
2. Production Board™
3. Command Center™
4. Notification Engine™
5. Production Orchestrator™

This creates a safe loop:

```text
identity -> permission -> command -> mission/production -> event -> notification -> audit/decision learning
```

---

## 5. Systems that should wait

| Wait system | Why it should wait | Minimum prerequisite stability |
|-------------|--------------------|-------------------------------|
| Orb™ | High risk of becoming an ungoverned super-layer if command, permission, knowledge, and decisions are immature. | Command Center™, Permissions Engine™, Knowledge Core™, World Graph™, Decision Architecture |
| Company Headquarters™ | Risks becoming a dashboard shell with duplicated state. | Company Registry™, Mission Control™, Command Center™, Analytics snapshots |
| Atlas™ | Needs World Graph and Search to avoid becoming a decorative sitemap. | World Graph™, Search Engine™, Company Registry™ |
| Studio Foundry™ | Requires asset, recipe, scene, compile, permissions, and production foundations. | Asset Registry™, Generation Recipes™, Scene Graph™, World Compiler™, Production Orchestrator™ |
| Career Worlds™ | Requires identity, profession brains, missions, experience, assets, and memory. | Identity Engine™, Profession Brains™, Mission Control™, Experience Engine™, Professional Memory™ |
| Studio Exchange™ | Commerce/entitlement risk is high without identity, permissions, assets, search, and analytics. | Identity Engine™, Permissions Engine™, Asset Registry™, Search Engine™, Analytics Engine™ |
| Simulation Engine™ | Depends on stable decision, scene, experience, and analytics models. | Decision Architecture, Scene Graph™, Experience Engine™, Analytics Engine™ |
| Professional Memory™ | Memory quality depends on retention, profession models, identity, and mission outcomes. | Knowledge Retention™, Profession Brains™, Identity Engine™, Mission Control™ |

---

## 6. Circular dependency risks

| Risk | Bad circular dependency | Rule to prevent it |
|------|-------------------------|--------------------|
| Orb as owner | Orb™ ↔ Knowledge Core™ / Command Center™ / Mission Control™ | Orb routes and explains; it never owns source-of-truth data. |
| HQ dashboard sprawl | Company Headquarters™ ↔ Mission Control™ / Analytics Engine™ | HQ displays and commands; mission and metric truth live elsewhere. |
| Permission recursion | Permissions Engine™ ↔ Command Center™ | Permissions authorizes commands; Command Center may request checks but never defines authority. |
| Analytics mutation | Analytics Engine™ ↔ Mission Control™ / Studio Exchange™ / Production Orchestrator™ | Analytics observes and emits evidence; operational systems decide or execute. |
| Experience ownership | Experience Engine™ ↔ World Graph™ / Asset Registry™ / Scene Graph™ | Experience composes/render state; source graph/assets/scenes remain independent. |
| Marketplace ownership drift | Studio Exchange™ ↔ Asset Registry™ / Identity Engine™ | Exchange owns listings/entitlements; assets and identities stay in their registries. |
| Profession memory loop | Professional Memory™ ↔ Profession Brains™ | Profession Brains provide models; Professional Memory stores learned episodes and promotions. |
| Search as authority | Search Engine™ ↔ Permissions Engine™ | Search filters by permissions; permissions are resolved outside search. |
| Production bypass | Production Orchestrator™ ↔ Command Center™ / Permissions Engine™ | Orchestrator runs approved jobs only; it never self-authorizes. |

---

## 7. Missing foundation systems

The requested system list is largely sufficient. These missing foundation boundaries are required as explicit scopes, but they do **not** need to become large new product systems yet:

| Missing foundation | Why it is required | Recommended treatment |
|--------------------|-------------------|-----------------------|
| Core Systems Registry™ | Dependency Map needs a canonical place to register systems, dependencies, boundaries, contracts, lifecycle state. | Already implemented under `src/studio-os-core/genesis/core-systems/`; continue using it. |
| Event Contract Registry™ | Systems need stable event names/payload contracts before Notification/Search/Analytics consume them. | Extend Universal Interaction Model™, not a separate product system. |
| Audit Log / Trace Store | Commands, permissions, decisions, production, marketplace, and automation require traceability. | Keep as shared Interaction/Decision audit infrastructure until scale requires its own store. |
| Policy Schema Registry™ | Permissions Engine needs reusable policy shape before fine-grained authorization. | Build inside Permissions Engine MVP. |
| Entitlement Registry™ | Studio Exchange cannot safely sell/license without entitlement truth. | Build inside Studio Exchange MVP, backed by Identity + Asset Registry. |
| Source/Citation Registry™ | Knowledge Core and Research Engine need citation provenance. | Build inside Knowledge Core MVP. |

No other missing foundation should be introduced until these scopes prove insufficient.

---

## 8. Recommended first 10 implementation sprints

These are implementation sprints after the already-completed Genesis foundations.

| Sprint | Build | Why now | Must include | Must not include |
|--------|-------|---------|--------------|------------------|
| 1 | Knowledge Core™ MVP | Shared source-backed knowledge is prerequisite for Codex, research, Orb, professions. | Artifact registry, source/citation model, approval status, graph links. | Course UI, AI tutoring, marketplace packaging. |
| 2 | World Graph™ MVP | Dependency, navigation, search, Atlas, analytics all require relationships. | Typed nodes/edges, dependency graph, object/system relationships, query helpers. | Decorative maps, spatial UI. |
| 3 | Codex™ Projection MVP | Developers/architects need canonical compiled reference before more systems. | Read-only projections from Genesis/Knowledge Core, index metadata. | Independent wiki editing. |
| 4 | Identity Engine™ MVP | Actor identity is required before permissions, commands, companies, marketplace. | Identity envelope, roles/affiliations, AI worker/person/company actor references. | Full auth provider rewrite. |
| 5 | Company Registry™ MVP | Headquarters, missions, production, analytics need tenancy/company context. | Company, department, membership, workspace boundaries. | Executive dashboard UI. |
| 6 | Permissions Engine™ MVP | Authority must precede commands, production, marketplace, automation. | Policy schema, scope evaluator, approvals, audit event hooks. | Complex enterprise RBAC UI. |
| 7 | Mission Control™ MVP | Work needs mission state before production and headquarters surfaces. | Mission registry, status lifecycle, owner/blocker/outcome fields. | Full project-management replacement. |
| 8 | Production Board™ MVP | Production needs visible queues and blockers before orchestration. | Board/card/status model connected to missions and permissions. | Rich kanban customization. |
| 9 | Command Center™ MVP | Safe command routing is prerequisite for Orb and production automation. | Command registry, permission gate, approval, execution state, rollback metadata. | Autonomous command execution. |
| 10 | Notification Engine™ MVP | Operations need attention signals from missions, commands, permissions, production. | Notification records, priority/audience/channel contracts, read/action events. | Cross-channel delivery complexity. |

---

## 9. What Composer should build next

Composer should build **Knowledge Core™ MVP** next.

### 9.1 Why Knowledge Core first

Knowledge Core is the first missing runtime substrate after the kernel foundations and Core Systems infrastructure:

- Codex™ needs a canonical source projection target.
- Institute of Knowledge™ needs approved artifacts and curricula sources.
- Research Engine™ needs source/evidence storage.
- Profession Brains™ need source-backed knowledge.
- Orb™ needs trusted retrieval before recommendations become credible.
- Search Engine™ and World Graph™ need knowledge nodes and citation relationships.

### 9.2 Scope for next sprint

Build reusable scaffolding only:

1. Knowledge Artifact Registry™
2. Source / Citation Model™
3. Knowledge Relationship Hooks to World Graph™
4. Approval / Review Status lifecycle
5. Batch ingest schema under `genesis/knowledge-core/`
6. Genesis store integration under `GenesisStore.knowledgeCore`
7. Admin tab or section in Genesis workspace
8. Platform guide doc

### 9.3 Do not build yet

- AI tutoring
- Rich course authoring
- Career Worlds UI
- Marketplace knowledge packs
- Orb conversational retrieval
- Research automation

---

## 10. Closing law

Studio OS should build in dependency order:

```text
truth -> knowledge -> graph -> identity -> permission -> mission -> command -> production -> experience -> intelligence -> economy
```

Any sprint that jumps ahead must explicitly prove that its upstream dependencies are either already implemented or intentionally mocked behind stable interfaces.
