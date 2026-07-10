# Expert Capture Interview — MVP v1

Production-ready lightweight interview for Studio Institute knowledge transfer.

## Route

**https://fsbw.vercel.app/expert-capture**

## Architecture (modular)

| Module | Path |
|--------|------|
| Types & constants | `src/studio-os-core/expert-capture/` |
| Session storage | `session-storage.ts` (localStorage metadata) |
| Media storage | `media-storage.ts` (IndexedDB blobs) |
| Interview engine | `interview-engine.ts` + `follow-up-detector.ts` |
| Recording | `recording-service.ts` (MediaRecorder, Web Speech API, mic meter) |
| Knowledge extraction | `knowledge-extraction.ts` |
| Export | `export-service.ts` (9 markdown documents) |
| UI hook | `src/hooks/useExpertCaptureSession.ts` |
| Page | `src/pages/expert-capture/page.tsx` |
| AI API | `POST /api/expert-capture/interview` |

## Flow

Landing → Consent → Camera/Mic → Interview (one Q at a time) → Understanding review → Knowledge review → Export

## Future placeholders

See `placeholders.ts` — not implemented in MVP v1.
