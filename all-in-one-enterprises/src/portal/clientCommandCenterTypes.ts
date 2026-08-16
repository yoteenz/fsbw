export type PortalKind = 'carrier' | 'shipper';

export type PortalMemberRole = 'owner' | 'admin' | 'operations' | 'driver' | 'accounting' | 'viewer';

export type ActionPriority = 'urgent' | 'high' | 'normal' | 'low';

export type AttentionCategory =
  | 'road_ready'
  | 'documents'
  | 'renewals'
  | 'insurance'
  | 'dispatch'
  | 'factoring'
  | 'billing'
  | 'messages'
  | 'brokerage'
  | 'services';

export type BusinessStatusTone = 'good' | 'attention' | 'review';

export interface PortalContext {
  organizationId: string;
  portalKind: PortalKind;
  clientType: string;
  companyName: string;
  contactName?: string;
  memberRole: PortalMemberRole;
  isShipper: boolean;
  canViewBilling: boolean;
  canViewFullMoney: boolean;
}

export interface ClientNextAction {
  priority: ActionPriority;
  title: string;
  description: string;
  category: AttentionCategory;
  entityType?: string;
  entityId?: string;
  ctaLabel: string;
  ctaHref: string;
  reason: string;
  dedupeKey: string;
}

export interface ClientAttentionItem {
  id: string;
  dedupeKey: string;
  category: AttentionCategory;
  priority: ActionPriority;
  title: string;
  explanation: string;
  statusLabel: string;
  deadline?: string;
  deadlineLabel?: string;
  ctaLabel: string;
  ctaHref: string;
  affectedAreas: string[];
  entityType?: string;
  entityId?: string;
}

export interface RoadReadySummaryView {
  setupProgress: number;
  verifiedProgress: number;
  attentionCount: number;
  nextActionTitle?: string;
  ctaHref: string;
}

export interface FleetSummaryView {
  activePowerUnits: number;
  trailers: number;
  drivers: number;
  unitsNeedingAttention: number;
  availableTrucks: number;
  inTransit: number;
  vehicles: FleetVehicleCardView[];
}

export interface FleetVehicleCardView {
  id: string;
  label: string;
  subtitle?: string;
  roadReadyTone: 'complete' | 'progress' | 'needed' | 'alert';
  roadReadyLabel: string;
  dispatchLabel?: string;
  insuranceLabel?: string;
  registrationLabel?: string;
  href: string;
}

export interface OperationsSummaryView {
  hasDispatch: boolean;
  activeLoadCount: number;
  loadsNeedingAttention: number;
  currentLoad?: CurrentLoadHeroView;
  recentDeliveries: number;
  documentsNeeded: number;
  factoringHandoffReady: number;
}

export interface CurrentLoadHeroView {
  id: string;
  origin: string;
  destination: string;
  statusLabel: string;
  deliveryLabel: string;
  nextActionLabel: string;
  bolComplete: boolean;
  podComplete: boolean;
  href: string;
}

export interface MoneySummaryView {
  aioBalanceDueMinor?: number;
  freightReceivablesInProcessMinor?: number;
  brokeragePayablesMinor?: number;
  factoringInProcessMinor?: number;
  showAioBilling: boolean;
  showFreightReceivables: boolean;
  showBrokeragePayables: boolean;
  showFactoring: boolean;
}

export interface DocumentSummaryView {
  needed: number;
  underReview: number;
  verified: number;
  expiring: number;
  recentCount: number;
  requestedItems: DocumentRequestedItemView[];
}

export interface DocumentRequestedItemView {
  id: string;
  title: string;
  neededFor: string[];
  href: string;
}

export interface CommunicationSummaryView {
  unreadMessages: number;
  unreadNotifications: number;
  urgentNotifications: number;
  documentRequests: number;
  recentThreads: { id: string; title: string; context: string; href: string }[];
}

export interface UpcomingItemView {
  id: string;
  title: string;
  dueDate: string;
  daysLabel: string;
  category: AttentionCategory;
  href: string;
}

export interface TodayItemView {
  id: string;
  title: string;
  timeLabel?: string;
  category: AttentionCategory;
  href: string;
}

export interface ActiveServiceView {
  id: string;
  name: string;
  statusLabel: string;
  tone: 'active' | 'progress' | 'available' | 'inactive';
  href?: string;
}

export interface BusinessHealthView {
  roadReady?: RoadReadySummaryView;
  documents: { verified: number; needsAttention: number };
  renewalsUpcoming: number;
  insuranceStatus?: string;
  fleet?: { active: number; needsAttention: number };
  billing?: { balanceDueMinor: number; openInvoices: number };
}

export interface ClientCommandCenterView {
  context: PortalContext;
  greeting: string;
  businessStatus: { tone: BusinessStatusTone; label: string; detail: string };
  nextAction?: ClientNextAction;
  attentionItems: ClientAttentionItem[];
  allCaughtUp: boolean;
  nextUpcoming?: UpcomingItemView;
  roadReady?: RoadReadySummaryView;
  businessHealth: BusinessHealthView;
  fleet?: FleetSummaryView;
  operations?: OperationsSummaryView;
  money?: MoneySummaryView;
  documents: DocumentSummaryView;
  communication: CommunicationSummaryView;
  today: TodayItemView[];
  upcoming: UpcomingItemView[];
  activeServices: ActiveServiceView[];
  activeRequestCount: number;
  notificationDigest: { unread: number; urgent: number; documentRequests: number };
  quickActions: QuickActionView[];
  activityPreview: { id: string; title: string; createdAt: string }[];
  moduleErrors: Partial<Record<string, string>>;
}

export interface QuickActionView {
  id: string;
  label: string;
  href: string;
}

export interface OrganizationMemberView {
  id: string;
  name: string;
  email: string;
  role: PortalMemberRole;
  roleLabel: string;
  status: 'active' | 'invited' | 'inactive';
  lastActivityAt?: string;
}
