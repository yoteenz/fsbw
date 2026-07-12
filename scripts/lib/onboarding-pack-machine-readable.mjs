/**
 * Unified Onboarding Pack v2 — machine-readable state layer generator.
 * Produces canonical index JSON files for external AI coverage verification.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

export const MACHINE_READABLE_SCHEMA_VERSION = 2;

/** Optional archive files copied with capsule trees but excluded from MASTER_MANIFEST reading order. */
export const OPTIONAL_ARCHIVE_FILES = [
  {
    path: 'AI_Context_Capsule/ONBOARDING_REPORT.md',
    capsule: 'AI Context Capsule',
    purpose: 'Standalone Context Capsule onboarding report template (backward compatibility)',
    classification: 'compatibility-entry-point',
    mustRead: false,
    supportsReportSections: [],
    notInMasterManifestReason:
      'Unified pack uses root ONBOARDING_REPORT_TEMPLATE.md; retained for standalone Context Capsule distribution only',
  },
  {
    path: 'Founder_Intelligence_Capsule/README.md',
    capsule: 'Founder Intelligence Capsule',
    purpose: 'Capsule overview and unified-pack pointer for standalone distribution',
    classification: 'compatibility-entry-point',
    mustRead: false,
    supportsReportSections: [],
    notInMasterManifestReason:
      'Informational overview; README_FIRST.md is the required capsule entry point in unified pack reading order',
  },
  {
    path: 'Collaboration_Intelligence_Capsule/README.md',
    capsule: 'Collaboration Intelligence Capsule',
    purpose: 'Capsule scope and authority overview for standalone distribution',
    classification: 'compatibility-entry-point',
    mustRead: false,
    supportsReportSections: [],
    notInMasterManifestReason:
      'Informational overview; README_FIRST.md is the required capsule entry point in unified pack reading order',
  },
];

export const REPORT_SECTIONS = [
  { id: 'onboarding-compliance', number: 1, title: 'Onboarding Compliance', templateHeading: '# 1. Onboarding Compliance' },
  { id: 'read-confirmation', number: 2, title: 'Read Confirmation', templateHeading: '# 2. Read Confirmation' },
  { id: 'project-understanding', number: 3, title: 'Project Understanding', templateHeading: '# 3. Project Understanding' },
  { id: 'founder-understanding', number: 4, title: 'Founder Understanding', templateHeading: '# 4. Founder Understanding' },
  { id: 'studio-world-understanding', number: 5, title: 'Studio World Understanding', templateHeading: '# 5. Studio World Understanding' },
  { id: 'marketplace-revenue-understanding', number: 6, title: 'Marketplace and Revenue Understanding', templateHeading: '# 6. Marketplace and Revenue Understanding' },
  { id: 'studio-workers-hr-understanding', number: 7, title: 'Studio Workers and Studio HR Understanding', templateHeading: '# 7. Studio Workers and Studio HR Understanding' },
  { id: 'knowledge-capture-understanding', number: 8, title: 'Studio Institute and Knowledge Capture Understanding', templateHeading: '# 8. Studio Institute and Knowledge Capture Understanding' },
  { id: 'knowledge-vault-trust-understanding', number: 9, title: 'Knowledge Vault and Expert Trust Framework Understanding', templateHeading: '# 9. Knowledge Vault and Expert Trust Framework Understanding' },
  { id: 'current-implementation-state', number: 10, title: 'Current Implementation State', templateHeading: '# 10. Current Implementation State' },
  { id: 'source-of-truth-hierarchy', number: 11, title: 'Operational Source-of-Truth Hierarchy', templateHeading: '# 11. Operational Source-of-Truth Hierarchy' },
  { id: 'current-blockers', number: 12, title: 'Current Blockers', templateHeading: '# 12. Current Blockers' },
  { id: 'canon-verification', number: 13, title: 'Canon Verification', templateHeading: '# 13. Canon Verification' },
  { id: 'studio-dna-assessment', number: 14, title: 'Studio DNA Assessment', templateHeading: '# 14. Studio DNA Assessment' },
  { id: 'fact-inference-unknown-assessment', number: 15, title: 'Documented Fact / Inference / Unknown Assessment', templateHeading: '# 15. Documented Fact / Inference / Unknown Assessment' },
  { id: 'documentation-review', number: 16, title: 'Documentation Review', templateHeading: '# 16. Documentation Review' },
  { id: 'confidence-assessment', number: 17, title: 'Confidence Assessment', templateHeading: '# 17. Confidence Assessment' },
  { id: 'readiness-assessment', number: 18, title: 'Readiness Assessment', templateHeading: '# 18. Readiness Assessment' },
  { id: 'approval-boundary', number: 19, title: 'Approval Boundary', templateHeading: '# 19. Approval Boundary' },
];

/** @type {Record<string, { capsule: string, purpose: string, topics: string[], dependencies: string[], crossReferences: string[], reportSections: string[], required: boolean }>} */
const DOCUMENT_METADATA = {
  'START_HERE.md': {
    capsule: 'Unified Pack',
    purpose: 'Single authoritative entry point and onboarding rules',
    topics: ['Onboarding Process', 'Reading Order', 'Approval Boundary', 'Cross-Context', 'Motherboard Bridge'],
    dependencies: [],
    crossReferences: ['MASTER_MANIFEST.md', 'ONBOARDING_GUIDE.md', 'ONBOARDING_REPORT_TEMPLATE.md'],
    reportSections: ['onboarding-compliance', 'read-confirmation', 'approval-boundary'],
    required: true,
  },
  'MASTER_MANIFEST.md': {
    capsule: 'Unified Pack',
    purpose: 'Complete required reading order and manifest checksum',
    topics: ['Manifest', 'Reading Order', 'Capsule Inventory'],
    dependencies: ['START_HERE.md'],
    crossReferences: ['onboarding-state.json', 'onboarding-index.json'],
    reportSections: ['read-confirmation', 'onboarding-compliance'],
    required: true,
  },
  'ONBOARDING_GUIDE.md': {
    capsule: 'Unified Pack',
    purpose: 'Fact classification, implementation state, and source-of-truth hierarchy',
    topics: ['Source of Truth', 'Documented vs Inferred', 'Implementation State'],
    dependencies: ['START_HERE.md', 'MASTER_MANIFEST.md'],
    crossReferences: ['source-of-truth-map.json', 'ONBOARDING_REPORT_TEMPLATE.md'],
    reportSections: ['source-of-truth-hierarchy', 'fact-inference-unknown-assessment', 'documentation-review'],
    required: true,
  },
  'ONBOARDING_REPORT_TEMPLATE.md': {
    capsule: 'Unified Pack',
    purpose: 'Required 19-section report structure',
    topics: ['Onboarding Report', 'Approval Boundary'],
    dependencies: ['MASTER_MANIFEST.md', 'ONBOARDING_GUIDE.md'],
    crossReferences: ['onboarding-state.json'],
    reportSections: REPORT_SECTIONS.map((s) => s.id),
    required: true,
  },
  'ONBOARDING_PACK_VALIDATION.md': {
    capsule: 'Unified Pack',
    purpose: 'Auto-generated packaging validation summary',
    topics: ['Package Validation', 'Coverage Status'],
    dependencies: ['onboarding-state.json'],
    crossReferences: ['onboarding-pack.json'],
    reportSections: ['read-confirmation', 'documentation-review'],
    required: true,
  },
  'onboarding-pack.json': {
    capsule: 'Unified Pack',
    purpose: 'Pack metadata, capsule versions, and operational authority map',
    topics: ['Package Metadata', 'Capsule Versions'],
    dependencies: ['MASTER_MANIFEST.md'],
    crossReferences: ['onboarding-state.json'],
    reportSections: ['read-confirmation', 'source-of-truth-hierarchy'],
    required: true,
  },
  'onboarding-state.json': {
    capsule: 'Unified Pack',
    purpose: 'Canonical machine-readable pack state and validation summary',
    topics: ['Package State', 'Coverage Status', 'Validation Status'],
    dependencies: [],
    crossReferences: ['onboarding-index.json', 'coverage-map.json', 'MASTER_MANIFEST.md'],
    reportSections: ['read-confirmation', 'documentation-review'],
    required: true,
  },
  'onboarding-index.json': {
    capsule: 'Unified Pack',
    purpose: 'Per-document metadata index for coverage verification',
    topics: ['Document Index', 'Report Coverage'],
    dependencies: ['onboarding-state.json'],
    crossReferences: ['topic-index.json', 'coverage-map.json'],
    reportSections: ['read-confirmation', 'documentation-review'],
    required: true,
  },
  'coverage-map.json': {
    capsule: 'Unified Pack',
    purpose: 'Topic coverage status across the onboarding pack',
    topics: ['Topic Coverage', 'Coverage Verification'],
    dependencies: ['topic-index.json'],
    crossReferences: ['onboarding-index.json'],
    reportSections: ['documentation-review', 'confidence-assessment'],
    required: true,
  },
  'cross-capsule-map.json': {
    capsule: 'Unified Pack',
    purpose: 'Concept ownership and cross-capsule references',
    topics: ['Cross Capsule Concepts', 'Canonical Ownership'],
    dependencies: ['source-of-truth-map.json'],
    crossReferences: ['topic-index.json'],
    reportSections: ['source-of-truth-hierarchy', 'documentation-review'],
    required: true,
  },
  'topic-index.json': {
    capsule: 'Unified Pack',
    purpose: 'Reverse index of topics to documents and capsules',
    topics: ['Topic Index', 'Semantic Lookup'],
    dependencies: ['onboarding-index.json'],
    crossReferences: ['coverage-map.json', 'cross-capsule-map.json'],
    reportSections: ['documentation-review'],
    required: true,
  },
  'source-of-truth-map.json': {
    capsule: 'Unified Pack',
    purpose: 'Explicit authority hierarchy for operational topics',
    topics: ['Source of Truth', 'Operational Authority'],
    dependencies: [],
    crossReferences: ['ONBOARDING_GUIDE.md', 'cross-capsule-map.json'],
    reportSections: ['source-of-truth-hierarchy', 'current-implementation-state', 'current-blockers'],
    required: true,
  },
};

function capsuleMeta(capsuleKey, folder, readingList, jsonFile, version) {
  for (const file of readingList) {
    const rel = `${folder}/${file}`;
    if (DOCUMENT_METADATA[rel]) continue;
    DOCUMENT_METADATA[rel] = {
      capsule: capsuleKey,
      purpose: `${capsuleKey} document — see capsule MANIFEST`,
      topics: inferTopicsFromFilename(file),
      dependencies: file === 'README_FIRST.md' ? [] : ['README_FIRST.md', 'MANIFEST.md'],
      crossReferences: [`${folder}/MANIFEST.md`],
      reportSections: inferReportSections(file, capsuleKey),
      required: true,
    };
  }
  const jsonRel = `${folder}/${jsonFile}`;
  DOCUMENT_METADATA[jsonRel] = {
    capsule: capsuleKey,
    purpose: `${capsuleKey} machine-readable capsule metadata`,
    topics: ['Capsule Metadata'],
    dependencies: [`${folder}/MANIFEST.md`],
    crossReferences: ['onboarding-index.json'],
    reportSections: ['read-confirmation'],
    required: true,
  };
}

function inferTopicsFromFilename(file) {
  const base = file.replace(/\.md$/, '').replace(/_/g, ' ');
  return [base];
}

function inferReportSections(file, capsule) {
  const sections = ['read-confirmation'];
  const f = file.toLowerCase();
  if (f.includes('current_handoff')) sections.push('current-implementation-state');
  if (f.includes('known_blockers')) sections.push('current-blockers');
  if (f.includes('founder_profile') || f.includes('founder_preferences')) sections.push('founder-understanding');
  if (f.includes('studio_world') || f.includes('civilization')) sections.push('studio-world-understanding');
  if (f.includes('marketplace') || f.includes('revenue') || f.includes('monetization') || f.includes('business_model'))
    sections.push('marketplace-revenue-understanding');
  if (f.includes('studio_workers')) sections.push('studio-workers-hr-understanding');
  if (f.includes('knowledge_capture') || f.includes('interview_engine')) sections.push('knowledge-capture-understanding');
  if (f.includes('expert_trust') || f.includes('knowledge_capture')) sections.push('knowledge-vault-trust-understanding');
  if (f.includes('project_dna') || f.includes('canon') || f.includes('dna')) sections.push('canon-verification', 'studio-dna-assessment');
  if (f.includes('ai_context') || f.includes('project_dna')) sections.push('project-understanding');
  if (f.includes('roadmap') || f.includes('open_questions')) sections.push('documentation-review');
  if (capsule === 'Collaboration Intelligence Capsule') {
    sections.push('documentation-review', 'fact-inference-unknown-assessment', 'confidence-assessment');
    if (f.includes('decision_history')) sections.push('current-blockers', 'current-implementation-state');
    if (f.includes('collaboration_glossary') || f.includes('historical_context'))
      sections.push('project-understanding');
  }
  return [...new Set(sections)];
}

/** Topic coverage definitions — status resolved at generation time */
export const COVERAGE_TOPIC_DEFS = [
  { topic: 'Studio Marketplace', keywords: ['marketplace', 'commission', 'subscription'], documents: ['Founder_Intelligence_Capsule/MARKETPLACE.md', 'Founder_Intelligence_Capsule/REVENUE_MODEL.md'] },
  { topic: 'Marketplace Mechanics', keywords: ['marketplace', 'commission'], documents: ['Founder_Intelligence_Capsule/MARKETPLACE.md'] },
  { topic: 'Revenue Model', keywords: ['revenue', 'transaction'], documents: ['Founder_Intelligence_Capsule/REVENUE_MODEL.md', 'Founder_Intelligence_Capsule/MONETIZATION.md'] },
  { topic: 'Monetization', keywords: ['monetization', 'subscription'], documents: ['Founder_Intelligence_Capsule/MONETIZATION.md'] },
  { topic: 'Business Model', keywords: ['business', 'model'], documents: ['Founder_Intelligence_Capsule/BUSINESS_MODEL.md'] },
  { topic: 'Worker Lifecycle', keywords: ['retirement', 'training', 'lifecycle'], documents: ['Founder_Intelligence_Capsule/STUDIO_WORKERS.md'] },
  { topic: 'Studio Workers', keywords: ['studio workers', 'digital payroll'], documents: ['Founder_Intelligence_Capsule/STUDIO_WORKERS.md'] },
  { topic: 'Studio Team / Studio HR', keywords: ['studio team', 'studio hr'], documents: ['Founder_Intelligence_Capsule/STUDIO_WORKERS.md'] },
  { topic: 'Knowledge Vault', keywords: ['knowledge vault'], documents: ['Founder_Intelligence_Capsule/KNOWLEDGE_CAPTURE.md', 'Studio_DNA_Capsule/CANON_REGISTRY.md'] },
  { topic: 'Knowledge Capture', keywords: ['knowledge capture', 'living knowledge mirror'], documents: ['Founder_Intelligence_Capsule/KNOWLEDGE_CAPTURE.md'] },
  { topic: 'Interview Engine', keywords: ['interview', 'invite'], documents: ['Founder_Intelligence_Capsule/INTERVIEW_ENGINE.md'] },
  { topic: 'Expert Trust Framework', keywords: ['trust', 'governance', 'authorization'], documents: ['Founder_Intelligence_Capsule/EXPERT_TRUST_AND_GOVERNANCE.md'] },
  { topic: 'Studio World Vision', keywords: ['studio world', 'civilization'], documents: ['Founder_Intelligence_Capsule/STUDIO_WORLD.md', 'Founder_Intelligence_Capsule/CIVILIZATION.md'] },
  { topic: 'Current Implementation', keywords: ['current sprint', 'handoff'], documents: ['AI_Context_Capsule/CURRENT_HANDOFF.md'] },
  { topic: 'Known Blockers', keywords: ['blocker', 'gate'], documents: ['AI_Context_Capsule/KNOWN_BLOCKERS.md'] },
  { topic: 'Black Box', keywords: ['black box', 'world compiler'], documents: ['Collaboration_Intelligence_Capsule/COLLABORATION_GLOSSARY.md', 'Collaboration_Intelligence_Capsule/HISTORICAL_CONTEXT.md'] },
  { topic: 'World Compiler', keywords: ['world compiler', 'compile'], documents: ['Collaboration_Intelligence_Capsule/COLLABORATION_GLOSSARY.md', 'Collaboration_Intelligence_Capsule/HISTORICAL_CONTEXT.md'] },
  { topic: 'Experience Lab', keywords: ['experience lab'], documents: ['Collaboration_Intelligence_Capsule/HISTORICAL_CONTEXT.md', 'Collaboration_Intelligence_Capsule/IMPORTANT_CONVERSATIONS.md'] },
  { topic: 'Composer Sprint', keywords: ['composer sprint'], documents: ['Collaboration_Intelligence_Capsule/COLLABORATION_GLOSSARY.md', 'Collaboration_Intelligence_Capsule/COLLABORATION_PATTERNS.md'] },
  { topic: 'Collaboration Memory', keywords: ['collaboration intelligence', 'motherboard'], documents: ['Collaboration_Intelligence_Capsule/README_FIRST.md', 'Collaboration_Intelligence_Capsule/MEMORY_MATURITY.md'] },
  { topic: 'Motherboard', keywords: ['motherboard'], documents: ['Collaboration_Intelligence_Capsule/SEARCH_INDEX.md', 'AI_Context_Capsule/AI_CONTEXT.md'] },
  { topic: 'Design Judgment', keywords: ['design', 'canon'], documents: ['Studio_DNA_Capsule/FOUNDER_DESIGN_PHILOSOPHY.md', 'Founder_Intelligence_Capsule/DESIGN_LANGUAGE.md'] },
  { topic: 'Canon Registry', keywords: ['canon'], documents: ['Studio_DNA_Capsule/CANON_REGISTRY.md', 'AI_Context_Capsule/PROJECT_DNA.md'] },
  { topic: 'Digital Payroll Pricing', keywords: ['digital payroll', 'pricing'], documents: ['Founder_Intelligence_Capsule/STUDIO_WORKERS.md', 'Founder_Intelligence_Capsule/REVENUE_MODEL.md'] },
  { topic: 'Founder Strategy', keywords: ['vision', 'founder'], documents: ['Founder_Intelligence_Capsule/VISION.md', 'Founder_Intelligence_Capsule/PRODUCT_PHILOSOPHY.md'] },
  { topic: 'AI Collaboration Protocol', keywords: ['collaboration', 'onboarding'], documents: ['Founder_Intelligence_Capsule/AI_COLLABORATION.md', 'Collaboration_Intelligence_Capsule/COLLABORATION_PATTERNS.md'] },
];

export const CROSS_CAPSULE_CONCEPTS = [
  {
    concept: 'CURRENT_HANDOFF',
    canonicalOwner: { capsule: 'AI Context Capsule', document: 'AI_Context_Capsule/CURRENT_HANDOFF.md' },
    supportingDocuments: ['AI_Context_Capsule/PROJECT_CHANGELOG.md', 'Collaboration_Intelligence_Capsule/HISTORICAL_CONTEXT.md'],
    operationalAuthority: 'Current implementation status and active sprint',
    relatedDocuments: ['AI_Context_Capsule/KNOWN_BLOCKERS.md', 'onboarding-state.json'],
    referencedBy: ['Founder Intelligence Capsule', 'Collaboration Intelligence Capsule', 'Unified Pack'],
  },
  {
    concept: 'KNOWN_BLOCKERS',
    canonicalOwner: { capsule: 'AI Context Capsule', document: 'AI_Context_Capsule/KNOWN_BLOCKERS.md' },
    supportingDocuments: ['AI_Context_Capsule/CURRENT_HANDOFF.md', 'Collaboration_Intelligence_Capsule/DECISION_HISTORY.md'],
    operationalAuthority: 'Active blockers, gates, and do-not-violate rules',
    relatedDocuments: ['Collaboration_Intelligence_Capsule/HISTORICAL_CONTEXT.md'],
    referencedBy: ['Founder Intelligence Capsule', 'Collaboration Intelligence Capsule'],
  },
  {
    concept: 'Cross-Context (Motherboard)',
    canonicalOwner: { capsule: 'Motherboard (repository)', document: 'motherboard/README.md' },
    supportingDocuments: ['motherboard/CORE.md', 'motherboard/CODEBASE.md', 'AI_Context_Capsule/AI_CONTEXT.md', 'onboarding-pack/ONBOARDING_GUIDE.md'],
    operationalAuthority: 'Live implementation bridge after onboarding — not inside 93-file reading order',
    relatedDocuments: ['motherboard/MEMORY.md', 'source-of-truth-map.json'],
    referencedBy: ['Unified Pack', 'AI Context Capsule', 'Cursor agents'],
  },
  {
    concept: 'Founder Strategy',
    canonicalOwner: { capsule: 'Founder Intelligence Capsule', document: 'Founder_Intelligence_Capsule/VISION.md' },
    supportingDocuments: ['Founder_Intelligence_Capsule/PRODUCT_PHILOSOPHY.md', 'Founder_Intelligence_Capsule/STUDIO_WORLD.md'],
    operationalAuthority: 'Why the project exists and long-term direction',
    relatedDocuments: ['AI_Context_Capsule/FOUNDER_PROFILE.md'],
    referencedBy: ['AI Context Capsule', 'Collaboration Intelligence Capsule'],
  },
  {
    concept: 'Design Judgment',
    canonicalOwner: { capsule: 'Studio DNA Capsule', document: 'Studio_DNA_Capsule/FOUNDER_DESIGN_PHILOSOPHY.md', fallback: 'Founder_Intelligence_Capsule/DESIGN_LANGUAGE.md' },
    supportingDocuments: ['Studio_DNA_Capsule/CANON_REGISTRY.md', 'Founder_Intelligence_Capsule/CREATIVE_DIRECTION.md'],
    operationalAuthority: 'How decisions should feel and canon preservation',
    relatedDocuments: ['Studio_DNA_Capsule/CANON_PRESERVATION_POLICY.md'],
    referencedBy: ['Founder Intelligence Capsule', 'AI Context Capsule'],
  },
  {
    concept: 'Collaboration Memory',
    canonicalOwner: { capsule: 'Collaboration Intelligence Capsule', document: 'Collaboration_Intelligence_Capsule/COLLABORATION_INTELLIGENCE_INDEX.md' },
    supportingDocuments: ['Collaboration_Intelligence_Capsule/DECISION_HISTORY.md', 'Collaboration_Intelligence_Capsule/GOOSEBUMP_MOMENTS.md'],
    operationalAuthority: 'Institutional memory of Founder–AI collaboration (not chat history)',
    relatedDocuments: ['Collaboration_Intelligence_Capsule/MEMORY_MATURITY.md', 'Collaboration_Intelligence_Capsule/SEARCH_INDEX.md'],
    referencedBy: ['AI Context Capsule', 'Founder Intelligence Capsule', 'Unified Pack'],
  },
  {
    concept: 'Marketplace',
    canonicalOwner: { capsule: 'Founder Intelligence Capsule', document: 'Founder_Intelligence_Capsule/MARKETPLACE.md' },
    supportingDocuments: ['Founder_Intelligence_Capsule/REVENUE_MODEL.md', 'Founder_Intelligence_Capsule/MONETIZATION.md'],
    operationalAuthority: 'Expert economy and marketplace mechanics',
    relatedDocuments: ['Founder_Intelligence_Capsule/BUSINESS_MODEL.md'],
    referencedBy: ['Collaboration Intelligence Capsule', 'AI Context Capsule'],
  },
  {
    concept: 'Studio Workers',
    canonicalOwner: { capsule: 'Founder Intelligence Capsule', document: 'Founder_Intelligence_Capsule/STUDIO_WORKERS.md' },
    supportingDocuments: ['Founder_Intelligence_Capsule/REVENUE_MODEL.md'],
    operationalAuthority: 'AI worker lifecycle, Studio Team, Digital Payroll',
    relatedDocuments: ['Collaboration_Intelligence_Capsule/GOOSEBUMP_MOMENTS.md'],
    referencedBy: ['Collaboration Intelligence Capsule'],
  },
  {
    concept: 'Knowledge Vault',
    canonicalOwner: { capsule: 'Founder Intelligence Capsule', document: 'Founder_Intelligence_Capsule/KNOWLEDGE_CAPTURE.md' },
    supportingDocuments: ['Founder_Intelligence_Capsule/INTERVIEW_ENGINE.md', 'Founder_Intelligence_Capsule/EXPERT_TRUST_AND_GOVERNANCE.md'],
    operationalAuthority: 'Expert knowledge capture, vault, and trust',
    relatedDocuments: ['Studio_DNA_Capsule/CANON_REGISTRY.md'],
    referencedBy: ['Collaboration Intelligence Capsule', 'Studio DNA Capsule'],
  },
  {
    concept: 'Black Box',
    canonicalOwner: { capsule: 'Collaboration Intelligence Capsule', document: 'Collaboration_Intelligence_Capsule/COLLABORATION_GLOSSARY.md' },
    supportingDocuments: ['Collaboration_Intelligence_Capsule/HISTORICAL_CONTEXT.md', 'Collaboration_Intelligence_Capsule/IMPORTANT_CONVERSATIONS.md'],
    operationalAuthority: 'World Compiler investigation and forensic diagnostics',
    relatedDocuments: ['AI_Context_Capsule/CURRENT_HANDOFF.md'],
    referencedBy: ['AI Context Capsule'],
  },
  {
    concept: 'PROJECT_DNA',
    canonicalOwner: { capsule: 'AI Context Capsule', document: 'AI_Context_Capsule/PROJECT_DNA.md' },
    supportingDocuments: ['AI_Context_Capsule/AI_CONTEXT.md', 'Studio_DNA_Capsule/ARCHITECTURE_DNA.md'],
    operationalAuthority: 'Technical and architectural canon summary',
    relatedDocuments: ['AI_Context_Capsule/MANIFEST.md'],
    referencedBy: ['Founder Intelligence Capsule', 'Studio DNA Capsule'],
  },
];

export const SOURCE_OF_TRUTH_HIERARCHY = [
  { domain: 'Current Implementation', authority: 'AI_Context_Capsule/CURRENT_HANDOFF.md', capsule: 'AI Context Capsule' },
  { domain: 'Current Blockers', authority: 'AI_Context_Capsule/KNOWN_BLOCKERS.md', capsule: 'AI Context Capsule' },
  { domain: 'Live Implementation Rules', authority: 'motherboard/CORE.md', capsule: 'Motherboard (repository)', repositoryOnly: true },
  { domain: 'Live Codebase Map', authority: 'motherboard/CODEBASE.md', capsule: 'Motherboard (repository)', repositoryOnly: true },
  { domain: 'Implementation History', authority: 'motherboard/MEMORY.md', capsule: 'Motherboard (repository)', repositoryOnly: true, note: 'Append-only; latest applicable entries; does not override handoff/blockers' },
  { domain: 'Founder Strategy', authority: 'Founder_Intelligence_Capsule/VISION.md', capsule: 'Founder Intelligence Capsule' },
  { domain: 'Design Judgment', authority: 'Studio_DNA_Capsule/FOUNDER_DESIGN_PHILOSOPHY.md', capsule: 'Studio DNA Capsule', fallback: 'Founder_Intelligence_Capsule/DESIGN_LANGUAGE.md' },
  { domain: 'Collaboration Memory', authority: 'Collaboration_Intelligence_Capsule/COLLABORATION_INTELLIGENCE_INDEX.md', capsule: 'Collaboration Intelligence Capsule' },
  { domain: 'Technical Canon Summary', authority: 'AI_Context_Capsule/PROJECT_DNA.md', capsule: 'AI Context Capsule' },
  { domain: 'Marketplace & Revenue', authority: 'Founder_Intelligence_Capsule/MARKETPLACE.md', capsule: 'Founder Intelligence Capsule' },
  { domain: 'Studio Workers / HR', authority: 'Founder_Intelligence_Capsule/STUDIO_WORKERS.md', capsule: 'Founder Intelligence Capsule' },
  { domain: 'Knowledge Capture', authority: 'Founder_Intelligence_Capsule/KNOWLEDGE_CAPTURE.md', capsule: 'Founder Intelligence Capsule' },
  { domain: 'Future Sequencing', authority: 'AI_Context_Capsule/ROADMAP.md', capsule: 'AI Context Capsule' },
  { domain: 'Unresolved Decisions', authority: 'AI_Context_Capsule/OPEN_QUESTIONS.md', capsule: 'AI Context Capsule' },
];

export function registerCapsuleDocuments(contextReading, ficReading, dnaReading, ciReading, includeDna) {
  capsuleMeta('AI Context Capsule', 'AI_Context_Capsule', contextReading, 'context-capsule.json', null);
  capsuleMeta('Founder Intelligence Capsule', 'Founder_Intelligence_Capsule', ficReading, 'founder-intelligence.json', null);
  if (includeDna) capsuleMeta('Studio DNA Capsule', 'Studio_DNA_Capsule', dnaReading, 'studio-dna-capsule.json', null);
  capsuleMeta('Collaboration Intelligence Capsule', 'Collaboration_Intelligence_Capsule', ciReading, 'collaboration-intelligence.json', null);

  for (const opt of OPTIONAL_ARCHIVE_FILES) {
    DOCUMENT_METADATA[opt.path] = {
      capsule: opt.capsule,
      purpose: opt.purpose,
      topics: inferTopicsFromFilename(path.basename(opt.path)),
      dependencies: [],
      crossReferences: [],
      reportSections: opt.supportsReportSections,
      required: false,
      classification: opt.classification,
      mustRead: opt.mustRead,
      notInMasterManifestReason: opt.notInMasterManifestReason,
    };
  }

  // Enrich key documents
  enrichDoc('AI_Context_Capsule/CURRENT_HANDOFF.md', {
    purpose: 'Current sprint, implementation status, and debugging state',
    topics: ['Current Implementation', 'Active Sprint', 'Debugging Status'],
    reportSections: ['current-implementation-state', 'current-blockers', 'readiness-assessment'],
  });
  enrichDoc('AI_Context_Capsule/KNOWN_BLOCKERS.md', {
    purpose: 'Active blockers, gates, and do-not-violate rules',
    topics: ['Known Blockers', 'Gates', 'P0 Blockers'],
    reportSections: ['current-blockers', 'current-implementation-state'],
  });
  enrichDoc('Collaboration_Intelligence_Capsule/COLLABORATION_GLOSSARY.md', {
    purpose: 'Founder–AI shared vocabulary including Black Box and Composer Sprint',
    topics: ['Black Box', 'World Compiler', 'Composer Sprint', 'Glossary'],
    reportSections: ['documentation-review', 'project-understanding'],
  });
  enrichDoc('Collaboration_Intelligence_Capsule/DECISION_HISTORY.md', {
    purpose: 'Approved, rejected, and deferred collaboration decisions',
    topics: ['Decision History', 'Ephemeral Auth', 'One Deploy Per Task'],
    reportSections: ['current-blockers', 'fact-inference-unknown-assessment'],
  });
  enrichDoc('Founder_Intelligence_Capsule/MARKETPLACE.md', {
    purpose: 'Marketplace mechanics, expert economy, and knowledge licensing',
    topics: ['Studio Marketplace', 'Marketplace Mechanics', 'Knowledge Licensing'],
    reportSections: ['marketplace-revenue-understanding'],
  });
  enrichDoc('Founder_Intelligence_Capsule/STUDIO_WORKERS.md', {
    purpose: 'Studio Workers lifecycle, Studio Team, Digital Payroll, Shadow Mode',
    topics: ['Worker Lifecycle', 'Studio Workers', 'Digital Payroll'],
    reportSections: ['studio-workers-hr-understanding', 'marketplace-revenue-understanding'],
  });
}

function enrichDoc(rel, patch) {
  if (!DOCUMENT_METADATA[rel]) return;
  DOCUMENT_METADATA[rel] = { ...DOCUMENT_METADATA[rel], ...patch };
}

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function sha256Text(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function extractDocVersion(packDir, relPath) {
  const fp = path.join(packDir, relPath);
  if (!fs.existsSync(fp)) return null;
  const body = fs.readFileSync(fp, 'utf8');
  const lastUpdated = body.match(/\*\*Last updated:\*\*\s*([^\n]+)/i)?.[1]?.trim();
  const version = body.match(/\*\*Version:\*\*\s*([^\n]+)/i)?.[1]?.trim();
  return { lastUpdated: lastUpdated ?? null, version: version ?? null };
}

function resolveCoverageStatus(packDir, def, includeDna) {
  const presentDocs = [];
  const missingDocs = [];
  for (const doc of def.documents) {
    if (doc.startsWith('Studio_DNA_Capsule/') && !includeDna) continue;
    const fp = path.join(packDir, doc);
    if (fs.existsSync(fp)) presentDocs.push(doc);
    else missingDocs.push(doc);
  }
  if (presentDocs.length === 0) return { status: 'Not Present', presentDocs, missingDocs, evidence: null };

  let keywordHits = 0;
  let keywordTotal = 0;
  for (const doc of presentDocs) {
    const body = fs.readFileSync(path.join(packDir, doc), 'utf8').toLowerCase();
    for (const kw of def.keywords) {
      keywordTotal += 1;
      if (body.includes(kw.toLowerCase())) keywordHits += 1;
    }
  }
  if (keywordTotal === 0) return { status: 'Covered', presentDocs, missingDocs, evidence: 'documents present' };
  const ratio = keywordHits / keywordTotal;
  if (ratio >= 0.75) return { status: 'Covered', presentDocs, missingDocs, evidence: `${keywordHits}/${keywordTotal} keywords` };
  if (ratio >= 0.35) return { status: 'Partially Covered', presentDocs, missingDocs, evidence: `${keywordHits}/${keywordTotal} keywords` };
  if (ratio > 0) return { status: 'Unknown', presentDocs, missingDocs, evidence: `${keywordHits}/${keywordTotal} keywords` };
  return { status: 'Unknown', presentDocs, missingDocs, evidence: 'keywords not found' };
}

function buildTopicIndex(coverageEntries, manifestEntries, includeDna) {
  const topicMap = new Map();
  for (const entry of coverageEntries) {
    if (!topicMap.has(entry.topic)) {
      topicMap.set(entry.topic, { topic: entry.topic, appearsIn: [], capsules: new Set(), coverageStatus: entry.status });
    }
    const t = topicMap.get(entry.topic);
    t.coverageStatus = entry.status;
    for (const doc of entry.presentDocuments) {
      if (!t.appearsIn.includes(doc)) t.appearsIn.push(doc);
      const capsule = manifestEntries.find((e) => e.path === doc)?.capsule ?? inferCapsuleFromPath(doc);
      if (capsule) t.capsules.add(capsule);
    }
  }
  for (const [rel, meta] of Object.entries(DOCUMENT_METADATA)) {
    for (const topic of meta.topics) {
      if (!topicMap.has(topic)) topicMap.set(topic, { topic, appearsIn: [], capsules: new Set(), coverageStatus: 'Unknown' });
      const t = topicMap.get(topic);
      if (!t.appearsIn.includes(rel)) t.appearsIn.push(rel);
      t.capsules.add(meta.capsule);
    }
  }
  return Array.from(topicMap.values())
    .map((t) => ({
      topic: t.topic,
      coverageStatus: t.coverageStatus,
      appearsIn: t.appearsIn.sort(),
      capsules: Array.from(t.capsules).sort(),
    }))
    .sort((a, b) => a.topic.localeCompare(b.topic));
}

function inferCapsuleFromPath(docPath) {
  if (docPath.startsWith('AI_Context_Capsule/')) return 'AI Context Capsule';
  if (docPath.startsWith('Founder_Intelligence_Capsule/')) return 'Founder Intelligence Capsule';
  if (docPath.startsWith('Studio_DNA_Capsule/')) return 'Studio DNA Capsule';
  if (docPath.startsWith('Collaboration_Intelligence_Capsule/')) return 'Collaboration Intelligence Capsule';
  return 'Unified Pack';
}

function buildOptionalIndex(packDir) {
  return OPTIONAL_ARCHIVE_FILES.map((opt, index) => {
    const fp = path.join(packDir, opt.path);
    const checksum = fs.existsSync(fp) ? sha256File(fp) : null;
    return {
      order: index + 1,
      documentName: path.basename(opt.path),
      path: opt.path,
      capsule: opt.capsule,
      purpose: opt.purpose,
      classification: opt.classification,
      mustRead: opt.mustRead,
      supportsReportSections: opt.supportsReportSections,
      notInMasterManifestReason: opt.notInMasterManifestReason,
      required: false,
      optional: true,
      checksumSha256: checksum,
    };
  });
}

function buildOnboardingIndex(manifestEntries, packDir) {
  return manifestEntries.map((entry, index) => {
    const meta = DOCUMENT_METADATA[entry.path] ?? {
      capsule: inferCapsuleFromPath(entry.path),
      purpose: 'Required onboarding document',
      topics: inferTopicsFromFilename(path.basename(entry.path)),
      dependencies: [],
      crossReferences: [],
      reportSections: ['read-confirmation'],
      required: true,
    };
    const fp = path.join(packDir, entry.path);
    const checksum = fs.existsSync(fp) ? sha256File(fp) : null;
    return {
      order: index + 1,
      documentName: path.basename(entry.path),
      path: entry.path,
      capsule: meta.capsule,
      phase: entry.phase,
      version: meta.version ?? null,
      purpose: meta.purpose,
      topicsCovered: meta.topics,
      dependencies: meta.dependencies.map((d) => (d.includes('/') ? d : `${inferCapsuleFolder(meta.capsule)}/${d}`).replace(/^\//, '')),
      crossReferences: meta.crossReferences,
      required: meta.required,
      optional: !meta.required,
      reportSectionsSupported: meta.reportSections,
      checksumSha256: checksum,
    };
  });
}

function inferCapsuleFolder(capsule) {
  const map = {
    'AI Context Capsule': 'AI_Context_Capsule',
    'Founder Intelligence Capsule': 'Founder_Intelligence_Capsule',
    'Studio DNA Capsule': 'Studio_DNA_Capsule',
    'Collaboration Intelligence Capsule': 'Collaboration_Intelligence_Capsule',
    'Unified Pack': '',
  };
  return map[capsule] ?? '';
}

/**
 * Generate all machine-readable JSON files and return validation results.
 */
export function generateMachineReadableLayer(input) {
  const {
    packDir,
    packVersion,
    gitCommit,
    generatedAt,
    manifestEntries,
    manifestChecksum,
    includeDna,
    capsuleReleases,
    includedCapsules,
    missingOptionalCapsules,
    archiveChecksum,
  } = input;

  registerCapsuleDocuments(
    input.contextReading,
    input.ficReading,
    input.dnaReading,
    input.ciReading,
    includeDna
  );

  const requiredEntries = manifestEntries.filter((e) => {
    if (e.path.startsWith('Studio_DNA_Capsule/') && !includeDna) return false;
    const meta = DOCUMENT_METADATA[e.path];
    return meta?.required !== false;
  });

  const fileChecksums = {};
  for (const entry of manifestEntries) {
    const fp = path.join(packDir, entry.path);
    if (fs.existsSync(fp)) fileChecksums[entry.path] = sha256File(fp);
  }

  const coverageEntries = COVERAGE_TOPIC_DEFS.map((def) => {
    const resolved = resolveCoverageStatus(packDir, def, includeDna);
    return {
      topic: def.topic,
      status: resolved.status,
      presentDocuments: resolved.presentDocs,
      missingDocuments: resolved.missingDocs,
      evidence: resolved.evidence,
      keywords: def.keywords,
    };
  });

  const topicIndex = buildTopicIndex(coverageEntries, manifestEntries, includeDna);

  const handoffMeta = extractDocVersion(packDir, 'AI_Context_Capsule/CURRENT_HANDOFF.md');
  const blockersMeta = extractDocVersion(packDir, 'AI_Context_Capsule/KNOWN_BLOCKERS.md');

  const optionalIndex = buildOptionalIndex(packDir);
  const optionalChecksums = {};
  for (const opt of optionalIndex) {
    if (opt.checksumSha256) optionalChecksums[opt.path] = opt.checksumSha256;
  }

  const requiredFileCount = manifestEntries.length;
  const optionalFileCount = OPTIONAL_ARCHIVE_FILES.length;
  const generatedMetadataFileCount = 0;
  const totalInventoriedFileCount = requiredFileCount + optionalFileCount + generatedMetadataFileCount;

  const perCapsuleCounts = buildPerCapsuleCounts(manifestEntries, OPTIONAL_ARCHIVE_FILES);

  const capsuleInventory = includedCapsules.map((name) => {
    const key =
      name === 'AI Context Capsule'
        ? 'context'
        : name === 'Founder Intelligence Capsule'
          ? 'founderIntelligence'
          : name === 'Collaboration Intelligence Capsule'
            ? 'collaborationIntelligence'
            : 'studioDna';
    const release = capsuleReleases[key];
    const folder =
      name === 'AI Context Capsule'
        ? 'AI_Context_Capsule'
        : name === 'Founder Intelligence Capsule'
          ? 'Founder_Intelligence_Capsule'
          : name === 'Collaboration Intelligence Capsule'
            ? 'Collaboration_Intelligence_Capsule'
            : 'Studio_DNA_Capsule';
    const requiredCount = manifestEntries.filter((e) => e.path.startsWith(`${folder}/`)).length;
    const optionalCount = OPTIONAL_ARCHIVE_FILES.filter((o) => o.path.startsWith(`${folder}/`)).length;
    return {
      name,
      folder,
      version: release?.currentVersion ?? release?.version ?? 'unknown',
      required: name !== 'Studio DNA Capsule',
      requiredFileCount: requiredCount,
      optionalFileCount: optionalCount,
      fileCount: requiredCount + optionalCount,
      contributesTopics: topicIndex.filter((t) => t.capsules.includes(name)).map((t) => t.topic),
      validationStatus: release?.validationStatus ?? 'pass',
    };
  });

  const crossCapsuleMap = {
    schemaVersion: MACHINE_READABLE_SCHEMA_VERSION,
    generatedAt,
    concepts: CROSS_CAPSULE_CONCEPTS.map((c) => ({
      ...c,
      dnaIncluded: includeDna,
      canonicalOwner: {
        ...c.canonicalOwner,
        available: !c.canonicalOwner.document?.startsWith('Studio_DNA_Capsule/') || includeDna,
      },
    })),
  };

  const sourceOfTruthMap = {
    schemaVersion: MACHINE_READABLE_SCHEMA_VERSION,
    generatedAt,
    hierarchy: SOURCE_OF_TRUTH_HIERARCHY.map((row) => ({
      ...row,
      available: !row.authority.startsWith('Studio_DNA_Capsule/') || includeDna,
      path: row.authority,
    })),
    resolutionRules: [
      'Context wins for what is built today',
      'CURRENT_HANDOFF and KNOWN_BLOCKERS override older Motherboard MEMORY for current blockers',
      'Motherboard CORE and CODEBASE govern live implementation when repository access is available',
      'Founder Intelligence wins for why and strategy',
      'Studio DNA wins for design judgment when included',
      'Collaboration Intelligence wins for institutional collaboration memory',
      'Cross-context synchronization required when either Motherboard or onboarding pack changes materially',
    ],
  };

  const coverageMap = {
    schemaVersion: MACHINE_READABLE_SCHEMA_VERSION,
    generatedAt,
    summary: {
      covered: coverageEntries.filter((e) => e.status === 'Covered').length,
      partiallyCovered: coverageEntries.filter((e) => e.status === 'Partially Covered').length,
      unknown: coverageEntries.filter((e) => e.status === 'Unknown').length,
      notPresent: coverageEntries.filter((e) => e.status === 'Not Present').length,
      total: coverageEntries.length,
    },
    topics: coverageEntries,
    collaborationIntelligenceTopics: coverageEntries.filter((e) =>
      e.presentDocuments.some((d) => d.startsWith('Collaboration_Intelligence_Capsule/'))
    ),
  };

  const onboardingIndex = buildOnboardingIndex(
    manifestEntries.map((e) => ({ ...e, capsule: inferCapsuleFromPath(e.path) })),
    packDir
  );

  const onboardingState = {
    schemaVersion: MACHINE_READABLE_SCHEMA_VERSION,
    packageVersion: packVersion,
    repositoryCommit: gitCommit,
    generationTimestamp: generatedAt,
    totalCapsules: includedCapsules.length,
    totalRequiredFiles: requiredEntries.length,
    totalOptionalFiles: optionalFileCount,
    archiveInventory: {
      requiredFileCount,
      optionalFileCount,
      generatedMetadataFileCount,
      totalInventoriedFileCount,
      actualArchiveFileCount: null,
      perCapsuleCounts,
      optionalFiles: optionalIndex,
    },
    capsuleInventory,
    manifestValidation: {
      status: 'pass',
      requiredFileCount: manifestEntries.length,
      manifestChecksum,
      allEntriesPresent: true,
    },
    checksumValidation: {
      status: archiveChecksum ? 'pending-archive' : 'pass',
      fileChecksumCount: Object.keys(fileChecksums).length,
      archiveChecksumSha256: archiveChecksum ?? null,
    },
    coverageStatus: coverageEntries.some((e) => e.status === 'Not Present') ? 'partial' : 'pass',
    validationStatus: 'pass',
    expectedReportSections: REPORT_SECTIONS,
    sourceOfTruthHierarchy: SOURCE_OF_TRUTH_HIERARCHY,
    knownCanonVersion: capsuleReleases.context?.currentVersion ?? null,
    currentHandoff: {
      path: 'AI_Context_Capsule/CURRENT_HANDOFF.md',
      lastUpdated: handoffMeta?.lastUpdated ?? null,
      version: handoffMeta?.version ?? null,
    },
    knownBlockers: {
      path: 'AI_Context_Capsule/KNOWN_BLOCKERS.md',
      lastUpdated: blockersMeta?.lastUpdated ?? null,
      version: blockersMeta?.version ?? null,
    },
    collaborationIntelligence: {
      capsule: 'Collaboration Intelligence Capsule',
      version: capsuleReleases.collaborationIntelligence?.currentVersion ?? null,
      required: true,
      indexedIn: [
        'onboarding-state.json',
        'onboarding-index.json',
        'coverage-map.json',
        'cross-capsule-map.json',
        'topic-index.json',
        'MASTER_MANIFEST.md',
      ],
      fileCount: manifestEntries.filter((e) => e.path.startsWith('Collaboration_Intelligence_Capsule/')).length,
    },
    machineReadableFiles: [
      'onboarding-state.json',
      'onboarding-index.json',
      'coverage-map.json',
      'cross-capsule-map.json',
      'topic-index.json',
      'source-of-truth-map.json',
    ],
  };

  const topicIndexJson = {
    schemaVersion: MACHINE_READABLE_SCHEMA_VERSION,
    generatedAt,
    topicCount: topicIndex.length,
    topics: topicIndex,
  };

  const onboardingIndexJson = {
    schemaVersion: MACHINE_READABLE_SCHEMA_VERSION,
    generatedAt,
    requiredDocumentCount: onboardingIndex.length,
    optionalDocumentCount: optionalIndex.length,
    documentCount: onboardingIndex.length,
    documents: onboardingIndex,
    optionalFiles: optionalIndex,
  };

  const files = {
    'onboarding-state.json': onboardingState,
    'onboarding-index.json': onboardingIndexJson,
    'coverage-map.json': coverageMap,
    'cross-capsule-map.json': crossCapsuleMap,
    'topic-index.json': topicIndexJson,
    'source-of-truth-map.json': sourceOfTruthMap,
  };

  for (const [name, data] of Object.entries(files)) {
    const out = path.join(packDir, name);
    fs.writeFileSync(out, JSON.stringify(data, null, 2) + '\n');
  }

  const validation = validateMachineReadableLayer({
    packDir,
    manifestEntries,
    includeDna,
    files,
    capsuleInventory,
  });

  onboardingState.validationStatus = validation.pass ? 'pass' : 'fail';
  onboardingState.coverageStatus = validation.coveragePass ? 'pass' : 'partial';
  onboardingState.manifestValidation.allEntriesPresent = validation.missingManifestEntries.length === 0;
  onboardingState.manifestValidation.status = validation.missingManifestEntries.length === 0 ? 'pass' : 'fail';

  fs.writeFileSync(path.join(packDir, 'onboarding-state.json'), JSON.stringify(onboardingState, null, 2) + '\n');

  return { files, onboardingState, validation, fileChecksums, optionalChecksums, perCapsuleCounts };
}

function buildPerCapsuleCounts(manifestEntries, optionalFiles) {
  const folders = {
    'AI Context': 'AI_Context_Capsule',
    'Founder Intelligence': 'Founder_Intelligence_Capsule',
    'Studio DNA': 'Studio_DNA_Capsule',
    'Collaboration Intelligence': 'Collaboration_Intelligence_Capsule',
    'Machine-Readable Index': null,
  };
  const counts = {};
  for (const [label, folder] of Object.entries(folders)) {
    if (!folder) {
      const required = manifestEntries.filter((e) =>
        [
          'onboarding-state.json',
          'onboarding-index.json',
          'coverage-map.json',
          'cross-capsule-map.json',
          'topic-index.json',
          'source-of-truth-map.json',
        ].includes(e.path)
      ).length;
      counts[label] = { requiredFileCount: required, optionalFileCount: 0, totalFileCount: required };
      continue;
    }
    const required = manifestEntries.filter((e) => e.path.startsWith(`${folder}/`)).length;
    const optional = optionalFiles.filter((o) => o.path.startsWith(`${folder}/`)).length;
    counts[label] = { requiredFileCount: required, optionalFileCount: optional, totalFileCount: required + optional };
  }
  const unifiedRequired = manifestEntries.filter(
    (e) =>
      !e.path.includes('_Capsule/') &&
      ![
        'onboarding-state.json',
        'onboarding-index.json',
        'coverage-map.json',
        'cross-capsule-map.json',
        'topic-index.json',
        'source-of-truth-map.json',
      ].includes(e.path)
  ).length;
  counts['Unified Pack Root'] = { requiredFileCount: unifiedRequired, optionalFileCount: 0, totalFileCount: unifiedRequired };
  return counts;
}

/** List relative file paths inside a pack directory or ZIP archive. */
export function listArchiveFiles(target, { isZip = false, packFolderName = null } = {}) {
  let rawPaths;
  if (isZip) {
    const output = execSync(`unzip -Z1 ${JSON.stringify(target)}`, { encoding: 'utf8' });
    rawPaths = output.trim().split('\n').filter(Boolean);
  } else {
    rawPaths = [];
    function walk(dir, prefix = '') {
      for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        const rel = prefix ? `${prefix}/${name}` : name;
        if (fs.statSync(full).isDirectory()) walk(full, rel);
        else rawPaths.push(rel.replace(/\\/g, '/'));
      }
    }
    walk(target);
  }

  const prefix = packFolderName ? `${packFolderName}/` : null;
  return rawPaths
    .map((p) => (prefix && p.startsWith(prefix) ? p.slice(prefix.length) : p))
    .filter((p) => p.length > 0 && !p.endsWith('/'))
    .sort();
}

/**
 * Hard validation: every physical archive file must be inventoried.
 * Fails on unindexed files, missing required/optional files, or count mismatches.
 */
export function validateArchiveInventory({
  target,
  isZip = false,
  packFolderName = null,
  manifestEntries,
  optionalFiles = OPTIONAL_ARCHIVE_FILES,
  generatedMetadataFiles = [],
  perCapsuleCounts = null,
}) {
  const errors = [];
  const files = listArchiveFiles(target, { isZip, packFolderName });

  const requiredPaths = new Set(manifestEntries.map((e) => e.path));
  const optionalPaths = new Set(optionalFiles.map((f) => f.path));
  const generatedPaths = new Set(generatedMetadataFiles);
  const allInventoried = new Set([...requiredPaths, ...optionalPaths, ...generatedPaths]);

  for (const file of files) {
    if (!allInventoried.has(file)) errors.push(`Unindexed archive file: ${file}`);
  }

  for (const p of requiredPaths) {
    if (!files.includes(p)) errors.push(`Missing required file: ${p}`);
  }

  for (const p of optionalPaths) {
    if (!files.includes(p)) errors.push(`Missing declared optional file: ${p}`);
  }

  for (const p of allInventoried) {
    if (!files.includes(p)) errors.push(`Inventoried file missing from archive: ${p}`);
  }

  const requiredFileCount = requiredPaths.size;
  const optionalFileCount = optionalPaths.size;
  const generatedMetadataFileCount = generatedPaths.size;
  const totalInventoriedFileCount = requiredFileCount + optionalFileCount + generatedMetadataFileCount;
  const actualArchiveFileCount = files.length;

  if (actualArchiveFileCount !== totalInventoriedFileCount) {
    errors.push(
      `Archive count mismatch: actualArchiveFileCount=${actualArchiveFileCount}, totalInventoriedFileCount=${totalInventoriedFileCount}`
    );
  }

  if (perCapsuleCounts) {
    for (const [label, expected] of Object.entries(perCapsuleCounts)) {
      const folderMap = {
        'AI Context': 'AI_Context_Capsule',
        'Founder Intelligence': 'Founder_Intelligence_Capsule',
        'Studio DNA': 'Studio_DNA_Capsule',
        'Collaboration Intelligence': 'Collaboration_Intelligence_Capsule',
      };
      const folder = folderMap[label];
      if (!folder) continue;
      const actualRequired = files.filter((f) => f.startsWith(`${folder}/`) && requiredPaths.has(f)).length;
      const actualOptional = files.filter((f) => f.startsWith(`${folder}/`) && optionalPaths.has(f)).length;
      const actualTotal = actualRequired + actualOptional;
      if (actualRequired !== expected.requiredFileCount) {
        errors.push(
          `${label}: required count mismatch (expected ${expected.requiredFileCount}, actual ${actualRequired})`
        );
      }
      if (actualOptional !== expected.optionalFileCount) {
        errors.push(
          `${label}: optional count mismatch (expected ${expected.optionalFileCount}, actual ${actualOptional})`
        );
      }
      if (actualTotal !== expected.totalFileCount) {
        errors.push(`${label}: total count mismatch (expected ${expected.totalFileCount}, actual ${actualTotal})`);
      }
    }
  }

  return {
    pass: errors.length === 0,
    errors,
    files,
    counts: {
      requiredFileCount,
      optionalFileCount,
      generatedMetadataFileCount,
      totalInventoriedFileCount,
      actualArchiveFileCount,
    },
  };
}

export function validateMachineReadableLayer({ packDir, manifestEntries, includeDna, files, capsuleInventory }) {
  const errors = [];

  const REQUIRED_MACHINE_FILES = [
    'onboarding-state.json',
    'onboarding-index.json',
    'coverage-map.json',
    'cross-capsule-map.json',
    'topic-index.json',
    'source-of-truth-map.json',
  ];

  for (const name of REQUIRED_MACHINE_FILES) {
    const fp = path.join(packDir, name);
    if (!fs.existsSync(fp)) errors.push(`Missing machine-readable file: ${name}`);
    else {
      try {
        JSON.parse(fs.readFileSync(fp, 'utf8'));
      } catch {
        errors.push(`Invalid JSON: ${name}`);
      }
    }
  }

  for (const entry of manifestEntries) {
    const fp = path.join(packDir, entry.path);
    const deferredPackFiles = new Set(['MASTER_MANIFEST.md', 'ONBOARDING_PACK_VALIDATION.md', 'onboarding-pack.json']);
    if (deferredPackFiles.has(entry.path)) continue;
    if (!fs.existsSync(fp)) errors.push(`Manifest entry missing on disk: ${entry.path}`);
  }

  const ciCapsule = capsuleInventory.find((c) => c.name === 'Collaboration Intelligence Capsule');
  if (!ciCapsule) errors.push('Collaboration Intelligence Capsule missing from capsule inventory');
  else {
    if (ciCapsule.fileCount < 1) errors.push('Collaboration Intelligence Capsule has no files in manifest');
    const ciInManifest = manifestEntries.some((e) => e.path.startsWith('Collaboration_Intelligence_Capsule/'));
    if (!ciInManifest) errors.push('Collaboration Intelligence Capsule missing from MASTER_MANIFEST entries');
    const ciInCoverage = files['coverage-map.json'].collaborationIntelligenceTopics?.length > 0;
    if (!ciInCoverage) errors.push('Collaboration Intelligence not represented in coverage-map.json');
    const ciInCross = files['cross-capsule-map.json'].concepts.some((c) =>
      c.canonicalOwner.capsule === 'Collaboration Intelligence Capsule'
    );
    if (!ciInCross) errors.push('Collaboration Intelligence missing from cross-capsule-map.json');
    const ciInTopic = files['topic-index.json'].topics.some((t) => t.capsules.includes('Collaboration Intelligence Capsule'));
    if (!ciInTopic) errors.push('Collaboration Intelligence missing from topic-index.json');
    const ciInState = files['onboarding-state.json'].collaborationIntelligence?.required === true;
    if (!ciInState) errors.push('Collaboration Intelligence not marked required in onboarding-state.json');
  }

  const sectionCoverage = new Map(REPORT_SECTIONS.map((s) => [s.id, []]));
  for (const doc of files['onboarding-index.json'].documents) {
    for (const sectionId of doc.reportSectionsSupported ?? []) {
      if (!sectionCoverage.has(sectionId)) continue;
      sectionCoverage.get(sectionId).push(doc.path);
    }
  }
  for (const section of REPORT_SECTIONS) {
    const sources = sectionCoverage.get(section.id) ?? [];
    if (section.id === 'studio-dna-assessment' && !includeDna) {
      if (!sources.some((p) => p.includes('ONBOARDING_REPORT_TEMPLATE'))) {
        errors.push(`Report section "${section.title}" has no answerable source when DNA omitted`);
      }
      continue;
    }
    if (sources.length === 0) errors.push(`Report section "${section.title}" has no answerable document source`);
  }

  for (const doc of files['onboarding-index.json'].documents) {
    for (const ref of doc.crossReferences ?? []) {
      if (ref.endsWith('.json')) {
        const deferredPackFiles = new Set(['onboarding-pack.json']);
        if (deferredPackFiles.has(ref)) continue;
        const jsonPath = path.join(packDir, ref);
        if (!fs.existsSync(jsonPath)) errors.push(`Broken cross-reference: ${doc.path} → ${ref}`);
        continue;
      }
      const deferredPackFiles = new Set(['MASTER_MANIFEST.md', 'ONBOARDING_PACK_VALIDATION.md', 'onboarding-pack.json']);
      if (deferredPackFiles.has(ref)) continue;
      const resolved = ref.includes('/') ? ref : doc.path.replace(/[^/]+$/, ref);
      if (!fs.existsSync(path.join(packDir, resolved)) && !manifestEntries.some((e) => e.path === resolved || e.path.endsWith(`/${ref}`))) {
        // Allow references to optional DNA when not included
        if (resolved.startsWith('Studio_DNA_Capsule/') && !includeDna) continue;
        errors.push(`Broken cross-reference: ${doc.path} → ${ref}`);
      }
    }
  }

  const deferredPackFiles = new Set(['MASTER_MANIFEST.md', 'ONBOARDING_PACK_VALIDATION.md', 'onboarding-pack.json']);
  const missingManifestEntries = manifestEntries
    .filter((e) => !deferredPackFiles.has(e.path))
    .filter((e) => !fs.existsSync(path.join(packDir, e.path)))
    .map((e) => e.path);

  const coveragePass = !files['coverage-map.json'].topics.some((t) => t.status === 'Not Present');

  return {
    pass: errors.length === 0 && missingManifestEntries.length === 0,
    coveragePass,
    errors,
    missingManifestEntries,
    reportSectionCoverage: Object.fromEntries(
      REPORT_SECTIONS.map((s) => [s.id, sectionCoverage.get(s.id) ?? []])
    ),
  };
}

export function validateReportTemplateSections(packDir) {
  const templatePath = path.join(packDir, 'ONBOARDING_REPORT_TEMPLATE.md');
  if (!fs.existsSync(templatePath)) return ['ONBOARDING_REPORT_TEMPLATE.md missing'];
  const body = fs.readFileSync(templatePath, 'utf8');
  const missing = [];
  for (const section of REPORT_SECTIONS) {
    if (!body.includes(section.templateHeading)) missing.push(`Template missing section: ${section.templateHeading}`);
  }
  return missing;
}
