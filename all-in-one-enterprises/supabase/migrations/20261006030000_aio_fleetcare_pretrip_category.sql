-- Add the canonical FleetCare category used by pre-trip defect escalation.
-- The application already writes service_category_code='pretrip_inspection';
-- keeping the taxonomy explicit preserves the FK instead of weakening it.
insert into public.aio_fleetcare_service_categories
  (code, label, description, enabled, requires_verification, sort_order)
values
  (
    'pretrip_inspection',
    'Pre-Trip Inspection',
    'Defects escalated from a driver pre-trip inspection into FleetCare.',
    true,
    true,
    15
  )
on conflict (code) do update
set
  label = excluded.label,
  description = excluded.description,
  enabled = excluded.enabled,
  requires_verification = excluded.requires_verification,
  sort_order = excluded.sort_order;
