export type FreightLocationType = 'shipper' | 'receiver' | 'both';

export interface FreightLocation {
  id: string;
  organizationId: string;
  businessName: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode?: string;
  facilityType?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  hours?: string;
  appointmentRules?: string;
  driverInstructions?: string;
  dockInstructions?: string;
  parkingNotes?: string;
  lumperNotes?: string;
  internalNotes?: string;
  locationType: FreightLocationType;
  createdAt: string;
  updatedAt: string;
}

export interface FreightLocationSnapshot {
  businessName: string;
  city: string;
  state: string;
  driverInstructions?: string;
  capturedAt: string;
}

export function snapshotLocation(loc: FreightLocation): FreightLocationSnapshot {
  return {
    businessName: loc.businessName,
    city: loc.city,
    state: loc.state,
    driverInstructions: loc.driverInstructions,
    capturedAt: new Date().toISOString(),
  };
}
