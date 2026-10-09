# O — Future WFE visual quality gates (Build Object / environment art)

| Gate | Requirement | Auto? |
|------|-------------|-------|
| **01 REFERENCE VERIFIED** | SHA-256 + path logged; canonical JPG identified | Script |
| **02 IMAGE VISUALLY INSPECTED** | Codex `-i` + transcript must include reference-specific observations **before** bpy commit | Human review of transcript |
| **03 CAMERA-MATCHED BLOCKOUT** | Perspective match + overlay PNG vs reference | Render |
| **04 MAJOR ARCHITECTURE MATCH** | Founder or CD sign-off on blockout silhouettes | **Founder** |
| **05 MATERIAL QUALITY** | Sample renders vs reference exposure/saturation | Render + founder |
| **06 RENDER INSPECTION** | All required views from **same** material generation | Automated file check |
| **07 FOUNDER VISUAL REVIEW** | Explicit REVISE / APPROVE | **Founder** |
| **08 TECHNICAL ART PACKAGE** | WFE ingestion (existing) | Automated |
| **09 ASSET INGESTION** | Lineage + hashes (existing) | Automated |

**Rule:** Ingestion PASS **must not** set creative approval. Separate states: `TECHNICAL_PASS`, `VISUAL_REVIEW_READY`, `FOUNDER_APPROVED`.
