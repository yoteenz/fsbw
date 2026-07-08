# Project Genome™

**Intelligence for a single initiative inside a company**

---

## Purpose

Define **Project Genome™** — the scoped intelligence layer for one project · initiative · or production effort within a company.

Inherits from Company Genome™ and Founder Genomes™. Preserves **project-specific** creative and strategic context.

---

## Position in Hierarchy

```
Founder Genome™
        ↓
Founder Taste Genome™
        ↓
Company Genome™
        ↓
Project Genome™  ← this layer
        ↓
Room DNA™
        ↓
Scene Blueprint™
        ↓
Asset Graph™
        ↓
Golden Build™
```

---

## What Project Genome™ Preserves

| Field | Examples |
|-------|----------|
| **Project identity** | Name · code · department · Set™ target |
| **Audience** | Who this initiative serves |
| **Constraints** | Timeline · budget · platform · compliance |
| **Creative direction notes** | Director's Notes™ accumulation |
| **Approved vision** | Canon™ reference · concept ID |
| **Rejected explorations** | Alternate Branch™ IDs |
| **Mood · brief seeds** | Living Mood Wall™ state |
| **Branch labels** | A/B test variants · creative forks |
| **Stakeholders** | Founder · team · client (agency mode) |
| **Status** | Discovering · building · golden · live |
| **Taste snapshot** | Traits at vision lock time |
| **Refinement history** | Asset Graph™ changelog summary |

---

## Schema (Conceptual)

```typescript
interface ProjectGenome {
  id: string;
  companyId: string;
  departmentId?: string;
  setId?: string;

  name: string;
  creativeDirectionNotes: string[];   // Director's Notes™
  approvedVisionId?: string;          // Canon™ ref
  alternateBranchIds: string[];
  constraints: ProjectConstraints;
  audience: string;
  status: ProjectStatus;

  // Inherited snapshots (read-only refs)
  companyGenomeVersion: string;
  founderTasteGenomeVersion: string;

  createdAt: string;
  updatedAt: string;
}
```

---

## Implementation Reference

| Artifact | Location |
|----------|----------|
| `project-genome/` module | `src/studio-os-core/project-genome/` |
| Director's Notes store | `studio-builder/directors-notes-store.ts` |
| Creative Approval Pipeline | Per-project pipeline state |

Pilot: Creative Direction Golden Build™ — Project 001 in Creative Atelier™.

---

## Inheritance Rules

| Rule | Meaning |
|------|---------|
| **Consult up** | Generation reads Founder + Company + Project |
| **Write down** | Project decisions update Room DNA · Blueprint · Graph |
| **No upward mutation** | Project never changes Company Genome™ directly |
| **Taste signals up** | Creative decisions feed Founder Taste Genome™ |

---

## Project Lifecycle

```
Project initiated
        ↓
Inherits Company + Founder context
        ↓
Creative Brief™ · Creative Direction™
        ↓
Concept selection → Canon™ on project
        ↓
Refinement Pipeline™ updates project notes
        ↓
Golden Build™ certification
        ↓
Archive™ + taste signals to founder layer
```

---

## Multi-Project Companies

One company may run many projects simultaneously:

| Project | Independent |
|---------|-------------|
| Creative Atelier™ Golden Build | Own Project Genome™ |
| Marketing campaign Q3 | Own Project Genome™ |
| Packaging refresh | Own Project Genome™ |

Shared: Company Genome™ · Founder Genomes™.  
Unique: Project constraints · Canon™ · notes.

---

## Anti-Patterns

| Anti-pattern | Why |
|--------------|-----|
| Project genome replaces company genome | Wrong scope |
| No inheritance from above | Brand drift |
| Delete project genome after ship | Lose creative history |
| Founder genome stored per project | Founder layer is separate |

---

## Cross-References

- [intelligence-hierarchy.md](./intelligence-hierarchy.md)
- [company-genome.md](./company-genome.md)
- [Creative Direction Pipeline™](../creative-direction-pipeline/README.md)
- [company-object-model.md](../philosophy/company-object-model.md)
