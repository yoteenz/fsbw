/** Maps interview question categories → governed training packet titles (shared platform; profession-specific) */

export type PacketDefinition = {
  slug: string;
  title: string;
  knowledgeAreas: string[];
  scenarioTestRequired: boolean;
  authorizationsOnPass: string[];
  authorizationsRestricted: string[];
};

export const PERMITTING_PACKET_DEFINITIONS: PacketDefinition[] = [
  {
    slug: 'client-intake',
    title: 'Client Intake Packet',
    knowledgeAreas: ['Customer Intake', 'Business Overview'],
    scenarioTestRequired: true,
    authorizationsOnPass: ['can_identify_missing_intake_information', 'can_draft_customer_status_updates'],
    authorizationsRestricted: ['cannot_submit_to_municipality'],
  },
  {
    slug: 'document-collection',
    title: 'Document Collection Packet',
    knowledgeAreas: ['Required Documentation', 'Software & Storage'],
    scenarioTestRequired: true,
    authorizationsOnPass: ['can_organize_documents', 'can_identify_missing_documentation'],
    authorizationsRestricted: ['cannot_make_final_regulatory_determinations'],
  },
  {
    slug: 'permit-submission',
    title: 'Permit Submission Packet',
    knowledgeAreas: ['Permit Submission Process', 'Permit Types'],
    scenarioTestRequired: true,
    authorizationsOnPass: ['can_prepare_preliminary_permit_checklist', 'can_classify_project_types'],
    authorizationsRestricted: ['cannot_submit_to_municipality', 'cannot_approve_filings'],
  },
  {
    slug: 'municipality-communication',
    title: 'Municipality Communication Packet',
    knowledgeAreas: ['Municipality Communication', 'Municipality Differences', 'Jurisdictions'],
    scenarioTestRequired: true,
    authorizationsOnPass: ['can_draft_municipality_inquiries'],
    authorizationsRestricted: ['cannot_override_expert'],
  },
  {
    slug: 'quality-control',
    title: 'Quality Control Packet',
    knowledgeAreas: ['Quality Assurance', 'Common Mistakes', 'Common Failures'],
    scenarioTestRequired: true,
    authorizationsOnPass: ['can_perform_quality_checks'],
    authorizationsRestricted: ['cannot_approve_filings'],
  },
  {
    slug: 'customer-updates',
    title: 'Customer Update Packet',
    knowledgeAreas: ['Customer Updates'],
    scenarioTestRequired: false,
    authorizationsOnPass: ['can_draft_customer_status_updates'],
    authorizationsRestricted: [],
  },
  {
    slug: 'escalation',
    title: 'Escalation Packet',
    knowledgeAreas: ['Escalation Rules', 'Exception Handling', 'Professional Judgment'],
    scenarioTestRequired: true,
    authorizationsOnPass: ['can_identify_escalation_triggers'],
    authorizationsRestricted: ['cannot_override_expert'],
  },
  {
    slug: 'revisions-inspections',
    title: 'Revisions & Inspections Packet',
    knowledgeAreas: ['Revisions', 'Rejected Permits', 'Inspection Scheduling'],
    scenarioTestRequired: true,
    authorizationsOnPass: ['can_track_permit_status'],
    authorizationsRestricted: ['cannot_submit_to_municipality'],
  },
];

export const TAX_PREPARATION_PACKET_DEFINITIONS: PacketDefinition[] = [
  {
    slug: 'tax-intake',
    title: 'Tax Return Intake Packet',
    knowledgeAreas: ['Customer Intake', 'Business Overview'],
    scenarioTestRequired: true,
    authorizationsOnPass: ['can_identify_missing_intake_information'],
    authorizationsRestricted: ['cannot_approve_filings'],
  },
  {
    slug: 'document-verification',
    title: 'Document Verification Packet',
    knowledgeAreas: ['Required Documentation', 'Software & Storage'],
    scenarioTestRequired: true,
    authorizationsOnPass: ['can_organize_documents', 'can_identify_missing_documentation'],
    authorizationsRestricted: ['cannot_make_final_regulatory_determinations'],
  },
  {
    slug: 'prior-year-comparison',
    title: 'Prior-Year Comparison Packet',
    knowledgeAreas: ['Workflow', 'Decision Rules'],
    scenarioTestRequired: true,
    authorizationsOnPass: ['can_classify_project_types'],
    authorizationsRestricted: ['cannot_approve_filings'],
  },
  {
    slug: 'quality-control',
    title: 'Quality Control Packet',
    knowledgeAreas: ['Quality Assurance', 'Common Mistakes'],
    scenarioTestRequired: true,
    authorizationsOnPass: ['can_perform_quality_checks'],
    authorizationsRestricted: ['cannot_approve_filings'],
  },
  {
    slug: 'customer-communication',
    title: 'Customer Communication Packet',
    knowledgeAreas: ['Customer Communication'],
    scenarioTestRequired: false,
    authorizationsOnPass: ['can_draft_customer_status_updates'],
    authorizationsRestricted: [],
  },
  {
    slug: 'escalation',
    title: 'Escalation Packet',
    knowledgeAreas: ['Escalation Rules', 'Exception Handling'],
    scenarioTestRequired: true,
    authorizationsOnPass: ['can_identify_escalation_triggers'],
    authorizationsRestricted: ['cannot_override_expert'],
  },
];

export function getPacketDefinitionsForProfile(profileId: string): PacketDefinition[] {
  if (profileId.includes('permitting')) return PERMITTING_PACKET_DEFINITIONS;
  if (profileId.includes('tax')) return TAX_PREPARATION_PACKET_DEFINITIONS;
  return [];
}
