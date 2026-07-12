/**
 * Governed generation error normalization — preserves cause chain for internal diagnostics.
 * Public responses remain sanitized; never include secrets or raw assets.
 */

export type GenerationFailureCategory =
  | 'CLIENT_REQUEST_FAILED'
  | 'API_ROUTE_FAILED'
  | 'GOVERNANCE_FAILED'
  | 'ORCHESTRATION_FAILED'
  | 'PROVIDER_REQUEST_FAILED'
  | 'PROVIDER_REJECTED'
  | 'PROVIDER_RESPONSE_INVALID'
  | 'ASSET_NORMALIZATION_FAILED'
  | 'ASSET_PERSISTENCE_FAILED'
  | 'GENERATION_TIMEOUT'
  | 'UNKNOWN_GENERATION_FAILURE';

export type GenerationErrorDiagnostic = {
  category: GenerationFailureCategory;
  stage: string;
  traceId: string;
  exceptionName: string;
  message: string;
  causeMessage?: string;
  causeName?: string;
  provider?: string;
  model?: string;
  adapter?: string;
  providerHttpStatus?: number;
  providerErrorCode?: string;
  providerResponsePreview?: string;
  elapsedMs?: number;
  layerType?: string;
  layerId?: string;
  stationId?: string;
  organizationId?: string;
  compileRunId?: string;
  safeStackPreview?: string;
};

const PREVIEW_MAX = 1024;

function truncate(text: string, max = PREVIEW_MAX): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…[truncated]`;
}

function safeJsonPreview(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  try {
    const raw = typeof value === 'string' ? value : JSON.stringify(value);
    return truncate(raw.replace(/(api[_-]?key|bearer|authorization|token|secret)=[^\s&"']+/gi, '[REDACTED]'));
  } catch {
    return undefined;
  }
}

function isFalApiError(err: unknown): err is {
  name: string;
  message: string;
  status: number;
  body?: unknown;
  requestId?: string;
} {
  return (
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    typeof (err as { status: unknown }).status === 'number' &&
    (err as { name?: string }).name === 'ApiError'
  );
}

export function createGenerationTraceId(prefix = 'gen'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function classifyProviderFailure(status?: number): GenerationFailureCategory {
  if (status === 408 || status === 504) return 'GENERATION_TIMEOUT';
  if (status && status >= 400 && status < 500) return 'PROVIDER_REJECTED';
  if (status && status >= 500) return 'PROVIDER_REQUEST_FAILED';
  return 'PROVIDER_REQUEST_FAILED';
}

export function normalizeGenerationError(input: {
  err: unknown;
  stage: string;
  traceId: string;
  category?: GenerationFailureCategory;
  provider?: string;
  model?: string;
  adapter?: string;
  elapsedMs?: number;
  context?: {
    layerId?: string;
    layerType?: string;
    stationId?: string;
    organizationId?: string;
    compileRunId?: string;
  };
}): GenerationErrorDiagnostic {
  const err = input.err;
  const base: GenerationErrorDiagnostic = {
    category: input.category ?? 'UNKNOWN_GENERATION_FAILURE',
    stage: input.stage,
    traceId: input.traceId,
    exceptionName: err instanceof Error ? err.name : typeof err,
    message: err instanceof Error ? err.message : String(err),
    provider: input.provider,
    model: input.model,
    adapter: input.adapter ?? 'generateStudioBuilderAsset',
    elapsedMs: input.elapsedMs,
    layerId: input.context?.layerId,
    layerType: input.context?.layerType ?? input.context?.layerId,
    stationId: input.context?.stationId,
    organizationId: input.context?.organizationId,
    compileRunId: input.context?.compileRunId,
  };

  if (err instanceof Error && 'cause' in err) {
    const cause = (err as Error & { cause?: unknown }).cause;
    if (cause instanceof Error) {
      base.causeName = cause.name;
      base.causeMessage = cause.message;
    }
  }

  if (isFalApiError(err)) {
    base.category = classifyProviderFailure(err.status);
    base.providerHttpStatus = err.status;
    base.providerErrorCode =
      typeof err.body === 'object' && err.body !== null && 'detail' in err.body
        ? 'VALIDATION_ERROR'
        : String(err.status);
    base.providerResponsePreview = safeJsonPreview(err.body ?? err.message);
    if (err.requestId) base.providerResponsePreview = `[requestId=${err.requestId}] ${base.providerResponsePreview ?? ''}`.trim();
  }

  if (err instanceof Error && err.stack) {
    base.safeStackPreview = truncate(
      err.stack
        .split('\n')
        .slice(0, 8)
        .join('\n')
        .replace(/(api[_-]?key|bearer|authorization|token|secret)=[^\s&"']+/gi, '[REDACTED]')
    );
  }

  return base;
}

export function logGenerationDiagnostic(diag: GenerationErrorDiagnostic): void {
  console.error(
    JSON.stringify({
      audit: 'studio-builder-generation-diagnostic',
      at: new Date().toISOString(),
      ...diag,
    })
  );
}

export function publicMessageFromDiagnostic(diag: GenerationErrorDiagnostic): string {
  if (diag.category === 'PROVIDER_REJECTED' && diag.providerHttpStatus === 403) {
    return 'Provider rejected the generation request (authorization or quota).';
  }
  if (diag.category === 'GENERATION_TIMEOUT') {
    return 'Generation timed out before the provider returned a result.';
  }
  if (diag.message.includes('FAL_KEY')) {
    return 'Image generation provider is not configured on the server.';
  }
  if (diag.message.includes('Reference fetch failed') || diag.message.includes('reference missing')) {
    return 'Could not prepare placement reference image for generation.';
  }
  return diag.message.replace(/(api[_-]?key|bearer|authorization|token|secret)=[^\s&"']+/gi, '[REDACTED]') || 'Studio Builder generation failed';
}
