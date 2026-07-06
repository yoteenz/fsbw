import type { CustomerJourneyStep } from './types';
import { CUSTOMER_JOURNEY_STAGES } from './constants';

const JOURNEY_LABELS: Record<(typeof CUSTOMER_JOURNEY_STAGES)[number], { label: string; description: string }> = {
  'learn-free': { label: 'Learn for free', description: 'Educational guidance from published expertise — build trust first.' },
  'purchase-checklist': { label: 'Purchase a checklist', description: 'Low-friction first purchase — operational value immediately.' },
  'enroll-course': { label: 'Enroll in a course', description: 'Structured learning from the same Profession Brain source.' },
  'ask-ai-expert': { label: 'Ask the AI Expert', description: 'AI Expert Experience powered by organizational intelligence.' },
  'purchase-templates': { label: 'Purchase templates', description: 'Professional templates and frameworks as digital products.' },
  'join-membership': { label: 'Join a membership', description: 'Recurring access to premium knowledge libraries.' },
  'book-consultation': { label: 'Book a consultation', description: 'Human professional review when judgment matters.' },
  'become-client': { label: 'Become a long-term client', description: 'Full professional relationship — expertise compounds.' },
};

export function buildCustomerJourney(): CustomerJourneyStep[] {
  return CUSTOMER_JOURNEY_STAGES.map((stage, i) => ({
    stage,
    label: JOURNEY_LABELS[stage].label,
    description: JOURNEY_LABELS[stage].description,
    nextStage: CUSTOMER_JOURNEY_STAGES[i + 1],
  }));
}
