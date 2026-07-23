# Studio World — Database Inventory

**Scope:** Supabase objects used by Studio World (migrations under `supabase/migrations/` with `studio` prefix or documented Studio APIs).

**Not included:** Customer commerce tables (orders, cart, wigs, etc.) unless referenced by Studio APIs (none identified as primary in Studio paths).

---

## Migration files (Studio-related)

| Migration | Theme |
| --- | --- |
| `20260704120000_studio_social_publishing.sql` | Social publishing |
| `20260705120000_studio_os_org_memberships.sql` | Org membership |
| `20260706170000_studio_os_workspace_state.sql` | Workspace state blob |
| `20260708120000_studio_asset_registry.sql` | Asset registry |
| `20260708140000_studio_creative_intelligence.sql` | Creative intelligence |
| `20260711000000_studio_institute_invites.sql` (+ `11010000`, `11120000`) | Institute invites |
| `20260712180000_studio_governed_generation_jobs.sql` | Governed async jobs |
| `20260713130000_studio_os_migration_history_reconcile.sql` | Migration history |
| `20260713150000_studio_founder_render_jobs.sql` | Founder render |
| `20260713160000_studio_industry_packs.sql` | Industry/marketplace packs |
| `20260713170000_master_founder_render_composition.sql` | Composition packs |
| `20260713180000_canonical_studio_world.sql` | Canonical departments / HQ instances |
| `20260713190000_architecture_law_001.sql` | Department UI sockets |
| `20260713200000_canonical_department_generator.sql` | World canonical departments suite |
| `20260714140000_environment_asset_packages.sql` | Environment packages |
| `20260714210000_environment_package_events_canonical.sql` | Package audit events |

---

## Tables (by domain)

### Studio OS platform

| Table | Purpose |
| --- | --- |
| `studio_os_org_memberships` | User ↔ org Studio access |
| `studio_os_workspace_state` | Persisted workspace UI/state JSON |

### Governed generation & renders

| Table | Purpose |
| --- | --- |
| `studio_governed_generation_jobs` | Async generation job queue/status |
| `studio_founder_render_jobs` | Founder full-room render jobs |
| `studio_master_founder_renders` | Master founder render records |
| `studio_master_portrait_renders` | Portrait renders |
| `studio_composition_packs` | Composition packs |
| `studio_composition_profiles` | Profiles |
| `studio_blueprint_composition_metadata` | Blueprint metadata |

### Asset registry

| Table | Purpose |
| --- | --- |
| `studio_asset_registry_assets` | Asset records |
| `studio_asset_registry_versions` | Version history |
| `studio_asset_registry_relationships` | Graph edges |
| `studio_asset_registry_usage_events` | Usage telemetry |
| `studio_asset_registry_similarity_hooks` | Similarity |

### Creative intelligence

| Table | Purpose |
| --- | --- |
| `studio_creative_intelligence_decisions` | Decision log |
| `studio_creative_intelligence_learning_signals` | Learning signals |

### Social publishing (Studio)

| Table | Purpose |
| --- | --- |
| `studio_social_accounts` | Connected accounts |
| `studio_social_posts` | Post drafts/scheduled |
| `studio_social_publish_log` | Publish log |

### Studio Institute

| Table | Purpose |
| --- | --- |
| `studio_institute_invites` | Invite records (+ extended columns in later migrations) |

### Canonical Studio World & departments

| Table | Purpose |
| --- | --- |
| `studio_canonical_departments` | Canonical dept list |
| `studio_company_hq_instances` | Company HQ instances |
| `studio_department_ui_sockets` | UI socket definitions (architecture law) |
| `studio_world_canonical_departments` | Generator canonical departments |
| `studio_world_department_charters` | Charters |
| `studio_world_department_versions` | Versions |
| `studio_world_department_blueprints` | Blueprints |
| `studio_world_department_renders` | Renders |
| `studio_world_department_composition_packs` | Dept composition packs |
| `studio_world_department_socket_profiles` | Socket profiles |
| `studio_world_department_publications` | Publications |
| `studio_world_department_dependencies` | Dependencies |
| `studio_world_department_access_policies` | Access policies |

### Industry / marketplace packs

| Table | Purpose |
| --- | --- |
| `studio_business_archetypes` | Archetypes |
| `studio_department_templates` | Templates |
| `studio_shared_department_instances` | Shared instances |
| `studio_industry_packs` | Packs |
| `studio_industry_pack_versions` | Versions |
| `studio_founder_pack_instances` | Founder instances |
| `studio_marketplace_packs` | Marketplace |

### Environment asset packages

| Table | Purpose |
| --- | --- |
| `studio_environment_asset_packages` | Package root |
| `studio_environment_package_outputs` | Outputs |
| `studio_environment_package_readiness` | Readiness |
| `studio_environment_package_generation_jobs` | Jobs |
| `studio_environment_package_approvals` | Approvals |
| `studio_environment_package_audit_events` | Audit |
| `studio_environment_package_cds_handoffs` | CDS handoffs |
| `studio_environment_package_cache_entries` | Cache |

---

## Storage buckets (Studio-related)

| Bucket / usage | Observed in code/docs |
| --- | --- |
| **`live-preview`** | Generated assets uploaded from FAL pipeline (`motherboard/CODEBASE.md`) |
| Expert capture / institute | Media uploads via expert-capture APIs (exact bucket names in handler code—not fully enumerated in this audit) |

---

## RPCs / views / policies

- RLS policies defined per migration on above tables (typical pattern: org-scoped or service-role for workers).
- **No separate inventory of every RPC** in this audit; governed worker and environment workers invoke Postgres via service role in API handlers.
- **`studio_os_migration_history_reconcile`** migration addresses migration history metadata—not application RPC.

---

## Relationships (conceptual)

```
studio_os_org_memberships ──► user access to org
studio_os_workspace_state ──► per-org persisted UI state
studio_governed_generation_jobs ──► outputs ──► storage + studio_asset_registry_*
studio_world_canonical_departments ──► charters, blueprints, renders, publications
studio_environment_asset_packages ──► jobs, outputs, cds_handoffs
studio_institute_invites ──► expert capture sessions (application layer)
```

---

## Frontal Slayer table coupling

Studio migrations **do not** require customer product tables for core Studio OS operation. Workspace content may **reference** FS brand assets conceptually; generation parity docs reference FS API paths separately, not FK joins in schema audit.
