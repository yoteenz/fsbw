# Global Experience System™

**Studio World Experience Engine™ · One engine · infinite places**

---

## Principle

Departments declare **WHAT** they contain (Experience Profile™ metadata).

The **Experience Engine™** decides **HOW** that information is experienced.

No department manually wires Progressive Presence™, Orb behavior, navigation philosophy, Scene Tray, Atlas, motion, or information hierarchy.

They **inherit** them.

---

## Architecture

```
DepartmentGoldenBuildShell
  └── StudioWorldExperienceProvider  ← route → Experience Profile™
        └── Experience Engine™
              ├── Progressive Presence™
              ├── Navigation philosophy
              ├── Orb behavior (via StudioOrbProvider)
              ├── Atlas behavior (via GlobalAtlasProvider)
              ├── Experience Tokens™
              └── Reveal / collapse / focus sequencing
```

**Code:** `src/studio-os-core/studio-world-experience/` · `src/components/admin/studio/global-experience/`

---

## Experience Profile™

Register in `profile-registry.ts`:

```typescript
{
  departmentId: 'creative-direction',
  displayName: 'Creative Direction Studio™',
  primaryStory: "We're creating.",
  primaryQuestion: 'What are we building?',
  primaryOrbMode: 'creative',
  defaultPresenceLevel: 0,
  ambientInformation: ['Creative Queue', 'Current Project'],
  contextModules: ['Story Table™', 'Mood Wall™', ...],
  deepSystems: ['Knowledge Graph™', 'Scene Graph™', ...],
}
```

New Discovery Packs™, professions, and expansions add a profile — not custom UI.

---

## Experience Tokens™

Global constants in `experience-tokens.ts` — Reveal Speed™, Glass Blur™, Presence Threshold™, etc.

Injected as CSS variables by `StudioWorldExperienceProvider`.

---

## Hooks

| Hook | Use |
|------|-----|
| `useStudioWorldExperience()` | Full engine — profile, presence, tokens, overlaysEarned |
| `useProgressivePresence()` | **Deprecated** — fallback only; use context |

---

## World-Wide Consistency™

A founder entering any new place understands the same interaction language.

The architecture changes. The experience language never does.

*Ratified 2026-07-08 · Extends Article K18 Progressive Presence™*
