export type IntakeGoal =
  | 'start_business'
  | 'get_legal'
  | 'compliance'
  | 'insurance'
  | 'dispatch'
  | 'factoring'
  | 'move_freight';

export type BusinessJourney =
  | 'just_starting'
  | 'business_formed'
  | 'getting_road_ready'
  | 'already_operating'
  | 'growing_fleet';

export type BusinessStructure = 'not_formed' | 'sole_proprietor' | 'llc' | 'corporation' | 'other';

export type OperationType = 'owner_operator' | 'carrier' | 'fleet' | 'shipper' | 'other';

export type YesNoUnsure = 'yes' | 'no' | 'in_progress' | 'not_sure';

export type IntakeQuestionType =
  | 'single_select'
  | 'multi_select'
  | 'text'
  | 'number'
  | 'select'
  | 'date'
  | 'textarea'
  | 'checklist';

export interface IntakeOption {
  value: string;
  label: string;
  description?: string;
}

export interface IntakeQuestion {
  id: string;
  section: string;
  question: string;
  description?: string;
  type: IntakeQuestionType;
  options?: IntakeOption[];
  required?: boolean;
  /** Dot-path into intake answers, e.g. business.name */
  field: string;
  condition?: (answers: IntakeAnswers) => boolean;
  roadmapImpact?: string[];
  serviceTags?: string[];
}

export interface IntakeSection {
  id: string;
  title: string;
  description?: string;
  questions: IntakeQuestion[];
  condition?: (answers: IntakeAnswers) => boolean;
}

export interface IntakeAnswers {
  goal?: IntakeGoal;
  journey?: BusinessJourney;
  business: {
    name?: string;
    structure?: BusinessStructure;
    formationState?: string;
    operatingState?: string;
    trucks?: number;
    trailers?: number;
    drivers?: number;
    operationType?: OperationType;
  };
  operating: {
    scope?: 'intrastate' | 'interstate' | 'not_sure';
    equipment?: string[];
    freightTypes?: string[];
    crossesStateLines?: boolean;
    currentlyOperating?: boolean;
    heavyVehicles?: boolean;
  };
  assets: Record<string, YesNoUnsure>;
  painPoints?: string[];
  factoring?: {
    operating?: boolean;
    unpaidInvoices?: boolean;
    payer?: 'broker' | 'shipper' | 'combination' | 'not_sure';
    usingOtherFactor?: 'yes' | 'no' | 'not_sure';
    monthlyVolume?: string;
  };
  insurance?: {
    coverageTypes?: string[];
    powerUnits?: number;
  };
  shipper?: {
    companyName?: string;
    contactName?: string;
    origin?: string;
    destination?: string;
    equipmentType?: string;
    commodity?: string;
    weight?: string;
    pickupDate?: string;
    deliveryDate?: string;
    recurring?: 'one_time' | 'recurring';
    notes?: string;
  };
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export const defaultIntakeAnswers = (): IntakeAnswers => ({
  business: {},
  operating: { equipment: [], freightTypes: [] },
  assets: {},
  painPoints: [],
});

export const GOAL_QUERY_MAP: Record<string, IntakeGoal> = {
  'start-business': 'start_business',
  'get-legal': 'get_legal',
  compliance: 'compliance',
  insurance: 'insurance',
  dispatch: 'dispatch',
  factoring: 'factoring',
  'move-freight': 'move_freight',
};

export const GOAL_LABELS: Record<IntakeGoal, { title: string; description: string }> = {
  start_business: {
    title: 'START MY TRUCKING BUSINESS',
    description: "I'm starting from the beginning and need help getting set up.",
  },
  get_legal: {
    title: 'GET MY TRUCK LEGAL',
    description:
      'I already have a business and need help with registrations, permits, authorities, taxes or related requirements.',
  },
  compliance: {
    title: 'KEEP MY BUSINESS COMPLIANT',
    description: "I'm already operating and need help managing filings, renewals and deadlines.",
  },
  insurance: {
    title: 'GET TRUCKING INSURANCE',
    description: 'I need help exploring commercial transportation coverage.',
  },
  dispatch: {
    title: 'FIND LOADS & RUN MY TRUCK',
    description: "I'm interested in dispatch support.",
  },
  factoring: {
    title: 'GET PAID FASTER',
    description: "I'm interested in factoring eligible freight invoices.",
  },
  move_freight: {
    title: 'MOVE FREIGHT',
    description: "I'm a shipper/business looking for freight brokerage services.",
  },
};
