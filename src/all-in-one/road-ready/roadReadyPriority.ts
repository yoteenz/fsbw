import type { RoadReadyAttentionItem, RoadReadyItem } from './roadReadyTypes';
import { computeExpirationState } from './roadReadyScoring';

export function buildAttentionItems(items: RoadReadyItem[]): RoadReadyAttentionItem[] {
  const out: RoadReadyAttentionItem[] = [];

  for (const item of items) {
    if (!item.applicable || item.status === 'optional' || item.status === 'not_applicable') continue;

    let priority = 0;
    let action: RoadReadyAttentionItem['action'] = 'update_status';
    let reason = '';

    if (item.expiresAt) {
      const exp = computeExpirationState(item.expiresAt);
      if (exp === 'expired') {
        priority = 100;
        action = 'review';
        reason = `${item.title} has expired.`;
      } else if (exp === 'expiring_soon') {
        priority = 80;
        action = 'review';
        reason = `${item.title} expiration is approaching.`;
      }
    }

    if (item.status === 'action_needed') {
      priority = Math.max(priority, 70);
      action = 'request_help';
      reason = reason || `${item.title} needs your attention.`;
    }
    if (item.status === 'needs_review' || item.verificationStatus === 'pending_review') {
      priority = Math.max(priority, 60);
      action = 'message';
      reason = reason || `${item.title} needs review.`;
    }
    if (item.verificationStatus === 'self_reported' && item.status === 'completed') {
      priority = Math.max(priority, 40);
      action = 'upload';
      reason = reason || `Upload supporting documentation for ${item.title}.`;
    }

    if (priority > 0) {
      out.push({
        itemId: item.id,
        title: item.title,
        category: item.category,
        reason,
        priority,
        action,
        serviceSlug: item.serviceSlug,
      });
    }
  }

  return out.sort((a, b) => b.priority - a.priority);
}

export function pickNextBestAction(attention: RoadReadyAttentionItem[]): RoadReadyAttentionItem | null {
  return attention[0] ?? null;
}

export function nextBestActionCopy(item: RoadReadyAttentionItem | null): { title: string; body: string; cta: string } | null {
  if (!item) return null;
  switch (item.action) {
    case 'upload':
      return { title: `Verify ${item.title}`, body: 'Upload your current documentation so All In One can review this item.', cta: 'Upload Document' };
    case 'request_help':
      return { title: `Get Help With ${item.title}`, body: 'All In One can assist with this requirement.', cta: 'Get Help With This' };
    case 'review':
      return { title: `Review ${item.title}`, body: item.reason, cta: 'Review Item' };
    default:
      return { title: item.title, body: item.reason, cta: 'View Road Ready' };
  }
}
