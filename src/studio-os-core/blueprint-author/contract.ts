/**
 * Blueprint Author™ — deterministic construction specification.
 * Design is specified here. AI only executes bounded jobs.
 */

export const BLUEPRINT_AUTHOR_VERSION = 'blueprint-author.v1';

export type BlueprintRevisionVersions = {
  blueprintVersion: string;
  organizationVersion: string;
  worldVersion: string;
  roomVersion: string;
  architectureVersion: string;
  materialVersion: string;
  assetVersion: string;
  interactionVersion: string;
  lightingVersion: string;
  validationVersion: string;
  generationVersion: string;
  promptVersion: string;
  compilerVersion: string;
};

export type BlueprintAuthorMetadata = {
  revision: number;
  author: string;
  authoredAt: string;
  compilerVersion: string;
  organizationId: string;
  sceneVersion: string;
};

export type FounderCompileRequest = {
  requestId: string;
  organizationId: string;
  buildingId: string;
  floorId: string;
  roomId: string;
  stationId: string;
  departmentId: string;
  projectId: string;
  /** Natural language intent — Blueprint Author translates to spec; AI never receives this directly */
  founderIntent: string;
  roomType: string;
  styleProfileId: string;
};

/** Canonical compile order with Blueprint Author as first stage */
export const BLUEPRINT_COMPILER_ORDER = [
  'founder-request',
  'blueprint-author',
  'construction-plan',
  'job-queue',
  'ai-workers',
  'quality-guard',
  'immune-system',
  'scene-stack',
  'living-room',
] as const;

export type BlueprintCompilerPhase = (typeof BLUEPRINT_COMPILER_ORDER)[number];
