/** Milestone 105 — Knowledge Confidence™ V1.0 */

export const KNOWLEDGE_CONFIDENCE_STORAGE_KEY = 'studioOsKnowledgeConfidence_v1';
export const KNOWLEDGE_CONFIDENCE_VERSION = '1.0.0';
export const STUDIO_OS_KNOWLEDGE_CONFIDENCE_UPDATED = 'studio-os-knowledge-confidence-updated';

export const KNOWLEDGE_CONFIDENCE_PHILOSOPHY = [
  'Not all knowledge carries the same level of certainty — Studio OS communicates confidence honestly.',
  'Organizations should immediately know where expertise is strongest and where additional teaching is needed.',
  'Trust begins with transparency — Studio OS never pretends to know more than it actually does.',
  'Knowledge Confidence™ is the quality assurance system for institutional intelligence.',
] as const;

export const CONFIDENCE_DIMENSIONS = [
  'knowledge-coverage',
  'decision-confidence',
  'documentation-completeness',
  'regulatory-currency',
  'training-coverage',
  'workflow-validation',
  'automation-readiness',
  'historical-accuracy',
  'practical-experience',
  'version-freshness',
] as const;

export const CONFIDENCE_DIMENSION_LABELS: Record<(typeof CONFIDENCE_DIMENSIONS)[number], string> = {
  'knowledge-coverage': 'Knowledge Coverage',
  'decision-confidence': 'Decision Confidence',
  'documentation-completeness': 'Documentation Completeness',
  'regulatory-currency': 'Regulatory Currency',
  'training-coverage': 'Training Coverage',
  'workflow-validation': 'Workflow Validation',
  'automation-readiness': 'Automation Readiness',
  'historical-accuracy': 'Historical Accuracy',
  'practical-experience': 'Practical Experience',
  'version-freshness': 'Version Freshness',
};

/** Brains below this threshold generate learning recommendations. */
export const LOW_CONFIDENCE_THRESHOLD = 75;

/** Dimensions below this threshold trigger continuous improvement alerts. */
export const LOW_DIMENSION_THRESHOLD = 70;

export const CONFIDENCE_DECREASE_TRIGGERS = [
  'Regulation changes',
  'Missing documentation',
  'Incomplete workflows',
  'Conflicting guidance',
  'New services',
  'Outdated policies',
] as const;
