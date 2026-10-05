# AIO Duplication Map

| Group | Instances | Recommendation |
|-------|-----------|----------------|
| **Route tree mirror** | `/`, `/desktop/*`, `/mobile/*` | Single canonical path in graph; keep mirrors for layout preview |
| **Client command naming** | Docs/teasers vs `portal` index | Product name MY OFFICE; keep internal module names |
| **Document storage** | Vault vs module-specific uploads | Consolidate on vault references |
| **Load records** | Demo loads vs `aio_dispatch_loads` | Supabase canonical when in backend mode |
| **Financial summaries** | `money` center vs domain invoices | Preserve separation—no combined “total money” |
| **Inbox vs messages** | Office inbox vs portal messages | Merge under F17 container meta, keep domain context |
| **Orphan pages** | `ServiceDetailPage`, `FactoringOpsPage`, `BrokerageOpsPage` | Wire or deprecate explicitly |
| **Authorization** | Demo guard pass-through vs RLS | Expected in demo; must not ship in prod |
