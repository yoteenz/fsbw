import type { SupabaseClient } from '@supabase/supabase-js';
import type { GenerationJobRow, GenerationSegmentType } from './types.js';

export type ProviderSubmitInput = {
  segmentType: 'opening' | 'closing' | 'full';
  prompt: string;
  modelId: string;
  durationSec: number;
  startFrameUrl?: string | null;
  endFrameUrl?: string | null;
  isTest?: boolean;
};

export type ProviderSubmitResult = {
  providerJobId: string;
  estimatedCost?: number | null;
};

export type ProviderPollResult = {
  status: 'generating' | 'completed' | 'failed';
  outputUrl?: string;
  actualCost?: number | null;
  error?: string;
};

export interface ForecastVideoGenerationProvider {
  readonly id: string;
  submit(input: ProviderSubmitInput): Promise<ProviderSubmitResult>;
  poll(modelId: string, providerJobId: string): Promise<ProviderPollResult>;
}

export type ProviderRegistryEntry = {
  provider: ForecastVideoGenerationProvider;
  defaultModelId: string;
};

export function isJobActive(job: Pick<GenerationJobRow, 'status'>): boolean {
  return job.status === 'queued' || job.status === 'generating';
}

export async function hasActiveGenerationJob(
  supabase: SupabaseClient,
  editionSlug: string,
  segmentType: GenerationSegmentType,
): Promise<boolean> {
  const { data } = await supabase
    .from('slay_forecast_generation_jobs')
    .select('id, status')
    .eq('edition_slug', editionSlug)
    .eq('segment_type', segmentType)
    .in('status', ['queued', 'generating'])
    .limit(1);
  return (data?.length ?? 0) > 0;
}
