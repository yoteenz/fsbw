import { registerCoreSystem, type RegisterCoreSystemInput } from '../systems/engine';
import { registerIntegrationContract, type RegisterIntegrationContractInput } from '../contracts/integration';
import { registerExpansionHook, type RegisterExpansionHookInput } from '../hooks/expansion';
import type { CoreSystemBlueprint } from '../types';

export type CoreSystemPayload = RegisterCoreSystemInput;

/** Batch ingest — zero engineering changes when payload matches schema */
export function ingestCoreSystemPayload(payload: CoreSystemPayload): CoreSystemBlueprint {
  return registerCoreSystem(payload);
}

export function ingestCoreSystemBatch(payloads: CoreSystemPayload[]): {
  ingested: CoreSystemBlueprint[];
  errors: string[];
} {
  const ingested: CoreSystemBlueprint[] = [];
  const errors: string[] = [];

  for (const payload of payloads) {
    try {
      if (!payload.officialName?.trim()) {
        errors.push('Missing officialName');
        continue;
      }
      if (!payload.domain?.trim()) {
        errors.push(`Missing domain for ${payload.officialName}`);
        continue;
      }
      ingested.push(ingestCoreSystemPayload(payload));
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  return { ingested, errors };
}

export type IntegrationContractPayload = RegisterIntegrationContractInput;
export type ExpansionHookPayload = RegisterExpansionHookInput;

export function ingestIntegrationContractPayload(payload: IntegrationContractPayload) {
  return registerIntegrationContract(payload);
}

export function ingestExpansionHookPayload(payload: ExpansionHookPayload) {
  return registerExpansionHook(payload);
}
