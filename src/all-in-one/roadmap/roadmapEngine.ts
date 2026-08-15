import type { IntakeAnswers, YesNoUnsure } from '../intake/intakeTypes';
import type { CrossSellRecommendation, RoadmapItem, RoadmapResult } from './roadmapTypes';
import { ACRONYM_GLOSSARY } from './roadmapTypes';

function assetStatus(answers: IntakeAnswers, key: string): YesNoUnsure | undefined {
  return answers.assets[key] as YesNoUnsure | undefined;
}

function mapAssetToRoadmapStatus(status: YesNoUnsure | undefined): RoadmapItem['status'] {
  if (status === 'yes') return 'completed';
  if (status === 'in_progress') return 'in_progress';
  if (status === 'not_sure') return 'needs_review';
  if (status === 'no') return 'recommended';
  return 'recommended';
}

function isInterstate(answers: IntakeAnswers): boolean {
  const crosses = answers.operating.crossesStateLines;
  const crossesBool =
    crosses === true || crosses === ('true' as unknown as boolean) || String(crosses) === 'true';
  return answers.operating.scope === 'interstate' || crossesBool;
}

function isStartup(answers: IntakeAnswers): boolean {
  return (
    answers.journey === 'just_starting' ||
    answers.journey === 'business_formed' ||
    answers.business.structure === 'not_formed'
  );
}

function isOperating(answers: IntakeAnswers): boolean {
  return answers.journey === 'already_operating' || answers.journey === 'growing_fleet';
}

function item(
  partial: Omit<RoadmapItem, 'serviceAvailable'> & { serviceAvailable?: boolean },
): RoadmapItem {
  return { serviceAvailable: true, ...partial };
}

export function generateRoadmap(answers: IntakeAnswers): RoadmapResult {
  if (answers.goal === 'move_freight') {
    return generateShipperRoadmap(answers);
  }

  const items: RoadmapItem[] = [];

  // Business foundation
  const bizStatus = assetStatus(answers, 'registered_business');
  const structure = answers.business.structure;
  if (structure === 'not_formed' || isStartup(answers)) {
    items.push(
      item({
        id: 'business_formation',
        category: 'business',
        title: 'Business Formation',
        description: 'Assistance forming your trucking business entity.',
        status: bizStatus === 'yes' ? 'completed' : mapAssetToRoadmapStatus(bizStatus),
        priority: 'high',
        reason:
          structure === 'not_formed'
            ? 'You indicated your business is not yet formed — formation may be a helpful first step.'
            : 'Based on your journey stage, business formation assistance may be recommended.',
        serviceSlug: 'llc-formation-assistance',
        requiredForProgress: true,
        source: 'intake',
      }),
    );
  } else if (bizStatus === 'yes') {
    items.push(
      item({
        id: 'business_formation',
        category: 'business',
        title: 'Business Formation',
        description: 'Your registered business appears to be in place.',
        status: 'completed',
        priority: 'low',
        reason: 'You indicated you already have a registered business.',
        serviceSlug: 'llc-formation-assistance',
        requiredForProgress: true,
        source: 'intake',
      }),
    );
  }

  const einStatus = assetStatus(answers, 'ein');
  items.push(
    item({
      id: 'ein',
      category: 'business',
      title: 'EIN',
      description: 'Employer Identification Number guidance and assistance.',
      status: mapAssetToRoadmapStatus(einStatus),
      priority: einStatus === 'yes' ? 'low' : 'high',
      reason:
        einStatus === 'not_sure'
          ? 'You were not sure whether you have an EIN — this may need review.'
          : einStatus === 'yes'
            ? 'You indicated you already have an EIN.'
            : 'An EIN is commonly needed for business banking, filings, and registrations.',
      serviceSlug: 'ein-assistance',
      requiredForProgress: true,
      source: 'intake',
    }),
  );

  // Authority
  const usdotStatus = assetStatus(answers, 'usdot');
  items.push(
    item({
      id: 'usdot',
      category: 'authority',
      title: 'USDOT Number',
      description: 'USDOT registration guidance for commercial motor carriers.',
      acronym: 'USDOT',
      acronymExplanation: ACRONYM_GLOSSARY.USDOT,
      status: mapAssetToRoadmapStatus(usdotStatus),
      priority: 'high',
      reason:
        usdotStatus === 'not_sure'
          ? 'You indicated uncertainty about your USDOT number — this may need review.'
          : usdotStatus === 'yes'
            ? 'You indicated you already have a USDOT number.'
            : 'A USDOT number is commonly part of getting a carrier operational.',
      serviceSlug: 'operating-authority-assistance',
      requiredForProgress: true,
      source: 'intake',
    }),
  );

  const authorityStatus = assetStatus(answers, 'operating_authority');
  const needsAuthority =
    answers.goal === 'start_business' ||
    answers.goal === 'get_legal' ||
    answers.painPoints?.includes('authority') ||
    isInterstate(answers);

  if (needsAuthority) {
    items.push(
      item({
        id: 'operating_authority',
        category: 'authority',
        title: 'Operating Authority / MC',
        description: 'Guidance on motor carrier operating authority requirements.',
        acronym: 'MC',
        acronymExplanation: ACRONYM_GLOSSARY.MC,
        status: mapAssetToRoadmapStatus(authorityStatus),
        priority: 'high',
        reason:
          authorityStatus === 'not_sure'
            ? 'You indicated uncertainty about operating authority — this may need review.'
            : authorityStatus === 'yes'
              ? 'You indicated you already have operating authority.'
              : 'Based on your interstate operating profile, operating authority may be relevant.',
        serviceSlug: 'operating-authority-assistance',
        requiredForProgress: true,
        source: 'rule',
      }),
    );
  }

  const boc3Status = assetStatus(answers, 'boc3');
  if (needsAuthority || authorityStatus === 'in_progress' || authorityStatus === 'yes') {
    items.push(
      item({
        id: 'boc3',
        category: 'authority',
        title: 'BOC-3',
        description: 'Process agent designation filing assistance.',
        acronym: 'BOC-3',
        acronymExplanation: ACRONYM_GLOSSARY['BOC-3'],
        status: mapAssetToRoadmapStatus(boc3Status),
        priority: 'medium',
        reason:
          boc3Status === 'not_sure'
            ? "You indicated you're pursuing operating authority and are not sure whether a BOC-3 filing has been completed."
            : boc3Status === 'yes'
              ? 'You indicated BOC-3 is already in place.'
              : 'BOC-3 is commonly associated with operating authority setup.',
        serviceSlug: 'boc-3-assistance',
        requiredForProgress: true,
        source: 'rule',
      }),
    );
  }

  // Registration & tax
  if (isInterstate(answers) || answers.operating.scope === 'not_sure') {
    const irpStatus = assetStatus(answers, 'irp');
    items.push(
      item({
        id: 'irp',
        category: 'registration',
        title: 'IRP / Apportioned Registration',
        description: 'Apportioned registration guidance for qualifying interstate carriers.',
        acronym: 'IRP',
        acronymExplanation: ACRONYM_GLOSSARY.IRP,
        status: mapAssetToRoadmapStatus(irpStatus),
        priority: 'medium',
        reason:
          irpStatus === 'not_sure'
            ? 'You were not sure about IRP registration — this may need review for interstate operations.'
            : 'Interstate commercial operations may involve apportioned registration.',
        serviceSlug: 'irp-apportioned-registration',
        requiredForProgress: true,
        source: 'rule',
      }),
    );

    const iftaStatus = assetStatus(answers, 'ifta');
    items.push(
      item({
        id: 'ifta',
        category: 'tax',
        title: 'IFTA',
        description: 'Fuel tax reporting account guidance.',
        acronym: 'IFTA',
        acronymExplanation: ACRONYM_GLOSSARY.IFTA,
        status: mapAssetToRoadmapStatus(iftaStatus),
        priority: 'medium',
        reason:
          iftaStatus === 'not_sure'
            ? 'You were not sure about IFTA — this may need review for interstate fuel tax reporting.'
            : 'Interstate carriers may need fuel tax reporting arrangements.',
        serviceSlug: 'ifta-fuel-tax-assistance',
        requiredForProgress: true,
        source: 'rule',
      }),
    );
  }

  const permitsStatus = assetStatus(answers, 'state_permits');
  items.push(
    item({
      id: 'permits',
      category: 'registration',
      title: 'Permits & Trip Permits',
      description: 'State permit and temporary permit guidance.',
      status: mapAssetToRoadmapStatus(permitsStatus),
      priority: 'medium',
      reason: 'Permit requirements vary by state and operation type.',
      serviceSlug: 'trip-permits',
      requiredForProgress: true,
      source: 'intake',
    }),
  );

  const roadTaxStatus = assetStatus(answers, 'road_taxes');
  items.push(
    item({
      id: 'road_taxes',
      category: 'tax',
      title: 'Road / Highway Tax Accounts',
      description: 'Review of road tax and highway use accounts that may apply.',
      status: mapAssetToRoadmapStatus(roadTaxStatus),
      priority: 'low',
      reason: 'Road tax accounts may apply depending on where you operate.',
      serviceSlug: 'road-tax-assistance',
      requiredForProgress: false,
      source: 'intake',
    }),
  );

  // Insurance
  const insuranceStatus = assetStatus(answers, 'commercial_insurance');
  items.push(
    item({
      id: 'insurance',
      category: 'insurance',
      title: 'Commercial Insurance',
      description: 'Commercial transportation insurance review and quote assistance.',
      status:
        insuranceStatus === 'yes'
          ? 'completed'
          : answers.goal === 'insurance'
            ? 'recommended'
            : mapAssetToRoadmapStatus(insuranceStatus),
      priority: 'high',
      reason:
        insuranceStatus === 'yes'
          ? 'You indicated you already have commercial insurance.'
          : insuranceStatus === 'not_sure'
            ? 'You were not sure about commercial insurance — a review may be helpful before operating.'
            : 'Commercial insurance is commonly reviewed before operating.',
      serviceSlug: 'commercial-auto-liability',
      requiredForProgress: true,
      source: 'intake',
    }),
  );

  // Compliance
  if (answers.goal === 'compliance' || isOperating(answers)) {
    items.push(
      item({
        id: 'compliance_support',
        category: 'compliance',
        title: 'Compliance Support',
        description: 'Renewals, filings, and deadline management assistance.',
        status: answers.goal === 'compliance' ? 'recommended' : 'optional',
        priority: 'medium',
        reason: 'You indicated interest in staying compliant with renewals and filings.',
        serviceSlug: 'compliance-support',
        requiredForProgress: false,
        source: 'goal',
      }),
    );
  }

  // Operations — optional
  const dispatchStatus = assetStatus(answers, 'dispatch');
  const wantsDispatch =
    answers.goal === 'dispatch' ||
    answers.painPoints?.includes('dispatching') ||
    answers.painPoints?.includes('finding_loads');

  if (wantsDispatch || dispatchStatus === 'yes' || dispatchStatus === 'in_progress') {
    items.push(
      item({
        id: 'dispatch',
        category: 'operations',
        title: 'Dispatching',
        description: 'Carrier dispatch and load coordination support.',
        status:
          dispatchStatus === 'yes'
            ? 'completed'
            : wantsDispatch
              ? 'optional'
              : mapAssetToRoadmapStatus(dispatchStatus),
        priority: 'low',
        reason:
          dispatchStatus === 'yes'
            ? 'You indicated you already use dispatch services.'
            : 'Dispatch support is optional and based on your operational goals.',
        serviceSlug: 'carrier-dispatch-support',
        requiredForProgress: false,
        source: 'intake',
      }),
    );
  }

  // Factoring — optional, never affects compliance progress
  const factoringAsset = assetStatus(answers, 'factoring');
  const wantsFactoring =
    answers.goal === 'factoring' ||
    answers.painPoints?.includes('factoring') ||
    answers.factoring?.unpaidInvoices === true ||
    answers.factoring?.unpaidInvoices === ('true' as unknown as boolean);

  if (wantsFactoring || factoringAsset === 'yes' || factoringAsset === 'in_progress') {
    items.push(
      item({
        id: 'factoring',
        category: 'factoring',
        title: 'Factoring Consultation',
        description: 'Preliminary review of invoice factoring options — not an approval or funding determination.',
        status:
          factoringAsset === 'yes'
            ? 'completed'
            : wantsFactoring
              ? 'recommended'
              : 'optional',
        priority: 'low',
        reason:
          factoringAsset === 'yes'
            ? 'You indicated you already use factoring.'
            : 'Based on your interest in getting paid faster, a factoring consultation may be helpful.',
        serviceSlug: 'factoring-consultation',
        requiredForProgress: false,
        source: 'goal',
      }),
    );
  }

  const complianceItems = items.filter((i) => i.requiredForProgress);
  const completedCompliance = complianceItems.filter((i) => i.status === 'completed').length;
  const complianceProgress =
    complianceItems.length > 0 ? Math.round((completedCompliance / complianceItems.length) * 100) : 0;

  const serviceItems = items.filter((i) => !i.requiredForProgress);
  const completedServices = serviceItems.filter((i) => i.status === 'completed').length;
  const businessServicesProgress =
    serviceItems.length > 0 ? Math.round((completedServices / serviceItems.length) * 100) : 0;

  const crossSell = buildCrossSell(answers, items);

  return {
    items,
    complianceProgress,
    businessServicesProgress,
    generatedAt: new Date().toISOString(),
    summary: 'Based on the information you provided, here\'s your preliminary path forward.',
    crossSellRecommendations: crossSell,
  };
}

function generateShipperRoadmap(answers: IntakeAnswers): RoadmapResult {
  const items: RoadmapItem[] = [
    item({
      id: 'freight_quote',
      category: 'brokerage',
      title: 'Freight Quote Request',
      description: 'Preliminary quote for your shipment — subject to review.',
      status: 'recommended',
      priority: 'high',
      reason: `Quote request from ${answers.shipper?.origin ?? 'origin'} to ${answers.shipper?.destination ?? 'destination'}.`,
      serviceSlug: 'freight-quote',
      requiredForProgress: true,
      source: 'intake',
    }),
    item({
      id: 'shipment_coordination',
      category: 'brokerage',
      title: 'Shipment Coordination',
      description: 'Coordination support once your quote is reviewed.',
      status: answers.shipper?.recurring === 'recurring' ? 'recommended' : 'optional',
      priority: 'medium',
      reason:
        answers.shipper?.recurring === 'recurring'
          ? 'You indicated recurring freight — ongoing coordination may be helpful.'
          : 'Optional coordination support for one-time shipments.',
      serviceSlug: 'shipment-coordination',
      requiredForProgress: false,
      source: 'intake',
    }),
  ];

  return {
    items,
    complianceProgress: 0,
    businessServicesProgress: 0,
    generatedAt: new Date().toISOString(),
    summary: 'Based on your freight details, here\'s your preliminary brokerage path.',
    crossSellRecommendations: [],
  };
}

function buildCrossSell(answers: IntakeAnswers, items: RoadmapItem[]): CrossSellRecommendation[] {
  const recs: CrossSellRecommendation[] = [];

  const insurance = items.find((i) => i.id === 'insurance');
  const authority = items.find((i) => i.id === 'operating_authority');
  const factoring = items.find((i) => i.id === 'factoring');

  if (authority?.status === 'completed' && insurance && insurance.status !== 'completed') {
    recs.push({
      id: 'cross_insurance',
      title: 'Insurance Review',
      message: 'You may also want to review commercial insurance before operating.',
      serviceSlug: 'commercial-auto-liability',
    });
  }

  if (
    answers.painPoints?.includes('dispatching') &&
    factoring?.status !== 'completed' &&
    answers.goal !== 'factoring'
  ) {
    recs.push({
      id: 'cross_factoring',
      title: 'Factoring Consultation',
      message: 'Interested in getting eligible invoices paid faster? Explore factoring.',
      serviceSlug: 'factoring-consultation',
    });
  }

  if (isStartup(answers) && authority?.status === 'recommended') {
    recs.push({
      id: 'cross_authority',
      title: 'Authority & Registration',
      message: 'Continue your setup with authority and registration assistance.',
      serviceSlug: 'operating-authority-assistance',
    });
  }

  return recs.slice(0, 3);
}
