# Founder Intelligence Capsule™

Institutional memory of **why Studio OS exists** and **how the founder thinks**.

## Three-capsule onboarding

| Capsule | Question | Download |
|---------|----------|----------|
| AI Context | What is this project? | `/context/latest` |
| Studio DNA | How does Studio OS think? | `/downloads/studio-dna-capsules/latest.zip` |
| Founder Intelligence | Why does this project exist? | `/founder-intelligence/latest` |

## Source folder

`founder-intelligence/` at repo root — 27 category documents with metadata blocks.

## Packaging

```bash
npm run package:founder-intelligence-capsule-zip
```

Prebuild validates:

- Required documents present
- Metadata markers in every file
- Version sync (1.0.0)
- No orphan documents
- Internal link integrity
- ZIP integrity before `latest.zip` update

## Distribution

| URL | Purpose |
|-----|---------|
| `/founder-intelligence/latest` | Permanent download |
| `/founder-intelligence` | Public hub |
| `/founder-intelligence/release.json` | Release manifest |

Archives: `/downloads/founder-intelligence-capsules/archive/Founder_Intelligence_Capsule_v1.0.0.zip`

## Admin

`/admin/studio/context-capsule` — download panel alongside Context and DNA capsules.

## Cross-references

- Context: `PROJECT_DNA.md`, `FOUNDER_PROFILE.md` (operational collaboration)
- DNA: design judgment and canon policy
- FIC: strategy, business, vision (this capsule)

## Living document

Regenerate when major founder decisions, product strategy, or business model evolves. Append to `DECISION_HISTORY.md`; do not silently overwrite philosophy files.
