/**
 * HTTP forensic capture for governed generation requests — diagnostic mode only.
 * Preserves raw provider/server response before client error translation collapses it.
 */
import { isWorldCompilerDiagnosticMode } from './diagnostic-mode';

export type GenerationRequestHttpForensic = {
  endpoint: string;
  httpStatus: number;
  responseBodyPreview: string;
  responseBodyLength: number;
  jsonParseSucceeded: boolean;
  parsedOk: boolean | null;
  parsedCode: string | null | undefined;
  parsedError: string | null | undefined;
  contentType: string | null;
  elapsedMs: number;
  clientTranslation:
    | 'json_parse_failure'
    | 'http_error_with_json'
    | 'http_error_empty_body'
    | 'success';
  synthesizedUserMessage: string | null;
  /** Whether the failure is likely server/platform (non-JSON) vs structured gateway JSON */
  responseClass: 'structured_json' | 'non_json_platform' | 'empty_body' | 'success';
  translationLayer: string;
  recordedAt: string;
};

const PREVIEW_MAX = 2048;

let lastCapture: GenerationRequestHttpForensic | null = null;

function truncatePreview(text: string): string {
  if (text.length <= PREVIEW_MAX) return text;
  return `${text.slice(0, PREVIEW_MAX)}…[truncated ${text.length - PREVIEW_MAX} chars]`;
}

export function recordGenerationRequestHttpForensic(input: {
  endpoint: string;
  httpStatus: number;
  responseText: string;
  contentType: string | null;
  elapsedMs: number;
  jsonParseSucceeded: boolean;
  parsed?: { ok?: boolean; code?: string; error?: string };
  returnedToCaller?: { ok: boolean; error?: string; code?: string };
}): GenerationRequestHttpForensic | null {
  if (!isWorldCompilerDiagnosticMode()) return null;

  const body = input.responseText ?? '';
  const isFunctionInvocationFailed = /FUNCTION_INVOCATION_FAILED/i.test(body);
  const isHtml = /^\s*</.test(body) || /text\/html/i.test(input.contentType ?? '');

  let clientTranslation: GenerationRequestHttpForensic['clientTranslation'] = 'success';
  let responseClass: GenerationRequestHttpForensic['responseClass'] = 'success';

  if (input.httpStatus >= 400) {
    if (!input.jsonParseSucceeded) {
      clientTranslation = 'json_parse_failure';
      responseClass = isFunctionInvocationFailed || isHtml ? 'non_json_platform' : 'non_json_platform';
    } else if (!body.trim()) {
      clientTranslation = 'http_error_empty_body';
      responseClass = 'empty_body';
    } else {
      clientTranslation = 'http_error_with_json';
      responseClass = 'structured_json';
    }
  }

  const capture: GenerationRequestHttpForensic = {
    endpoint: input.endpoint,
    httpStatus: input.httpStatus,
    responseBodyPreview: truncatePreview(body),
    responseBodyLength: body.length,
    jsonParseSucceeded: input.jsonParseSucceeded,
    parsedOk: input.parsed?.ok ?? null,
    parsedCode: input.parsed?.code ?? null,
    parsedError: input.parsed?.error ?? null,
    contentType: input.contentType,
    elapsedMs: input.elapsedMs,
    clientTranslation,
    synthesizedUserMessage: input.returnedToCaller?.error ?? null,
    responseClass,
    translationLayer:
      clientTranslation === 'json_parse_failure'
        ? 'src/services/studio/studioBuilder/api.ts:61-62'
        : clientTranslation === 'http_error_with_json'
          ? 'src/services/studio/studioBuilder/api.ts:64-68'
          : 'none',
    recordedAt: new Date().toISOString(),
  };

  lastCapture = capture;
  return capture;
}

export function getLastGenerationRequestHttpForensic(): GenerationRequestHttpForensic | null {
  return lastCapture;
}

export function clearGenerationRequestHttpForensic(): void {
  lastCapture = null;
}
