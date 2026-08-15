import { DEFAULT_NOTIFICATION_PREFERENCES } from '../notifications/notificationTypes';
import type { VaultDocument } from '../vault/vaultTypes';
import type { RenewalRecord } from '../renewals/renewalTypes';
import type { AioNotification } from '../notifications/notificationTypes';
import type { Deadline } from './demoTypes';
import { daysAgo, daysAhead, isoNow } from './dateHelpers';
import { buildRenewalFromDocument } from '../renewals/renewalService';

function doc(partial: Partial<VaultDocument> & Pick<VaultDocument, 'id' | 'organizationId' | 'category' | 'documentType' | 'title' | 'status'>): VaultDocument {
  return {
    verificationStatus: 'unverified',
    visibility: 'customer',
    isCurrent: true,
    createdAt: isoNow(),
    updatedAt: isoNow(),
    ...partial,
  };
}

export function createVaultSeedData(): {
  documents: VaultDocument[];
  renewals: RenewalRecord[];
  deadlines: Deadline[];
  notifications: AioNotification[];
} {
  const documents: VaultDocument[] = [
    // CLIENT A — missing documents
    doc({
      id: 'vdoc-a1',
      organizationId: 'client-a',
      category: 'insurance',
      documentType: 'Certificate of Insurance',
      title: 'Insurance Certificate',
      status: 'requested',
      verificationStatus: 'unverified',
      serviceRequestId: 'req-1',
      roadReadyItemId: undefined,
      requestedAt: daysAgo(2),
      clientId: 'client-a',
      name: 'Insurance Certificate',
    }),
    doc({
      id: 'vdoc-a2',
      organizationId: 'client-a',
      category: 'business',
      documentType: 'Formation Document',
      title: 'Business Formation Documents',
      status: 'requested',
      verificationStatus: 'unverified',
      serviceRequestId: 'req-1',
      requestedAt: daysAgo(2),
      clientId: 'client-a',
      name: 'Business Formation Documents',
    }),

    // CLIENT B — insurance expiring in 21 days, verified current
    doc({
      id: 'vdoc-b1',
      organizationId: 'client-b',
      category: 'insurance',
      documentType: 'Certificate of Insurance',
      title: 'Commercial Insurance Certificate 2026',
      status: 'verified',
      verificationStatus: 'verified',
      expiresAt: daysAhead(21),
      verifiedAt: daysAgo(60),
      verifiedByStaffId: 'staff-5',
      uploadedAt: daysAgo(65),
      serviceRequestId: 'req-2',
      clientId: 'client-b',
      name: 'Commercial Insurance Certificate 2026',
    }),
    doc({
      id: 'vdoc-b2',
      organizationId: 'client-b',
      category: 'registration',
      documentType: 'IRP Cab Card',
      title: 'IRP Cab Card',
      status: 'under_review',
      verificationStatus: 'pending_review',
      uploadedAt: daysAgo(1),
      clientId: 'client-b',
      name: 'Vehicle Registration',
    }),

    // CLIENT C — fleet, truck 02 IRP 30 days, truck 03 registration expired
    doc({
      id: 'vdoc-c1',
      organizationId: 'client-c',
      category: 'registration',
      documentType: 'IRP Cab Card',
      title: 'IRP — Truck 02',
      status: 'verified',
      verificationStatus: 'verified',
      expiresAt: daysAhead(30),
      relatedEntityType: 'vehicle',
      relatedEntityId: 'unit-c2',
      relatedVehicle: 'unit-c2',
      verifiedAt: daysAgo(300),
      verifiedByStaffId: 'staff-3',
      clientId: 'client-c',
      name: 'IRP — Truck 02',
    }),
    doc({
      id: 'vdoc-c2',
      organizationId: 'client-c',
      category: 'registration',
      documentType: 'Vehicle Registration',
      title: 'Registration — Truck 03',
      status: 'expired',
      verificationStatus: 'verified',
      expiresAt: daysAhead(-5),
      relatedEntityType: 'vehicle',
      relatedEntityId: 'unit-c3',
      relatedVehicle: 'unit-c3',
      isCurrent: true,
      clientId: 'client-c',
      name: 'Registration — Truck 03',
    }),
    doc({
      id: 'vdoc-c3',
      organizationId: 'client-c',
      category: 'dispatch',
      documentType: 'Rate Confirmation',
      title: 'Rate Confirmation LD-1001',
      status: 'verified',
      verificationStatus: 'verified',
      loadId: 'load-1',
      clientId: 'client-c',
      name: 'Rate Confirmation',
    }),

    // CLIENT D — completed renewal with superseded doc
    doc({
      id: 'vdoc-d-old',
      organizationId: 'client-d',
      category: 'insurance',
      documentType: 'Certificate of Insurance',
      title: 'Insurance Policy 2025',
      status: 'archived',
      verificationStatus: 'verified',
      expiresAt: daysAhead(-30),
      isCurrent: false,
      supersededByDocumentId: 'vdoc-d-new',
      verifiedAt: daysAgo(400),
      clientId: 'client-d',
      name: 'Insurance Policy 2025',
    }),
    doc({
      id: 'vdoc-d-new',
      organizationId: 'client-d',
      category: 'insurance',
      documentType: 'Certificate of Insurance',
      title: 'Insurance Policy 2026',
      status: 'verified',
      verificationStatus: 'verified',
      expiresAt: daysAhead(180),
      isCurrent: true,
      supersedesDocumentId: 'vdoc-d-old',
      verifiedAt: daysAgo(10),
      verifiedByStaffId: 'staff-5',
      uploadedAt: daysAgo(12),
      clientId: 'client-d',
      name: 'Insurance Policy 2026',
    }),

    // CLIENT E — overdue permit
    doc({
      id: 'vdoc-e1',
      organizationId: 'client-e',
      category: 'permits',
      documentType: 'State Permit',
      title: 'Temporary Operating Permit',
      status: 'expired',
      verificationStatus: 'verified',
      expiresAt: daysAhead(-5),
      clientId: 'client-e',
      name: 'Temporary Operating Permit',
    }),
    doc({
      id: 'vdoc-e-rejected',
      organizationId: 'client-b',
      category: 'registration',
      documentType: 'Vehicle Registration',
      title: 'Registration — Wrong Upload',
      status: 'rejected',
      verificationStatus: 'rejected',
      rejectionReason: 'wrong_document',
      rejectionMessage: 'This does not appear to be the registration document we requested.',
      uploadedAt: daysAgo(3),
      isCurrent: false,
      clientId: 'client-b',
      name: 'Registration — Wrong Upload',
    }),
  ];

  const renewals: RenewalRecord[] = [];
  for (const d of documents) {
    const r = buildRenewalFromDocument(d);
    if (r) renewals.push(r);
  }
  const renD: RenewalRecord = {
    id: 'ren-d-completed',
    organizationId: 'client-d',
    renewalType: 'insurance',
    title: 'Insurance Renewal 2026',
    category: 'insurance',
    deadlineType: 'insurance_renewal',
    expirationDate: daysAhead(180),
    status: 'completed',
    currentDocumentId: 'vdoc-d-new',
    completedAt: daysAgo(10),
    createdAt: daysAgo(90),
    updatedAt: daysAgo(10),
  };
  renewals.push(renD);

  const deadlines: Deadline[] = [
    { id: 'dl-v-b-ins', label: 'Insurance expiration — Heartland Freight', clientId: 'client-b', organizationId: 'client-b', documentId: 'vdoc-b1', dueDate: daysAhead(21), severity: 'due_soon', category: 'insurance', complete: false, source: 'verified_document', deadlineType: 'insurance_renewal', deadlineVerification: 'staff_verified' },
    { id: 'dl-v-c-irp', label: 'IRP renewal — Truck 02', clientId: 'client-c', organizationId: 'client-c', documentId: 'vdoc-c1', vehicleId: 'unit-c2', dueDate: daysAhead(30), severity: 'upcoming', category: 'registration', complete: false, source: 'verified_document', deadlineType: 'registration_renewal' },
    { id: 'dl-v-c-reg', label: 'Registration expired — Truck 03', clientId: 'client-c', organizationId: 'client-c', documentId: 'vdoc-c2', vehicleId: 'unit-c3', dueDate: daysAhead(-5), severity: 'overdue', category: 'registration', complete: false, source: 'verified_document', deadlineType: 'registration_renewal' },
    { id: 'dl-v-e-per', label: 'Permit expired — NorthStar', clientId: 'client-e', organizationId: 'client-e', documentId: 'vdoc-e1', dueDate: daysAhead(-5), severity: 'overdue', category: 'permits', complete: false, source: 'verified_document', deadlineType: 'permit_expiration' },
  ];

  const notifications: AioNotification[] = [
    {
      id: 'notif-b-ins-30',
      organizationId: 'client-b',
      recipientType: 'customer',
      eventType: 'DOCUMENT_EXPIRING',
      category: 'documents',
      title: 'Insurance expires in 21 days',
      body: 'Review your upcoming insurance expiration and decide how you would like to handle the renewal.',
      read: false,
      dedupeKey: 'doc-expiring-21d:vdoc-b1',
      entityType: 'document',
      entityId: 'vdoc-b1',
      link: '/all-in-one/portal/vault/vdoc-b1',
      createdAt: daysAgo(0),
    },
    {
      id: 'notif-a-doc-req',
      organizationId: 'client-a',
      recipientType: 'customer',
      eventType: 'DOCUMENT_REQUESTED',
      category: 'documents',
      title: 'Document needed — Insurance Certificate',
      body: 'All In One requested an updated insurance certificate for your authority filing.',
      read: false,
      entityType: 'document',
      entityId: 'vdoc-a1',
      link: '/all-in-one/portal/vault',
      createdAt: daysAgo(2),
    },
    {
      id: 'notif-staff-upload',
      recipientType: 'staff',
      staffId: 'staff-5',
      eventType: 'DOCUMENT_UPLOADED',
      category: 'documents',
      title: 'New document uploaded — Heartland Freight',
      body: 'IRP Cab Card uploaded and awaiting review.',
      read: false,
      entityType: 'document',
      entityId: 'vdoc-b2',
      link: '/all-in-one/office/documents',
      createdAt: daysAgo(1),
    },
  ];

  return { documents, renewals, deadlines, notifications };
}

export function defaultNotificationPreferences() {
  return DEFAULT_NOTIFICATION_PREFERENCES.map((p) => ({ ...p }));
}
