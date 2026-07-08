# Department Composition™

**Station Stacks per Department**

---

## CDS Creative Direction Studio™ (Pilot)

| Station | Signature Landmark | Layer count |
|---------|-------------------|-------------|
| Arrival™ | Orb threshold glimpse | 8 FAL layers |
| Story Table™ | **Story Table™** | 8 FAL layers |
| Mood Wall™ | Living Mood Wall™ | 8 FAL layers |
| Notes Desk™ | Executive desk | 8 FAL layers |
| Pipeline™ | Mission control wall | 8 FAL layers |
| Library™ | Archive shelving | 8 FAL layers |

Each station = independent Scene Stack™.

Camera movement walks between **composed stacks** — not pages.

---

## Future Departments

Every department declares in Department Generator™:

```json
{
  "sceneStack": {
    "stations": [...],
    "layersPerStation": ["environment-shell", "signature-landmark", ...]
  }
}
```

Layer 02 always maps to [Architectural Icons™](../architectural-icons/landmark-registry.md) `signatureLandmarkId`.

---

## Implementation

- `scene-stack/cds-station-prompts.ts` — CDS layer prompts
- `useSceneStack` — per-station layer orchestration
- `SceneStackViewport` — compositor

---

## See Also

- [../architectural-icons/department-landmarks.md](../architectural-icons/department-landmarks.md)
