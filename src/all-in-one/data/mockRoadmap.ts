import type { AioRoadmapItem, AioBusinessStep } from '../types';

export const mockRoadmapProgress = 87;

export const mockRoadmapItems: AioRoadmapItem[] = [
  { id: 'formation', label: 'Company Formation', status: 'complete' },
  { id: 'usdot', label: 'USDOT Number', status: 'complete' },
  { id: 'authority', label: 'Operating Authority', status: 'in-progress' },
  { id: 'boc3', label: 'BOC-3 Filing', status: 'needed' },
  { id: 'insurance', label: 'Commercial Insurance', status: 'needed' },
  { id: 'irp', label: 'IRP Registration', status: 'in-progress' },
  { id: 'ifta', label: 'IFTA Registration', status: 'needed' },
  { id: 'permits', label: 'Permits & Taxes', status: 'in-progress' },
  { id: 'dispatch', label: 'Dispatching', status: 'optional' },
];

export const mockBusinessSteps: AioBusinessStep[] = [
  { step: '01', title: 'BUILD', subtitle: 'Form Your Business' },
  { step: '02', title: 'AUTHORIZE', subtitle: 'Get Your Authority' },
  { step: '03', title: 'PROTECT', subtitle: 'Insurance Coverage' },
  { step: '04', title: 'REGISTER', subtitle: 'Tags, IFTA, IRP & Permits' },
  { step: '05', title: 'ACTIVATE', subtitle: 'Compliance & Filings' },
  { step: '06', title: 'ROLL', subtitle: 'Dispatch & Move Freight' },
];
