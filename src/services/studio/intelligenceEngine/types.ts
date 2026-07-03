import type {
  IntelligenceConnectorId,
  IntelligenceEvidenceSeed,
  IntelligenceTypeId,
  ConfidenceLevel,
} from '../../../utils/adminStudioIntelligenceDemo';

export type ConnectorRuntimeState = {
  enabled: boolean;
  connected: boolean;
  lastSyncAt: string | null;
  statusMessage: string;
};

export type IntelligenceEvidence = IntelligenceEvidenceSeed & {
  connectorLabel: string;
  collectedAt: string;
  dataAvailable: boolean;
};

export type IntelligenceRecommendation = {
  id: string;
  title: string;
  intelligenceType: IntelligenceTypeId;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  evidence: IntelligenceEvidence[];
  suggestedShowId?: string;
  suggestedCtaId?: string;
  suggestedProducts?: string[];
  insufficientEvidence: boolean;
  reason?: string;
};

export type TopicForecast = {
  id: string;
  title: string;
  window: string;
  intelligenceType: IntelligenceTypeId;
  ready: boolean;
  missingConnectors: string[];
};

export type IntelligenceGatherResult = {
  gatheredAt: string;
  activeConnectors: IntelligenceConnectorId[];
  recommendations: IntelligenceRecommendation[];
  forecasts: TopicForecast[];
  hasActionableData: boolean;
};

export type CreativeDirectorIntelligenceFeed = {
  briefingBullets: string[];
  suggestedTopic: string | null;
  suggestedShowId: string | null;
  suggestedCtaId: string | null;
  suggestedProductIds: string[];
  campaignSuggestions: string[];
  publishingNotes: string[];
  insufficientData: boolean;
};
