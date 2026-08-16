/**
 * Sprint 24 — staff training modules and records (demo/architecture layer).
 */

import type { StaffLifecycleState } from './types';

export interface TrainingModule {
  id: string;
  title: string;
  category: string;
  version: string;
  requiredRoles: string[];
  sopPath?: string;
}

export interface TrainingRecord {
  moduleId: string;
  staffId: string;
  assigned: boolean;
  started: boolean;
  completed: boolean;
  acknowledged: boolean;
  completedAt?: string;
  version: string;
}

export const TRAINING_MODULES: TrainingModule[] = [
  { id: 'office-basics', title: 'Office Basics', category: 'Core', version: '1.0', requiredRoles: ['all'], sopPath: 'docs/operations/OPERATIONS_MASTER_GUIDE.md' },
  { id: 'privacy', title: 'Customer Privacy', category: 'Security', version: '1.0', requiredRoles: ['all'], sopPath: 'docs/operations/PRIVACY_REQUESTS_SOP.md' },
  { id: 'security-baseline', title: 'Security Baseline', category: 'Security', version: '1.0', requiredRoles: ['all'], sopPath: 'docs/operations/SECURITY_INCIDENT_SOP.md' },
  { id: 'crm', title: 'CRM & Sales', category: 'Growth', version: '1.0', requiredRoles: ['crm', 'admin', 'owner'], sopPath: 'docs/operations/CRM_AND_SALES_SOP.md' },
  { id: 'road-ready', title: 'Road Ready', category: 'Customer', version: '1.0', requiredRoles: ['all'], sopPath: 'docs/operations/ROAD_READY_SOP.md' },
  { id: 'permitting', title: 'Permitting Operations', category: 'Services', version: '1.0', requiredRoles: ['permitting', 'admin'], sopPath: 'docs/operations/PERMITTING_SOP.md' },
  { id: 'documents', title: 'Document Review', category: 'Operations', version: '1.0', requiredRoles: ['all'], sopPath: 'docs/operations/DOCUMENT_REVIEW_SOP.md' },
  { id: 'billing', title: 'Billing & Payments', category: 'Finance', version: '1.0', requiredRoles: ['finance', 'admin'], sopPath: 'docs/operations/BILLING_AND_PAYMENTS_SOP.md' },
  { id: 'communications', title: 'Customer Communications', category: 'Operations', version: '1.0', requiredRoles: ['all'], sopPath: 'docs/operations/CUSTOMER_COMMUNICATIONS_SOP.md' },
  { id: 'appointments', title: 'Appointments', category: 'Operations', version: '1.0', requiredRoles: ['all'], sopPath: 'docs/operations/APPOINTMENTS_SOP.md' },
  { id: 'dispatch', title: 'Dispatch Operations', category: 'Services', version: '1.0', requiredRoles: ['dispatcher', 'admin'], sopPath: 'docs/operations/DISPATCH_OPERATIONS_SOP.md' },
  { id: 'support', title: 'Customer Support', category: 'Operations', version: '1.0', requiredRoles: ['support', 'all'], sopPath: 'docs/operations/CUSTOMER_SUPPORT_SOP.md' },
  { id: 'incident-escalation', title: 'Incident Escalation', category: 'Security', version: '1.0', requiredRoles: ['admin', 'owner', 'security'], sopPath: 'docs/operations/SECURITY_INCIDENT_SOP.md' },
  { id: 'owner-admin', title: 'Owner/Admin Launch Controls', category: 'Management', version: '1.0', requiredRoles: ['owner', 'admin'], sopPath: 'docs/launch/LAUNCH_RUNBOOK.md' },
];

/** Demo training progress — production uses persisted records */
const DEMO_COMPLETED = new Set(['office-basics', 'privacy', 'security-baseline', 'road-ready', 'documents']);

export function getTrainingRecordsForStaff(staffId: string): TrainingRecord[] {
  return TRAINING_MODULES.map((m) => ({
    moduleId: m.id,
    staffId,
    assigned: true,
    started: DEMO_COMPLETED.has(m.id) || m.id === 'owner-admin',
    completed: DEMO_COMPLETED.has(m.id),
    acknowledged: DEMO_COMPLETED.has(m.id),
    completedAt: DEMO_COMPLETED.has(m.id) ? '2026-08-16T00:00:00Z' : undefined,
    version: m.version,
  }));
}

export function getTrainingCompletionSummary(): { total: number; completed: number; percentComplete: number } {
  const total = TRAINING_MODULES.length;
  const completed = DEMO_COMPLETED.size;
  return { total, completed, percentComplete: Math.round((completed / total) * 100) };
}

export const STAFF_LIFECYCLE_STATES: StaffLifecycleState[] = [
  'INVITED',
  'ONBOARDING',
  'TRAINING',
  'ACTIVE',
  'SUSPENDED',
  'OFFBOARDED',
];

export const PRODUCTION_STAFF_ROLES = [
  'OWNER',
  'ADMIN',
  'MANAGER',
  'PERMITTING_SPECIALIST',
  'DISPATCHER',
  'CRM_SALES',
  'CUSTOMER_SUPPORT',
  'FINANCE',
  'DOCUMENT_REVIEWER',
  'SECURITY_ADMIN',
] as const;
