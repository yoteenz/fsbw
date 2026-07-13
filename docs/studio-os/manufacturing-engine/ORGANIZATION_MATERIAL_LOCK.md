# Organization Material Lock™

Every material references organization assets only. No model invents substitutes.

## Locked materials (Frontal Slayer)

Founder Marble · Founder Acrylic · Founder Chrome · Founder Glass · Founder Crystal · Founder Red Illumination

## API

```typescript
const lock = lockOrganizationMaterials({ organizationId, materialIds });
assertNoMaterialSubstitution({ expectedMaterialId: 'founder-marble', actualLabel });
```

Generic marble/stone/glass/wood/chrome → `MATERIAL_SUBSTITUTION_FORBIDDEN`
