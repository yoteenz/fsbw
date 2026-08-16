import type { DemoStore } from '../demo/demoTypes';
import type {
  CommConversation,
  CommConversationStatus,
  CommMessage,
  CommPreference,
  CommSuppression,
} from './communicationTypes';

export function canCustomerViewMessage(msg: CommMessage): boolean {
  return msg.visibility === 'customer_visible';
}

export function canStaffViewMessage(_msg: CommMessage): boolean {
  return true;
}

export function computeNeedsReply(conv: CommConversation): boolean {
  return conv.status === 'waiting_on_staff' || conv.responseResponsibility === 'staff';
}

export function afterInboundCustomerMessage(conv: CommConversation, at: string): CommConversation {
  return {
    ...conv,
    status: 'waiting_on_staff',
    responseResponsibility: 'staff',
    lastMessageAt: at,
    lastCustomerMessageAt: at,
    updatedAt: at,
  };
}

export function afterOutboundStaffMessage(conv: CommConversation, at: string, awaitingCustomer: boolean): CommConversation {
  return {
    ...conv,
    status: awaitingCustomer ? 'waiting_on_customer' : conv.status,
    responseResponsibility: awaitingCustomer ? 'customer' : 'none',
    lastMessageAt: at,
    lastStaffMessageAt: at,
    updatedAt: at,
  };
}

export function afterInternalNote(conv: CommConversation, at: string): CommConversation {
  return { ...conv, updatedAt: at };
}

export function isSuppressed(
  store: DemoStore,
  opts: { leadId?: string; organizationId?: string; channel: CommSuppression['channel'] },
): boolean {
  return (store.commSuppressions ?? []).some((s) => {
    if (!s.active) return false;
    if (opts.leadId && s.leadId === opts.leadId) return s.channel === 'all' || s.channel === opts.channel;
    if (opts.organizationId && s.contactId === opts.organizationId) return s.channel === 'all' || s.channel === opts.channel;
    return false;
  });
}

export function getPreference(
  store: DemoStore,
  opts: { organizationId?: string; leadId?: string },
): CommPreference | undefined {
  return (store.commPreferences ?? []).find(
    (p) =>
      (opts.organizationId && p.organizationId === opts.organizationId) ||
      (opts.leadId && p.leadId === opts.leadId),
  );
}

export function canSendChannel(
  pref: CommPreference | undefined,
  channel: 'email' | 'sms' | 'portal',
  category: 'transactional' | 'marketing' = 'transactional',
): boolean {
  if (!pref) return channel === 'portal';
  if (channel === 'portal') return pref.portalAllowed;
  if (channel === 'email') return category === 'marketing' ? pref.marketingEmailAllowed : pref.emailAllowed;
  if (channel === 'sms') return category === 'marketing' ? pref.marketingSmsAllowed : pref.smsAllowed;
  return false;
}

export function filterCustomerMessages(messages: CommMessage[]): CommMessage[] {
  return messages.filter((m) => m.visibility === 'customer_visible');
}

export function conversationPreview(messages: CommMessage[]): string {
  const visible = [...messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const last = visible[0];
  return last ? last.body.slice(0, 120) : '';
}

export function unreadCountForParticipant(
  messages: CommMessage[],
  lastReadAt?: string,
): number {
  const cutoff = lastReadAt ?? '';
  return messages.filter(
    (m) => m.visibility === 'customer_visible' && m.createdAt > cutoff && !m.readAt,
  ).length;
}

export function deriveConversationStatusFromLegacy(status: CommConversationStatus): string {
  return status.replace(/_/g, ' ');
}

export function authorizeConversationAccess(
  store: DemoStore,
  conversationId: string,
  opts: { organizationId?: string; isStaff?: boolean },
): CommConversation | undefined {
  const conv = store.commConversations?.find((c) => c.id === conversationId);
  if (!conv) return undefined;
  if (opts.isStaff) return conv;
  if (opts.organizationId && conv.organizationId === opts.organizationId) return conv;
  return undefined;
}

export function authorizeBrokerageConversation(
  conv: CommConversation,
  viewerOrgId: string,
  viewerRole: 'shipper' | 'carrier' | 'staff',
): boolean {
  if (viewerRole === 'staff') return true;
  if (conv.conversationType !== 'brokerage') return conv.organizationId === viewerOrgId;
  return conv.organizationId === viewerOrgId;
}
