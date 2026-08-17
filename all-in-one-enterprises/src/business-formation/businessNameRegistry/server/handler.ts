import type { BusinessStructure } from '../../../intake/intakeTypes';
import { checkBusinessNameAvailability, logNameCheckHealth } from '../registryService';
import {
  checkBusinessNameRateLimit,
  clientIpFromHeaders,
  validateBusinessNameCheckBody,
} from './rateLimit';

export async function handleBusinessNameCheckRequest(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const ip = clientIpFromHeaders(req.headers);
  const limit = checkBusinessNameRateLimit(ip);
  if (!limit.allowed) {
    return json(
      { error: 'Rate limit exceeded.', code: 'RATE_LIMITED', retryAfterMs: limit.retryAfterMs },
      429,
      { 'Retry-After': String(Math.ceil((limit.retryAfterMs ?? 60000) / 1000)) },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body.', code: 'INVALID_JSON' }, 400);
  }

  const parsed = validateBusinessNameCheckBody(body);
  if (!parsed.ok) {
    return json({ error: parsed.error, code: parsed.code }, 400);
  }

  const allowDemo = process.env.AIO_ALLOW_DEMO_NAME_CHECK === '1' || process.env.NODE_ENV !== 'production';
  const demoMode = parsed.value.demoMode && allowDemo;

  const started = Date.now();
  try {
    const response = await checkBusinessNameAvailability({
      state: parsed.value.state,
      businessName: parsed.value.businessName,
      entityType: parsed.value.entityType as BusinessStructure | undefined,
      demoMode,
    });

    logNameCheckHealth({
      state: parsed.value.state,
      status: response.status,
      adapter: demoMode ? 'demo' : response.source,
      latencyMs: Date.now() - started,
      errorCode: response.errorCode,
    });

    return json(response, 200);
  } catch {
    logNameCheckHealth({
      state: parsed.value.state,
      status: 'error',
      adapter: 'unknown',
      latencyMs: Date.now() - started,
      errorCode: 'INTERNAL_ERROR',
    });
    return json({ error: 'Internal server error.', code: 'INTERNAL_ERROR' }, 500);
  }
}

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}
