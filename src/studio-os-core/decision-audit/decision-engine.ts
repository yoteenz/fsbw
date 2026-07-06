import { getOrganizationExecutiveTrustDashboardProfile } from '../executive-trust-dashboard/store';
import { getOrganizationPredictiveQaProfile } from '../predictive-qa/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationSelfHealingEngineProfile } from '../self-healing-engine/store';
import {
  AUDIT_SOURCE_LABELS,
  DECISION_TYPE_LABELS,
} from './constants';
import type { AuditSource, DecisionRecord, DecisionType } from './types';

type DecisionSeed = Omit<
  DecisionRecord,
  'id' | 'decisionTypeLabel' | 'auditSourceLabel' | 'timestamp'
>;

const DECISION_SEEDS: DecisionSeed[] = [
  {
    decisionType: 'approve-workflow',
    decision: 'Approved onboarding workflow v3 for production deployment.',
    decisionMaker: 'Chief Concierge · Human Administrator',
    auditSource: 'workflow-engine',
    confidencePct: 94,
    supportingEvidence: [
      'QA Simulation Engine: 6/7 personas passed with 91% success rate',
      'Production gate cleared · accessibility audit passed',
      'Executive Trust Dashboard workflow trust at 88%',
    ],
    knowledgeSourcesUsed: ['Workflow Template v3', 'QA Simulation Results', 'Customer Journey Map'],
    alternativeOptionsConsidered: ['Deploy v2 with hotfix · Delay 2 weeks for additional testing · Partial rollout to 10%'],
    potentialRisks: ['Mobile checkout path still has minor drop-off risk at 14%'],
    businessImpact: 'Enables scaled customer onboarding · projected 23% conversion improvement',
    organizationAffected: 'Headquarters',
    department: 'Operations',
    workflow: 'Customer Onboarding v3',
    approvalStatus: 'approved',
    whyItHappened: 'Simulation results exceeded production gate threshold · trust scores stable · customer volume increasing.',
    relatedDocuments: ['Onboarding Workflow Spec v3', 'QA Simulation Report #47', 'Production Gate Checklist'],
    relatedConversations: ['Chief Concierge approval thread · QA Inspector sign-off'],
    relatedWorkflows: ['Customer Onboarding v3', 'Welcome Email Automation', 'Account Setup Checklist'],
    approvedBy: 'Founder · via Chief Concierge',
  },
  {
    decisionType: 'reject-marketplace-submission',
    decision: 'Rejected marketplace listing submission — incomplete compliance documentation.',
    decisionMaker: 'Studio Intelligence™ · Marketplace Review',
    auditSource: 'marketplace',
    confidencePct: 97,
    supportingEvidence: [
      'Listing missing Professional Trust Framework compliance attestation',
      'Product images do not match declared category',
      'Pricing structure violates marketplace fee policy',
    ],
    knowledgeSourcesUsed: ['Marketplace Listing Guidelines', 'Professional Trust Framework', 'Fee Schedule v2'],
    alternativeOptionsConsidered: ['Request revision with 7-day deadline · Conditional approval with restrictions · Escalate to human review'],
    potentialRisks: ['Seller may dispute rejection · delayed revenue from listing'],
    businessImpact: 'Protects marketplace trust · prevents non-compliant listings from reaching customers',
    organizationAffected: 'Headquarters',
    department: 'Marketplace',
    workflow: 'Marketplace Listing Review',
    approvalStatus: 'rejected',
    whyItHappened: 'Mandatory compliance fields incomplete · automated pre-screen flagged 3 policy violations.',
    relatedDocuments: ['Listing Submission #2847', 'Marketplace Policy v4.2', 'Rejection Notice Template'],
    relatedConversations: ['Seller notification · Marketplace team review notes'],
    relatedWorkflows: ['Marketplace Listing Review', 'Compliance Verification', 'Seller Notification'],
    approvedBy: 'Studio Intelligence™ · auto-rejected per policy',
  },
  {
    decisionType: 'recommend-publishing-schedule',
    decision: 'Recommended Tuesday 10am EST for knowledge article publication — peak engagement window.',
    decisionMaker: 'Studio Intelligence™',
    auditSource: 'studio-intelligence',
    confidencePct: 86,
    supportingEvidence: [
      'Historical engagement data: Tuesday mornings +34% open rate',
      'Knowledge Graph coverage complete for article topic',
      'No competing publications scheduled same window',
    ],
    knowledgeSourcesUsed: ['Engagement Analytics', 'Knowledge Graph Node: Tax Filing', 'Publishing Calendar'],
    alternativeOptionsConsidered: ['Wednesday 2pm · Friday morning · Immediate publish'],
    potentialRisks: ['Breaking news may overshadow publication · expert availability for Q&A'],
    businessImpact: 'Maximizes knowledge asset reach · supports customer self-service',
    organizationAffected: 'Headquarters',
    department: 'Knowledge',
    workflow: 'Knowledge Publication Pipeline',
    approvalStatus: 'pending',
    whyItHappened: 'Engagement model identified optimal window · content readiness confirmed · awaiting founder approval.',
    relatedDocuments: ['Article Draft: Quarterly Tax Tips', 'Engagement Report Q1', 'Publishing Calendar'],
    relatedConversations: ['Studio Intelligence recommendation · Knowledge team review'],
    relatedWorkflows: ['Knowledge Publication Pipeline', 'Social Distribution', 'Expert Q&A Scheduling'],
    approvedBy: null,
  },
  {
    decisionType: 'update-profession-brain',
    decision: 'Updated Legal Profession Brain™ boundary — added escalation rule for tax overlap queries.',
    decisionMaker: 'Knowledge Administrator · Profession Brain™',
    auditSource: 'profession-brains',
    confidencePct: 91,
    supportingEvidence: [
      'QA Inspector flagged contradicting brain instruction between Legal and Tax',
      'Self-Healing Engine prepared harmonization recovery plan',
      'Knowledge Graph nodes updated to reflect new boundary',
    ],
    knowledgeSourcesUsed: ['Legal Brain v4.1', 'Tax Brain v3.2', 'Professional Trust Framework', 'Knowledge Graph'],
    alternativeOptionsConsidered: ['Merge Legal and Tax into single brain · Disable tax guidance entirely · Manual review for all overlap queries'],
    potentialRisks: ['Temporary reduction in AI response speed during boundary recalibration'],
    businessImpact: 'Eliminates inconsistent AI guidance · reduces compliance exposure · improves customer trust',
    organizationAffected: 'Headquarters',
    department: 'Knowledge',
    workflow: 'Profession Brain Harmonization',
    approvalStatus: 'approved',
    whyItHappened: 'Decision Audit and Self-Healing detected inconsistency · harmonization required before next customer interaction.',
    relatedDocuments: ['Brain Boundary Spec', 'Harmonization Review Notes', 'QA Inspector Finding #12'],
    relatedConversations: ['Legal domain expert review · Tax team sign-off'],
    relatedWorkflows: ['Profession Brain Update', 'Knowledge Graph Sync', 'QA Re-validation'],
    approvedBy: 'Knowledge Administrator · Founder notified',
  },
  {
    decisionType: 'trigger-automation',
    decision: 'Triggered welcome email automation for new customer account #48291.',
    decisionMaker: 'Automations™ · Event Bus',
    auditSource: 'automations',
    confidencePct: 99,
    supportingEvidence: [
      'Account creation event received from onboarding workflow',
      'Customer email verified · consent captured',
      'Automation #12 health check passed · last run successful',
    ],
    knowledgeSourcesUsed: ['Welcome Email Template v2', 'Customer Profile #48291', 'Automation Registry'],
    alternativeOptionsConsidered: ['Delay 24 hours for manual review · Send SMS instead · Skip welcome sequence'],
    potentialRisks: ['Email deliverability if domain reputation drops'],
    businessImpact: 'Immediate customer engagement · reduces time-to-first-action by 47%',
    organizationAffected: 'Headquarters',
    department: 'Customer Success',
    workflow: 'New Customer Welcome Sequence',
    approvalStatus: 'auto-approved',
    whyItHappened: 'Standard low-risk automation · all pre-conditions met · within auto-approval policy.',
    relatedDocuments: ['Automation #12 Config', 'Welcome Email Template', 'Customer Record #48291'],
    relatedConversations: [],
    relatedWorkflows: ['New Customer Welcome Sequence', 'Account Setup Checklist'],
    approvedBy: 'Automations™ · auto-approved',
  },
  {
    decisionType: 'escalate-risk',
    decision: 'Escalated permission conflict to Security team — Editor role delete capability violation.',
    decisionMaker: 'Predictive QA™ · QA Inspector',
    auditSource: 'studio-intelligence',
    confidencePct: 93,
    supportingEvidence: [
      'QA Inspector critical finding: permission conflict on Editor role',
      'Predictive QA predicted unauthorized access incident within 7 days',
      'Self-Healing Recovery Plan prepared · requires human approval',
    ],
    knowledgeSourcesUsed: ['Permission Engine Audit', 'Policy Engine Template', 'QA Inspector Report'],
    alternativeOptionsConsidered: ['Auto-revoke delete capability · Temporary role suspension · Full permission audit'],
    potentialRisks: ['Data loss if exploit occurs before remediation · compliance audit failure'],
    businessImpact: 'Prevents unauthorized deletion · protects customer data · maintains compliance posture',
    organizationAffected: 'Headquarters',
    department: 'Security',
    workflow: 'Permission Conflict Resolution',
    approvalStatus: 'escalated',
    whyItHappened: 'Critical severity · restricted domain (compliance) · exceeds auto-repair threshold · requires executive attention.',
    relatedDocuments: ['Permission Audit Report', 'Recovery Plan #PC-001', 'Policy Engine Diff'],
    relatedConversations: ['Security team alert · Executive notification'],
    relatedWorkflows: ['Permission Conflict Resolution', 'Policy Engine Sync', 'Compliance Review'],
    approvedBy: 'Escalated to Security · awaiting Founder',
  },
  {
    decisionType: 'create-knowledge-asset',
    decision: 'Created knowledge asset "Permit Approval Process Guide" from workflow documentation sync.',
    decisionMaker: 'Knowledge Graph™ · Documentation Sync',
    auditSource: 'knowledge-graph',
    confidencePct: 88,
    supportingEvidence: [
      'Workflow step lacked published documentation · QA Inspector flagged gap',
      'Self-Healing generated draft from workflow node metadata',
      'Knowledge Confidence score for permit workflow at 72% — below threshold',
    ],
    knowledgeSourcesUsed: ['Permit Approval Workflow', 'Workflow Node Metadata', 'Documentation Templates'],
    alternativeOptionsConsidered: ['Manual authoring by knowledge team · Link to external resource · Defer until next sprint'],
    potentialRisks: ['Auto-generated content may need expert review before customer-facing publish'],
    businessImpact: 'Closes knowledge gap · improves AI grounding · reduces support tickets on permit process',
    organizationAffected: 'Headquarters',
    department: 'Knowledge',
    workflow: 'Knowledge Asset Creation',
    approvalStatus: 'approved',
    whyItHappened: 'Documentation sync policy triggered asset creation · gap identified by QA layer · low-risk auto-creation approved.',
    relatedDocuments: ['Permit Approval Process Guide (Draft)', 'Workflow Spec', 'Knowledge Gap Report'],
    relatedConversations: ['Knowledge team notified for review'],
    relatedWorkflows: ['Knowledge Asset Creation', 'Permit Approval Workflow', 'Documentation Sync'],
    approvedBy: 'Knowledge Administrator',
  },
  {
    decisionType: 'recommend-pricing-change',
    decision: 'Recommended 8% price increase on premium consultation tier — demand exceeds supply.',
    decisionMaker: 'Studio Intelligence™ · Marketplace Analytics',
    auditSource: 'marketplace',
    confidencePct: 84,
    supportingEvidence: [
      'Expert consultation waitlist at 34% · booking velocity exceeds availability',
      'Competitor pricing analysis: 12% below market average',
      'Customer satisfaction on premium tier at 94% — price elasticity favorable',
    ],
    knowledgeSourcesUsed: ['Marketplace Analytics', 'Competitor Pricing Report', 'Customer Satisfaction Survey'],
    alternativeOptionsConsidered: ['Hire additional experts · Cap bookings · Tier restructure without price change'],
    potentialRisks: ['Customer churn at higher price point · expert compensation expectations'],
    businessImpact: 'Projected +$12K monthly revenue · balances supply/demand · maintains expert quality',
    organizationAffected: 'Headquarters',
    department: 'Finance',
    workflow: 'Pricing Review Cycle',
    approvalStatus: 'pending',
    whyItHappened: 'Supply/demand imbalance detected · pricing model recommends adjustment · requires executive approval.',
    relatedDocuments: ['Pricing Analysis Q2', 'Marketplace Demand Report', 'Competitor Benchmark'],
    relatedConversations: ['Studio Intelligence briefing · Finance team review'],
    relatedWorkflows: ['Pricing Review Cycle', 'Marketplace Fee Update', 'Customer Communication Plan'],
    approvedBy: null,
  },
  {
    decisionType: 'hire-expert',
    decision: 'Approved hiring of tax specialist expert for marketplace — capacity gap identified.',
    decisionMaker: 'Chief Concierge · Expert Marketplace',
    auditSource: 'expert-marketplace',
    confidencePct: 89,
    supportingEvidence: [
      'Predictive QA: current staffing will not support projected demand next month',
      'Tax consultation category waitlist at 41%',
      'Candidate credentials verified against Professional Trust Framework',
    ],
    knowledgeSourcesUsed: ['Expert Marketplace SLA Report', 'Predictive QA Staffing Forecast', 'Candidate Profile'],
    alternativeOptionsConsidered: ['Overflow routing to partner network · Increase waitlist capacity · Delay hiring 30 days'],
    potentialRisks: ['Onboarding time 2–3 weeks · quality consistency during ramp'],
    businessImpact: 'Closes expert capacity gap · reduces waitlist · protects marketplace SLA',
    organizationAffected: 'Headquarters',
    department: 'Marketplace',
    workflow: 'Expert Onboarding',
    approvalStatus: 'approved',
    whyItHappened: 'Predictive QA staffing forecast · marketplace SLA at risk · qualified candidate available.',
    relatedDocuments: ['Expert Candidate Profile', 'Staffing Forecast Report', 'Onboarding Checklist'],
    relatedConversations: ['Chief Concierge recommendation · Marketplace team approval'],
    relatedWorkflows: ['Expert Onboarding', 'Credential Verification', 'Marketplace Profile Setup'],
    approvedBy: 'Founder · via Chief Concierge',
  },
  {
    decisionType: 'approve-refund',
    decision: 'Approved partial refund of $47.50 for customer booking #9284 — service quality issue.',
    decisionMaker: 'AI Concierge™ · Customer Success',
    auditSource: 'ai-concierges',
    confidencePct: 92,
    supportingEvidence: [
      'Customer reported expert no-show · calendar sync failure confirmed via Time Machine replay',
      'Refund policy allows partial credit for service failures',
      'Customer lifetime value: high · retention priority',
    ],
    knowledgeSourcesUsed: ['Refund Policy v2', 'Booking Record #9284', 'Time Machine Replay Event'],
    alternativeOptionsConsidered: ['Full refund · Credit toward future booking · Deny — policy exception required'],
    potentialRisks: ['Precedent for similar requests · revenue impact $47.50'],
    businessImpact: 'Maintains customer trust · prevents churn · documents service failure for expert review',
    organizationAffected: 'Headquarters',
    department: 'Customer Success',
    workflow: 'Refund Approval',
    approvalStatus: 'approved',
    whyItHappened: 'Verified service failure · policy-compliant partial refund · customer retention prioritized.',
    relatedDocuments: ['Refund Request #9284', 'Booking Record', 'Time Machine Replay Summary'],
    relatedConversations: ['Customer support thread · Expert accountability note'],
    relatedWorkflows: ['Refund Approval', 'Expert Performance Review', 'Calendar Sync Remediation'],
    approvedBy: 'AI Concierge™ · auto-approved within policy limits',
  },
];

function offsetTimestamp(base: string, hoursAgo: number): string {
  const d = new Date(base);
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

export function buildDecisionRecords(organizationId: string, now: string): DecisionRecord[] {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const trust = getOrganizationExecutiveTrustDashboardProfile(organizationId);
  const predictive = getOrganizationPredictiveQaProfile(organizationId);
  const healing = getOrganizationSelfHealingEngineProfile(organizationId);
  const orgName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();

  return DECISION_SEEDS.map((seed, i) => {
    let confidencePct = seed.confidencePct;
    if (trust && trust.overallTrustScore >= 85) confidencePct = Math.min(99, confidencePct + 1);
    if (predictive && seed.decisionType === 'escalate-risk') confidencePct = Math.min(99, confidencePct + 2);
    if (healing && seed.decisionType === 'update-profession-brain') confidencePct = Math.min(99, confidencePct + 1);

    return {
      ...seed,
      id: `decision-${seed.decisionType}-${i}`,
      decisionTypeLabel: DECISION_TYPE_LABELS[seed.decisionType],
      auditSourceLabel: AUDIT_SOURCE_LABELS[seed.auditSource],
      confidencePct,
      organizationAffected: orgName,
      timestamp: offsetTimestamp(now, i * 4 + 2),
    };
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function computeAccountabilityScore(decisions: DecisionRecord[]): number {
  if (decisions.length === 0) return 100;
  const explainable = decisions.filter(
    (d) => d.supportingEvidence.length >= 2 && d.whyItHappened.length > 20
  ).length;
  const avgConfidence = decisions.reduce((s, d) => s + d.confidencePct, 0) / decisions.length;
  return Math.max(0, Math.min(99, Math.round((explainable / decisions.length) * 60 + avgConfidence * 0.35)));
}

export function countDecisionsToday(decisions: DecisionRecord[], now: string): number {
  const today = new Date(now).toDateString();
  return decisions.filter((d) => new Date(d.timestamp).toDateString() === today).length;
}

export function countPendingApprovals(decisions: DecisionRecord[]): number {
  return decisions.filter((d) => d.approvalStatus === 'pending').length;
}

export function getDecisionById(decisions: DecisionRecord[], id: string): DecisionRecord | null {
  return decisions.find((d) => d.id === id) ?? null;
}

export function getDecisionsBySource(decisions: DecisionRecord[], source: AuditSource): DecisionRecord[] {
  return decisions.filter((d) => d.auditSource === source);
}

export function getDecisionsByType(decisions: DecisionRecord[], type: DecisionType): DecisionRecord[] {
  return decisions.filter((d) => d.decisionType === type);
}
