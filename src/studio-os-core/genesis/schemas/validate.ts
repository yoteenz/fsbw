import { validateGenesisObjectSchema } from './base-schema';
import { getGenesisObjectSchemaMeta } from './object-schemas';
import type { GenesisObject, GenesisObjectType } from '../types';

export type GenesisValidationReport = {
  objectId: string;
  valid: boolean;
  schemaValid: boolean;
  payloadValid: boolean;
  missingFields: string[];
  missingPayloadFields: string[];
  errors: string[];
};

export function validateGenesisObject(object: GenesisObject): GenesisValidationReport {
  const schema = validateGenesisObjectSchema(object);
  const meta = getGenesisObjectSchemaMeta(object.type);
  const missingPayloadFields: string[] = [];
  const payload = object.payload ?? {};

  for (const field of meta.requiredPayloadFields) {
    if (payload[field] === undefined || payload[field] === null) {
      missingPayloadFields.push(field);
    }
  }

  const payloadValid = missingPayloadFields.length === 0;
  const valid = schema.valid && payloadValid;

  return {
    objectId: object.objectId,
    valid,
    schemaValid: schema.valid,
    payloadValid,
    missingFields: schema.missingFields,
    missingPayloadFields,
    errors: schema.errors,
  };
}

export function assertGenesisObjectValid(object: GenesisObject): void {
  const report = validateGenesisObject(object);
  if (!report.valid) {
    const parts = [
      ...report.missingFields.map((f) => `missing ${f}`),
      ...report.missingPayloadFields.map((f) => `missing payload.${f}`),
      ...report.errors,
    ];
    throw new Error(`Genesis object ${object.objectId} invalid: ${parts.join('; ')}`);
  }
}

export function validateObjectTypePayload(
  type: GenesisObjectType,
  payload: Record<string, unknown>
): string[] {
  const meta = getGenesisObjectSchemaMeta(type);
  return meta.requiredPayloadFields.filter((field) => payload[field] === undefined);
}
