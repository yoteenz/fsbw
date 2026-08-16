import { isBusinessDay } from '../workflow/businessDays';
import type { Appointment, AppointmentAvailabilityRule, AppointmentSlotHold, AppointmentType } from './appointmentTypes';

export interface SlotOffer {
  start: string;
  end: string;
  available: boolean;
}

function parseTime(hhmm: string): { h: number; m: number } {
  const [h, m] = hhmm.split(':').map(Number);
  return { h, m: m ?? 0 };
}

export function generateSlotsForDay(
  dateIso: string,
  type: AppointmentType,
  rules: AppointmentAvailabilityRule[],
  existing: Appointment[],
  holds: AppointmentSlotHold[],
  bufferMinutes: number,
  now = new Date(),
): SlotOffer[] {
  const day = new Date(`${dateIso}T12:00:00`);
  if (!isBusinessDay(day)) return [];
  const dow = day.getDay();
  const dayRules = rules.filter((r) => r.appointmentTypeId === type.id && r.dayOfWeek === dow);
  if (!dayRules.length) return [];

  const slots: SlotOffer[] = [];
  for (const rule of dayRules) {
    const start = parseTime(rule.startTime);
    const end = parseTime(rule.endTime);
    let cursor = new Date(`${dateIso}T${String(start.h).padStart(2, '0')}:${String(start.m).padStart(2, '0')}:00`);
    const endDt = new Date(`${dateIso}T${String(end.h).padStart(2, '0')}:${String(end.m).padStart(2, '0')}:00`);
    while (cursor < endDt) {
      const slotEnd = new Date(cursor.getTime() + type.durationMinutes * 60000);
      if (slotEnd > endDt) break;
      if (cursor <= now) {
        cursor = new Date(cursor.getTime() + (type.durationMinutes + bufferMinutes) * 60000);
        continue;
      }
      const startIso = cursor.toISOString();
      const endIso = slotEnd.toISOString();
      const booked = existing.some(
        (a) =>
          !['cancelled', 'no_show'].includes(a.status) &&
          a.scheduledStart === startIso,
      );
      const held = holds.some(
        (h) => h.slotStart === startIso && new Date(h.expiresAt) > now,
      );
      slots.push({ start: startIso, end: endIso, available: !booked && !held });
      cursor = new Date(slotEnd.getTime() + bufferMinutes * 60000);
    }
  }
  return slots;
}

export function tryBookSlot(
  appointments: Appointment[],
  holds: AppointmentSlotHold[],
  slotStart: string,
  sessionKey: string,
): { ok: true } | { ok: false; reason: string } {
  const activeHold = holds.find((h) => h.slotStart === slotStart && h.sessionKey !== sessionKey && new Date(h.expiresAt) > new Date());
  if (activeHold) return { ok: false, reason: 'Slot temporarily held' };
  const booked = appointments.some(
    (a) => !['cancelled', 'no_show'].includes(a.status) && a.scheduledStart === slotStart,
  );
  if (booked) return { ok: false, reason: 'Slot no longer available' };
  return { ok: true };
}

export function formatAppointmentLocal(iso: string, timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: timezone,
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleString();
  }
}
