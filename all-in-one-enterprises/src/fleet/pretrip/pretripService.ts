import type { DemoStore } from '../../demo/demoTypes';
import { shouldEscalateToFleetCare, type PretripInspection, type SubmitPretripInput } from './pretripTypes';

function uid(): string {
  return crypto.randomUUID();
}

export function submitPretripInspection(store: DemoStore, input: SubmitPretripInput): PretripInspection {
  const inspection: PretripInspection = {
    id: uid(),
    organizationId: input.organizationId,
    driverId: input.driverId,
    powerUnitId: input.powerUnitId,
    trailerId: input.trailerId,
    loadId: input.loadId,
    result: input.result,
    defectSummary: input.defectSummary,
    odometerMiles: input.odometerMiles,
    inspectedAt: new Date().toISOString(),
    escalatedToFleetCare: false,
    createdAt: new Date().toISOString(),
  };

  if (shouldEscalateToFleetCare(input.result)) {
    inspection.escalatedToFleetCare = true;
    const ticketId = uid();
    inspection.fleetCareTicketId = ticketId;
    const seq = (store.fleetcareCounters?.ticketSeq ?? 100) + 1;
    store.fleetcareCounters = { ...(store.fleetcareCounters ?? { ticketSeq: 100 }), ticketSeq: seq };
    store.fleetcareTickets = store.fleetcareTickets ?? [];
    store.fleetcareTickets.unshift({
      id: ticketId,
      ticketNumber: `FC-${String(seq).padStart(6, '0')}`,
      clientOrganizationId: input.organizationId,
      vehicleId: input.powerUnitId ?? 'unknown',
      serviceCategoryCode: 'pretrip_inspection',
      issueDescription: input.defectSummary ?? `Pre-trip result: ${input.result}`,
      drivableStatus: input.result === 'OUT_OF_SERVICE' ? 'no' : 'unknown',
      location: { label: 'Pre-trip inspection' },
      urgency: input.result === 'OUT_OF_SERVICE' ? 'roadside_urgent' : 'soon',
      status: 'submitted',
      leadSource: 'aio_marketplace',
      aioOriginated: true,
      customerContactReleased: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  store.pretripInspections = [...(store.pretripInspections ?? []), inspection];
  return inspection;
}
