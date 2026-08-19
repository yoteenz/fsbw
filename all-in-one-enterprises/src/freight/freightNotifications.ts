import type { SupabaseClient } from '@supabase/supabase-js';
import { updateDemoStore } from '../demo/demoStore';
import { buildNotification, shouldCreateNotification } from '../notifications/notificationEngine';
import type { NotificationEventType } from '../notifications/notificationTypes';

export interface FreightNotificationInput {
  eventType: NotificationEventType;
  organizationId?: string;
  userId?: string;
  staffId?: string;
  loadId?: string;
  title: string;
  body: string;
  dedupeKey: string;
  link?: string;
}

const FREIGHT_LOAD_BOARD_EVENTS: NotificationEventType[] = [
  'NEW_MATCHING_LOAD',
  'PRIVATE_LOAD_INVITE',
  'CARRIER_OFFER_SUBMITTED',
  'OFFER_ACCEPTED',
  'OFFER_COUNTERED',
  'OFFER_DECLINED',
  'LOAD_BOOKED',
  'LOAD_UPDATED',
  'LOAD_CANCELLED',
  'PICKUP_REMINDER',
  'DELIVERY_REMINDER',
  'DOCUMENT_REQUIRED',
  'POD_REQUIRED',
  'PAYMENT_STATUS_CHANGED',
  'FLEETCARE_LOAD_WARNING',
];

export function isFreightLoadBoardEvent(type: NotificationEventType): boolean {
  return FREIGHT_LOAD_BOARD_EVENTS.includes(type);
}

export function deliverFreightNotificationDemo(input: FreightNotificationInput): boolean {
  let delivered = false;
  updateDemoStore((s) => {
    if (!shouldCreateNotification(s.notifications, input.dedupeKey)) return s;
    const notification = buildNotification({
      organizationId: input.organizationId,
      recipientType: input.staffId ? 'staff' : 'customer',
      recipientId: input.organizationId,
      staffId: input.staffId,
      eventType: input.eventType,
      category: 'brokerage',
      title: input.title,
      body: input.body,
      dedupeKey: input.dedupeKey,
      entityType: 'load',
      entityId: input.loadId,
      link: input.link,
    });
    delivered = true;
    return { ...s, notifications: [notification, ...s.notifications] };
  });
  return delivered;
}

export async function notifyFreightEvent(
  supabase: SupabaseClient | null,
  input: FreightNotificationInput,
): Promise<boolean> {
  if (!supabase || !input.userId) {
    return deliverFreightNotificationDemo(input);
  }

  const { data: existing } = await supabase
    .from('aio_notifications')
    .select('id')
    .eq('user_id', input.userId)
    .eq('type', input.eventType)
    .eq('entity_id', input.loadId ?? '')
    .maybeSingle();

  if (existing) return false;

  const { error } = await supabase.from('aio_notifications').insert({
    user_id: input.userId,
    type: input.eventType,
    title: input.title,
    body: input.body,
    entity_type: 'load',
    entity_id: input.loadId ?? null,
  });

  if (error) {
    console.error('[freight] notification delivery failed', { eventType: input.eventType, code: error.code });
    return false;
  }
  return true;
}

export function notifyCarrierOfferSubmittedDemo(
  carrierOrgId: string,
  loadId: string,
  offerId: string,
): void {
  deliverFreightNotificationDemo({
    eventType: 'CARRIER_OFFER_SUBMITTED',
    organizationId: carrierOrgId,
    loadId,
    title: 'Offer submitted',
    body: 'Your load board offer was sent to AIO brokerage.',
    dedupeKey: `offer-submitted:${offerId}`,
    link: `/portal/load-board/my-loads`,
  });
}

export function notifyFleetCareLoadWarningDemo(
  carrierOrgId: string,
  loadId: string,
  truckNickname: string,
  message: string,
): void {
  deliverFreightNotificationDemo({
    eventType: 'FLEETCARE_LOAD_WARNING',
    organizationId: carrierOrgId,
    loadId,
    title: 'Maintenance attention',
    body: `${truckNickname}: ${message}`,
    dedupeKey: `fleetcare-warning:${loadId}:${truckNickname}`,
    link: `/portal/fleetcare`,
  });
}
