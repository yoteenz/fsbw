# Universal Interaction Model™

**Project:** Genesis.md  
**Phase:** Interaction & Relationship Architecture™  
**Status:** Canonical interaction architecture draft for Genesis review  
**Version:** 1.0.0  
**Authority:** Genesis.md  
**Depends on:** Constitutional Core™, Canonical Object Model™  
**Constitutional posture:** Studio World is a living ecosystem. No system may behave as an isolated module when its actions affect another object, citizen, institution, workflow, or body of knowledge.

---

## 0. Doctrine

Every meaningful action in Studio World is an explicit interaction.

Interactions are the verbs of the civilization. Objects define what exists; relationships define how objects are connected; interactions define how connected objects communicate, collaborate, teach, govern, remember, publish, automate, evolve, and recover.

Hidden behavior is architectural debt. If a system talks to another system, changes state, influences a founder, updates knowledge, emits a notification, advances a workflow, publishes canon, grants certification, or changes a relationship, that behavior must be modeled as a canonical interaction.

### 0.1 Interaction rules

1. Every interaction has participants, an initiator, a recipient, inputs, outputs, lifecycle, visibility, auditability, and recovery.
2. Interactions are composable primitives; workflows are built from interactions, not one-off logic.
3. Interactions may be automated, but automation never removes observability or accountability.
4. Events record that something happened; interactions describe the meaningful exchange that produced, consumed, or responded to the event.
5. AI collaboration must use the same interaction model as human and system collaboration.
6. Every interaction must declare what objects it reads, creates, updates, validates, publishes, promotes, archives, or supersedes.
7. If an interaction changes canon, memory, knowledge, authority, state, or relationships, it must be auditable.

---

## 1. Universal Interaction Envelope

Every interaction type uses this envelope.

```yaml
id: string
officialName: string
interactionType: CanonicalInteractionType
purpose: string
participants:
  - objectId: CanonicalObjectId
    role: initiator | recipient | observer | approver | validator | publisher | executor | subject
initiator: CanonicalObjectId
recipient: CanonicalObjectId
inputs:
  - name: string
    sourceObjectId: CanonicalObjectId
    required: boolean
outputs:
  - name: string
    targetObjectId: CanonicalObjectId
    persistence: transient | event | memory | knowledge | canon | archive
lifecycle:
  - requested
  - accepted
  - in_progress
  - completed
  - failed
  - recovered
failureStates:
  - invalid_input
  - unauthorized
  - dependency_missing
  - contradiction
  - timeout
  - rejected
  - partial_completion
recovery:
  strategy: retry | request_clarification | human_review | rollback | archive_and_supersede | manual_resolution
visibility: private | participant-visible | workspace-visible | institution-visible | founder-visible | public | canonical
auditability: none | trace | event | decision-record | review-record | canonical-history
relationships:
  reads: CanonicalObjectId[]
  creates: CanonicalObjectId[]
  updates: CanonicalObjectId[]
  validates: CanonicalObjectId[]
  publishes: CanonicalObjectId[]
  governs: CanonicalObjectId[]
  emits: CanonicalEventId[]
futureExpansion:
  extensionPoints: string[]
  compatibleWith: string[]
```

### 1.1 Interaction invariants

1. `initiator` and `recipient` must be canonical objects.
2. Every interaction must either produce an output, emit an event, update state, or explicitly record no-op reasoning.
3. Failed interactions are still observable when they affect decisions, workflow state, knowledge, canon, permissions, money, certification, or founder experience.
4. No interaction may silently alter a canonical object.
5. Any interaction that produces a recommendation must expose reasoning and source references.
6. Any interaction that produces an approval must preserve approver, authority, and scope.
7. Any interaction that produces publication must trace back to its source object graph.

---

## 2. Universal Interaction Language

The following interaction types form the minimum complete interaction language for Studio World.

### 2.1 Communication interactions

#### 1. Interaction™
- **Official Name™:** Interaction™
- **Purpose:** Base primitive for any intentional exchange between canonical objects.
- **Participants:** Any canonical objects.
- **Initiator:** Object that starts the exchange.
- **Recipient:** Object expected to receive, process, or respond.
- **Inputs:** Intent, context, source object references, permissions.
- **Outputs:** Response, event, state change, artifact, memory, or no-op record.
- **Lifecycle:** Requested -> Accepted -> In Progress -> Completed/Failed -> Audited/Archived.
- **Failure States:** Invalid participant, missing permission, missing dependency, contradiction, timeout.
- **Recovery:** Clarify, retry, route to steward, rollback, or archive failed attempt.
- **Visibility:** Determined by affected object scope.
- **Auditability:** Required when persistent state or canon changes.
- **Relationships:** `connects`, `uses`, `emits`, `updates`, `references`.
- **Future Expansion:** New interaction types inherit this envelope.

#### 2. Conversation™
- **Official Name™:** Conversation™
- **Purpose:** Sustained multi-turn exchange for understanding, guidance, decision support, teaching, or collaboration.
- **Participants:** Founder, Citizen, Orb™, AI Worker, Mentor, Profession Brain, Knowledge Core, Council.
- **Initiator:** Human, AI worker, system, or workflow.
- **Recipient:** One or more participants able to respond.
- **Inputs:** Messages, context, memory, object references, prior turns.
- **Outputs:** Responses, requests, recommendations, decisions, memories, knowledge candidates.
- **Lifecycle:** Opened -> Context Loaded -> Turns Exchanged -> Outcome Identified -> Summarized -> Archived/Converted.
- **Failure States:** Context drift, hallucinated reference, unresolved ambiguity, participant unavailable.
- **Recovery:** Ask clarification, cite sources, summarize state, route to review, archive uncertainty.
- **Visibility:** Participant-visible by default; escalates when decisions or canon emerge.
- **Auditability:** Conversation archive when it informs memory, decisions, canon, or founder preferences.
- **Relationships:** `references` Memory, `guides` Citizen, `creates` Recommendation, `archives` Memory.
- **Future Expansion:** Voice, spatial, multi-agent, council, and simulation conversations.

#### 3. Request™
- **Official Name™:** Request™
- **Purpose:** Formal ask from one object to another for action, information, approval, generation, review, or state change.
- **Participants:** Initiator, recipient, optional approver/observer.
- **Initiator:** Object needing work or information.
- **Recipient:** Object responsible for fulfilling or declining.
- **Inputs:** Request body, priority, constraints, deadline/cadence, source references.
- **Outputs:** Response, accepted work item, rejection, clarification request, event.
- **Lifecycle:** Created -> Routed -> Accepted/Returned -> Fulfilled/Rejected -> Closed.
- **Failure States:** Unclear ask, unavailable recipient, unauthorized request, duplicate, missing dependency.
- **Recovery:** Clarify, reroute, split, defer, cancel, escalate.
- **Visibility:** Initiator and recipient visible; founder-visible when high-impact.
- **Auditability:** Trace by default; event when workflow-affecting.
- **Relationships:** `routes_to`, `requires`, `triggers`, `references`.
- **Future Expansion:** SLA, priority classes, delegation, marketplace fulfillment.

#### 4. Response™
- **Official Name™:** Response™
- **Purpose:** Structured reply to a request, command, question, review, validation, or conversation turn.
- **Participants:** Responder, original initiator, optional observers.
- **Initiator:** Recipient of prior interaction.
- **Recipient:** Original initiator or workflow.
- **Inputs:** Original request, context, evidence, constraints.
- **Outputs:** Answer, artifact, rejection, recommendation, clarification, event.
- **Lifecycle:** Drafted -> Validated -> Delivered -> Acknowledged -> Archived if needed.
- **Failure States:** Incomplete answer, unsupported claim, stale context, invalid recipient.
- **Recovery:** Regenerate, cite sources, ask clarification, mark uncertainty.
- **Visibility:** Mirrors source interaction.
- **Auditability:** Required when response affects decision, state, or canon.
- **Relationships:** `responds_to`, `references`, `validates`, `creates`.
- **Future Expansion:** Multi-format, multimodal, confidence-scored responses.

#### 5. Command™
- **Official Name™:** Command™
- **Purpose:** Directive intended to execute an action or change state.
- **Participants:** Commander, executor, affected object, observer/auditor.
- **Initiator:** Founder, authorized citizen, workflow, AI worker, or system.
- **Recipient:** System, AI worker, workflow, or service.
- **Inputs:** Command phrase/API call, target object, parameters, authority.
- **Outputs:** Action result, event, state change, confirmation, failure reason.
- **Lifecycle:** Issued -> Authorized -> Executed -> Confirmed -> Recorded.
- **Failure States:** Unauthorized, invalid target, unsafe action, dependency missing, execution failed.
- **Recovery:** Deny with reason, request approval, retry, rollback, route to human review.
- **Visibility:** Participant-visible; founder-visible for high-impact commands.
- **Auditability:** Event/trace required for state changes.
- **Relationships:** `triggers` Workflow, `operates` System, `updates` State, `emits` Event.
- **Future Expansion:** Voice command, natural language routing, cross-workspace commands.

### 2.2 Guidance and attention interactions

#### 6. Recommendation™
- **Official Name™:** Recommendation™
- **Purpose:** Suggested action, decision, workflow, learning path, service, or next move with reasoning.
- **Participants:** Recommender, recipient, affected objects.
- **Initiator:** AI worker, Profession Brain, Knowledge Core, system, mentor, council.
- **Recipient:** Founder, citizen, workflow, council, or system.
- **Inputs:** Signals, knowledge, memory, goals, constraints, object graph.
- **Outputs:** Recommended action, rationale, confidence, alternatives, risks.
- **Lifecycle:** Generated -> Explained -> Accepted/Rejected/Deferred -> Learned From.
- **Failure States:** Low confidence, missing evidence, conflict with policy, stale context.
- **Recovery:** Ask for evidence, route to review, lower confidence, suppress recommendation.
- **Visibility:** Recipient-visible; founder-visible when strategic.
- **Auditability:** Trace required; decision-record when accepted for high-impact action.
- **Relationships:** `guides`, `references`, `supports`, `triggers` Request/Decision.
- **Future Expansion:** Multi-agent debate, personalized recommendation memory, marketplace recommendations.

#### 7. Notification™
- **Official Name™:** Notification™
- **Purpose:** Attention object informing a participant that something needs awareness or action.
- **Participants:** Source, recipient, optional action handler.
- **Initiator:** Event, workflow, system, AI worker.
- **Recipient:** Founder, citizen, AI worker, council, system.
- **Inputs:** Event, priority, audience, action, expiry.
- **Outputs:** Delivered message, acknowledgement, action, dismissal, memory if meaningful.
- **Lifecycle:** Created -> Prioritized -> Routed -> Delivered -> Read/Acted/Expired -> Archived.
- **Failure States:** Wrong recipient, notification fatigue, expired action, delivery failure.
- **Recovery:** Reroute, digest, escalate, suppress duplicate, convert to briefing.
- **Visibility:** Recipient-visible; workspace-visible for shared operations.
- **Auditability:** Trace; event if action-bearing.
- **Relationships:** `emitted_by`, `routes_to`, `references`, `triggers`.
- **Future Expansion:** Ambient notifications, digest mode, executive priority model.

#### 8. Executive Advisory™
- **Official Name™:** Executive Advisory™
- **Purpose:** High-context guidance meant to help a founder or executive make a meaningful decision.
- **Participants:** Advisory source, founder/executive, affected departments/systems.
- **Initiator:** Chief of Staff, Orb™, council, intelligence system, workflow.
- **Recipient:** Founder, executive, council.
- **Inputs:** Briefing context, risks, opportunities, history, policies, knowledge.
- **Outputs:** Advisory, reasoning, recommended decision, confidence, follow-up request.
- **Lifecycle:** Detected -> Researched -> Composed -> Delivered -> Accepted/Deferred/Dismissed -> Learned From.
- **Failure States:** Insufficient context, overreach, conflict with founder preference, low confidence.
- **Recovery:** Ask founder, downgrade to notification, route to council, gather evidence.
- **Visibility:** Founder-visible by default.
- **Auditability:** Decision-record when acted on; trace otherwise.
- **Relationships:** `guides` Founder, `references` Briefing, `supports` Decision, `triggers` Mission.
- **Future Expansion:** Cross-company advisory, portfolio advisory, council-generated advisory.

#### 9. Briefing™
- **Official Name™:** Briefing™
- **Purpose:** Synthesized context prepared for orientation, review, decision, or action.
- **Participants:** Briefing compiler, recipient, cited sources.
- **Initiator:** Schedule, event, request, command, workflow.
- **Recipient:** Founder, citizen, council, department, AI worker.
- **Inputs:** Events, signals, memory, knowledge, mission state, metrics, decisions.
- **Outputs:** Summary, priorities, risks, recommendations, citations, next actions.
- **Lifecycle:** Requested/Scheduled -> Compiled -> Validated -> Delivered -> Acted On -> Archived.
- **Failure States:** Source conflict, stale data, missing citations, overloaded summary.
- **Recovery:** Mark uncertainty, refresh sources, split brief, request review.
- **Visibility:** Audience-scoped.
- **Auditability:** Trace; archive when decision-supporting.
- **Relationships:** `composes`, `references`, `guides`, `emits`.
- **Future Expansion:** Daily, mission, council, marketplace, career, and room briefings.

### 2.3 Governance interactions

#### 10. Decision™
- **Official Name™:** Decision™
- **Purpose:** Consequential choice that changes direction, state, policy, architecture, mission, or authority.
- **Participants:** Decision maker, affected objects, advisors, approvers.
- **Initiator:** Founder, council, workflow, system, proposal.
- **Recipient:** Affected object graph.
- **Inputs:** Context, options, tradeoffs, recommendations, policies, evidence.
- **Outputs:** Chosen path, rationale, consequences, event, follow-up actions.
- **Lifecycle:** Framed -> Options Considered -> Decided -> Communicated -> Implemented -> Reviewed.
- **Failure States:** Insufficient authority, missing evidence, contradiction, unclear consequences.
- **Recovery:** Defer, request research, escalate, create ADR, reopen with superseding decision.
- **Visibility:** Depends on impact; founder/canon decisions are highly visible.
- **Auditability:** Decision-record required for architectural, constitutional, economic, or authority decisions.
- **Relationships:** `governs`, `creates` ADR/Policy/Mission, `references`, `supersedes`.
- **Future Expansion:** Decision simulation, council voting, AI challenge rounds.

#### 11. Approval™
- **Official Name™:** Approval™
- **Purpose:** Authority-granting interaction that permits an object, workflow, publication, decision, or state transition.
- **Participants:** Approver, requester, subject object, observers.
- **Initiator:** Request, workflow, review, publication, promotion.
- **Recipient:** Approver with authority.
- **Inputs:** Subject, criteria, evidence, authority scope, risks.
- **Outputs:** Approved/rejected/returned/deferred status, rationale, event.
- **Lifecycle:** Requested -> Reviewed -> Approved/Rejected/Returned -> Recorded -> Enforced.
- **Failure States:** Wrong approver, insufficient evidence, conflict of authority, expired request.
- **Recovery:** Reroute, request evidence, return with notes, escalate.
- **Visibility:** Subject stakeholders; founder-visible when high-impact.
- **Auditability:** Approval record required.
- **Relationships:** `approves`, `validates`, `governs`, `triggers`.
- **Future Expansion:** Threshold approvals, trust-based auto-approval, multi-stage approval.

#### 12. Review™
- **Official Name™:** Review™
- **Purpose:** Structured examination of an object, artifact, workflow, proposal, or decision.
- **Participants:** Reviewer, submitter, subject, optional council.
- **Initiator:** Workflow, proposal, publication request, validation gate.
- **Recipient:** Reviewer or review body.
- **Inputs:** Subject object, criteria, evidence, relationships, prior decisions.
- **Outputs:** Pass/fail/return/defer, notes, required changes, approval candidate.
- **Lifecycle:** Opened -> Assigned -> Evaluated -> Result Recorded -> Follow-up Tracked.
- **Failure States:** Missing criteria, unavailable reviewer, unresolved conflict, incomplete evidence.
- **Recovery:** Return, split review, escalate, request evidence.
- **Visibility:** Review stakeholders; canonical reviews visible to governing institution.
- **Auditability:** Review record required when affecting canon, publication, promotion, or authority.
- **Relationships:** `validates`, `references`, `blocks`, `supports`.
- **Future Expansion:** AI pre-review, council review, peer review, simulation review.

#### 13. Validation™
- **Official Name™:** Validation™
- **Purpose:** Confirms whether an object, relationship, workflow, or output satisfies rules or expectations.
- **Participants:** Validator, subject, rule/policy/spec, owner.
- **Initiator:** Review, workflow gate, compile, registry update, command.
- **Recipient:** Subject object or workflow.
- **Inputs:** Rules, schema, relationship graph, evidence, test results.
- **Outputs:** Valid/invalid result, issues, warnings, blockers, event.
- **Lifecycle:** Triggered -> Checked -> Result Produced -> Block/Pass -> Archived if needed.
- **Failure States:** Rule ambiguity, missing data, broken references, contradiction.
- **Recovery:** Clarify rule, request data, repair reference, route to review.
- **Visibility:** Owner-visible; canon validation visible to institution.
- **Auditability:** Trace by default; review record for canonical gates.
- **Relationships:** `validates`, `blocks`, `references`, `governed_by`.
- **Future Expansion:** Automated validators, World Graph consistency, runtime policy checks.

#### 14. Promotion™
- **Official Name™:** Promotion™
- **Purpose:** Advances an object to a higher lifecycle, maturity, visibility, trust, or canonical status.
- **Participants:** Subject, promoter, validator, approver, affected systems.
- **Initiator:** Review pass, founder approval, maturity signal, workflow.
- **Recipient:** Subject object.
- **Inputs:** Evidence, review result, validation, readiness, approval.
- **Outputs:** New status, event, publication/update, history record.
- **Lifecycle:** Proposed -> Validated -> Approved -> Promoted -> Announced/Compiled.
- **Failure States:** Missing validation, unresolved contradiction, insufficient readiness.
- **Recovery:** Return to review, defer, request evidence, archive failed promotion attempt.
- **Visibility:** Stakeholder-visible; canonical promotion institution-visible.
- **Auditability:** Required.
- **Relationships:** `validates`, `governs`, `compiles_into`, `emits`.
- **Future Expansion:** Capability maturity promotion, AI trust promotion, marketplace promotion.

#### 15. Deprecation™
- **Official Name™:** Deprecation™
- **Purpose:** Marks an object, interaction, workflow, service, or rule as no longer preferred while preserving history.
- **Participants:** Owner, affected dependents, archive, replacement object.
- **Initiator:** Decision, review, policy, supersession, failure signal.
- **Recipient:** Subject object and dependents.
- **Inputs:** Reason, replacement path, affected relationships, migration plan.
- **Outputs:** Deprecated status, event, archive entry, warnings, migration tasks.
- **Lifecycle:** Proposed -> Impact Assessed -> Approved -> Marked Deprecated -> Migrated -> Archived/Superseded.
- **Failure States:** Hidden dependency, no migration path, premature removal.
- **Recovery:** Restore, extend support, create compatibility layer, revise migration.
- **Visibility:** Affected stakeholders; public if external dependency.
- **Auditability:** Required for canonical/public objects.
- **Relationships:** `supersedes`, `archives`, `references`, `blocks`.
- **Future Expansion:** Automated dependency warnings, compatibility matrix.

### 2.4 Publication and knowledge interactions

#### 16. Publication™
- **Official Name™:** Publication™
- **Purpose:** Releases knowledge, canon, article, research, listing, certification, or artifact to an audience.
- **Participants:** Publisher, source object, audience, archive.
- **Initiator:** Approval, workflow, institution, marketplace.
- **Recipient:** Audience or publication surface.
- **Inputs:** Source object, approval, version, audience, metadata.
- **Outputs:** Published artifact, event, citation, archive entry.
- **Lifecycle:** Prepared -> Reviewed -> Approved -> Published -> Indexed -> Versioned/Archived.
- **Failure States:** Missing approval, broken references, audience mismatch, stale version.
- **Recovery:** Unpublish, correct, supersede, republish, archive errata.
- **Visibility:** Audience-scoped; canon publications canonical-visible.
- **Auditability:** Publication record required.
- **Relationships:** `publishes`, `published_by`, `compiles_into`, `archives`.
- **Future Expansion:** Multi-channel publishing, Institute editions, marketplace publishing.

#### 17. Learning™
- **Official Name™:** Learning™
- **Purpose:** Records a participant gaining knowledge, skill, preference, context, or capability.
- **Participants:** Learner, teacher/source, mentor, profession brain, memory.
- **Initiator:** Citizen, AI worker, mentor, simulation, workflow.
- **Recipient:** Learner.
- **Inputs:** Lesson, experience, feedback, scenario, correction, source artifact.
- **Outputs:** Progress, memory, achievement candidate, calibration update.
- **Lifecycle:** Started -> Practiced -> Evaluated -> Reflected -> Stored/Certified.
- **Failure States:** Mislearned pattern, low confidence, missing feedback, outdated material.
- **Recovery:** Correct, retrain, mentor review, mark uncertainty.
- **Visibility:** Learner and steward; founder-visible for AI calibration.
- **Auditability:** Required for AI authority, certification, and institutional memory.
- **Relationships:** `learns_from`, `teaches`, `validates`, `archives`.
- **Future Expansion:** Adaptive learning paths, apprenticeship, profession mastery.

#### 18. Teaching™
- **Official Name™:** Teaching™
- **Purpose:** Delivers structured knowledge, wisdom, guidance, or practice to a learner.
- **Participants:** Teacher, learner, curriculum/artifact, evaluator.
- **Initiator:** Mentor, Institute, Profession Brain, citizen request, workflow.
- **Recipient:** Citizen, AI worker, company, profession participant.
- **Inputs:** Learning objective, learner state, curriculum, scenario.
- **Outputs:** Lesson, exercise, feedback, memory, achievement evidence.
- **Lifecycle:** Planned -> Delivered -> Practiced -> Evaluated -> Adapted.
- **Failure States:** Wrong level, poor evidence, learner confusion, missing practice.
- **Recovery:** Reframe, simplify, simulate, route to mentor, update curriculum.
- **Visibility:** Learner-visible; institution-visible for curriculum improvement.
- **Auditability:** Trace; record when contributing to certification.
- **Relationships:** `teaches`, `guides`, `validates`, `references`.
- **Future Expansion:** Live mentor sessions, AI faculty, career-world curriculum.

#### 19. Knowledge Update™
- **Official Name™:** Knowledge Update™
- **Purpose:** Adds, revises, corrects, or supersedes approved knowledge.
- **Participants:** Source, Knowledge Core, reviewer, affected systems.
- **Initiator:** Review, publication, memory pipeline, research, decision.
- **Recipient:** Knowledge Core or knowledge artifact.
- **Inputs:** New claim, evidence, source, status, relationships.
- **Outputs:** Updated knowledge artifact, event, index change, relationship updates.
- **Lifecycle:** Proposed -> Classified -> Reviewed -> Approved/Rejected -> Published/Archived.
- **Failure States:** Unsupported claim, duplicate, contradiction, wrong status.
- **Recovery:** Request evidence, merge, mark draft, escalate contradiction.
- **Visibility:** Knowledge steward; canonical updates institution-visible.
- **Auditability:** Required.
- **Relationships:** `updates`, `references`, `validates`, `supersedes`.
- **Future Expansion:** Semantic versioning, vector index sync, external knowledge sources.

#### 20. Memory Update™
- **Official Name™:** Memory Update™
- **Purpose:** Captures or updates institutional, founder, AI, workflow, or historical memory.
- **Participants:** Source event/conversation, memory system, reviewer, consumer.
- **Initiator:** Conversation, event, correction, decision, workflow.
- **Recipient:** Memory object or Memory System.
- **Inputs:** Source, extracted insight, confidence, domain, review status.
- **Outputs:** Memory record, candidate knowledge, event, relationship links.
- **Lifecycle:** Captured -> Extracted -> Reviewed -> Stored -> Used/Archived.
- **Failure States:** Sensitive data, incorrect extraction, low confidence, canon confusion.
- **Recovery:** Redact, correct, reject, mark historical, require founder review.
- **Visibility:** Scoped by sensitivity and source.
- **Auditability:** Required when memory informs future behavior.
- **Relationships:** `archives`, `references`, `guides`, `validates`.
- **Future Expansion:** Workspace memory, profession memory, AI calibration memory.

### 2.5 Work, automation, and state interactions

#### 21. Mission™
- **Official Name™:** Mission™
- **Purpose:** Interaction pattern for initiating, coordinating, and completing strategic work.
- **Participants:** Mission owner, contributors, systems, workflows, affected objects.
- **Initiator:** Founder, council, system, recommendation, event.
- **Recipient:** Company, department, workflow, citizen, AI worker.
- **Inputs:** Objective, why, scope, constraints, success signals.
- **Outputs:** Workflows, decisions, artifacts, events, briefings, memories.
- **Lifecycle:** Proposed -> Accepted -> Active -> Reviewed -> Completed/Cancelled -> Archived.
- **Failure States:** Unclear objective, missing owner, blocked dependency, scope drift.
- **Recovery:** Clarify, split, reassign, pause, cancel, archive learnings.
- **Visibility:** Workspace-visible; founder-visible for strategic missions.
- **Auditability:** Mission event stream and decision records.
- **Relationships:** `guides`, `contains`, `uses`, `creates`, `emits`.
- **Future Expansion:** Mission templates, AI delegation, marketplace missions.

#### 22. Workflow™
- **Official Name™:** Workflow™
- **Purpose:** Composes reusable interactions into a repeatable operating sequence.
- **Participants:** Workflow owner, actors, systems, validators, outputs.
- **Initiator:** Mission, command, event, schedule, request.
- **Recipient:** Workflow engine or responsible system.
- **Inputs:** Trigger, objects, actors, rules, state.
- **Outputs:** Completed sequence, artifacts, decisions, events, state changes.
- **Lifecycle:** Triggered -> Planned -> Step Execution -> Validation -> Completion/Failure -> Archive.
- **Failure States:** Step failure, missing actor, invalid state, dependency unavailable.
- **Recovery:** Retry step, branch, compensate, request human review, rollback.
- **Visibility:** Owner and participant-visible; high-impact workflows founder-visible.
- **Auditability:** Event stream required.
- **Relationships:** `contains` Interactions, `uses` Capability, `emits` Event, `updates` State.
- **Future Expansion:** Visual workflows, simulation, automation registry, marketplace workflows.

#### 23. Automation™
- **Official Name™:** Automation™
- **Purpose:** Executes interactions without requiring direct manual action while preserving rules, visibility, and audit.
- **Participants:** Automation owner, trigger source, executor, affected objects.
- **Initiator:** Schedule, event, signal, policy, command.
- **Recipient:** System, workflow, AI worker, service.
- **Inputs:** Trigger, conditions, permissions, parameters, safeguards.
- **Outputs:** Executed action, event, notification, state change, exception.
- **Lifecycle:** Defined -> Authorized -> Armed -> Triggered -> Executed -> Audited -> Tuned.
- **Failure States:** Unsafe condition, missing permission, loop, stale input, unexpected output.
- **Recovery:** Halt, rollback, notify owner, require approval, quarantine.
- **Visibility:** Owner-visible; participant-visible when affecting them.
- **Auditability:** Required.
- **Relationships:** `triggers`, `operates`, `governed_by`, `emits`.
- **Future Expansion:** Trust levels, AI-executed automations, cross-system orchestration.

#### 24. Status Change™
- **Official Name™:** Status Change™
- **Purpose:** Changes the lifecycle, canonical, workflow, mission, publication, or operational state of an object.
- **Participants:** Subject, initiator, validator, observer.
- **Initiator:** Workflow, approval, validation, decision, automation.
- **Recipient:** Subject object.
- **Inputs:** Current state, requested state, authority, rule, rationale.
- **Outputs:** New state, event, notification, history record.
- **Lifecycle:** Requested -> Validated -> Applied -> Emitted -> Recorded.
- **Failure States:** Invalid transition, missing authority, blocked contradiction.
- **Recovery:** Reject, route to approval, restore prior state, archive attempt.
- **Visibility:** Object stakeholders.
- **Auditability:** Required for persistent objects.
- **Relationships:** `updates`, `validates`, `emits`, `governed_by`.
- **Future Expansion:** State machines, maturity states, AI trust states.

#### 25. Synchronization™
- **Official Name™:** Synchronization™
- **Purpose:** Aligns state, knowledge, graph data, compiled outputs, or registries across systems.
- **Participants:** Source, target, synchronizer, validator.
- **Initiator:** Event, schedule, command, compile, registry update.
- **Recipient:** Target system/registry/index.
- **Inputs:** Source version, delta, target state, conflict rules.
- **Outputs:** Synced state, conflict report, event, validation result.
- **Lifecycle:** Detected -> Compared -> Applied/Merged -> Validated -> Recorded.
- **Failure States:** Conflict, stale target, partial sync, schema mismatch.
- **Recovery:** Retry, merge, rollback, manual resolution, create contradiction.
- **Visibility:** System owner; founder-visible only if impact matters.
- **Auditability:** Trace; required when syncing canon, memory, permissions, money, or publication.
- **Relationships:** `updates`, `validates`, `references`, `emits`.
- **Future Expansion:** Multi-workspace sync, World Graph sync, external integrations.

#### 26. Compilation™
- **Official Name™:** Compilation™
- **Purpose:** Transforms canonical source objects into downstream projections.
- **Participants:** Source graph, compiler, validation engine, output target.
- **Initiator:** Command, schedule, publication, canonical promotion.
- **Recipient:** Compile target.
- **Inputs:** Canonical objects, relationships, filters, target schema.
- **Outputs:** Compiled artifact, manifest, warnings/errors, event.
- **Lifecycle:** Started -> Source Resolved -> Validated -> Generated -> Manifested -> Published/Archived.
- **Failure States:** Broken reference, contradiction, invalid target, formatting failure.
- **Recovery:** Block output, report errors, repair graph, rerun.
- **Visibility:** System/institution-visible; founder-visible for canonical releases.
- **Auditability:** Compile manifest required.
- **Relationships:** `compiles_into`, `validates`, `publishes`, `archives`.
- **Future Expansion:** Codex, Institute, Master Spec, World Graph, API, SDK, marketplace projections.

### 2.6 Simulation and relationship evolution interactions

#### 27. Simulation™
- **Official Name™:** Simulation™
- **Purpose:** Runs a modeled scenario to teach, test, forecast, validate, or rehearse.
- **Participants:** Simulator, participants, scenario, evaluator, memory.
- **Initiator:** Learner, mentor, workflow, validation gate, recommendation.
- **Recipient:** Simulation engine or career world.
- **Inputs:** Scenario, rules, participant state, goals, constraints.
- **Outputs:** Outcome, feedback, score, memory, achievement evidence, recommendation.
- **Lifecycle:** Configured -> Run -> Observed -> Evaluated -> Debriefed -> Archived.
- **Failure States:** Invalid scenario, unrealistic rules, missing participant state, unsafe outcome.
- **Recovery:** Adjust scenario, flag limitation, rerun, mentor review.
- **Visibility:** Participant-visible; institution-visible for certification.
- **Auditability:** Required when used for certification, validation, or AI authority.
- **Relationships:** `teaches`, `validates`, `emits`, `archives`.
- **Future Expansion:** Career worlds, workflow testing, council rehearsal, business forecasting.

#### 28. Relationship Update™
- **Official Name™:** Relationship Update™
- **Purpose:** Creates, changes, validates, or removes a relationship between canonical objects.
- **Participants:** Source object, target object, graph steward, validator.
- **Initiator:** Object registration, review, synchronization, decision, workflow.
- **Recipient:** Relationship graph.
- **Inputs:** Source, target, relationship type, rationale, strength, evidence.
- **Outputs:** New/updated/archived relationship, validation result, event.
- **Lifecycle:** Proposed -> Validated -> Applied -> Propagated -> Audited.
- **Failure States:** Missing endpoint, invalid type, contradiction, circular dependency.
- **Recovery:** Reject, request rationale, mark contradiction, archive old edge.
- **Visibility:** Graph/system owner; canonical relationships institution-visible.
- **Auditability:** Required for dependency, governance, supersession, and canon relationships.
- **Relationships:** `connects`, `validates`, `updates`, `emits`.
- **Future Expansion:** Weighted relationships, temporal validity, confidence, World Graph export.

---

## 3. System Communication Architecture

Systems communicate through explicit interactions, not hidden imports, side effects, or private assumptions.

### 3.1 Communication chain example

```text
Orb™
  Request™ / Conversation™
Profession Brain™
  Recommendation™ / Teaching™ / Validation™
Knowledge Core™
  Knowledge Update™ / Reference Resolution
Institute of Knowledge™
  Review™ / Publication™ / Certification™
Codex™
  Compilation™ / Publication™
Founder™
  Decision™ / Approval™ / Command™
Mission™
  Workflow™ / Status Change™ / Event™
Studio Exchange™
  Marketplace Publication™ / Certification™ / Service Request™
```

### 3.2 Communication rules

1. Every cross-system exchange must declare interaction type.
2. Every exchange must identify source object and target object.
3. Every exchange must include permission or authority when it changes state.
4. Every exchange must emit an event when it produces persistent change.
5. Every AI-generated exchange must include reasoning and source references when advising humans or updating knowledge.
6. Every publication exchange must trace source object -> review -> approval -> output.
7. Every marketplace exchange must trace listing -> service/certification/asset -> fulfillment -> event.

### 3.3 Integration boundary

When a subsystem needs another subsystem, it sends an interaction:

```text
System A
  emits Request™
Interaction Router
  validates authority, target, and input
System B
  processes and emits Response™ / Event™ / Failure™
Graph
  records relationship, state, memory, or history if persistent
```

This prevents direct hidden coupling while allowing Studio World to behave as one ecosystem.

---

## 4. Event Philosophy

Events are observable facts that something meaningful happened.

Events are not raw clicks, incidental logs, or private implementation details unless those actions affect canonical state, workflow state, memory, knowledge, money, certification, publication, authority, or founder experience.

### 4.1 Event envelope

```yaml
eventId: string
officialName: string
eventType: string
occurredAt: ISODate
sourceObjectId: CanonicalObjectId
actorObjectId: CanonicalObjectId
affectedObjectIds: CanonicalObjectId[]
interactionId: string
payload: object
visibility: private | workspace | institution | founder | public | canonical
auditLevel: trace | event | history | decision | canon
correlationId: string
causationId: string
```

### 4.2 Canonical event examples

| Event | Meaning |
|-------|---------|
| Mission Created™ | A Mission object was created and accepted into work. |
| Blueprint Published™ | A Blueprint passed review and became available to its audience. |
| Knowledge Approved™ | A Knowledge Artifact moved into approved/canonical knowledge. |
| Certification Earned™ | A Citizen, AI Worker, or Company satisfied certification requirements. |
| Founder Decision™ | Founder made a consequential decision with recorded rationale. |
| Expansion Released™ | Expansion Pack became available or installable. |
| Business Created™ | Company object entered founded/onboarded state. |
| Company Activated™ | Company workspace/headquarters became operational. |
| Memory Updated™ | Memory object was created, corrected, or superseded. |
| Relationship Updated™ | Canonical graph edge was created, changed, or archived. |
| Object Promoted™ | Canonical object advanced status, maturity, or authority. |
| Compilation Completed™ | Source graph compiled to target artifact and manifest. |
| Publication Released™ | Artifact became published to audience. |
| Automation Halted™ | Automation stopped due to safety, policy, or dependency failure. |

### 4.3 Event rules

1. Events are immutable. Corrections create new events.
2. Every event has source, actor, affected objects, correlation, and causation.
3. Events may trigger workflows, notifications, briefings, memory updates, synchronization, or validation.
4. Events that affect canon, authority, money, certification, memory, publication, or state must be auditable.
5. Event names use past-tense meaning: `Mission Created`, `Knowledge Approved`, `Certification Earned`.
6. Event payloads are implementation details; event identity and meaning are canonical.

---

## 5. Workflow Philosophy

Every workflow is a composition of canonical interactions.

Workflows should not invent unique behavior when an existing interaction primitive can represent the step.

### 5.1 Workflow composition pattern

```text
Trigger Event™
  -> Request™
  -> Validation™
  -> Recommendation™ / Review™
  -> Decision™ / Approval™
  -> Command™
  -> Status Change™
  -> Publication™ / Synchronization™
  -> Memory Update™ / Knowledge Update™
  -> Completion Event™
```

### 5.2 Workflow rules

1. A workflow must declare its interaction sequence.
2. Each step must declare participant objects.
3. Branches must be explicit interactions, not hidden conditionals.
4. Failures must become failure states with recovery paths.
5. Long-running workflows must emit observable status changes.
6. Workflows may call AI workers, but AI workers must interact through Request, Response, Recommendation, Review, Validation, Teaching, or Automation primitives.
7. Workflows should be reusable across systems when their interaction sequence is the same.

### 5.3 Example: knowledge-to-publication workflow

```text
Conversation™
  -> Memory Update™
  -> Knowledge Update™
  -> Review™
  -> Approval™
  -> Publication™
  -> Compilation™
  -> Notification™
```

### 5.4 Example: mission workflow

```text
Recommendation™
  -> Mission Created™ Event
  -> Request™
  -> Workflow™
  -> Status Change™
  -> Briefing™
  -> Decision™
  -> Completion Event™
  -> Memory Update™
```

### 5.5 Example: career certification workflow

```text
Teaching™
  -> Simulation™
  -> Validation™
  -> Review™
  -> Approval™
  -> Certification Earned™ Event
  -> Publication™ / Marketplace Eligibility Update
```

---

## 6. Visibility and Audit Doctrine

Visibility answers: who can see this interaction?

Auditability answers: what proof survives?

### 6.1 Visibility levels

| Level | Meaning |
|-------|---------|
| `private` | Only the owning actor/system can see it. |
| `participant-visible` | Direct participants can see it. |
| `workspace-visible` | Relevant workspace/company can see it. |
| `institution-visible` | Governing institution can see it. |
| `founder-visible` | Founder can see it by default. |
| `public` | External/public audience can see it. |
| `canonical` | Canonical record visible in Genesis/Codex/Institute projections. |

### 6.2 Audit levels

| Level | Meaning |
|-------|---------|
| `none` | Ephemeral behavior; no durable effect. |
| `trace` | Debuggable trace or correlation only. |
| `event` | Durable event record. |
| `decision-record` | Rationale and authority preserved. |
| `review-record` | Criteria, reviewer, and outcome preserved. |
| `canonical-history` | Immutable canonical/historical archive. |

### 6.3 Audit triggers

An interaction requires durable audit when it:

- changes canonical truth;
- changes object lifecycle/canonical status;
- changes permissions, authority, trust, certification, or money;
- updates memory or knowledge used by AI;
- publishes or depublishes;
- promotes, deprecates, supersedes, or archives;
- creates a founder-facing recommendation that is acted on;
- changes relationship graph edges that affect dependency, governance, or inheritance.

---

## 7. Failure and Recovery Doctrine

Failure is part of the interaction model, not an exception hidden in implementation.

### 7.1 Standard failure states

| Failure | Meaning |
|---------|---------|
| `invalid_input` | Required input missing or malformed. |
| `unauthorized` | Initiator lacks authority. |
| `dependency_missing` | Required object/system/data unavailable. |
| `contradiction` | Interaction conflicts with canon, policy, graph, or state. |
| `timeout` | Recipient did not complete within expected bounds. |
| `rejected` | Recipient or approver refused the interaction. |
| `partial_completion` | Some outputs succeeded and others failed. |
| `unsafe` | Interaction could violate safety, trust, privacy, or founder intent. |

### 7.2 Recovery strategies

| Strategy | Use when |
|----------|----------|
| `retry` | Failure is transient. |
| `request_clarification` | Intent or input is ambiguous. |
| `human_review` | Authority, judgment, or safety is required. |
| `rollback` | State changed incorrectly and can be restored. |
| `archive_and_supersede` | Historical correction is required. |
| `manual_resolution` | Automated path cannot safely continue. |
| `defer` | Interaction is valid but not ready. |
| `reroute` | Recipient is wrong or unavailable. |

---

## 8. Integration Foundations

The Universal Interaction Model is the foundation for:

- **AI collaboration:** AI workers request, respond, recommend, teach, validate, review, and automate through visible primitives.
- **Founder workflows:** Founder decisions, approvals, commands, advisories, and briefings are explicit interactions.
- **Automation:** Automations are authorized, observable workflows composed of interactions.
- **Knowledge systems:** Memory Update and Knowledge Update interactions preserve provenance and prevent accidental canon.
- **Career Worlds:** Teaching, Learning, Simulation, Certification, Achievement, and Marketplace interactions form professional lives.
- **Marketplace:** Listings, services, certifications, publications, and fulfillment all use traceable interactions.
- **Notifications:** Notifications derive from events and route attention intentionally.
- **Mission system:** Missions coordinate workflows, events, decisions, briefings, and memory.
- **World Graph:** Interactions emit observable graph changes and event edges.
- **Future integrations:** External systems must enter through interaction boundaries, not hidden coupling.

---

## 9. Completion Criteria

The Universal Interaction Model™ is complete when every future workflow can be described as:

```text
Object A
  initiates Interaction Type
Object B
  receives and processes
Rules / Policies / Relationships
  validate
Events
  record what happened
Memory / Knowledge
  preserve what matters
Workflows
  compose interactions
World Graph
  observes relationships and evolution
```

Studio World becomes coherent when every system speaks this shared language.
