# AIO client migration — canonical field map (RECOVERY3)

| Source entity | Source field | Canonical target | Target field | Review | Write authority |
| --- | --- | --- | --- | --- | --- |
| company | legal_name | aio_organizations | name | staff approve | supabaseApproveMigration |
| company | usdot | aio_organization_regulatory_identifiers | identifier_value (USDOT) | staff approve | supabaseApproveMigration |
| company | mc_number | aio_organization_regulatory_identifiers | identifier_value (MC) | staff approve | supabaseApproveMigration |
| company | ein | aio_organization_regulatory_identifiers | identifier_value (EIN) | staff approve | supabaseApproveMigration |
| company | business_address | aio_client_profile_provenance | value | staff approve | provenance only (no org address column) |
| company | company_phone | aio_contacts | phone | staff approve | linked on contact insert |
| company | company_email | aio_contacts | email | staff approve | linked on contact insert |
| person | contact_name | aio_contacts | first_name / last_name | staff approve | supabaseApproveMigration |
| vehicle | unit_number | aio_fleet_vehicles | unit_number | staff approve | supabaseApproveMigration |
| vehicle | vin | aio_fleet_vehicles | vin | staff approve | supabaseApproveMigration |
| insurance | policy_number | aio_client_profile_provenance | value | staff approve | provenance (no policy table) |
| insurance | carrier_name | aio_client_profile_provenance | value | staff approve | provenance |
| service | workspace code | aio_office_workspace_entitlements | state | staff approve | supabaseApproveMigration |
| (batch) | — | aio_road_ready_profiles | overall_status | auto on approve | in_progress |
| documents | file metadata | aio_documents | storage + hash | on approve | supabaseApproveMigration |

Gaps: client org–contact linkage (`aio_customer_organizations`), dedicated insurance policy storage, and business address on `aio_organizations` remain follow-ups.
