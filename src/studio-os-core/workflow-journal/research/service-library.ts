import type { RequirementClass, ServiceCommercialState } from '../types';

export type CandidateWorkflow = {
  id: string;
  name: string;
  appliesWhen: string;
  requirementClass: RequirementClass;
  sourceIds: string[];
  expertQuestions: string[];
};

export type ServiceFamilyDraft = {
  id: string;
  name: string;
  aioCommercialState: ServiceCommercialState;
  aioNote: string;
  overview: string;
  workflows: CandidateWorkflow[];
  decisions: string[];
  documents: string[];
  exceptions: string[];
  jurisdictionNotes: string;
  interactivePilot: boolean;
};

export const SERVICE_LIBRARY: ServiceFamilyDraft[] = [
  {
    id: 'permitting-authorities',
    name: 'Permitting & Authorities',
    aioCommercialState: 'limited_pilot',
    aioNote: 'Launch matrix: permitting and authority services are LIMITED_PILOT. Standalone BOC-3 is BLOCKED until a process agent is verified. AIO is not FMCSA.',
    overview: 'Administrative help with USDOT registration, operating authority, and related filings. Each filing is its own workflow.',
    workflows: [
      { id: 'operating-authority-application', name: 'Operating authority application', appliesWhen: 'Interstate for-hire operation needs a docket number', requirementClass: 'legal_requirement', sourceIds: ['fmcsa-operating-authority', 'fmcsa-boc3', 'fmcsa-insurance'], expertQuestions: ['Do you start with eligibility, or with the paperwork already in hand?'] },
      { id: 'usdot-registration', name: 'USDOT registration', appliesWhen: 'A number is required and the company is not yet registered', requirementClass: 'legal_requirement', sourceIds: ['fmcsa-operating-authority'], expertQuestions: ['Which clients already have a USDOT number before they call?'] },
      { id: 'boc3-coordination', name: 'BOC-3 coordination', appliesWhen: 'A process agent must designate states', requirementClass: 'legal_requirement', sourceIds: ['fmcsa-boc3', 'aio-launch-matrix'], expertQuestions: ['Which process agent do you use, and what do you never file yourself?'] },
      { id: 'authority-reinstatement', name: 'Authority reinstatement', appliesWhen: 'Authority was revoked and the client asks to restore it', requirementClass: 'legal_requirement', sourceIds: ['fmcsa-operating-authority'], expertQuestions: ['The public page listed an $80 reinstatement fee on 20 April 2026. Do you quote that, or re-check every time?'] },
    ],
    decisions: ['Needs authority or not', 'First registration or additional authority', 'Which docket types'],
    documents: ['Business identity', 'Insurer filing receipt', 'BOC-3 copy kept at the principal place of business'],
    exceptions: ['Missing insurance proof can dismiss the application', 'Missing BOC-3 leaves authority incomplete', 'Fee windows conflict between OP-1 text and the insurance-page excerpt'],
    jurisdictionNotes: 'Interstate federal rules. State permits are separate workflows.',
    interactivePilot: true,
  },
  {
    id: 'filing-fuel-taxes',
    name: 'Filing & Fuel Taxes',
    aioCommercialState: 'internal',
    aioNote: 'Fuel tax and road tax are INTERNAL_ONLY. Form 2290 is COMING_SOON. No fee or deadline is stated here.',
    overview: 'Distance and fuel records are gathered, then the base jurisdiction or IRS return is prepared by a person. IFTA, Inc. does not issue the license.',
    workflows: [
      { id: 'ifta-quarterly', name: 'IFTA return preparation', appliesWhen: 'A qualified carrier owes a base-jurisdiction fuel-tax return', requirementClass: 'legal_requirement', sourceIds: ['iftach-home'], expertQuestions: ['Do you begin with mileage and fuel records? Which base jurisdiction do you file?'] },
      { id: 'hvut-2290', name: 'Form 2290 assistance', appliesWhen: 'A heavy vehicle may be subject to HVUT', requirementClass: 'research_uncertainty', sourceIds: ['irs-2290'], expertQuestions: ['Which vehicles do you refuse to file until the IRS instructions for that period are re-read?'] },
    ],
    decisions: ['Base jurisdiction', 'Whether the vehicle is in scope'],
    documents: ['Distance records', 'Fuel receipts', 'Prior return'],
    exceptions: ['A jurisdiction exemption may remove a vehicle. Do not invent the exemption.'],
    jurisdictionNotes: 'IFTA credentials come from the base jurisdiction. Deadlines were not copied.',
    interactivePilot: false,
  },
  {
    id: 'compliance',
    name: 'Compliance',
    aioCommercialState: 'coming_soon',
    aioNote: 'DOT compliance, UCR, and MCS-150 are COMING_SOON. No guaranteed-compliance claim.',
    overview: 'Support for updates and safety programs the carrier must still perform. AIO does not certify compliance.',
    workflows: [
      { id: 'mcs150-update', name: 'MCS-150 update', appliesWhen: 'A biennial or requested update is due', requirementClass: 'legal_requirement', sourceIds: ['aio-launch-matrix'], expertQuestions: ['What do you compare against the last filed snapshot?'] },
      { id: 'ucr', name: 'UCR registration', appliesWhen: 'The operation is in scope for UCR', requirementClass: 'research_uncertainty', sourceIds: ['aio-launch-matrix'], expertQuestions: ['Which clients do you tell are outside UCR?'] },
    ],
    decisions: ['In scope or not', 'Update versus new filing'],
    documents: ['Current census data', 'Fleet count used for the filing'],
    exceptions: ['Applicability is not universal'],
    jurisdictionNotes: 'UCR and state programs vary. Do not hard-code one rule.',
    interactivePilot: false,
  },
  {
    id: 'vehicles-fleet',
    name: 'Vehicles & Fleet',
    aioCommercialState: 'hold',
    aioNote: 'Tag services are HOLD because rules are state-specific. ELD is COMING_SOON.',
    overview: 'Titles, plates, and cab devices are state or vendor workflows. They are not one national checklist.',
    workflows: [
      { id: 'plates-tags', name: 'Base-plate and tag support', appliesWhen: 'A vehicle needs credentials in a named state', requirementClass: 'research_uncertainty', sourceIds: ['aio-launch-matrix'], expertQuestions: ['Which states do you actually file today?'] },
      { id: 'eld-setup', name: 'ELD setup coordination', appliesWhen: 'A partner device is being installed', requirementClass: 'common_business_option', sourceIds: ['aio-launch-matrix'], expertQuestions: ['Which vendor do you use, and what do you never promise about the device?'] },
    ],
    decisions: ['Which state', 'Which vendor'],
    documents: ['Title', 'Lease', 'VIN'],
    exceptions: ['A state form can reject a lease name that does not match the title'],
    jurisdictionNotes: 'Do not publish one national plate process.',
    interactivePilot: false,
  },
  {
    id: 'dispatch',
    name: 'Dispatch',
    aioCommercialState: 'active',
    aioNote: 'Launch matrix marks dispatching GO, with a dispatch agreement before live operations. It is not broker authority.',
    overview: 'Dispatch under a carrier’s control can be a bona fide agent arrangement. Assigning loads across carriers, or handling freight like a broker, can require broker authority. The distinction is fact-specific.',
    workflows: [
      { id: 'dispatch-agreement', name: 'Dispatch agreement and load support', appliesWhen: 'AIO is arranging work for a carrier that directs the dispatcher', requirementClass: 'legal_requirement', sourceIds: ['fmcsa-broker-guidance', 'aio-launch-matrix'], expertQuestions: ['Does the carrier control which loads you accept? Do you ever allocate a load to a different carrier?'] },
    ],
    decisions: ['One carrier’s agent, or independent allocation'],
    documents: ['Continuing carrier agreement', 'Load details the carrier approved'],
    exceptions: ['Independent sourcing or holding freight charges points toward broker authority'],
    jurisdictionNotes: 'June 16, 2023 FMCSA guidance. The notice says it is not itself a binding law.',
    interactivePilot: false,
  },
  {
    id: 'brokerage',
    name: 'Brokerage',
    aioCommercialState: 'paused',
    aioNote: 'BLOCKED in the launch matrix. Research only. Do not activate the service.',
    overview: 'Broker authority is a different registration, with its own financial responsibility. It is not a dispatch setting.',
    workflows: [
      { id: 'broker-authority', name: 'Broker authority preparation', appliesWhen: 'The company will arrange transportation as a broker', requirementClass: 'legal_requirement', sourceIds: ['fmcsa-broker-guidance', 'fmcsa-operating-authority', 'aio-launch-matrix'], expertQuestions: ['This service is paused. Confirm that no client is being offered brokerage.'] },
    ],
    decisions: ['Is this actually brokerage'],
    documents: ['Broker application', 'Surety or trust filing by the financial institution'],
    exceptions: ['A dispatch client must not be silently moved into brokerage'],
    jurisdictionNotes: 'Template only. Not an active AIO service.',
    interactivePilot: false,
  },
  {
    id: 'insurance',
    name: 'Insurance',
    aioCommercialState: 'hold',
    aioNote: 'HOLD. Referral or assistance. No bind without licensing. AIO does not promise coverage.',
    overview: 'AIO can collect facts and introduce a licensed party. Binding coverage is not an AIO action.',
    workflows: [
      { id: 'insurance-referral', name: 'Coverage referral', appliesWhen: 'A client needs a licensed insurer or agent', requirementClass: 'legal_requirement', sourceIds: ['aio-launch-matrix', 'fmcsa-insurance'], expertQuestions: ['What do you collect before you introduce the agent? What do you never bind?'] },
      { id: 'authority-insurance-tracking', name: 'Authority insurance tracking', appliesWhen: 'An operating-authority file is waiting on the insurer’s FMCSA filing', requirementClass: 'legal_requirement', sourceIds: ['fmcsa-insurance-faq'], expertQuestions: ['How do you confirm the insurer filed, rather than assuming the client did?'] },
    ],
    decisions: ['Referral versus filing coordination'],
    documents: ['Quote request facts', 'Insurer filing confirmation'],
    exceptions: ['A client-uploaded certificate is not the FMCSA filing'],
    jurisdictionNotes: 'State producer licensing is separate and was not researched state by state.',
    interactivePilot: false,
  },
  {
    id: 'factoring',
    name: 'Factoring',
    aioCommercialState: 'hold',
    aioNote: 'HOLD. Partner referral. All In One does not fund receivables.',
    overview: 'A partner may purchase invoices. Assignment, notice, and recourse terms belong to that contract. They are not guessed here.',
    workflows: [
      { id: 'factoring-referral', name: 'Factoring partner referral', appliesWhen: 'A client asks for invoice funding', requirementClass: 'common_business_option', sourceIds: ['aio-launch-matrix'], expertQuestions: ['Which partner agreement is current? What must the client sign before an invoice is submitted?'] },
    ],
    decisions: ['Eligible invoice or not', 'Who notifies the debtor'],
    documents: ['Partner agreement', 'Invoice', 'Assignment notice if the partner requires it'],
    exceptions: ['A load paid to the wrong party because notice was skipped'],
    jurisdictionNotes: 'Contract and state commercial law. No UCC citation was verified in this sprint.',
    interactivePilot: false,
  },
  {
    id: 'bookkeeping',
    name: 'Bookkeeping',
    aioCommercialState: 'limited_pilot',
    aioNote: 'LIMITED_PILOT. Not a CPA firm, tax preparation, or payroll processor.',
    overview: 'Record keeping and categorization. Tax positions and payroll filings stay outside this service unless a later approved workflow says otherwise.',
    workflows: [
      { id: 'monthly-books', name: 'Monthly bookkeeping close', appliesWhen: 'A pilot client sends source documents', requirementClass: 'standard_industry_practice', sourceIds: ['aio-launch-matrix'], expertQuestions: ['What do you refuse to classify without a receipt? When do you stop and send the file to a licensed preparer?'] },
    ],
    decisions: ['Bookkeeping versus a tax position'],
    documents: ['Bank activity', 'Receipts', 'Settlement statements'],
    exceptions: ['A tax question is handed off, not answered as advice'],
    jurisdictionNotes: 'No IRC position was researched.',
    interactivePilot: false,
  },
  {
    id: 'drivers-carriers',
    name: 'Drivers & Carriers',
    aioCommercialState: 'coming_soon',
    aioNote: 'DQ files, Clearinghouse, and consortium enrollment are COMING_SOON. Minimize sensitive driver data.',
    overview: 'Carrier duties for driver qualification live mainly in 49 CFR Part 391. This library does not copy that part into a checklist.',
    workflows: [
      { id: 'dq-file-setup', name: 'Driver qualification file setup', appliesWhen: 'A carrier asks AIO to organize qualification records', requirementClass: 'legal_requirement', sourceIds: ['ecfr-391', 'aio-launch-matrix'], expertQuestions: ['Which documents do you collect on day one, and which do you leave to the carrier’s safety officer?'] },
    ],
    decisions: ['Employee driver or not', 'What AIO stores'],
    documents: ['Items the expert confirms from Part 391, not a pre-filled legal list'],
    exceptions: ['A missing medical qualification stops dispatch. Confirm the current rule before writing the stop condition.'],
    jurisdictionNotes: 'Federal FMCSRs, plus state license rules that were not surveyed.',
    interactivePilot: false,
  },
  {
    id: 'mechanic-maintenance',
    name: 'Mechanic / Maintenance',
    aioCommercialState: 'missing',
    aioNote: 'No mechanic service is in the AIO launch matrix. Do not offer it as a live lane.',
    overview: 'If AIO later coordinates shops, the workflow is vendor management and inspection records. It is not a government mechanic license.',
    workflows: [
      { id: 'shop-coordination', name: 'Shop coordination', appliesWhen: 'A future service sends a unit to a named shop', requirementClass: 'common_business_option', sourceIds: ['aio-launch-matrix'], expertQuestions: ['Is this a service you want at all? Which shop records must come back before the unit is released?'] },
    ],
    decisions: ['Roadside stop versus scheduled shop'],
    documents: ['Work order', 'Inspection record the carrier keeps'],
    exceptions: ['A unit is not released on a verbal “it’s fine”'],
    jurisdictionNotes: 'Annual inspection rules were not re-read. Do not cite a section number from memory.',
    interactivePilot: false,
  },
  {
    id: 'road-ready',
    name: 'Road Ready',
    aioCommercialState: 'limited_pilot',
    aioNote: 'Road Ready is an AIO catalog category (get-road-ready). It is not a government certification.',
    overview: 'A package of startup and registration workflows the client can see in one place. Each underlying filing stays its own process.',
    workflows: [
      { id: 'road-ready-package', name: 'Road Ready package review', appliesWhen: 'A startup client wants the registrations AIO actually offers', requirementClass: 'organization_specific', sourceIds: ['aio-service-catalog', 'aio-launch-matrix'], expertQuestions: ['Which catalog items do you include before you call someone road ready?'] },
    ],
    decisions: ['Which child workflows apply'],
    documents: ['The child workflow files, not a single badge'],
    exceptions: ['A paused service such as brokerage is never implied by the package'],
    jurisdictionNotes: 'AIO-defined. Child workflows carry the legal research.',
    interactivePilot: false,
  },
];

export function familyById(id: string): ServiceFamilyDraft | undefined {
  return SERVICE_LIBRARY.find((family) => family.id === id);
}
