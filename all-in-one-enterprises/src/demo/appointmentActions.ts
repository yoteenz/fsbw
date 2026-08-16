import { generateSlotsForDay, tryBookSlot } from '../appointments/availabilityEngine';
import type { Appointment, AppointmentType } from '../appointments/appointmentTypes';
import { loadDemoStore, updateDemoStore } from './demoStore';
import type { DemoStore } from './demoTypes';
import { createConversation } from './communicationActions';
import { createLeadFromForm } from './crmActions';

function uid(): string {
  return crypto.randomUUID();
}

export function getAppointments(store: DemoStore = loadDemoStore()): Appointment[] {
  return store.appointments ?? [];
}

export function getAppointment(id: string, store: DemoStore = loadDemoStore()): Appointment | undefined {
  return store.appointments?.find((a) => a.id === id);
}

export function getAppointmentTypes(store: DemoStore = loadDemoStore()): AppointmentType[] {
  return (store.appointmentTypes ?? []).filter((t) => t.active);
}

export function getAvailableSlots(appointmentTypeId: string, dateIso: string, _sessionKey: string, store: DemoStore = loadDemoStore()) {
  const type = store.appointmentTypes?.find((t) => t.id === appointmentTypeId);
  if (!type) return [];
  const settings = store.appointmentSettings!;
  return generateSlotsForDay(
    dateIso,
    type,
    store.appointmentAvailability ?? [],
    store.appointments ?? [],
    store.appointmentSlotHolds ?? [],
    settings.bufferMinutes,
  );
}

export function holdSlot(appointmentTypeId: string, slotStart: string, slotEnd: string, sessionKey: string): boolean {
  let ok = false;
  updateDemoStore((s) => {
    const type = s.appointmentTypes?.find((t) => t.id === appointmentTypeId);
    if (!type) return s;
    const check = tryBookSlot(s.appointments ?? [], s.appointmentSlotHolds ?? [], slotStart, sessionKey);
    if (!check.ok) return s;
    const expiresAt = new Date(Date.now() + 10 * 60000).toISOString();
    s.appointmentSlotHolds = [
      ...(s.appointmentSlotHolds ?? []).filter((h) => h.sessionKey !== sessionKey),
      { id: uid(), appointmentTypeId, slotStart, slotEnd, expiresAt, sessionKey },
    ];
    ok = true;
    return s;
  });
  return ok;
}

export function bookAppointment(input: {
  appointmentTypeId: string;
  slotStart: string;
  slotEnd: string;
  sessionKey: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerReason?: string;
  organizationId?: string;
  leadId?: string;
  timezone?: string;
}): { ok: true; appointment: Appointment } | { ok: false; error: string } {
  let result: { ok: true; appointment: Appointment } | { ok: false; error: string } = { ok: false, error: 'Unknown' };
  updateDemoStore((s) => {
    const type = s.appointmentTypes?.find((t) => t.id === input.appointmentTypeId);
    if (!type) {
      result = { ok: false, error: 'Invalid appointment type' };
      return s;
    }
    const check = tryBookSlot(s.appointments ?? [], s.appointmentSlotHolds ?? [], input.slotStart, input.sessionKey);
    if (!check.ok) {
      result = { ok: false, error: check.reason };
      return s;
    }
    const now = new Date().toISOString();
    const appt: Appointment = {
      id: uid(),
      appointmentTypeId: input.appointmentTypeId,
      status: 'pending_confirmation',
      scheduledStart: input.slotStart,
      scheduledEnd: input.slotEnd,
      timezone: input.timezone ?? s.appointmentSettings?.defaultTimezone ?? 'America/Chicago',
      organizationId: input.organizationId,
      leadId: input.leadId,
      assignedTeamId: type.teamId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      customerReason: input.customerReason,
      createdAt: now,
      updatedAt: now,
      isDemo: true,
    };
    s.appointments = [...(s.appointments ?? []), appt];
    s.appointmentStatusHistory = [
      ...(s.appointmentStatusHistory ?? []),
      { id: uid(), appointmentId: appt.id, toStatus: 'pending_confirmation', createdAt: now },
    ];
    s.appointmentSlotHolds = (s.appointmentSlotHolds ?? []).filter((h) => h.sessionKey !== input.sessionKey);
    result = { ok: true, appointment: appt };
    return s;
  });
  return result;
}

export function bookPublicAppointment(input: {
  appointmentTypeId: string;
  slotStart: string;
  slotEnd: string;
  sessionKey: string;
  name: string;
  email?: string;
  phone?: string;
  reason?: string;
}): { ok: true; appointment: Appointment } | { ok: false; error: string } {
  const lead = createLeadFromForm({
    firstName: input.name.split(' ')[0],
    lastName: input.name.split(' ').slice(1).join(' ') || undefined,
    email: input.email,
    phone: input.phone,
    message: input.reason,
    sourceSlug: 'website',
  });
  createConversation({
    subject: 'Appointment request',
    conversationType: 'appointment',
    leadId: lead.id,
    primaryContextType: 'lead',
    primaryContextId: lead.id,
    initialMessage: input.reason ?? 'Appointment requested via public schedule',
    senderName: input.name,
  });
  const booked = bookAppointment({
    appointmentTypeId: input.appointmentTypeId,
    slotStart: input.slotStart,
    slotEnd: input.slotEnd,
    sessionKey: input.sessionKey,
    customerName: input.name,
    customerEmail: input.email,
    customerPhone: input.phone,
    customerReason: input.reason,
    leadId: lead.id,
  });
  if (booked.ok) {
    updateDemoStore((s) => {
      const appt = s.appointments?.find((a) => a.id === booked.appointment.id);
      if (appt) appt.leadId = lead.id;
      return s;
    });
  }
  return booked;
}

export function confirmAppointment(appointmentId: string, staffId?: string): void {
  updateDemoStore((s) => {
    const now = new Date().toISOString();
    s.appointments = (s.appointments ?? []).map((a) =>
      a.id === appointmentId ? { ...a, status: 'confirmed', confirmedAt: now, assignedUserId: staffId ?? a.assignedUserId, updatedAt: now } : a,
    );
    s.appointmentStatusHistory = [
      ...(s.appointmentStatusHistory ?? []),
      { id: uid(), appointmentId, fromStatus: 'pending_confirmation', toStatus: 'confirmed', actorStaffId: staffId, createdAt: now },
    ];
    return s;
  });
}

export function completeAppointment(appointmentId: string, staffSummary: string, staffId?: string): void {
  updateDemoStore((s) => {
    const now = new Date().toISOString();
    s.appointments = (s.appointments ?? []).map((a) =>
      a.id === appointmentId
        ? { ...a, status: 'completed', staffSummary, completedAt: now, updatedAt: now }
        : a,
    );
    s.appointmentStatusHistory = [
      ...(s.appointmentStatusHistory ?? []),
      { id: uid(), appointmentId, toStatus: 'completed', actorStaffId: staffId, note: staffSummary, createdAt: now },
    ];
    const appt = s.appointments?.find((a) => a.id === appointmentId);
    if (appt?.leadId) {
      s.crmActivities = [
        ...(s.crmActivities ?? []),
        {
          id: uid(),
          leadId: appt.leadId,
          activityType: 'meeting',
          title: 'Consultation completed',
          body: staffSummary,
          actorStaffId: staffId,
          createdAt: now,
          isDemo: true,
        },
      ];
    }
    return s;
  });
}

export function requestReschedule(appointmentId: string): void {
  updateDemoStore((s) => {
    const now = new Date().toISOString();
    s.appointments = (s.appointments ?? []).map((a) =>
      a.id === appointmentId ? { ...a, status: 'reschedule_requested', updatedAt: now } : a,
    );
    return s;
  });
}

export function cancelAppointment(appointmentId: string, reason?: string): void {
  updateDemoStore((s) => {
    const now = new Date().toISOString();
    s.appointments = (s.appointments ?? []).map((a) =>
      a.id === appointmentId ? { ...a, status: 'cancelled', cancelledAt: now, cancelReason: reason, updatedAt: now } : a,
    );
    return s;
  });
}

export function getOrgAppointments(organizationId: string, store: DemoStore = loadDemoStore()): Appointment[] {
  return (store.appointments ?? []).filter((a) => a.organizationId === organizationId);
}

export function getUpcomingAppointments(store: DemoStore = loadDemoStore()): Appointment[] {
  const now = Date.now();
  return (store.appointments ?? []).filter(
    (a) => ['confirmed', 'pending_confirmation', 'requested'].includes(a.status) && new Date(a.scheduledStart).getTime() >= now,
  );
}
