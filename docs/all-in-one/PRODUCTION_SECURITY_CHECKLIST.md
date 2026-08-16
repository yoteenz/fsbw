# All In One — Production Security Checklist

**Sprint 19** · Enforced by `canLaunchProduction()` — UI cannot override blockers.

---

## Blocking controls (launch gate)

- [ ] Production AIO authentication configured (dedicated Supabase)  
- [ ] Customer isolation tests passing (RLS + object auth)  
- [ ] Private document storage configured  
- [ ] Production backup provider configured + restore tested  
- [ ] Production domain + TLS  
- [ ] Demo mode disabled  
- [ ] Frontal Slayer cross-product isolation verified  
- [ ] No critical open security findings  
- [ ] Payment webhooks signature-verified in production  
- [ ] Debug reset disabled in production build  

---

## Categories

IDENTITY · AUTHORIZATION · DATABASE · STORAGE · PAYMENTS · INTEGRATIONS · COMMUNICATIONS · PRIVACY · AUDIT · BACKUPS · RECOVERY · DEPENDENCIES · INFRASTRUCTURE · LEGAL/POLICY · TESTING

---

## Readiness states

`NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `READY` · `NOT_APPLICABLE`

View live status: `/office/security/production-readiness`

---

## Sprint 20 dependency

Database RLS, real auth, and private storage migration are **Sprint 20** deliverables — remain blockers until shipped.
