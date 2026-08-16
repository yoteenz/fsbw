import type { DemoStore } from './demoTypes';
import { loadDemoStore, updateDemoStore } from './demoStore';
import type {
  CommConversation,
  CommConversationType,
  CommMessage,
  CommMessageVisibility,
  CommChannel,
} from '../communications/communicationTypes';
import {
  afterInboundCustomerMessage,
  afterInternalNote,
  afterOutboundStaffMessage,
  authorizeConversationAccess,
  canCustomerViewMessage,
  computeNeedsReply,
  isSuppressed,
  unreadCountForParticipant,
} from '../communications/communicationEngine';
import {
  portalDeliveryResult,
  recordExternalDelivery,
  resolveEmailProvider,
} from '../communications/communicationProviders';
import { buildNotification } from '../notifications/notificationEngine';

function uid(): string {
  return crypto.randomUUID();
}

export function getConversations(store: DemoStore = loadDemoStore()): CommConversation[] {
  return store.commConversations ?? [];
}

export function getConversation(id: string, store: DemoStore = loadDemoStore()): CommConversation | undefined {
  return store.commConversations?.find((c) => c.id === id);
}

export function getConversationMessages(conversationId: string, store: DemoStore = loadDemoStore(), customerView = false): CommMessage[] {
  const msgs = (store.commMessages ?? []).filter((m) => m.conversationId === conversationId);
  return customerView ? msgs.filter(canCustomerViewMessage) : msgs;
}

export function getOrgConversations(organizationId: string, store: DemoStore = loadDemoStore()): CommConversation[] {
  return (store.commConversations ?? []).filter((c) => c.organizationId === organizationId);
}

export function getLeadConversations(leadId: string, store: DemoStore = loadDemoStore()): CommConversation[] {
  return (store.commConversations ?? []).filter((c) => c.leadId === leadId);
}

export function getInboxMetrics(store: DemoStore = loadDemoStore()) {
  const convs = store.commConversations ?? [];
  return {
    unassigned: convs.filter((c) => !c.assignedUserId && !['closed', 'archived', 'resolved'].includes(c.status)).length,
    needsReply: convs.filter((c) => computeNeedsReply(c)).length,
    waitingOnCustomer: convs.filter((c) => c.status === 'waiting_on_customer').length,
    highPriority: convs.filter((c) => c.priority === 'urgent' || c.priority === 'high').length,
    resolved: convs.filter((c) => c.status === 'resolved').length,
  };
}

function routeConversation(type: CommConversationType, store: DemoStore): { teamId?: string; userId?: string } {
  const rule = (store.commRoutingRules ?? []).find((r) => r.conversationType === type && r.active);
  return { teamId: rule?.teamId, userId: undefined };
}

export function createConversation(input: {
  subject: string;
  conversationType: CommConversationType;
  organizationId?: string;
  leadId?: string;
  opportunityId?: string;
  primaryContextType?: CommConversation['primaryContextType'];
  primaryContextId?: string;
  assignedUserId?: string;
  initialMessage?: string;
  senderName?: string;
  channel?: CommChannel;
}): CommConversation {
  let created!: CommConversation;
  updateDemoStore((s) => {
    const now = new Date().toISOString();
    const route = routeConversation(input.conversationType, s);
    const conv: CommConversation = {
      id: uid(),
      organizationId: input.organizationId,
      leadId: input.leadId,
      opportunityId: input.opportunityId,
      subject: input.subject,
      conversationType: input.conversationType,
      status: 'open',
      priority: 'normal',
      responseResponsibility: 'none',
      assignedUserId: input.assignedUserId ?? route.userId,
      assignedTeamId: route.teamId,
      primaryContextType: input.primaryContextType,
      primaryContextId: input.primaryContextId,
      createdAt: now,
      updatedAt: now,
      isDemo: true,
    };
    s.commConversations = [...(s.commConversations ?? []), conv];
    if (input.initialMessage) {
      appendMessageInternal(s, conv.id, {
        senderType: input.organizationId ? 'customer' : 'customer',
        senderName: input.senderName ?? 'Prospect',
        body: input.initialMessage,
        channel: input.channel ?? 'portal',
        direction: 'inbound',
        visibility: 'customer_visible',
      });
      const updated = s.commConversations!.find((c) => c.id === conv.id)!;
      Object.assign(conv, afterInboundCustomerMessage(updated, now));
      s.commConversations = s.commConversations!.map((c) => (c.id === conv.id ? conv : c));
    }
    created = conv;
    return s;
  });
  return created;
}

function appendMessageInternal(
  s: DemoStore,
  conversationId: string,
  input: {
    senderType: CommMessage['senderType'];
    senderId?: string;
    senderName: string;
    body: string;
    channel: CommChannel;
    direction: CommMessage['direction'];
    visibility: CommMessageVisibility;
    status?: CommMessage['status'];
  },
): CommMessage {
  const now = new Date().toISOString();
  const msg: CommMessage = {
    id: uid(),
    conversationId,
    senderType: input.senderType,
    senderId: input.senderId,
    senderName: input.senderName,
    channel: input.channel,
    direction: input.direction,
    visibility: input.visibility,
    body: input.body,
    status: input.status ?? 'sent',
    createdAt: now,
    sentAt: now,
    isDemo: true,
  };
  s.commMessages = [...(s.commMessages ?? []), msg];
  if (input.visibility === 'customer_visible' && input.channel === 'portal') {
    const conv = s.commConversations?.find((c) => c.id === conversationId);
    const orgId = conv?.organizationId;
    if (orgId) {
      s.notifications.unshift(
        buildNotification({
          organizationId: orgId,
          recipientType: 'customer',
          recipientId: orgId,
          category: 'messages',
          eventType: 'MESSAGE_RECEIVED',
          title: 'New message from All In One',
          body: input.body.slice(0, 80),
          link: `/debug/all-in-one/portal/messages/${conversationId}`,
          dedupeKey: `msg:${conversationId}:${msg.id}`,
        }),
      );
    }
  }
  return msg;
}

export function sendPortalMessage(conversationId: string, body: string, staffId: string, staffName: string): CommMessage | null {
  let msg: CommMessage | null = null;
  updateDemoStore((s) => {
    const conv = s.commConversations?.find((c) => c.id === conversationId);
    if (!conv) return s;
    msg = appendMessageInternal(s, conversationId, {
      senderType: 'staff',
      senderId: staffId,
      senderName: staffName,
      body,
      channel: 'portal',
      direction: 'outbound',
      visibility: 'customer_visible',
      status: portalDeliveryResult({} as CommMessage).status,
    });
    s.commDeliveries = [
      ...(s.commDeliveries ?? []),
      { id: uid(), messageId: msg.id, channel: 'portal', provider: 'internal', status: 'sent', sentAt: msg.sentAt },
    ];
    const updated = afterOutboundStaffMessage(conv, msg.sentAt!, true);
    s.commConversations = s.commConversations!.map((c) => (c.id === conversationId ? updated : c));
    return s;
  });
  return msg;
}

export function sendCustomerPortalReply(conversationId: string, body: string, organizationId: string, senderName: string): CommMessage | null {
  let msg: CommMessage | null = null;
  updateDemoStore((s) => {
    const conv = authorizeConversationAccess(s, conversationId, { organizationId });
    if (!conv) return s;
    msg = appendMessageInternal(s, conversationId, {
      senderType: 'customer',
      senderName,
      body,
      channel: 'portal',
      direction: 'inbound',
      visibility: 'customer_visible',
    });
    s.commConversations = s.commConversations!.map((c) =>
      c.id === conversationId ? afterInboundCustomerMessage(c, msg!.sentAt!) : c,
    );
    return s;
  });
  return msg;
}

export function addInternalNote(conversationId: string, body: string, staffId: string, staffName: string): CommMessage | null {
  let msg: CommMessage | null = null;
  updateDemoStore((s) => {
    const conv = s.commConversations?.find((c) => c.id === conversationId);
    if (!conv) return s;
    msg = appendMessageInternal(s, conversationId, {
      senderType: 'staff',
      senderId: staffId,
      senderName: staffName,
      body,
      channel: 'portal',
      direction: 'internal',
      visibility: 'internal_only',
    });
    s.commConversations = s.commConversations!.map((c) =>
      c.id === conversationId ? afterInternalNote(c, msg!.createdAt) : c,
    );
    return s;
  });
  return msg;
}

export function recordEmailSentExternally(conversationId: string, body: string, staffId: string, staffName: string): CommMessage | null {
  let msg: CommMessage | null = null;
  updateDemoStore((s) => {
    const provider = resolveEmailProvider(s.commSettings?.providerMode ?? 'demo');
    const conv = s.commConversations?.find((c) => c.id === conversationId);
    if (!conv) return s;
    if (isSuppressed(s, { leadId: conv.leadId, organizationId: conv.organizationId, channel: 'email' })) return s;
    msg = appendMessageInternal(s, conversationId, {
      senderType: 'staff',
      senderId: staffId,
      senderName: staffName,
      body,
      channel: 'email',
      direction: 'outbound',
      visibility: 'customer_visible',
      status: recordExternalDelivery('').status,
    });
    s.commDeliveries = [
      ...(s.commDeliveries ?? []),
      {
        id: uid(),
        messageId: msg.id,
        channel: 'email',
        provider: provider.name,
        status: 'recorded_externally',
        sentAt: msg.sentAt,
      },
    ];
    s.commConversations = s.commConversations!.map((c) =>
      c.id === conversationId ? afterOutboundStaffMessage(c, msg!.sentAt!, false) : c,
    );
    return s;
  });
  return msg;
}

export function markConversationRead(conversationId: string, participantId: string, kind: 'contact' | 'staff'): void {
  updateDemoStore((s) => {
    const now = new Date().toISOString();
    s.commReadStates = [
      ...(s.commReadStates ?? []).filter((r) => !(r.conversationId === conversationId && r.participantId === participantId)),
      { id: uid(), conversationId, participantKind: kind, participantId, lastReadAt: now },
    ];
    return s;
  });
}

export function assignConversation(conversationId: string, staffId: string): void {
  updateDemoStore((s) => {
    s.commConversations = (s.commConversations ?? []).map((c) =>
      c.id === conversationId ? { ...c, assignedUserId: staffId, updatedAt: new Date().toISOString() } : c,
    );
    return s;
  });
}

export function relinkConversationOnLeadConversion(
  s: DemoStore,
  leadId: string,
  organizationId: string,
): DemoStore {
  s.commConversations = (s.commConversations ?? []).map((c) =>
    c.leadId === leadId ? { ...c, organizationId, updatedAt: new Date().toISOString() } : c,
  );
  s.commPreferences = (s.commPreferences ?? []).map((p) =>
    p.leadId === leadId ? { ...p, organizationId, leadId: undefined, updatedAt: new Date().toISOString() } : p,
  );
  return s;
}

export function searchConversations(query: string, store: DemoStore = loadDemoStore()): CommConversation[] {
  const q = query.toLowerCase();
  return (store.commConversations ?? []).filter((c) => {
    if (c.subject.toLowerCase().includes(q)) return true;
    const client = c.organizationId ? store.clients.find((x) => x.id === c.organizationId) : undefined;
    if (client?.companyName.toLowerCase().includes(q)) return true;
    const lead = c.leadId ? store.crmLeads?.find((l) => l.id === c.leadId) : undefined;
    if (lead?.businessName?.toLowerCase().includes(q)) return true;
    return false;
  });
}

export function getOutboxMessages(store: DemoStore = loadDemoStore()): CommMessage[] {
  return (store.commMessages ?? []).filter((m) =>
    ['draft', 'queued', 'failed', 'recorded_externally', 'demo'].includes(m.status),
  );
}

export function renderTemplate(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}

export type CommInboxQueue =
  | 'all'
  | 'unassigned'
  | 'needs_reply'
  | 'waiting_on_customer'
  | 'follow_up_today'
  | 'high_priority'
  | 'recent'
  | 'resolved';

export function conversationPartyLabel(conv: CommConversation, store: DemoStore): string {
  if (conv.organizationId) {
    const client = store.clients.find((c) => c.id === conv.organizationId);
    return client?.companyName ?? conv.organizationId;
  }
  if (conv.leadId) {
    const lead = store.crmLeads?.find((l) => l.id === conv.leadId);
    return lead?.businessName ?? ((`${lead?.firstName ?? ''} ${lead?.lastName ?? ''}`.trim()) || 'Prospect');
  }
  return 'Unknown';
}

export function conversationContextLabel(conv: CommConversation, store: DemoStore): string {
  if (conv.primaryContextType && conv.primaryContextId) {
    const link = (store.commContextLinks ?? []).find(
      (l) => l.conversationId === conv.id && l.relationshipType === 'primary',
    );
    if (link?.label) return link.label;
    return `${conv.primaryContextType.replace(/_/g, ' ')}`;
  }
  return conv.conversationType.replace(/_/g, ' ');
}

export function filterInboxQueue(queue: CommInboxQueue, store: DemoStore = loadDemoStore()): CommConversation[] {
  const convs = [...(store.commConversations ?? [])].sort(
    (a, b) => (b.lastMessageAt ?? b.createdAt).localeCompare(a.lastMessageAt ?? a.createdAt),
  );
  const closed = ['closed', 'archived'];
  switch (queue) {
    case 'unassigned':
      return convs.filter((c) => !c.assignedUserId && !closed.includes(c.status) && c.status !== 'resolved');
    case 'needs_reply':
      return convs.filter((c) => computeNeedsReply(c) && !closed.includes(c.status));
    case 'waiting_on_customer':
      return convs.filter((c) => c.status === 'waiting_on_customer');
    case 'high_priority':
      return convs.filter((c) => (c.priority === 'urgent' || c.priority === 'high') && !closed.includes(c.status));
    case 'resolved':
      return convs.filter((c) => c.status === 'resolved' || c.status === 'closed');
    case 'recent':
      return convs.filter((c) => !closed.includes(c.status)).slice(0, 20);
    case 'follow_up_today':
      return convs.filter((c) => {
        if (!c.nextResponseDueAt) return false;
        const due = new Date(c.nextResponseDueAt);
        const today = new Date();
        return due.toDateString() === today.toDateString();
      });
    default:
      return convs.filter((c) => !closed.includes(c.status) && c.status !== 'archived');
  }
}

export type PortalMessageFilter = 'all' | 'needs_reply' | 'service' | 'documents' | 'billing' | 'dispatch' | 'other';

export function filterPortalConversations(
  organizationId: string,
  filter: PortalMessageFilter,
  store: DemoStore = loadDemoStore(),
): CommConversation[] {
  let convs = getOrgConversations(organizationId, store);
  convs = convs.sort((a, b) => (b.lastMessageAt ?? b.createdAt).localeCompare(a.lastMessageAt ?? a.createdAt));
  switch (filter) {
    case 'needs_reply':
      return convs.filter((c) => c.status === 'waiting_on_customer');
    case 'service':
      return convs.filter((c) =>
        ['permitting', 'road_ready', 'support', 'renewal', 'sales'].includes(c.conversationType),
      );
    case 'documents':
      return convs.filter((c) => c.conversationType === 'documents');
    case 'billing':
      return convs.filter((c) => c.conversationType === 'billing');
    case 'dispatch':
      return convs.filter((c) => c.conversationType === 'dispatch');
    case 'other':
      return convs.filter((c) =>
        ['factoring', 'brokerage', 'insurance', 'appointment', 'general'].includes(c.conversationType),
      );
    default:
      return convs;
  }
}

export function getCustomerUnreadCount(organizationId: string, store: DemoStore = loadDemoStore()): number {
  const convs = getOrgConversations(organizationId, store);
  let count = 0;
  for (const c of convs) {
    const read = (store.commReadStates ?? []).find(
      (r) => r.conversationId === c.id && r.participantId === organizationId,
    );
    const msgs = getConversationMessages(c.id, store, true).filter((m) => m.senderType === 'staff');
    count += unreadCountForParticipant(msgs, read?.lastReadAt);
  }
  return count;
}
