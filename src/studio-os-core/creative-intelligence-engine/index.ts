/**
 * Creative Intelligence Engine™ — Studio OS kernel reasoning layer.
 * Thinks before generation. Every founder request passes through here first.
 */

export type {
  QualityIntent,
  AssetType,
  RecommendedStrategy,
  RiskLevel,
  FounderIntentInput,
  ReusableAssetMatch,
  MissingAssetSpec,
  GenerationOrderStep,
  ApprovalGate,
  CostIntelligence,
  GenomeAlignment,
  CreativeIntelligenceDecision,
  LearningSignalAction,
  LearningSignalInput,
  GenomeSnapshotInput,
  KernelStage,
  KernelStageId,
} from './types';

export {
  CREATIVE_INTELLIGENCE_KERNEL_STAGES,
  runCreativeIntelligenceGate,
  shouldProceedToGeneration,
  formatDecisionForFounder,
} from './kernel';

export type { CreativeIntelligenceGateResult } from './kernel';
