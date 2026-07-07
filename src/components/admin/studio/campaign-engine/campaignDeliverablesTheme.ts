import type { CSSProperties } from 'react';
import type { DeliverableWorkflowStatus } from '../../../../studio-os-core/campaign-engine/types';
import { CE, cePanel, ceSectionTitle, healthColor } from './campaignEngineTheme';

export const ceMarblePanel: CSSProperties = {
  ...cePanel,
  background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(250,250,248,0.88) 100%)',
  boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 8px 24px rgba(15,23,42,0.04)',
};

export const ceGlassStrip: CSSProperties = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(12px)',
  border: `1px solid ${CE.panelBorder}`,
};

export const ceDeskDivider: CSSProperties = {
  height: 1,
  background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)',
  margin: '12px 0',
};

export function workflowStatusColor(status: DeliverableWorkflowStatus): string {
  switch (status) {
    case 'draft':
      return CE.gray;
    case 'review':
      return CE.amber;
    case 'approved':
      return CE.slate;
    case 'scheduled':
      return '#0891B2';
    case 'published':
      return CE.green;
    case 'learning':
      return '#7C3AED';
    default:
      return CE.gray;
  }
}

export function workflowStatusBadgeStyle(status: DeliverableWorkflowStatus): CSSProperties {
  const color = workflowStatusColor(status);
  return {
    fontFamily: '"Futura PT Medium"',
    fontSize: '5px',
    letterSpacing: '0.06em',
    color,
    border: `1px solid ${color}33`,
    background: `${color}0D`,
    padding: '2px 6px',
    borderRadius: 999,
  };
}

export const ceDeliverablesDeskTitle: CSSProperties = {
  ...ceSectionTitle,
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '16px',
  letterSpacing: '0.04em',
  marginBottom: 4,
};

export { healthColor, CE };
