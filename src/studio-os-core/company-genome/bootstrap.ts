import { bootstrapCompanyGenomeStore } from './store';
import type { CompanyGenomeStore } from './types';

export function buildCompanyGenomeSeed(): Partial<CompanyGenomeStore> {
  return {
    companyName: 'NDXBOOK',
    dashboard: {
      summary: 'COMPANY GENOME V1.0 — living organizational genetics · watch your company evolve · the heartbeat of the organization.',
      unifiedHealthPct: 83,
      resiliencePct: 79,
      maturityPct: 78,
      innovationPct: 81,
      growthPct: 76,
      activeZoomLevel: 'company',
    },
    activeWorkspaceId: 'ndxbook',
    geneticLayers: [
      { id: 'company-dna', label: 'COMPANY DNA', healthPct: 85, maturityPct: 82, confidencePct: 88, growthPct: 74, inheritance: 'Mission · vision · values · 100K readers', organizationalImpact: 'Strategic north star · all architects inherit' },
      { id: 'creative-dna', label: 'CREATIVE DNA', healthPct: 88, maturityPct: 86, confidencePct: 92, growthPct: 70, inheritance: 'Writing Bible · stat-forward · Photography Bible', organizationalImpact: 'Brand Architect · visual consistency' },
      { id: 'writing-dna', label: 'WRITING DNA', healthPct: 91, maturityPct: 89, confidencePct: 93, growthPct: 68, inheritance: 'Futura · Grace metrics · no hype voice', organizationalImpact: 'All copy · newsroom · CoS approval' },
      { id: 'leadership-dna', label: 'LEADERSHIP DNA', healthPct: 78, maturityPct: 76, confidencePct: 85, growthPct: 72, inheritance: 'CoS · delegation · executive org', organizationalImpact: 'Decision quality · founder bottleneck risk' },
      { id: 'operational-dna', label: 'OPERATIONAL DNA', healthPct: 74, maturityPct: 71, confidencePct: 80, growthPct: 78, inheritance: 'Work orchestration · newsroom QA · editorial cadence', organizationalImpact: 'Execution · automation opportunities' },
    ],
    geneticRelationships: [
      { id: 'gr-1', fromSystem: 'Leadership DNA', toSystem: 'Company DNA', influence: 'Decision framework · strategic alignment', strengthPct: 92 },
      { id: 'gr-2', fromSystem: 'Company DNA', toSystem: 'Brand Architect', influence: 'Purpose · values · positioning', strengthPct: 88 },
      { id: 'gr-3', fromSystem: 'Brand Architect', toSystem: 'Experience Architect', influence: 'Identity · voice · visual system', strengthPct: 86 },
      { id: 'gr-4', fromSystem: 'Experience Architect', toSystem: 'Digital Architect', influence: 'Journey · emotional architecture', strengthPct: 84 },
      { id: 'gr-5', fromSystem: 'Digital Architect', toSystem: 'Relationship Engine', influence: 'Touchpoints · CX · nurture paths', strengthPct: 82 },
      { id: 'gr-6', fromSystem: 'Relationship Engine', toSystem: 'Reader Graph', influence: 'Nurture · advocacy · loyalty', strengthPct: 90 },
      { id: 'gr-7', fromSystem: 'Reader Graph', toSystem: 'Knowledge Graph', influence: 'Behavior · interests · lineage', strengthPct: 87 },
      { id: 'gr-8', fromSystem: 'Growth Architect', toSystem: 'Company Genome', influence: 'Initiatives · lifecycle · compound growth', strengthPct: 85 },
      { id: 'gr-9', fromSystem: 'Knowledge Asset Engine', toSystem: 'Knowledge Graph', influence: 'SSOT · evolution · institutional memory', strengthPct: 91 },
    ],
    evolutionTimeline: [
      { id: 'evo-1', date: '2024-01', category: 'FOUNDING', label: 'NDXBOOK FOUNDED · AUTHORITY VISION', impact: 'Company DNA seeded' },
      { id: 'evo-2', date: '2024-06', category: 'LAUNCH', label: 'NEWSROOM · PAGE STRATEGY', impact: 'Writing DNA · Creative DNA active' },
      { id: 'evo-3', date: '2025-03', category: 'INNOVATION', label: 'STUDIO OS PLATFORM', impact: 'Operational DNA · genome expands' },
      { id: 'evo-4', date: '2025-09', category: 'RELATIONSHIP', label: 'READER GRAPH · RELATIONSHIP ENGINE', impact: 'Relationship evolution · reader graph' },
      { id: 'evo-5', date: '2026-01', category: 'KNOWLEDGE', label: 'KNOWLEDGE ASSET ENGINE', impact: 'Knowledge evolution · 847+ assets' },
      { id: 'evo-6', date: '2026-07', category: 'ARCHITECT', label: 'ARCHITECT CHAIN · COMPANY GENOME', impact: 'Full genetic map · living visualization' },
      { id: 'evo-7', date: '2026-Q4', category: 'GROWTH', label: '100K READERS MILESTONE', impact: 'Growth genome · authority goal' },
    ],
    healthDimensions: [
      { id: 'hd-1', dimension: 'CLARITY', scorePct: 88 },
      { id: 'hd-2', dimension: 'LEADERSHIP', scorePct: 78 },
      { id: 'hd-3', dimension: 'INNOVATION', scorePct: 81 },
      { id: 'hd-4', dimension: 'KNOWLEDGE', scorePct: 91 },
      { id: 'hd-5', dimension: 'RELATIONSHIPS', scorePct: 86 },
      { id: 'hd-6', dimension: 'CUSTOMER EXPERIENCE', scorePct: 82 },
      { id: 'hd-7', dimension: 'BRAND CONSISTENCY', scorePct: 88 },
      { id: 'hd-8', dimension: 'EXECUTION', scorePct: 74 },
      { id: 'hd-9', dimension: 'FINANCIAL RESILIENCE', scorePct: 65 },
      { id: 'hd-10', dimension: 'AUTOMATION', scorePct: 70 },
      { id: 'hd-11', dimension: 'ORG INTELLIGENCE', scorePct: 81 },
    ],
    intelligenceAlerts: [
      { id: 'gi-1', category: 'LEADERSHIP', signal: 'Founder bottleneck · approval plateau at 78%', recommendation: 'Leadership DNA expansion · CoS delegation', priority: 'high' },
      { id: 'gi-2', category: 'KNOWLEDGE', signal: 'Knowledge maturity 91% · institutional leader', recommendation: 'Cross-brand KG linking · FS integration', priority: 'medium' },
      { id: 'gi-3', category: 'BRAND', signal: 'Brand drift risk · FS partially siloed', recommendation: 'Organizational inheritance · genetic blend', priority: 'medium' },
      { id: 'gi-4', category: 'EXPERIENCE', signal: 'Commerce/media CX split · 72% maturity', recommendation: 'Experience Architect · unified journey', priority: 'high' },
      { id: 'gi-5', category: 'GROWTH', signal: '100K readers trajectory on track', recommendation: 'Growth Architect · relationship compound', priority: 'low' },
    ],
    resilienceMetrics: [
      { id: 'res-1', metric: 'ADAPTABILITY', scorePct: 82, trend: 'rising' },
      { id: 'res-2', metric: 'LEARNING VELOCITY', scorePct: 88, trend: 'rising' },
      { id: 'res-3', metric: 'DECISION QUALITY', scorePct: 79, trend: 'stable' },
      { id: 'res-4', metric: 'KNOWLEDGE RETENTION', scorePct: 91, trend: 'rising' },
      { id: 'res-5', metric: 'ORGANIZATIONAL MEMORY', scorePct: 89, trend: 'rising' },
      { id: 'res-6', metric: 'LEADERSHIP SUCCESSION', scorePct: 62, trend: 'stable' },
      { id: 'res-7', metric: 'CROSS-FUNCTIONAL COLLAB', scorePct: 76, trend: 'rising' },
    ],
    fingerprint: {
      uniquenessScore: 87,
      competitiveDifferentiation: ['Stat-forward authority · calm executive design', 'Knowledge compounds · not viral moments', 'Studio OS architect chain · organizational genetics'],
      geneticStrengths: ['Writing DNA 91% · voice consistency', 'Knowledge 91% · institutional memory', 'Relationship engine · reader graph maturity'],
      rareCapabilities: ['Full architect pipeline M52-M57', 'Knowledge Asset Engine · SSOT model', 'Company Genome living visualization'],
      institutionalAdvantages: ['847+ knowledge assets · compounding IP', 'Labs-validated templates · CoS governance', 'Multi-brand workspace · inheritance ready'],
    },
    simulations: [
      { id: 'sim-1', scenario: 'NEW CMO EXECUTIVE', genomeImpact: 'Marketing DNA +12% · leadership alignment shift', healthDeltaPct: 6, resilienceDeltaPct: 4, confidencePct: 82, recommendations: ['Inherit Leadership DNA · 90-day integration'] },
      { id: 'sim-2', scenario: 'FRONTAL SLAYER ACQUISITION BLEND', genomeImpact: 'Creative DNA blend · commerce accent · portfolio genetics', healthDeltaPct: 8, resilienceDeltaPct: 5, confidencePct: 74, recommendations: ['Organizational inheritance · genetic compatibility check'] },
      { id: 'sim-3', scenario: 'INTERNATIONAL EXPANSION', genomeImpact: 'Writing DNA localization · relationship graph expansion', healthDeltaPct: 4, resilienceDeltaPct: 3, confidencePct: 68, recommendations: ['Phase after 100K domestic · brand consistency guardrails'] },
    ],
    crossCompanyGenetics: [
      { id: 'cc-1', company: 'NDXBOOK', sharedGenetics: ['Studio OS platform', 'CoS governance', 'Knowledge graph'], uniqueGenetics: ['Stat-forward media', '100K readers', 'Editorial cadence'], overlapPct: 45 },
      { id: 'cc-2', company: 'FRONTAL SLAYER', sharedGenetics: ['Creative DNA', 'Photography Bible', 'Commerce stack'], uniqueGenetics: ['Luxury commerce', 'Build-a-Wig', 'NOIR live preview'], overlapPct: 38 },
      { id: 'cc-3', company: 'STUDIO OS', sharedGenetics: ['Architect modules', 'Motherboard', 'Agent orchestration'], uniqueGenetics: ['Platform shell', 'Module registry', 'Workspace creation'], overlapPct: 62 },
    ],
    knowledgeFlow: [
      { id: 'kf-1', from: 'Newsroom', to: 'Knowledge Asset Engine', flowType: 'Page → SSOT asset', strengthPct: 92 },
      { id: 'kf-2', from: 'Knowledge Asset Engine', to: 'Knowledge Graph', flowType: 'Lineage · evolution', strengthPct: 91 },
      { id: 'kf-3', from: 'Distribution Engine', to: 'Reader Graph', flowType: 'Engagement signals', strengthPct: 86 },
      { id: 'kf-4', from: 'Reader Graph', to: 'Relationship Engine', flowType: 'Journey · nurture', strengthPct: 90 },
      { id: 'kf-5', from: 'Strategy Engine', to: 'Campaign Engine', flowType: 'Initiative → execution', strengthPct: 88 },
      { id: 'kf-6', from: 'Motherboard', to: 'All Agents', flowType: 'Institutional memory', strengthPct: 85 },
    ],
    futureOpportunities: [
      'Portfolio genome comparison · holding company intelligence',
      'Real-time genetic mutation on every CoS decision',
      'Cross-company knowledge inheritance visualization',
      'Decade evolution replay · watch organization strengthen',
    ],
  };
}

export function bootstrapCompanyGenomePlatform(): void {
  bootstrapCompanyGenomeStore(buildCompanyGenomeSeed());
}
