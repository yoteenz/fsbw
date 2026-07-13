# Department Classification

**Version:** `department-classification.v1`

Studio World maintains **three separate department classes**. These must never be conflated in data, APIs, UI, permissions, or diagnostics.

## 1. CANONICAL_STUDIO_WORLD_DEPARTMENT

**Global infrastructure** used to operate Studio World.

- Exists once globally
- No tenant ownership
- Experience Lab program: **BUILD STUDIO WORLD**
- Examples: Experience Lab, Creative Director Studio, Command Center, Asset Registry

## 2. SHARED_HQ_DEPARTMENT_TEMPLATE

**Reusable headquarters department** referenced across multiple Industry Packs.

- Not canonical Studio World infrastructure
- Not tenant-owned at template level
- Experience Lab program: **BUILD INDUSTRY PACKS**
- Examples: Reception, Lobby, Conference Room, Executive Office, Storage, Staff Lounge, Training Room

Shared template IDs: `reception`, `lobby`, `conference-room`, `executive-office`, `storage`, `staff-lounge`, `training-room`, `waiting-area`, `office`.

## 3. INDUSTRY_UNIQUE_DEPARTMENT_TEMPLATE

**Specialized headquarters department** belonging to one or more related industries.

- Experience Lab program: **BUILD INDUSTRY PACKS**
- Examples: Hair Analysis Lab, Medical Exam Room, Law Library

## Classification API

```typescript
import { classifyDepartmentById, classifyIndustryPackDepartmentSlot } from 'studio-os-core/canonical-studio-world';

classifyDepartmentById('experience-lab', { isCanonicalRegistryMember: true });
// → CANONICAL_STUDIO_WORLD_DEPARTMENT

classifyIndustryPackDepartmentSlot('reception');
// → SHARED_HQ_DEPARTMENT_TEMPLATE
```

## Database

- Canonical: `studio_world_canonical_departments.department_class`
- Industry templates: `studio_department_templates.department_class` (`SHARED_HQ_DEPARTMENT_TEMPLATE` | `INDUSTRY_UNIQUE_DEPARTMENT_TEMPLATE`)

## Rules

- Industry Packs may **reference** canonical services but never **clone or own** them
- Reception is **not** a canonical Studio World main department
- Do not merge canonical departments and Industry Packs into one registry
