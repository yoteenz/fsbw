import type { Priority } from '../demo/demoTypes';

export function computePriority(input: {
  status?: string;
  targetDate?: string;
  createdAt?: string;
  urgentFlag?: boolean;
}): Priority {
  if (input.urgentFlag) return 'urgent';
  if (input.targetDate) {
    const days = (new Date(input.targetDate).getTime() - Date.now()) / 86400000;
    if (days < 0) return 'urgent';
    if (days <= 3) return 'high';
  }
  if (input.status === 'new_request') return 'high';
  if (input.status === 'documents_needed' || input.status === 'information_needed') return 'normal';
  return 'normal';
}
