# All In One — Incident Response

**Sprint 19** · Operational foundation — not legal breach determination.

---

## Severity

| Level | Use |
|-------|-----|
| SEV-4 | Low — routine review |
| SEV-3 | Moderate |
| SEV-2 | High — active containment |
| SEV-1 | Critical — executive escalation |

---

## States

`OPEN` → `INVESTIGATING` → `CONTAINED` → `RECOVERING` → `RESOLVED` → `POSTMORTEM`

---

## Categories

Account compromise, credential exposure, unauthorized access, data exposure, malware, provider compromise, payment security, data loss, availability, other.

---

## UI

`/office/security/incidents` — staff-only; demo incident seeded (credential rotation drill).

---

## Legal boundary

System does **not** automatically determine reportable breach status. Flag **LEGAL REVIEW REQUIRED** for counsel/jurisdiction analysis.

---

## Credential exposure procedure (documented)

1. Disable affected credential  
2. Rotate  
3. Review audit/logs  
4. Verify replacement  
5. Close finding  

See `INTEGRATION_SECURITY.md` for provider-specific steps.
