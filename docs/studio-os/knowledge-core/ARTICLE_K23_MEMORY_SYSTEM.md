# ARTICLE-K23 — The Memory System™

**Status:** Accepted  
**System:** Studio World Memory System™  
**Graph role:** Conversation Archive™ → Knowledge Extraction™ → Architect Review™ → Knowledge Core™  
**Era:** Era 1 — Knowledge™  
**Approved:** 2026-07-08  

---

## One sentence

**Conversations are history. Knowledge is understanding. Canon is approval. Studio World must never confuse these three.**

---

## Purpose

The Knowledge Core™ must not become a folder of documents.

Studio World needs a living institutional memory that preserves:

- raw conversations,
- extracted understanding,
- founder review,
- approved canon,
- decision lineage,
- historical impact.

The Memory System™ exists so Studio World remembers not only what it knows, but how it learned it.

---

## Four memory layers

### Layer One — Conversation Archive™

Every significant design conversation is preserved exactly as it occurred.

Nothing is rewritten. Nothing is summarized. Nothing is removed.

The archive represents historical record, like Studio World’s Git history.

Purpose:

- recover context,
- review brainstorming,
- study decision evolution,
- recover abandoned ideas,
- revisit previous discussions,
- keep everything searchable.

### Layer Two — Knowledge Ingestion™

After a conversation concludes, Studio World analyzes the archive and extracts:

- architectural decisions,
- design principles,
- Constitution Articles,
- World Bible updates,
- ADR candidates,
- Prompt Standards,
- experience rules,
- engineering implications,
- future opportunities,
- open questions.

Nothing becomes canon automatically.

### Layer Three — Architect Review™

The founder reviews extracted knowledge.

Allowed actions:

- Approve
- Modify
- Reject
- Merge
- Delay

Nothing enters the Knowledge Core™ until approved.

### Layer Four — Knowledge Core™

Only approved knowledge enters the Knowledge Core™.

The Knowledge Core represents Studio World’s canonical memory and source of truth for:

- Orb,
- Mission Control,
- Knowledge Library,
- ADR System,
- World Graph,
- future prompts,
- engineering specifications.

Everything else references this system.

---

## First Ingestion™

The first archived conversation is:

`CONV-2026-07-08-studio-world-memory-architecture`

Archive path:

`knowledge/archive/conversations/2026-07-08-studio-world-memory-architecture.md`

Extraction report:

`knowledge/working/extraction-reports/2026-07-08-studio-world-memory-architecture.md`

The archive preserves the Article K21, K22, and K23 Studio World memory architecture discussion as the historical record. The extraction report identifies new systems, principles, ADR candidates, prompt standards, future opportunities, and items awaiting founder approval.

The extraction report is not canon. It is the bridge between conversation and institutional memory.

---

## Knowledge Extraction Report™

Every archived conversation should generate a report containing:

- Conversation Summary
- Architectural Decisions
- Systems Introduced
- Design Principles
- Conflicts Detected
- Potential ADRs
- Constitution Updates
- World Bible Updates
- Prompt Standard Updates
- Engineering Recommendations
- Future Opportunities
- Items Awaiting Approval

This report remains in Architect Review™ until founder action.

---

## Memory Graph™

Every archived conversation becomes a node.

Every Knowledge Entry becomes another node.

Relationships connect:

```text
Conversation
  ↓
Knowledge Extraction
  ↓
Founder Approval
  ↓
Knowledge Core
  ↓
ADR
  ↓
Implementation
  ↓
Historical Impact
```

Studio World should remember not only what it knows, but how it learned it.

---

## Expanded Architect’s Memory™

Architect’s Memory™ now preserves recurring architectural preferences as living principles:

- Architect before implementation.
- Always recommend the best model.
- Always include architectural improvements.
- Always include future expansion.
- Prefer reusable systems.
- Prefer immersive interaction.
- Prefer world-first architecture.

These are architectural consistency principles, not temporary chat preferences.

---

## Implementation contract

Implemented pieces:

- Memory System types in `src/studio-os-core/studio-world-knowledge-core/types.ts`
- Memory System records in `src/studio-os-core/studio-world-knowledge-core/entries.ts`
- Memory Graph ingestion in `src/studio-os-core/world-graph/ingestion/knowledge-core-ingest.ts`
- Conversation Archive in `knowledge/archive/conversations/`
- Knowledge Extraction Report in `knowledge/working/extraction-reports/`
- World Graph node types:
  - `conversation-archive`
  - `knowledge-extraction`
  - `founder-approval`

Future pieces:

- automated transcript capture,
- automated extraction report generation,
- founder review queue,
- Memory Graph visualization,
- Orb answers citing both canon and originating conversations.

---

## Final principle

Conversations are history.

Knowledge is understanding.

Canon is approval.

Studio World should never confuse these three.
