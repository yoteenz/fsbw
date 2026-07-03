import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from './types';

export type OpenAICompletionInput = {
  prompt: string;
  model?: string;
  temperature?: number;
};

export type OpenAICompletionOutput = {
  text: string;
  model: string;
};

export const openaiStudioService: StudioServiceStub & {
  generateCompletion(_input: OpenAICompletionInput): Promise<StudioServiceResult<OpenAICompletionOutput>>;
  generateScript(_input: OpenAICompletionInput): Promise<StudioServiceResult<OpenAICompletionOutput>>;
} = {
  id: 'openai',
  label: 'OPENAI',
  phase: 2,
  enabled: false,
  description: 'SCRIPT GENERATION · PROMPT COMPLETIONS · CONTENT PACK OUTLINES',
  async generateCompletion() {
    return studioServiceNotConnected('OpenAI is not connected. Wire API key in Phase 2.');
  },
  async generateScript() {
    return studioServiceNotConnected('OpenAI script generation is not connected. Wire API key in Phase 2.');
  },
};
