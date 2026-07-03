import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from './types';

export type FalImageInput = {
  prompt: string;
  referenceUrls?: string[];
  aspectRatio?: string;
};

export type FalImageOutput = {
  imageUrl: string;
  model: string;
};

export const falStudioService: StudioServiceStub & {
  generateThumbnail(_input: FalImageInput): Promise<StudioServiceResult<FalImageOutput>>;
  generateSceneImage(_input: FalImageInput): Promise<StudioServiceResult<FalImageOutput>>;
} = {
  id: 'fal',
  label: 'FAL',
  phase: 2,
  enabled: false,
  description: 'THUMBNAILS · SCENE IMAGES · NOIR MANNEQUIN PREVIEWS',
  async generateThumbnail() {
    return studioServiceNotConnected('Fal image generation is not connected. Wire Fal API in Phase 2.');
  },
  async generateSceneImage() {
    return studioServiceNotConnected('Fal scene images are not connected. Wire Fal API in Phase 2.');
  },
};
