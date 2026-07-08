/**
 * FAL generation adapter — connects Studio Foundry™ to existing server-side FAL integration.
 * Gracefully degrades when credentials/endpoints are unavailable.
 */

import type { FoundryGenerateRequest, FoundryGenerateResult } from './foundryTypes';

type FalGenerateApiResponse = {
  ok: boolean;
  publicUrl?: string;
  storagePath?: string;
  model?: string;
  error?: string;
};

export async function callFoundryFalAdapter(
  request: FoundryGenerateRequest & { prompt: string; recipeId: string; assetName: string }
): Promise<FalGenerateApiResponse> {
  try {
    const res = await fetch('/api/admin/studio-foundry-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: request.slug,
        recipeId: request.recipeId,
        assetName: request.assetName,
        prompt: request.prompt,
        regenerate: request.regenerate ?? false,
        organizationId: request.organizationId,
        creator: request.creator ?? 'Studio Foundry',
      }),
    });

    if (res.status === 503) {
      return { ok: false, error: 'FAL_KEY not configured' };
    }

    const data = (await res.json()) as FalGenerateApiResponse;
    return data;
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Foundry FAL adapter unavailable',
    };
  }
}

export function foundryAdapterLabel(result: FoundryGenerateResult): string {
  switch (result.adapter) {
    case 'fal-api':
      return 'FAL API connected';
    case 'local-plan-only':
      return 'Compiler plan only (generation deferred)';
    case 'unavailable':
      return 'Adapter unavailable — placeholder UI active';
  }
}
