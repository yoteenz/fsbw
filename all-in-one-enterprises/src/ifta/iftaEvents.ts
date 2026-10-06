/**
 * IFTA → shared surfaces. Every quarter event lands where the contract says it should:
 * INBOX (notifications + the quarter request thread), ACTIVITY (My Office timeline), VAULT (sealed packet),
 * and the staff side (office notifications). All functions mutate a DemoStore draft inside updateDemoStore.
 */
import type { ActivityKind, DemoStore } from '../demo/demoTypes';
import type { CommConversation, CommMessage } from '../communications/communicationTypes';
import { buildNotification } from '../notifications/notificationEngine';
import type { NotificationEventType } from '../notifications/notificationTypes';
import type { VaultDocument } from '../vault/vaultTypes';
import { aioPaths } from '../utils/paths';
import { quarterKey, quarterLabel } from './iftaDates';
import { iftaPacketContents, iftaVaultPath } from './iftaSeed';
import type { IftaQuarterCase } from './iftaTypes';

export function iftaRoomLink(q: IftaQuarterCase): string {
  return aioPaths.portalIftaQuarter(quarterKey(q));
}

export function companyNameOf(s: DemoStore, organizationId: string): string {
  return s.clients.find((c) => c.id === organizationId)?.companyName ?? organizationId;
}

export function staffNameOf(s: DemoStore, staffId: string | undefined): string {
  return s.staff.find((m) => m.id === staffId)?.name ?? 'AIO staff';
}

let sequence = 0;
function eventId(prefix: string): string {
  sequence += 1;
  return `${prefix}-${Date.now().toString(36)}-${sequence}`;
}

export function emitActivity(
  s: DemoStore,
  q: IftaQuarterCase,
  kind: ActivityKind,
  title: string,
  opts: { detail?: string; at?: string; id?: string; staffId?: string } = {},
): void {
  s.activity.unshift({
    id: opts.id ?? eventId('act-ifta'),
    kind,
    title,
    detail: opts.detail,
    clientId: q.organizationId,
    staffId: opts.staffId,
    createdAt: opts.at ?? new Date().toISOString(),
    visibility: 'customer',
  });
}

export function emitClientNotice(
  s: DemoStore,
  q: IftaQuarterCase,
  eventType: NotificationEventType,
  title: string,
  body: string,
  opts: { at?: string; read?: boolean } = {},
): void {
  const n = buildNotification({
    organizationId: q.organizationId,
    recipientType: 'customer',
    recipientId: q.organizationId,
    category: 'tax_fuel',
    eventType,
    title,
    body,
    link: iftaRoomLink(q),
    entityType: 'ifta_quarter',
    entityId: q.id,
    dedupeKey: `ifta:${q.id}:${eventType}:${opts.at ?? Date.now()}`,
  });
  if (opts.at) n.createdAt = opts.at;
  if (opts.read) n.read = true;
  s.notifications.unshift(n);
}

/** Resolving in the filing room resolves the matching inbox notices (sprint §18 — both surfaces update). */
export function resolveClientNotices(s: DemoStore, q: IftaQuarterCase, eventTypes: NotificationEventType[]): number {
  let resolved = 0;
  for (const n of s.notifications) {
    if (n.entityId === q.id && n.recipientType === 'customer' && eventTypes.includes(n.eventType) && !n.archived) {
      n.read = true;
      n.archived = true;
      resolved += 1;
    }
  }
  return resolved;
}

export function emitStaffNotice(s: DemoStore, q: IftaQuarterCase, eventType: NotificationEventType, title: string, body: string): void {
  s.notifications.unshift(
    buildNotification({
      organizationId: q.organizationId,
      recipientType: 'staff',
      staffId: q.assignedStaffId,
      category: 'tax_fuel',
      eventType,
      title,
      body,
      link: aioPaths.officeFuelTaxCase(q.id),
      entityType: 'ifta_quarter',
      entityId: q.id,
      dedupeKey: `ifta-staff:${q.id}:${eventType}:${Date.now()}`,
    }),
  );
}

/** The quarter request thread (contract: INBOX opens at QUARTER_OPEN, resolves at FILED). */
export function ensureThread(s: DemoStore, q: IftaQuarterCase, at?: string): CommConversation {
  const existing = q.conversationId ? s.commConversations?.find((c) => c.id === q.conversationId) : undefined;
  if (existing) return existing;
  const created = at ?? new Date().toISOString();
  const conv: CommConversation = {
    id: `conv-${q.id}`,
    organizationId: q.organizationId,
    subject: `IFTA ${quarterLabel(q)} — fuel tax filing`,
    conversationType: 'permitting',
    status: 'open',
    priority: 'normal',
    responseResponsibility: 'none',
    assignedUserId: q.assignedStaffId,
    createdAt: created,
    updatedAt: created,
    isDemo: true,
  };
  s.commConversations = [...(s.commConversations ?? []), conv];
  q.conversationId = conv.id;
  return conv;
}

export function postThread(
  s: DemoStore,
  q: IftaQuarterCase,
  message: { senderType: CommMessage['senderType']; senderName: string; senderId?: string; body: string; at?: string },
  status?: CommConversation['status'],
): CommMessage {
  const conv = ensureThread(s, q, message.at);
  const at = message.at ?? new Date().toISOString();
  const msg: CommMessage = {
    id: eventId('msg-ifta'),
    conversationId: conv.id,
    senderType: message.senderType,
    senderId: message.senderId,
    senderName: message.senderName,
    channel: 'portal',
    direction: message.senderType === 'customer' ? 'inbound' : message.senderType === 'staff' ? 'outbound' : 'system',
    visibility: 'customer_visible',
    body: message.body,
    status: 'sent',
    category: 'service',
    createdAt: at,
    sentAt: at,
    isDemo: true,
  };
  s.commMessages = [...(s.commMessages ?? []), msg];
  s.commConversations = (s.commConversations ?? []).map((c) =>
    c.id === conv.id
      ? {
          ...c,
          status: status ?? c.status,
          lastMessageAt: at,
          updatedAt: at,
          lastStaffMessageAt: message.senderType === 'staff' ? at : c.lastStaffMessageAt,
          lastCustomerMessageAt: message.senderType === 'customer' ? at : c.lastCustomerMessageAt,
          responseResponsibility: status === 'waiting_on_customer' ? 'customer' : status === 'waiting_on_staff' ? 'staff' : c.responseResponsibility,
          closedAt: status === 'resolved' ? at : c.closedAt,
        }
      : c,
  );
  return msg;
}

export function threadMessages(s: DemoStore, q: IftaQuarterCase): CommMessage[] {
  if (!q.conversationId) return [];
  return (s.commMessages ?? [])
    .filter((m) => m.conversationId === q.conversationId && m.visibility === 'customer_visible')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** FILED → VAULT: the quarter becomes one sealed folder object (contract QUARTER_PACKET). */
export function sealPacketToVault(s: DemoStore, q: IftaQuarterCase, at: string): VaultDocument {
  const contents = iftaPacketContents(q);
  const doc: VaultDocument = {
    id: `vdoc-${q.id}-packet`,
    organizationId: q.organizationId,
    category: 'tax_fuel',
    documentType: 'Tax Document',
    title: `IFTA ${quarterLabel(q)} filing packet`,
    description: `Sealed by AIO. ${contents.join(' · ')}. Confirmation ${q.filing?.confirmationNumber ?? '—'}.`,
    status: 'verified',
    verificationStatus: 'verified',
    visibility: 'customer',
    isCurrent: true,
    source: 'service_generated',
    recordLifecycle: 'current',
    jurisdiction: q.baseJurisdiction,
    mimeType: 'application/pdf',
    fileName: `IFTA-${quarterKey(q)}-filing-packet.pdf`,
    issuedAt: q.filing?.filedAt ?? at,
    createdAt: at,
    updatedAt: at,
    uploadedAt: at,
  };
  s.documents = [doc, ...s.documents.filter((d) => d.id !== doc.id)];
  q.vault = { sealedAt: at, path: iftaVaultPath(q), documentId: doc.id, contents };
  return doc;
}
