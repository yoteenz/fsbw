import type { Load } from '../../dispatch/dispatchTypes';
import type { DispatchPackage } from '../autopilot/dispatchPackage';

export type FreightTemplateKind =
  | 'dispatch_sheet'
  | 'driver_instructions'
  | 'carrier_instructions'
  | 'invoice'
  | 'settlement_statement'
  | 'document_request'
  | 'factoring_checklist'
  | 'load_closeout'
  | 'carrier_packet';

export interface FreightDocumentTemplate {
  kind: FreightTemplateKind;
  title: string;
  populate: (ctx: FreightTemplateContext) => string;
}

export interface FreightTemplateContext {
  load: Load;
  dispatchPackage?: DispatchPackage;
  invoiceNumber?: string;
  settlementTotal?: string;
}

export const FREIGHT_DOCUMENT_TEMPLATES: FreightDocumentTemplate[] = [
  {
    kind: 'dispatch_sheet',
    title: 'Dispatch Sheet',
    populate: ({ load, dispatchPackage }) =>
      [
        `AIO DISPATCH SHEET`,
        `Load: ${load.loadNumber}`,
        `Origin: ${load.originCity}, ${load.originState}`,
        `Destination: ${load.destinationCity}, ${load.destinationState}`,
        `Pickup: ${load.pickupDate}`,
        `Delivery: ${load.deliveryDate}`,
        `Equipment: ${load.equipmentType}`,
        dispatchPackage?.driver ? `Driver: ${dispatchPackage.driver.name}` : '',
        dispatchPackage?.truck ? `Truck: ${dispatchPackage.truck.nickname}` : '',
        `Documents required: BOL, POD`,
      ]
        .filter(Boolean)
        .join('\n'),
  },
  {
    kind: 'factoring_checklist',
    title: 'Factoring Package Checklist',
    populate: ({ load, invoiceNumber }) =>
      [
        `FACTORING PACKAGE — ${load.loadNumber}`,
        `[ ] Rate Confirmation`,
        `[ ] BOL`,
        `[ ] POD`,
        `[ ] Invoice ${invoiceNumber ?? '(pending)'}`,
        `[ ] Lumper receipts (if applicable)`,
      ].join('\n'),
  },
  {
    kind: 'settlement_statement',
    title: 'Driver Settlement Statement',
    populate: ({ load, settlementTotal }) =>
      [
        `DRIVER SETTLEMENT`,
        `Load: ${load.loadNumber}`,
        `Loaded miles: ${load.loadedMiles}`,
        `Empty miles: ${load.deadheadMiles}`,
        `Total: ${settlementTotal ?? 'TBD'}`,
      ].join('\n'),
  },
];

export function renderFreightTemplate(kind: FreightTemplateKind, ctx: FreightTemplateContext): string | undefined {
  return FREIGHT_DOCUMENT_TEMPLATES.find((t) => t.kind === kind)?.populate(ctx);
}
