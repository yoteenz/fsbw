import type {
  Appointment,
  AppointmentAvailabilityRule,
  AppointmentReminder,
  AppointmentSettings,
  AppointmentStatusHistory,
  AppointmentType,
} from '../appointments/appointmentTypes';

function daysAgo(now: Date, d: number): string {
  return new Date(now.getTime() - d * 86400000).toISOString();
}

function daysAhead(now: Date, d: number): string {
  return new Date(now.getTime() + d * 86400000).toISOString();
}

function atBusinessHour(date: Date, hour: number, minute = 0): string {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function createAppointmentsSeedData(now = new Date()) {
  const settings: AppointmentSettings = {
    minimumNoticeHours: 4,
    maximumAdvanceDays: 30,
    bufferMinutes: 15,
    defaultTimezone: 'America/Chicago',
    reminderHoursBefore: [24, 2],
  };

  const types: AppointmentType[] = [
    { id: 'at-general', slug: 'general_consultation', name: 'General Consultation', durationMinutes: 30, teamId: 'team-support', active: true },
    { id: 'at-new-biz', slug: 'new_business_consultation', name: 'New Business Consultation', durationMinutes: 45, teamId: 'team-permitting', active: true },
    { id: 'at-permitting', slug: 'permitting_consultation', name: 'Permitting Consultation', durationMinutes: 30, teamId: 'team-permitting', active: true },
    { id: 'at-insurance', slug: 'insurance_consultation', name: 'Insurance Consultation', durationMinutes: 30, teamId: 'team-insurance', active: true },
    { id: 'at-dispatch', slug: 'dispatch_consultation', name: 'Dispatch Consultation', durationMinutes: 30, teamId: 'team-dispatch', active: true },
    { id: 'at-factoring', slug: 'factoring_consultation', name: 'Factoring Consultation', durationMinutes: 30, teamId: 'team-factoring', active: true },
    { id: 'at-brokerage', slug: 'brokerage_consultation', name: 'Brokerage / Shipper Consultation', durationMinutes: 45, teamId: 'team-brokerage', active: true },
  ];

  const availability: AppointmentAvailabilityRule[] = [1, 2, 3, 4, 5].flatMap((dow) => [
    { id: `avail-gen-${dow}`, appointmentTypeId: 'at-general', dayOfWeek: dow, startTime: '09:00', endTime: '12:00', timezone: 'America/Chicago' },
    { id: `avail-gen-pm-${dow}`, appointmentTypeId: 'at-general', dayOfWeek: dow, startTime: '13:00', endTime: '16:00', timezone: 'America/Chicago' },
    { id: `avail-nb-${dow}`, appointmentTypeId: 'at-new-biz', dayOfWeek: dow, startTime: '10:00', endTime: '15:00', staffId: 'staff-2', timezone: 'America/Chicago' },
  ]);

  const tomorrow = new Date(now.getTime() + 86400000);
  const tomorrowStart = atBusinessHour(tomorrow, 10, 0);
  const tomorrowEnd = atBusinessHour(tomorrow, 10, 45);

  const todayStart = atBusinessHour(now, 14, 0);
  const todayEnd = atBusinessHour(now, 14, 30);

  const appointments: Appointment[] = [
    {
      id: 'appt-requested',
      appointmentTypeId: 'at-general',
      status: 'requested',
      scheduledStart: daysAhead(now, 5),
      scheduledEnd: new Date(new Date(daysAhead(now, 5)).getTime() + 30 * 60000).toISOString(),
      timezone: 'America/Chicago',
      leadId: 'lead-c',
      customerName: 'Taylor Brooks',
      customerEmail: 'taylor.demo@example.local',
      customerPhone: '555-0199',
      customerReason: 'Questions about dispatch onboarding',
      assignedTeamId: 'team-dispatch',
      createdAt: daysAgo(now, 0),
      updatedAt: daysAgo(now, 0),
      isDemo: true,
    },
    {
      id: 'appt-tomorrow',
      appointmentTypeId: 'at-new-biz',
      status: 'confirmed',
      scheduledStart: tomorrowStart,
      scheduledEnd: tomorrowEnd,
      timezone: 'America/Chicago',
      leadId: 'lead-b',
      conversationId: 'conv-g',
      assignedUserId: 'staff-2',
      assignedTeamId: 'team-permitting',
      customerName: 'Skyline Startup Demo',
      customerEmail: 'skyline.demo@example.local',
      customerReason: 'Starting trucking company — LLC, USDOT, authority',
      confirmedAt: daysAgo(now, 1),
      createdAt: daysAgo(now, 3),
      updatedAt: daysAgo(now, 1),
      isDemo: true,
    },
    {
      id: 'appt-today',
      appointmentTypeId: 'at-permitting',
      status: 'confirmed',
      scheduledStart: todayStart,
      scheduledEnd: todayEnd,
      timezone: 'America/Chicago',
      organizationId: 'client-a',
      assignedUserId: 'staff-2',
      customerName: 'Marcus Webb',
      customerEmail: 'marcus.demo@summitridge.example',
      customerReason: 'IRP document questions',
      confirmedAt: daysAgo(now, 2),
      createdAt: daysAgo(now, 4),
      updatedAt: daysAgo(now, 2),
      isDemo: true,
    },
    {
      id: 'appt-completed',
      appointmentTypeId: 'at-factoring',
      status: 'completed',
      scheduledStart: daysAgo(now, 7),
      scheduledEnd: new Date(new Date(daysAgo(now, 7)).getTime() + 30 * 60000).toISOString(),
      timezone: 'America/Chicago',
      organizationId: 'client-d',
      assignedUserId: 'staff-6',
      customerName: 'Kevin Shaw',
      staffSummary: 'Discussed factoring package requirements. Customer will upload invoices.',
      completedAt: daysAgo(now, 7),
      createdAt: daysAgo(now, 10),
      updatedAt: daysAgo(now, 7),
      isDemo: true,
    },
    {
      id: 'appt-cancelled',
      appointmentTypeId: 'at-general',
      status: 'cancelled',
      scheduledStart: daysAgo(now, 2),
      scheduledEnd: new Date(new Date(daysAgo(now, 2)).getTime() + 30 * 60000).toISOString(),
      timezone: 'America/Chicago',
      organizationId: 'client-b',
      customerName: 'Diana Cole',
      cancelledAt: daysAgo(now, 3),
      cancelReason: 'Customer schedule conflict',
      createdAt: daysAgo(now, 5),
      updatedAt: daysAgo(now, 3),
      isDemo: true,
    },
    {
      id: 'appt-noshow',
      appointmentTypeId: 'at-insurance',
      status: 'no_show',
      scheduledStart: daysAgo(now, 1),
      scheduledEnd: new Date(new Date(daysAgo(now, 1)).getTime() + 30 * 60000).toISOString(),
      timezone: 'America/Chicago',
      leadId: 'lead-h',
      customerName: 'Nurture Prospect Demo',
      createdAt: daysAgo(now, 5),
      updatedAt: daysAgo(now, 1),
      isDemo: true,
    },
    {
      id: 'appt-reschedule',
      appointmentTypeId: 'at-brokerage',
      status: 'reschedule_requested',
      scheduledStart: daysAhead(now, 3),
      scheduledEnd: new Date(new Date(daysAhead(now, 3)).getTime() + 45 * 60000).toISOString(),
      timezone: 'America/Chicago',
      organizationId: 'client-e',
      customerName: 'Elena Vasquez',
      customerReason: 'Need to move to afternoon slot',
      createdAt: daysAgo(now, 2),
      updatedAt: daysAgo(now, 0),
      isDemo: true,
    },
  ];

  const history: AppointmentStatusHistory[] = [
    { id: 'ah-1', appointmentId: 'appt-tomorrow', toStatus: 'confirmed', actorStaffId: 'staff-2', createdAt: daysAgo(now, 1) },
    { id: 'ah-2', appointmentId: 'appt-completed', fromStatus: 'confirmed', toStatus: 'completed', actorStaffId: 'staff-6', createdAt: daysAgo(now, 7) },
  ];

  const reminders: AppointmentReminder[] = [
    { id: 'rem-1', appointmentId: 'appt-tomorrow', remindAt: new Date(new Date(tomorrowStart).getTime() - 24 * 3600000).toISOString(), channel: 'portal', status: 'scheduled' },
    { id: 'rem-2', appointmentId: 'appt-tomorrow', remindAt: new Date(new Date(tomorrowStart).getTime() - 2 * 3600000).toISOString(), channel: 'portal', status: 'scheduled' },
  ];

  return {
    appointmentSettings: settings,
    appointmentTypes: types,
    appointmentAvailability: availability,
    appointments,
    appointmentStatusHistory: history,
    appointmentReminders: reminders,
    appointmentSlotHolds: [],
  };
}
