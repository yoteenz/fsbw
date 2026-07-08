import { commandCenterContext } from './command-center';
import { creativeDirectionContext } from './creative-direction';
import { warehouseContext } from './warehouse';
import { marketingContext } from './marketing';
import { financeContext } from './finance';
import { operationsContext } from './operations';
import { productContext } from './product';
import { customerExperienceContext } from './customer-experience';
import { legalContext } from './legal';
import { intelligenceContext } from './intelligence';
import type { OrbContextDefinition } from './types';

/** All registered Orb contexts — future departments append here only. */
export const ORB_CONTEXT_REGISTRY: OrbContextDefinition[] = [
  commandCenterContext,
  creativeDirectionContext,
  warehouseContext,
  marketingContext,
  financeContext,
  operationsContext,
  productContext,
  customerExperienceContext,
  legalContext,
  intelligenceContext,
];

export const ORB_CONTEXT_BY_ID: Record<string, OrbContextDefinition> = Object.fromEntries(
  ORB_CONTEXT_REGISTRY.map((context) => [context.contextId, context])
);

export const DEFAULT_ORB_CONTEXT_ID = commandCenterContext.contextId;

export * from './types';
export * from './command-center';
export * from './creative-direction';
export * from './warehouse';
export * from './marketing';
export * from './finance';
export * from './operations';
export * from './product';
export * from './customer-experience';
export * from './legal';
export * from './intelligence';
