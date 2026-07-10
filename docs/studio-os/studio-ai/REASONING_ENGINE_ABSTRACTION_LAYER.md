# Reasoning Engine Abstraction Layer

**Version:** 1.0.0  
**Status:** Architecture specification — no implementation  
**Abbreviation:** REA (Reasoning Engine Adapter)

---

## Purpose

The Reasoning Engine Adapter makes foundation models **interchangeable**. Studio AI speaks to REA — never directly to vendor SDKs in business logic.

---

## Design goals

1. **Vendor neutrality** — OpenAI, Anthropic, Google, local models, future providers  
2. **Capability negotiation** — declare what engine supports; Studio AI adapts  
3. **Streaming parity** — unified stream interface  
4. **Tool parity** — function calling mapped to Studio OS tools  
5. **Succession safety** — engine swap without Session Director rewrite  

---

## REA interface (conceptual)

```typescript
interface ReasoningEngineAdapter {
  engineId: string;                    // e.g. "openai:gpt-4o-2026-07"
  provider: EngineProvider;
  capabilities: EngineCapabilities;

  complete(request: ReasoningRequest): Promise<ReasoningResponse>;
  stream(request: ReasoningRequest): AsyncIterable<ReasoningChunk>;

  embed?(texts: string[]): Promise<number[][]>;
  countTokens?(messages: Message[]): Promise<number>;

  healthCheck(): Promise<EngineHealth>;
}

interface EngineCapabilities {
  maxContextTokens: number;
  supportsVision: boolean;
  supportsTools: boolean;
  supportsJsonMode: boolean;
  supportsStreaming: boolean;
  supportsSystemPrompt: boolean;
  latencyTier: 'low' | 'medium' | 'high';
}

interface ReasoningRequest {
  messages: Message[];
  system: StudioAiSystemContext;      // Studio AI layer — not raw vendor system
  tools?: ToolDefinition[];
  responseFormat?: 'text' | 'json';
  temperature?: number;
  maxOutputTokens?: number;
  metadata: {
    studioAiVersion: string;
    roleId: string;
    sessionId: string;
    passportId?: string;
  };
}
```

---

## Studio AI system context injection

REA receives **`StudioAiSystemContext`** assembled by Session Director — never a bare founder paste.

Layers (in order):

1. **Studio AI identity** — version, north star, non-negotiables  
2. **Active role mandate** — Creative Director, Professor Atlas, etc.  
3. **Persona profile** — voice, teaching style bounds  
4. **Founder DNA excerpt** — collaboration constraints  
5. **Project DNA excerpt** — civilization traits  
6. **Memory slice** — handoff, decisions, graph neighborhood (token-budgeted)  
7. **Canon rules** — active terminology + architectural rules  

Foundation model default personality is **overridden** by this stack.

---

## Adapter implementations (planned)

| Adapter ID | Provider | Notes |
|------------|----------|-------|
| `openai:*` | OpenAI | Primary external Creative Director host today |
| `anthropic:*` | Anthropic | Succession candidate |
| `google:*` | Google Gemini | Succession candidate |
| `cursor:*` | Cursor agent | Implementer path; tool-heavy |
| `studio-local:*` | Future on-prem | Enterprise / air-gap |

Each adapter lives in `reasoning/adapters/{provider}/`.

---

## Capability negotiation

When engine lacks capability:

| Missing capability | Studio AI behavior |
|--------------------|-------------------|
| `supportsVision` | Route vision tasks to alternate engine or defer |
| `supportsTools` | Inline tool simulation or role handoff |
| `maxContextTokens` too low | Memory Orchestrator compresses slice; knowledge-diff priority |
| `supportsJsonMode` | Persona Engine parses structured blocks from text |

Compatibility matrix: [MODEL_COMPATIBILITY_LAYER.md](./MODEL_COMPATIBILITY_LAYER.md)

---

## Engine registration

```json
{
  "engineId": "anthropic:claude-sonnet-202607",
  "registeredAt": "ISO-8601",
  "status": "candidate | active | archived",
  "adapterVersion": "1.0.0",
  "capabilities": { },
  "successionHistory": [
    { "promotedFrom": "openai:gpt-4o", "date": "ISO-8601", "studioAiVersion": "1.2.0" }
  ]
}
```

Only one **active** primary engine per Studio AI instance; secondary for failover.

---

## Observability

Every REA call logs (structured, not raw chat dump):

- `engineId`, `studioAiVersion`, `roleId`, `sessionId`  
- Token counts, latency, capability flags used  
- Canon violation flags from Persona Engine  
- No secrets, no full memory payload in logs  

---

## Security

- API keys in platform vault — never in capsules or motherboard  
- REA never receives credentials from institutional memory export  
- Redacted memory slices only in `ReasoningRequest`  

---

## Relationship to external tools today

Until REA ships in code:

- ChatGPT = manual REA host via capsule upload  
- Cursor = manual REA host via motherboard + AGENTS.md  
- Protocol defines **what** to inject; REA defines **how** uniformly  

---

*Architecture specification only*
