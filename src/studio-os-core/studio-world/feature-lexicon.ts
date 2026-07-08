/**
 * Studio World™ V4 — Feature Law: software features become architectural destinations.
 */

export type FeatureLexiconEntry = {
  formerName: string;
  architecturalName: string;
  physicalType: string;
  notes?: string;
};

export const STUDIO_WORLD_FEATURE_LEXICON: FeatureLexiconEntry[] = [
  { formerName: 'Pipeline', architecturalName: 'Production Wall™', physicalType: 'room' },
  { formerName: 'Hiring', architecturalName: 'Talent Theater™', physicalType: 'theater' },
  { formerName: 'Calendar', architecturalName: 'Scheduling Observatory™', physicalType: 'observatory' },
  { formerName: 'Notifications', architecturalName: 'Command Broadcast Center™', physicalType: 'room' },
  { formerName: 'Analytics', architecturalName: 'Performance Observatory™', physicalType: 'observatory' },
  { formerName: 'Settings', architecturalName: 'Control Room™', physicalType: 'room' },
  { formerName: 'Media Library', architecturalName: 'Media Vault™', physicalType: 'vault' },
  { formerName: 'Files', architecturalName: 'Archive Room™', physicalType: 'room' },
  { formerName: 'Integrations', architecturalName: 'Systems Dock™', physicalType: 'room' },
  { formerName: 'Reports', architecturalName: 'Executive Briefing Room™', physicalType: 'room' },
  { formerName: 'Marketplace', architecturalName: 'Marketplace Pavilion™', physicalType: 'pavilion' },
  { formerName: 'Asset Library', architecturalName: 'Studio Warehouse™', physicalType: 'workshop', notes: 'Manufacture · Assemble · Reuse — not Archives' },
  { formerName: 'Dashboard', architecturalName: 'Command Center™', physicalType: 'command-center' },
  { formerName: 'Publishing Queue', architecturalName: 'Distribution Dock™', physicalType: 'room' },
  { formerName: 'Blueprint Manager', architecturalName: 'Blueprint Archive™', physicalType: 'library' },
  { formerName: 'Asset Factory', architecturalName: 'Generation Bay™', physicalType: 'laboratory' },
  { formerName: 'Knowledge Hub', architecturalName: 'Knowledge Library™', physicalType: 'library' },
  { formerName: 'Legacy System', architecturalName: 'Museum Wing™', physicalType: 'museum' },
  { formerName: 'Mission Control', architecturalName: 'Studio Command Center™', physicalType: 'command-center' },
  { formerName: 'Overview / Hub', architecturalName: 'Campus Map Atrium™', physicalType: 'atrium' },
];

export function resolveArchitecturalName(formerName: string): string {
  const hit = STUDIO_WORLD_FEATURE_LEXICON.find(
    (e) => e.formerName.toLowerCase() === formerName.toLowerCase()
  );
  return hit?.architecturalName ?? formerName;
}
