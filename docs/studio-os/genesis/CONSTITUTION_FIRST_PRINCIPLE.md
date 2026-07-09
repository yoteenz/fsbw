# Constitution First Principle™

**Genesis article:** [`../../../genesis/articles/CONSTITUTION_FIRST_PRINCIPLE.md`](../../../genesis/articles/CONSTITUTION_FIRST_PRINCIPLE.md)  
**Status:** Constitutional amendment proposal for Genesis review

## Law

```text
Architecture must precede implementation.
Implementation may realize approved architecture.
Implementation may not silently redefine architecture.
```

## Roles

| Role | Constitutional responsibility |
|---|---|
| **GPT-5.6 Terra — Constitutional Architect** | Defines purpose, ownership, relationships, constraints, governance, risks, canonical terminology, and implementation boundaries. |
| **Composer 2.5 — Systems Engineer** | Implements approved architecture through code, schemas, integrations, migrations, tests, validation, observability, and deployable behavior. |
| **Founder** | Final authority for material constitutional direction. |

## Authority boundary

Genesis is binding. If code, prompts, tickets, or implementation patterns
conflict with Genesis, Genesis wins until a governed amendment changes it.

Composer may resolve internal technical details only if the choice does not
change system ownership, dependency direction, authority, public contract,
canonical terminology, or governance.

## Architecture Review Request™

Composer must stop work on an affected boundary and submit an ARR when it finds:

- Genesis conflict
- missing dependency
- unclear ownership
- implementation impossibility or unsafe constraint
- required new owner/object/relationship
- material authority, permission, tenancy, compliance, or automation change

An ARR records the affected Genesis references, evidence, impact, safe options,
engineering recommendation, requested architectural decision, and interim state.

Terra clarifies, approves an exception, amends Genesis, redesigns, sequences a
dependency, rejects the path, or returns bounded authority to Composer.

No ARR is resolved through a silent code workaround.

See the Genesis article for the complete implementation authority envelope,
canonization lifecycle, completion test, and anti-patterns.
