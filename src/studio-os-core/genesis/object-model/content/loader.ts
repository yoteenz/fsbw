import { registerCanonicalObject, type RegisterCanonicalObjectInput } from '../object-factory/factory';
import { addCanonicalObjectRelationship } from '../object-relationships/engine';
import { isCanonicalObjectType } from '../object-types/registry';
import type { CanonicalObject } from '../types';

export type CanonicalObjectPayload = RegisterCanonicalObjectInput & {
  relationships?: {
    toObjectId: string;
    type: string;
    rationale?: string;
    required?: boolean;
  }[];
};

/** Batch ingest — zero engineering changes when payload matches schema */
export function ingestCanonicalObjectPayload(payload: CanonicalObjectPayload): CanonicalObject {
  const { relationships, ...input } = payload;
  const object = registerCanonicalObject(input);

  for (const rel of relationships ?? []) {
    addCanonicalObjectRelationship({
      fromObjectId: object.objectId,
      toObjectId: rel.toObjectId,
      type: rel.type,
      rationale: rel.rationale,
      required: rel.required,
    });
  }

  return object;
}

export function ingestCanonicalObjectBatch(payloads: CanonicalObjectPayload[]): {
  ingested: CanonicalObject[];
  errors: string[];
} {
  const ingested: CanonicalObject[] = [];
  const errors: string[] = [];

  for (const payload of payloads) {
    try {
      if (!isCanonicalObjectType(payload.objectType)) {
        errors.push(`Invalid type: ${payload.objectType}`);
        continue;
      }
      ingested.push(ingestCanonicalObjectPayload(payload));
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  return { ingested, errors };
}
