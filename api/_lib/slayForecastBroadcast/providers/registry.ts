import {
  FULL_BROADCAST_DURATION_SEC,
  MOCK_CLOSING_PLACEHOLDER,
  MOCK_OPENING_PLACEHOLDER,
} from '../constants.js';
import { slayForecastGenerationConfig } from '../generationConfig.js';
import type { GenerationModelCapability, GenerationProviderId } from '../types.js';
import type {
  ForecastVideoGenerationProvider,
  ProviderPollResult,
  ProviderSubmitInput,
  ProviderSubmitResult,
} from './types.js';

export const MINIMAX_H3_MODEL = slayForecastGenerationConfig.model;

export const MODEL_CAPABILITIES: GenerationModelCapability[] = [
  {
    provider: 'mock',
    modelId: 'mock-v1',
    supportsStartFrame: true,
    supportsEndFrame: true,
    supportsAudio: false,
    supportsLipSync: false,
    supportsDuration: true,
    supportsSeed: false,
    supportsNegativePrompt: false,
  },
  {
    provider: 'fal',
    modelId: process.env.SLAY_FORECAST_FAL_VIDEO_MODEL?.trim() || 'fal-ai/kling-video/v3/pro/image-to-video',
    supportsStartFrame: true,
    supportsEndFrame: false,
    supportsAudio: false,
    supportsLipSync: false,
    supportsDuration: true,
    supportsSeed: false,
    supportsNegativePrompt: true,
  },
  {
    provider: 'minimax',
    modelId: MINIMAX_H3_MODEL,
    supportsStartFrame: true,
    supportsEndFrame: false,
    supportsAudio: true,
    supportsLipSync: true,
    supportsDuration: true,
    supportsSeed: false,
    supportsNegativePrompt: false,
  },
  {
    provider: 'openart',
    modelId: 'openart-video-v1',
    supportsStartFrame: true,
    supportsEndFrame: false,
    supportsAudio: false,
    supportsLipSync: false,
    supportsDuration: true,
    supportsSeed: false,
    supportsNegativePrompt: false,
  },
];

const mockJobs = new Map<
  string,
  { segmentType: 'opening' | 'closing' | 'full'; createdAt: number }
>();

export class MockForecastVideoProvider implements ForecastVideoGenerationProvider {
  readonly id = 'mock';

  async submit(input: ProviderSubmitInput): Promise<ProviderSubmitResult> {
    const providerJobId = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    mockJobs.set(providerJobId, { segmentType: input.segmentType, createdAt: Date.now() });
    return { providerJobId, estimatedCost: 0 };
  }

  async poll(_modelId: string, providerJobId: string): Promise<ProviderPollResult> {
    const job = mockJobs.get(providerJobId);
    if (!job) return { status: 'failed', error: 'Mock job not found' };
    if (Date.now() - job.createdAt < 800) return { status: 'generating' };
    const outputUrl =
      job.segmentType === 'closing'
        ? MOCK_CLOSING_PLACEHOLDER
        : job.segmentType === 'full'
          ? MOCK_OPENING_PLACEHOLDER
          : MOCK_OPENING_PLACEHOLDER;
    return { status: 'completed', outputUrl, actualCost: 0 };
  }
}

type MiniMaxTaskResponse = {
  task_id?: string;
  base_resp?: { status_code?: number; status_msg?: string };
};

type MiniMaxQueryResponse = {
  status?: string;
  file_id?: string;
  base_resp?: { status_code?: number; status_msg?: string };
};

export class MiniMaxH3ForecastVideoProvider implements ForecastVideoGenerationProvider {
  readonly id = 'minimax';

  private baseUrl(): string {
    return process.env.MINIMAX_API_BASE?.trim() || 'https://api.minimax.io';
  }

  private apiKey(): string {
    const key = process.env.MINIMAX_API_KEY?.trim();
    if (!key) throw new Error('MINIMAX_API_KEY not configured');
    return key;
  }

  async submit(input: ProviderSubmitInput): Promise<ProviderSubmitResult> {
    const imageUrl = input.startFrameUrl ?? slayForecastGenerationConfig.masterImage;
    if (!imageUrl) throw new Error('MiniMax H3 requires approved master image URL');

    const duration = Math.min(
      15,
      Math.max(4, Math.round(input.durationSec || FULL_BROADCAST_DURATION_SEC)),
    );

    const payload = {
      model: MINIMAX_H3_MODEL,
      content: [
        { type: 'text', text: input.prompt },
        {
          type: 'image_url',
          image_url: { url: imageUrl },
          role: 'first_frame',
        },
      ],
      duration,
      resolution: slayForecastGenerationConfig.apiResolution,
      ratio: slayForecastGenerationConfig.aspectRatio,
    };

    const res = await fetch(`${this.baseUrl()}/v2/video_generation`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const body = (await res.json().catch(() => ({}))) as MiniMaxTaskResponse;
    if (!res.ok || body.base_resp?.status_code !== 0) {
      throw new Error(body.base_resp?.status_msg ?? `MiniMax submit failed (${res.status})`);
    }
    if (!body.task_id) throw new Error('MiniMax did not return task_id');

    return { providerJobId: body.task_id, estimatedCost: null };
  }

  async poll(_modelId: string, providerJobId: string): Promise<ProviderPollResult> {
    const res = await fetch(
      `${this.baseUrl()}/v2/video_generation/query?task_id=${encodeURIComponent(providerJobId)}`,
      {
        headers: { Authorization: `Bearer ${this.apiKey()}` },
      },
    );
    const body = (await res.json().catch(() => ({}))) as MiniMaxQueryResponse & {
      video_url?: string;
      output?: { video_url?: string };
    };

    if (!res.ok) {
      return { status: 'failed', error: body.base_resp?.status_msg ?? `MiniMax poll failed (${res.status})` };
    }

    const status = (body.status ?? '').toLowerCase();
    if (status === 'processing' || status === 'queueing' || status === 'pending') {
      return { status: 'generating' };
    }
    if (status === 'failed' || status === 'fail') {
      return { status: 'failed', error: body.base_resp?.status_msg ?? 'MiniMax generation failed' };
    }

    const videoUrl = body.video_url ?? body.output?.video_url ?? null;
    if (!videoUrl && body.file_id) {
      const fileRes = await fetch(
        `${this.baseUrl()}/v1/files/retrieve?file_id=${encodeURIComponent(body.file_id)}`,
        { headers: { Authorization: `Bearer ${this.apiKey()}` } },
      );
      const fileBody = (await fileRes.json().catch(() => ({}))) as {
        file?: { download_url?: string };
      };
      const downloadUrl = fileBody.file?.download_url ?? null;
      if (downloadUrl) return { status: 'completed', outputUrl: downloadUrl, actualCost: null };
    }

    if (!videoUrl) return { status: 'generating' };
    return { status: 'completed', outputUrl: videoUrl, actualCost: null };
  }
}

export class FalKlingForecastVideoProvider implements ForecastVideoGenerationProvider {
  readonly id = 'fal';

  async submit(input: ProviderSubmitInput): Promise<ProviderSubmitResult> {
    const falKey = process.env.FAL_KEY?.trim();
    if (!falKey) throw new Error('FAL_KEY not configured');
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });

    const imageUrl = input.startFrameUrl ?? input.endFrameUrl;
    if (!imageUrl) throw new Error('FAL Kling requires a start frame URL');

    const falInput: Record<string, unknown> = {
      prompt: input.prompt,
      image_url: imageUrl,
      duration: String(Math.min(6, Math.max(4, Math.round(input.durationSec)))),
    };

    const { request_id: providerJobId } = await fal.queue.submit(input.modelId, { input: falInput });
    return { providerJobId, estimatedCost: null };
  }

  async poll(modelId: string, providerJobId: string): Promise<ProviderPollResult> {
    const { pollStudioBuilderFalQueue } = await import('../../studioBuilderGeneration.js');
    const { status } = await pollStudioBuilderFalQueue(modelId, providerJobId);
    if (status === 'IN_QUEUE' || status === 'IN_PROGRESS') return { status: 'generating' };
    if (status === 'FAILED') return { status: 'failed', error: 'FAL generation failed' };

    const falKey = process.env.FAL_KEY?.trim();
    if (!falKey) throw new Error('FAL_KEY not configured');
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });
    const result = await fal.queue.result(modelId, { requestId: providerJobId });
    const videoUrl =
      (result as { data?: { video?: { url?: string } } })?.data?.video?.url ??
      (result as { data?: { videos?: Array<{ url?: string }> } })?.data?.videos?.[0]?.url ??
      null;
    if (!videoUrl) return { status: 'failed', error: 'No video URL in FAL result' };
    return { status: 'completed', outputUrl: videoUrl, actualCost: null };
  }
}

const providers: Record<GenerationProviderId, ForecastVideoGenerationProvider> = {
  mock: new MockForecastVideoProvider(),
  fal: new FalKlingForecastVideoProvider(),
  minimax: new MiniMaxH3ForecastVideoProvider(),
  openart: new MockForecastVideoProvider(),
};

export function resolveProvider(providerId: GenerationProviderId): ForecastVideoGenerationProvider {
  if (providerId === 'mock') return providers.mock;
  if (providerId === 'fal') {
    if (!process.env.FAL_KEY?.trim()) return providers.mock;
    return providers.fal;
  }
  if (providerId === 'minimax') {
    if (!process.env.MINIMAX_API_KEY?.trim()) return providers.mock;
    return providers.minimax;
  }
  return providers[providerId] ?? providers.mock;
}

export function defaultModelForProvider(providerId: GenerationProviderId): string {
  const cap = MODEL_CAPABILITIES.find((c) => c.provider === providerId);
  return cap?.modelId ?? 'mock-v1';
}

export function defaultProviderForProduction(): GenerationProviderId {
  if (process.env.MINIMAX_API_KEY?.trim()) return 'minimax';
  return (process.env.SLAY_FORECAST_GENERATION_PROVIDER?.trim() as GenerationProviderId) ?? 'mock';
}
