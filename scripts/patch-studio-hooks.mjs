import fs from 'fs';
import path from 'path';

const HOOK_MAP = [
  ['useOrganizationalGuardianState.ts', 'organizational-guardian', 'OrganizationGuardianProfile', 'getOrganizationGuardianProfile', 'syncOrganizationalGuardianFromSources', 'STUDIO_OS_ORGANIZATIONAL_GUARDIAN_UPDATED'],
  ['useDesignComplianceEngineState.ts', 'design-compliance-engine', 'OrganizationDesignComplianceEngineProfile', 'getOrganizationDesignComplianceEngineProfile', 'syncDesignComplianceEngineFromSources', 'STUDIO_OS_DESIGN_COMPLIANCE_ENGINE_UPDATED'],
  ['usePromptQaState.ts', 'prompt-qa', 'OrganizationPromptQaProfile', 'getOrganizationPromptQaProfile', 'syncPromptQaFromSources', 'STUDIO_OS_PROMPT_QA_UPDATED'],
  ['useExperienceQaState.ts', 'experience-qa', 'OrganizationExperienceQaProfile', 'getOrganizationExperienceQaProfile', 'syncExperienceQaFromSources', 'STUDIO_OS_EXPERIENCE_QA_UPDATED'],
  ['useVisualDiffEngineState.ts', 'visual-diff-engine', 'OrganizationVisualDiffEngineProfile', 'getOrganizationVisualDiffEngineProfile', 'syncVisualDiffEngineFromSources', 'STUDIO_OS_VISUAL_DIFF_ENGINE_UPDATED'],
  ['useAccessibilityAuditorState.ts', 'accessibility-auditor', 'OrganizationAccessibilityAuditorProfile', 'getOrganizationAccessibilityAuditorProfile', 'syncAccessibilityAuditorFromSources', 'STUDIO_OS_ACCESSIBILITY_AUDITOR_UPDATED'],
  ['usePerformanceMonitorState.ts', 'performance-monitor', 'OrganizationPerformanceMonitorProfile', 'getOrganizationPerformanceMonitorProfile', 'syncPerformanceMonitorFromSources', 'STUDIO_OS_PERFORMANCE_MONITOR_UPDATED'],
  ['useRegressionEngineState.ts', 'regression-engine', 'OrganizationRegressionEngineProfile', 'getOrganizationRegressionEngineProfile', 'syncRegressionEngineFromSources', 'STUDIO_OS_REGRESSION_ENGINE_UPDATED'],
  ['useReleaseReadinessState.ts', 'release-readiness', 'OrganizationReleaseReadinessProfile', 'getOrganizationReleaseReadinessProfile', 'syncReleaseReadinessFromSources', 'STUDIO_OS_RELEASE_READINESS_UPDATED'],
  ['useEngineeringExcellenceState.ts', 'engineering-excellence-dashboard', 'OrganizationEngineeringExcellenceProfile', 'getOrganizationEngineeringExcellenceProfile', 'syncEngineeringExcellenceFromSources', 'STUDIO_OS_ENGINEERING_EXCELLENCE_UPDATED'],
  ['useQaHeadquartersState.ts', 'qa-headquarters', 'OrganizationQaHeadquartersProfile', 'getOrganizationQaHeadquartersProfile', 'syncQaHeadquartersFromSources', 'STUDIO_OS_QA_HEADQUARTERS_UPDATED'],
  ['useQaInspectorState.ts', 'qa-inspector', 'OrganizationQaInspectorProfile', 'getOrganizationQaInspectorProfile', 'syncQaInspectorFromSources', 'STUDIO_OS_QA_INSPECTOR_UPDATED'],
  ['useQaSimulationEngineState.ts', 'qa-simulation-engine', 'OrganizationQaSimulationEngineProfile', 'getOrganizationQaSimulationEngineProfile', 'syncQaSimulationEngineFromSources', 'STUDIO_OS_QA_SIMULATION_ENGINE_UPDATED'],
  ['useAiRedTeamState.ts', 'ai-red-team', 'OrganizationAiRedTeamProfile', 'getOrganizationAiRedTeamProfile', 'syncAiRedTeamFromSources', 'STUDIO_OS_AI_RED_TEAM_UPDATED'],
  ['useExecutiveTrustDashboardState.ts', 'executive-trust-dashboard', 'OrganizationExecutiveTrustDashboardProfile', 'getOrganizationExecutiveTrustDashboardProfile', 'syncExecutiveTrustDashboardFromSources', 'STUDIO_OS_EXECUTIVE_TRUST_DASHBOARD_UPDATED'],
  ['useTimeMachineState.ts', 'time-machine', 'OrganizationTimeMachineProfile', 'getOrganizationTimeMachineProfile', 'syncTimeMachineFromSources', 'STUDIO_OS_TIME_MACHINE_UPDATED'],
  ['usePredictiveQaState.ts', 'predictive-qa', 'OrganizationPredictiveQaProfile', 'getOrganizationPredictiveQaProfile', 'syncPredictiveQaFromSources', 'STUDIO_OS_PREDICTIVE_QA_UPDATED'],
  ['useSelfHealingEngineState.ts', 'self-healing-engine', 'OrganizationSelfHealingEngineProfile', 'getOrganizationSelfHealingEngineProfile', 'syncSelfHealingEngineFromSources', 'STUDIO_OS_SELF_HEALING_ENGINE_UPDATED'],
  ['useDecisionAuditState.ts', 'decision-audit', 'OrganizationDecisionAuditProfile', 'getOrganizationDecisionAuditProfile', 'syncDecisionAuditFromSources', 'STUDIO_OS_DECISION_AUDIT_UPDATED'],
  ['useConfidenceEngineState.ts', 'confidence-engine', 'OrganizationConfidenceEngineProfile', 'getOrganizationConfidenceEngineProfile', 'syncConfidenceEngineFromSources', 'STUDIO_OS_CONFIDENCE_ENGINE_UPDATED'],
  ['useCompanyHealthIndexState.ts', 'company-health-index', 'OrganizationHealthIndexProfile', 'getOrganizationHealthIndexProfile', 'syncCompanyHealthIndexFromSources', 'STUDIO_OS_COMPANY_HEALTH_INDEX_UPDATED'],
  ['useKnowledgeConfidenceState.ts', 'knowledge-confidence', 'OrganizationKnowledgeConfidenceProfile', 'getOrganizationKnowledgeConfidenceProfile', 'syncKnowledgeConfidenceFromSources', 'STUDIO_OS_KNOWLEDGE_CONFIDENCE_UPDATED'],
];

for (const [file, mod, type, getFn, syncFn, event] of HOOK_MAP) {
  const hookPath = path.join('src/hooks', file);
  if (!fs.existsSync(hookPath)) {
    console.log('skip missing', file);
    continue;
  }
  const fnName = file.replace('.ts', '');
  const content = `import { useStudioProfileState } from './useStudioProfileState';
import {
  ${event},
  ${getFn},
  ${syncFn},
  type ${type},
} from '../studio-os-core/${mod}';

export function ${fnName}() {
  return useStudioProfileState<${type}>({
    getProfile: ${getFn},
    syncProfile: ${syncFn},
    updatedEvent: ${event},
  });
}
`;
  fs.writeFileSync(hookPath, content);
  console.log('updated', file);
}
