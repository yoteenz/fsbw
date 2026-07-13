# Department Classification

**Version:** `content-classification.v1`

Studio World maintains **six content classes**. These must never be conflated in data, APIs, UI, permissions, Marketplace, or diagnostics.

## 1. CANONICAL_STUDIO_WORLD_DEPARTMENT

Global Studio World infrastructure (Experience Lab · BUILD STUDIO WORLD).

## 2. SHARED_HQ_DEPARTMENT_TEMPLATE

Neutral reusable HQ department (Reception, Lobby, Inventory, Private Office).

## 3. INDUSTRY_UNIQUE_DEFAULT_TEMPLATE

Neutral industry-specific default (Salon Wash Area, Medical Exam Room).

## 4. FOUNDER_CUSTOMIZED_DEPARTMENT

Founder's customized version of a default department.

## 5. FOUNDER_CREATED_MODDED_SCENE

Founder-created scene not in official pack — **Build-A-Wig Atelier™** is Frontal Slayer IP, not a Hair Brand default.

## 6. MARKETPLACE_LICENSED_MOD

Certified installable derivative under license.

## Build-A-Wig Atelier

| Field | Value |
|-------|-------|
| Class | `FOUNDER_CREATED_MODDED_SCENE` |
| Creator | `frontal-slayer` |
| In official Hair Brand Pack | **No** |
| In Frontal Slayer HQ | **Yes** (preserved) |

## API

```typescript
import { classifyContent } from 'studio-os-core/founder-mods';
import { validateOfficialPackBrandNeutrality } from 'studio-os-core/founder-mods';
```

## Database

- `founder_created_mods.content_class`
- `official_pack_content_bindings.content_class`
