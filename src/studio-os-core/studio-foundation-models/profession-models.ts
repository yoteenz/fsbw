import { PROFESSION_MODEL_IDS, PROFESSION_MODEL_LABELS } from './constants';
import type { ProfessionModelId, ProfessionModelProfile } from './types';

const PROFESSION_MODEL_FOCUS: Record<ProfessionModelId, { industryFit: string; reasoningFocus: string }> = {
  'studio-tax': {
    industryFit: 'Fuel tax · compliance · filing workflows',
    reasoningFocus: 'Tax workflow reasoning — external model handles language drafting',
  },
  'studio-legal-intake': {
    industryFit: 'Legal intake · scope · conflict checks',
    reasoningFocus: 'Intake triage · trust scope · escalation paths',
  },
  'studio-medical-office': {
    industryFit: 'Medical office · scheduling · intake',
    reasoningFocus: 'Office workflow · HIPAA-aware routing · patient experience',
  },
  'studio-hair': {
    industryFit: 'Salon · stylist workflows · client preferences',
    reasoningFocus: 'Appointment flow · service recommendations · client memory',
  },
  'studio-construction': {
    industryFit: 'Construction · jobsite · safety',
    reasoningFocus: 'Project phases · compliance · subcontractor coordination',
  },
  'studio-contractor': {
    industryFit: 'Contractor · bids · field operations',
    reasoningFocus: 'Estimate reasoning · change orders · client communication',
  },
  'studio-marketing': {
    industryFit: 'Marketing · campaigns · brand voice',
    reasoningFocus: 'Campaign strategy · content calendar · audience alignment',
  },
  'studio-finance': {
    industryFit: 'Finance · reporting · cash flow',
    reasoningFocus: 'Financial workflow · approvals · executive summaries',
  },
  'studio-customer-experience': {
    industryFit: 'CX · support · retention',
    reasoningFocus: 'Customer journey · escalation · satisfaction patterns',
  },
  'studio-operations': {
    industryFit: 'Operations · SOPs · efficiency',
    reasoningFocus: 'Department coordination · bottleneck detection · execution',
  },
  'studio-restaurant': {
    industryFit: 'Restaurant · service · inventory',
    reasoningFocus: 'Service flow · staffing · supplier coordination',
  },
  'studio-real-estate': {
    industryFit: 'Real estate · listings · transactions',
    reasoningFocus: 'Deal flow · disclosure · client matching',
  },
  'studio-education': {
    industryFit: 'Education · curriculum · student success',
    reasoningFocus: 'Learning paths · assessment · institutional memory',
  },
};

export function buildProfessionModels(
  industryId: string,
  brainLinked: boolean,
  trustRegulated: boolean
): ProfessionModelProfile[] {
  return PROFESSION_MODEL_IDS.map((id, index) => {
    const focus = PROFESSION_MODEL_FOCUS[id];
    const industryMatch = industryId.includes(id.replace('studio-', '').split('-')[0] ?? '');
    const readinessPct = Math.min(
      99,
      55 + index * 2 + (brainLinked ? 12 : 0) + (industryMatch ? 15 : 0) + (trustRegulated ? 3 : 0)
    );

    return {
      id,
      label: PROFESSION_MODEL_LABELS[id],
      industryFit: focus.industryFit,
      reasoningFocus: focus.reasoningFocus,
      professionBrainLinked: brainLinked,
      knowledgeFabricLinked: brainLinked,
      trustFrameworkLinked: true,
      hybridReady: true,
      readinessPct,
    };
  });
}

export function summarizeProfessionModels(models: ProfessionModelProfile[]): string {
  const ready = models.filter((m) => m.readinessPct >= 70).length;
  return `${models.length} Profession Models™ cataloged — ${ready} hybrid-ready. Specialized reasoning layers, not generic chatbots.`;
}
