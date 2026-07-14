import { buildStudioWorldIconManifest } from '../studio-world-icon-system/StudioWorldIconManifest';
import type { StudioWorldIconDefinition } from '../studio-world-icon-system/StudioWorldIconDefinition';
import type { IconSheetProfile } from './IconSheetProfiles';
import type { IconManufacturingQaReport } from './IconManufacturingQA';
import { appendVersionEntry } from './IconManufacturingVersionHistory';
import { recordManufacturingEvent } from './IconManufacturingHistory';

export type IconBatchExportPlan = {
  sheetId: string;
  category: string;
  iconCount: number;
  outputDir: string;
  buildScript: string;
  steps: string[];
  manifestChecksum: string;
  qaSummary: { pass: number; warn: number; fail: number };
  certificationReady: boolean;
  generatedAt: string;
};

export type IconBatchExportResult = {
  plan: IconBatchExportPlan;
  versionId: string;
  historyEventId: string;
  instructions: string[];
};

export function buildBatchExportPlan(
  profile: IconSheetProfile,
  qaReport: IconManufacturingQaReport,
  _iconDefinitions: StudioWorldIconDefinition[],
): IconBatchExportPlan {
  const manifest = buildStudioWorldIconManifest();
  const certificationReady = qaReport.fail === 0;

  return {
    sheetId: profile.id,
    category: profile.category,
    iconCount: profile.grid.iconCount,
    outputDir: profile.outputDir,
    buildScript: profile.buildScript,
    steps: [
      'Master Sheet',
      'Slice',
      'Optimize',
      'Compress',
      'Generate PNG',
      'Generate SVG Placeholder',
      'Create Metadata',
      'Register Assets',
      'Checksum',
      'Manifest',
      'QA',
      'Certification Ready',
    ],
    manifestChecksum: manifest.checksum,
    qaSummary: { pass: qaReport.pass, warn: qaReport.warn, fail: qaReport.fail },
    certificationReady,
    generatedAt: new Date().toISOString(),
  };
}

export function executeBatchExportPlan(
  profile: IconSheetProfile,
  plan: IconBatchExportPlan,
  author = 'founder',
): IconBatchExportResult {
  const version = appendVersionEntry({
    sheetId: profile.id,
    version: profile.version,
    author,
    notes: `Batch export — ${plan.iconCount} icons`,
    changes: plan.steps,
    exportPath: plan.outputDir,
  });

  const historyEvent = recordManufacturingEvent({
    sheetId: profile.id,
    type: 'exported',
    actor: author,
    summary: `Batch export planned for ${plan.iconCount} icons`,
    details: { qa: plan.qaSummary, certificationReady: plan.certificationReady },
  });

  const instructions = [
    `1. Commit calibration JSON for ${profile.label}`,
    `2. Run: ${profile.buildScript}`,
    `3. Review QA report (${plan.qaSummary.pass} pass / ${plan.qaSummary.warn} warn / ${plan.qaSummary.fail} fail)`,
    plan.certificationReady
      ? '4. Proceed to Founder Review → Certification'
      : '4. Fix FAIL items before certification',
    '5. Promote certified category via Production Promotion (founder approval required)',
  ];

  return { plan, versionId: version.id, historyEventId: historyEvent.id, instructions };
}
