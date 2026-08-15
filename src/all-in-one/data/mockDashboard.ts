import type { AioDashboardMetric } from '../types';

export const mockDashboardGreeting = 'Good morning, Marcus';

export const mockDashboardMetrics: AioDashboardMetric[] = [
  { id: 'roadmap', label: 'Road Ready', value: '87%', hint: 'Roadmap completion' },
  { id: 'loads', label: 'Active Loads', value: 2 },
  { id: 'renewals', label: 'Renewals Due', value: 3 },
  { id: 'messages', label: 'Unread Messages', value: 5 },
];

export const mockExpiringSoon = [
  { id: '1', label: 'IRP Cab Card', due: 'Mar 18, 2026', status: 'Action Required' },
  { id: '2', label: 'Insurance Certificate', due: 'Apr 02, 2026', status: 'Action Required' },
  { id: '3', label: 'IFTA Quarterly Filing', due: 'Apr 30, 2026', status: 'Upcoming' },
];

export const mockRecentActivity = [
  { id: '1', text: 'Operating authority application submitted', time: '2 hours ago' },
  { id: '2', text: 'Insurance quote request received', time: 'Yesterday' },
  { id: '3', text: 'BOC-3 filing marked as needed', time: '2 days ago' },
];

export const mockDocuments = [
  'Insurance Certificate',
  'IRP Cab Card',
  'USDOT Letter',
  'Operating Authority',
  'IFTA License',
  'BOC-3 Filing',
];
