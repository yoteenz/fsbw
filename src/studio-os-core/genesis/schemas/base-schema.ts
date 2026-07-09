import type { GenesisObject, GenesisObjectType } from '../types';

export const GENESIS_BASE_SCHEMA_FIELDS = [
  'objectId',
  'type',
  'title',
  'category',
  'status',
  'pipelineStage',
  'version',
  'canonicalStatus',
  'createdAt',
  'updatedAt',
  'author',
  'contributors',
  'dependencies',
  'relationships',
  'reviewHistory',
  'tags',
  'references',
  'revisionHistory',
] as const;

export type GenesisSchemaValidationResult = {
  valid: boolean;
  missingFields: string[];
  errors: string[];
};

export function validateGenesisObjectSchema(object: Partial<GenesisObject>): GenesisSchemaValidationResult {
  const missingFields: string[] = [];
  const errors: string[] = [];

  for (const field of GENESIS_BASE_SCHEMA_FIELDS) {
    const value = object[field as keyof GenesisObject];
    if (value === undefined || value === null) {
      missingFields.push(field);
    }
  }

  if (object.title !== undefined && object.title.trim().length === 0) {
    errors.push('title must not be empty');
  }

  if (object.objectId !== undefined && !/^GEN-[A-Z0-9-]+$/.test(object.objectId)) {
    errors.push('objectId must match GEN-{TYPE}-{SLUG} pattern');
  }

  if (object.version) {
    const { major, minor, patch } = object.version;
    if ([major, minor, patch].some((n) => typeof n !== 'number' || n < 0)) {
      errors.push('version major/minor/patch must be non-negative numbers');
    }
  }

  return {
    valid: missingFields.length === 0 && errors.length === 0,
    missingFields,
    errors,
  };
}

export function getSchemaFieldsForType(type: GenesisObjectType): string[] {
  const common = [...GENESIS_BASE_SCHEMA_FIELDS];
  switch (type) {
    case 'article':
      return [...common, 'summary', 'payload.thesis', 'payload.guidingPrinciples'];
    case 'adr':
      return [...common, 'payload.decisionContext', 'payload.decision', 'payload.consequences'];
    case 'specification':
      return [...common, 'payload.specKind', 'payload.normativeStatements'];
    case 'implementation':
      return [...common, 'payload.codePaths', 'payload.implements'];
    default:
      return common;
  }
}
