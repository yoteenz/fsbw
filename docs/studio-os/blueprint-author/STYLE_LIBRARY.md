# Style Library

**Version:** `style-library.v1`

Models receive **style identifiers** — not vague prompts.

## Organization styles

| Style ID | Profile | Visual language |
|----------|---------|-----------------|
| `studio-world-luxury` | StudioWorldLuxury | Premium spatial computing |
| `founder-luxury` | FounderLuxury | Marble, chrome, crystal, crimson |
| `executive-reception` | ExecutiveReception | Concierge arrival, hero desk |
| `gallery-minimal` | GalleryMinimal | White space, focused lighting |
| `hair-lab-clinical` | HairLabClinical | Clinical precision |
| `showroom-luxury` | ShowroomLuxury | Product showcase |

## Usage

```typescript
const style = resolveStyleProfile('executive-reception');
const payload = buildStyleWorkerPayload(style);
```

Workers receive `styleId`, `version`, `organizationStyle`, and `visualLanguage`.
