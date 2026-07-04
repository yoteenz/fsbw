/**
 * studio os Blueprint Manager — platform specification types.
 */

export type BlueprintScope = 'global' | 'workspace';

export type BlueprintStatus = 'draft' | 'review' | 'approved' | 'deprecated' | 'archived';

export type BlueprintCategoryId =
  | 'show'
  | 'episode'
  | 'campaign'
  | 'product'
  | 'talent'
  | 'studio'
  | 'social'
  | 'email'
  | 'thumbnail'
  | 'brand'
  | 'environment'
  | 'wardrobe'
  | 'custom';

export type BlueprintIdentity = {
  name: string;
  description: string;
  category: BlueprintCategoryId;
  scope: BlueprintScope;
};

export type BlueprintVersion = {
  version: string;
  status: BlueprintStatus;
  updatedAt: string;
  author?: string;
};

export type BlueprintDefinition = {
  id: string;
  identity: BlueprintIdentity;
  status: BlueprintStatus;
  currentVersion: BlueprintVersion;
  tags?: string[];
};
