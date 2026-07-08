import type { FounderGenomeSnapshot, CollaborationGenome } from './types';
import { GENOME_LAYER_LABELS } from './constants';

function orgSeed(organizationId: string, salt: string): number {
  let h = 0;
  const s = organizationId + salt;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 100;
}

export function buildFounderGenomeSnapshot(
  organizationId: string,
  companyName: string
): FounderGenomeSnapshot {
  const seed = orgSeed(organizationId, 'genome');
  const strengths = [
    ['Luxury Design', 'Spatial Composition', 'Material Storytelling'],
    ['Automation', 'Workflow Systems', 'Operational Intelligence'],
    ['Customer Psychology', 'Journey Design', 'Conversion Narrative'],
    ['Architecture', 'Campus Planning', 'Immersive Environments'],
    ['Brand Strategy', 'Visual Identity', 'Campaign Architecture'],
    ['Creative Direction', 'Scene Stack', 'Parallel Futures'],
  ];
  const pick = strengths[seed % strengths.length]!;

  return {
    founderId: `founder-${organizationId}`,
    founderName: 'Founder',
    organizationId,
    organizationName: companyName,
    layers: {
      'company-genome': [`${companyName} identity · mission alignment`],
      'creative-genome': [pick[0]!, pick[1]!],
      'experience-genome': ['Immersive navigation', 'Founder-first workflows'],
      'innovation-profile': ['Co-invention ready', 'Marketplace publishing enabled'],
      'blueprint-library': [`${3 + (seed % 5)} approved blueprints`],
      'creative-portfolio': [`${2 + (seed % 4)} golden builds`],
    },
    primaryStrengths: pick,
  };
}

export function buildDemoPartnerGenomes(organizationId: string): FounderGenomeSnapshot[] {
  const partners: FounderGenomeSnapshot[] = [
    {
      founderId: 'founder-luxury-atelier',
      founderName: 'Elena Voss',
      organizationId: 'luxury-atelier',
      organizationName: 'Luxury Atelier Co.',
      layers: {
        'creative-genome': ['Luxury retail environments', 'Haute material palettes'],
        'innovation-profile': ['Marketplace bestseller patterns'],
      },
      primaryStrengths: ['Luxury Design', 'Retail Experience', 'Lighting'],
    },
    {
      founderId: 'founder-automation-lab',
      founderName: 'Marcus Chen',
      organizationId: 'automation-lab',
      organizationName: 'Automation Lab™',
      layers: {
        'creative-genome': ['Workflow automation', 'Systems orchestration'],
        'innovation-profile': ['Joint AI Systems™'],
      },
      primaryStrengths: ['Automation', 'Programming', 'Systems'],
    },
    {
      founderId: 'founder-psychology-studio',
      founderName: 'Dr. Amara Okonkwo',
      organizationId: 'psychology-studio',
      organizationName: 'Psychology Studio™',
      layers: {
        'experience-genome': ['Customer psychology', 'Behavioral journeys'],
        'innovation-profile': ['Joint Expeditions™'],
      },
      primaryStrengths: ['Customer Psychology', 'Storytelling', 'Brand Strategy'],
    },
    {
      founderId: 'founder-campus-architects',
      founderName: 'James Whitfield',
      organizationId: 'campus-architects',
      organizationName: 'Campus Architects™',
      layers: {
        'creative-genome': ['Architecture', 'Campus master planning'],
        'blueprint-library': ['12 joint-ready blueprints'],
      },
      primaryStrengths: ['Architecture', 'Creative Direction', 'Operations'],
    },
  ];
  return partners.filter((p) => p.organizationId !== organizationId);
}

export function combineCollaborationGenome(
  sessionId: string,
  founders: FounderGenomeSnapshot[]
): CollaborationGenome {
  const combined = new Set<string>();
  founders.forEach((f) => f.primaryStrengths.forEach((s) => combined.add(s)));

  const layerParts = founders
    .map((f) => {
      const layers = Object.entries(f.layers)
        .slice(0, 2)
        .map(([k, v]) => `${GENOME_LAYER_LABELS[k as keyof typeof GENOME_LAYER_LABELS]}: ${v?.join(', ')}`);
      return `${f.founderName} — ${layers.join(' · ')}`;
    })
    .join(' | ');

  return {
    id: `cgenome-${sessionId}`,
    sessionId,
    combinedStrengths: [...combined],
    layerSummary: layerParts,
    founderSnapshots: founders,
    createdAt: new Date().toISOString(),
    active: true,
  };
}

export function summarizeCollaborationGenome(genome: CollaborationGenome): string {
  const names = genome.founderSnapshots.map((f) => f.founderName).join(', ');
  return `Collaboration Genome™ — ${names} combined: ${genome.combinedStrengths.slice(0, 4).join(' · ')}.`;
}
