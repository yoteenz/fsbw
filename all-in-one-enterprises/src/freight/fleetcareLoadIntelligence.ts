import type { DemoStore } from '../demo/demoTypes';
import type { TruckDispatchProfile } from '../dispatch/dispatchTypes';
import type { MaintenanceAttention } from './freightTypes';

const OPEN_TICKET_STATUSES = new Set([
  'submitted',
  'searching',
  'matched',
  'provider_reviewing',
  'provider_accepted',
  'awaiting_estimate',
  'estimate_sent',
  'awaiting_customer_authorization',
  'authorized',
  'scheduled',
  'in_service',
  'awaiting_parts',
  'on_hold',
]);

export function evaluateFleetCareLoadWarning(
  store: DemoStore,
  truck: TruckDispatchProfile | undefined,
  tripMiles: number,
): MaintenanceAttention | null {
  if (!truck) return null;

  const powerUnitId = truck.powerUnitId;

  if (truck.outOfService) {
    return {
      truckNickname: truck.nickname,
      severity: 'blocked',
      message: 'This vehicle is marked out of service.',
      actions: ['VIEW FLEETCARE', 'USE ANOTHER TRUCK'],
    };
  }

  if (truck.maintenanceHold) {
    return {
      truckNickname: truck.nickname,
      severity: 'blocked',
      message: 'This vehicle has an active maintenance hold.',
      actions: ['VIEW FLEETCARE', 'USE ANOTHER TRUCK'],
    };
  }

  const openCriticalTicket = (store.fleetcareTickets ?? []).find(
    (t) =>
      t.vehicleId === powerUnitId &&
      t.urgency === 'roadside_urgent' &&
      OPEN_TICKET_STATUSES.has(t.status),
  );

  if (openCriticalTicket) {
    return {
      truckNickname: truck.nickname,
      severity: 'warning',
      message: 'Open critical FleetCare maintenance ticket on this vehicle.',
      actions: ['VIEW FLEETCARE', 'USE ANOTHER TRUCK'],
    };
  }

  const currentMiles = truck.currentOdometerMiles;
  const nextPmMiles = truck.nextPmOdometerMiles;

  if (currentMiles != null && nextPmMiles != null && tripMiles > 0) {
    const milesUntilPm = nextPmMiles - currentMiles;
    if (tripMiles >= milesUntilPm && milesUntilPm > 0) {
      return {
        truckNickname: truck.nickname,
        severity: 'warning',
        serviceDueInMiles: milesUntilPm,
        message:
          'This trip may take this vehicle beyond its scheduled maintenance interval.',
        actions: ['VIEW FLEETCARE', 'USE ANOTHER TRUCK', 'PLAN SERVICE AFTER DELIVERY'],
      };
    }
    if (milesUntilPm > 0 && milesUntilPm <= 500) {
      return {
        truckNickname: truck.nickname,
        severity: 'information',
        serviceDueInMiles: milesUntilPm,
        message: `Preventive maintenance due in approximately ${milesUntilPm.toLocaleString()} miles.`,
        actions: ['VIEW FLEETCARE', 'PLAN SERVICE AFTER DELIVERY'],
      };
    }
  }

  if (truck.nextPmDate) {
    const due = new Date(truck.nextPmDate).getTime();
    const daysUntil = Math.ceil((due - Date.now()) / 86400000);
    if (daysUntil <= 7 && daysUntil >= 0) {
      return {
        truckNickname: truck.nickname,
        severity: 'information',
        message: `Scheduled service date approaching (${truck.nextPmDate}).`,
        actions: ['VIEW FLEETCARE', 'PLAN SERVICE AFTER DELIVERY'],
      };
    }
  }

  const lastRecord = (store.fleetcareRepairRecords ?? [])
    .filter((r) => r.vehicleId === powerUnitId && r.mileageAtService != null)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];

  if (lastRecord?.mileageAtService != null && currentMiles == null) {
    return {
      truckNickname: truck.nickname,
      severity: 'information',
      message: `Last FleetCare service recorded at ${lastRecord.mileageAtService.toLocaleString()} mi — current odometer not on file.`,
      actions: ['VIEW FLEETCARE'],
    };
  }

  return null;
}

export function maintenanceScoreAdjustment(warning: MaintenanceAttention | null): number {
  if (!warning) return 0;
  switch (warning.severity) {
    case 'blocked':
      return -30;
    case 'warning':
      return -8;
    case 'information':
      return -2;
    default:
      return 0;
  }
}
