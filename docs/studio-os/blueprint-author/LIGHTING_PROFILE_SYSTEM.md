# Lighting Profile System

**Version:** `lighting-profile-system.v1`

Blueprint defines lighting. No model invents lighting colors or profiles.

## Profile structure

```typescript
LightingProfileSpec {
  profileId, version
  colorTemperatureK
  reflectionIntensity
  shadowSoftness
  bounceCount
  glassResponse
  materialResponse
  ambientProfile
}
```

## Reception example

`ExecutiveReceptionLighting.v3`:

- Color temperature: 4200K
- Reflection intensity: 0.85
- Shadow softness: 0.35
- Bounce count: 3
- Ambient: `executive-reception-ambient`

## Rules

1. Lighting pass is independent — no furniture regeneration
2. Workers receive `lightingProfileId` and full profile payload
3. `assertLightingProfileComplete()` validates before compile

## API

```typescript
defineLightingProfile(profile);
buildLightingWorkerPayload(profile);
```
