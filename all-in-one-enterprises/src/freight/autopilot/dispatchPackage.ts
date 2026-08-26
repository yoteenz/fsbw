import type { Load } from '../../dispatch/dispatchTypes';
import type { TruckDispatchProfile } from '../../dispatch/dispatchTypes';
import type { DriverPlaceholder } from '../../road-ready/roadReadyTypes';
import type { Trailer } from '../../road-ready/roadReadyTypes';

/** Driver-safe dispatch package — no shipper billing or AIO margin. */
export interface DispatchPackage {
  loadId: string;
  loadNumber: string;
  organizationId: string;
  carrierOrganizationLabel: string;
  driver?: { id: string; name: string; phone?: string };
  truck?: { id: string; nickname: string; unitNumber?: string };
  trailer?: { id: string; unitNumber: string; type?: string };
  origin: { city: string; state: string; appointment?: string };
  destination: { city: string; state: string; appointment?: string };
  commodity?: string;
  weight?: string;
  equipmentType: string;
  referenceNumbers: string[];
  handlingInstructions?: string;
  documentRequirements: string[];
  dispatcherContact?: { name: string; phone?: string; email?: string };
  trackingRequirement: 'manual_check_in' | 'link_based_future' | 'eld_future';
  generatedAt: string;
}

export interface BuildDispatchPackageInput {
  load: Load;
  truckProfile?: TruckDispatchProfile;
  driver?: DriverPlaceholder;
  trailer?: Trailer;
  dispatcherName?: string;
  dispatcherPhone?: string;
  dispatcherEmail?: string;
}

export function buildDispatchPackage(input: BuildDispatchPackageInput): DispatchPackage {
  const { load, truckProfile, driver, trailer, dispatcherName, dispatcherPhone, dispatcherEmail } = input;
  const refs = [load.loadNumber, load.sourceReference].filter(Boolean) as string[];

  return {
    loadId: load.id,
    loadNumber: load.loadNumber,
    organizationId: load.organizationId,
    carrierOrganizationLabel: load.brokerName,
    driver: driver
      ? { id: driver.id, name: driver.name, phone: driver.phone }
      : undefined,
    truck: truckProfile
      ? { id: truckProfile.id, nickname: truckProfile.nickname, unitNumber: truckProfile.powerUnitId }
      : undefined,
    trailer: trailer
      ? { id: trailer.id, unitNumber: trailer.number, type: trailer.type }
      : undefined,
    origin: {
      city: load.originCity,
      state: load.originState,
      appointment: load.pickupDate,
    },
    destination: {
      city: load.destinationCity,
      state: load.destinationState,
      appointment: load.deliveryDate,
    },
    commodity: load.commodity,
    weight: load.weight,
    equipmentType: load.equipmentType,
    referenceNumbers: refs,
    handlingInstructions: load.customerNotes,
    documentRequirements: ['BOL at pickup', 'POD at delivery', 'Receipts for approved accessorials'],
    dispatcherContact: dispatcherName
      ? { name: dispatcherName, phone: dispatcherPhone, email: dispatcherEmail }
      : undefined,
    trackingRequirement: 'manual_check_in',
    generatedAt: new Date().toISOString(),
  };
}
