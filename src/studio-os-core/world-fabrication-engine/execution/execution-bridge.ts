import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { discoverCodexInterface } from './codex-discovery';
import {
  attemptCodexDispatch,
  prepareCodexHandoff,
  type CodexDispatchRecord,
} from './codex-dispatch-adapter';
import { buildSite00BuildObjectV2Assignment } from './fabrication-assignment';
import { runSite00BuildObjectExecutionLoop, verifyExecutionOutputs } from './execution-adapter';
import { ingestFabricationAssetPackage } from '../package-ingestion/ingest-workflow';
import { resolveFullV2ReviewPackage } from '../package-ingestion/artifact-intake';
import type { FabricationAssignmentManifest } from './types';

export type PipelineActivationResult = {
  prReconciliation: { pr49: 'OPEN'; pr50: 'OPEN'; pr51: 'OPEN'; pr52: 'OPEN'; note: string };
  codexInterface: ReturnType<typeof discoverCodexInterface>;
  codexDispatch: CodexDispatchRecord;
  realCodexDispatch: boolean;
  realCodexExecution: boolean;
  blenderLocal: ReturnType<typeof runSite00BuildObjectExecutionLoop>;
  blenderViaCodex: false;
  returnIngestionFromCodex: boolean;
  fullLoopVerified: boolean;
  fullV2Package: 'AVAILABLE' | 'MISSING';
  founderReview: 'PENDING — V2 REVISE';
  handoffBundlePath?: string;
  reportDir: string;
  exactMissingConnection?: string;
  requiredFounderAction?: string;
  nextStepAfterUnblock?: string;
};

function writeExternalHandoffBundle(
  assignment: FabricationAssignmentManifest,
  dispatch: CodexDispatchRecord,
  outDir: string
): string {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'fabrication-assignment.json'), JSON.stringify(assignment, null, 2));
  writeFileSync(join(outDir, 'codex-dispatch-record.json'), JSON.stringify(dispatch, null, 2));
  const runner = join(
    process.cwd(),
    'src/studio-os-core/world-fabrication-engine/execution/blender/wfe_blender_benchmark_runner.py'
  );
  const script = `#!/usr/bin/env bash
# Run on a machine with OPENAI_API_KEY and Blender 5.2.2+ (WFE_CODEX_BIN optional).
set -euo pipefail
export WFE_PACKAGE_ROOT="${assignment.packageRoot}"
export WFE_RETURN_ROOT="${assignment.returnRoot}"
mkdir -p "$WFE_RETURN_ROOT"
npx --yes @openai/codex exec "Bounded WFE task: run Blender 5.2 headless with --python ${runner} using env WFE_PACKAGE_ROOT and WFE_RETURN_ROOT. Do not modify creative geometry. Return only when report JSON exists."
echo "Then ingest: npm run wfe:codex-fabrication-proof"
`;
  writeFileSync(join(outDir, 'RUN_EXTERNAL_CODEX_HANDOFF.sh'), script);
  return outDir;
}

/**
 * Single activation entry — Codex path when auth verified; otherwise external handoff + local Blender proof.
 */
export async function activateProductionPipeline(params: {
  reducedFixtureRoot: string;
  runRoot: string;
}): Promise<PipelineActivationResult> {
  mkdirSync(params.runRoot, { recursive: true });
  const reportDir = join(params.runRoot, 'reports');
  mkdirSync(reportDir, { recursive: true });

  const full = await resolveFullV2ReviewPackage();
  const fullV2Package = full.status === 'FOUND' ? 'AVAILABLE' : 'MISSING';

  const assignment = buildSite00BuildObjectV2Assignment({
    assignmentId: `activation-${Date.now()}`,
    packageRoot: params.reducedFixtureRoot,
    returnRoot: join(params.runRoot, 'codex-return'),
  });
  writeFileSync(join(reportDir, 'fabrication-assignment.json'), JSON.stringify(assignment, null, 2));

  const codexInterface = discoverCodexInterface({ runAuthProbe: true });
  writeFileSync(join(reportDir, 'codex-capability-assessment.json'), JSON.stringify(codexInterface, null, 2));

  let codexDispatch = prepareCodexHandoff(assignment);
  let realCodexDispatch = false;
  let realCodexExecution = false;
  let returnIngestionFromCodex = false;
  let handoffBundlePath: string | undefined;
  let exactMissingConnection: string | undefined;
  let requiredFounderAction: string | undefined;
  let nextStepAfterUnblock: string | undefined;

  if (codexInterface.authStatus === 'VERIFIED') {
    codexDispatch = attemptCodexDispatch(assignment, join(params.runRoot, 'codex-work'));
    realCodexDispatch =
      codexDispatch.state === 'DISPATCHED' ||
      codexDispatch.state === 'OUTPUT_PENDING' ||
      codexDispatch.state === 'OUTPUT_RECEIVED';
    realCodexExecution = Boolean(codexDispatch.codexJobId && codexDispatch.executionReceiptPath);
    if (realCodexExecution && existsSync(assignment.returnRoot)) {
      const verify = verifyExecutionOutputs(assignment.returnRoot);
      if (verify.ok) {
        const ingested = ingestFabricationAssetPackage({
          projectId: 'site00',
          assetId: 'site00_bld_object_v2_codex_return',
          productionProfileId: 'SITE00_BUILD_OBJECT_WEB_3D',
          packageRoot: assignment.returnRoot,
          outputReportsDir: join(params.runRoot, 'codex-ingestion-reports'),
        });
        returnIngestionFromCodex = ingested.outcome === 'INGESTED' || ingested.outcome === 'INGESTED_WITH_WARNINGS';
        codexDispatch.state = returnIngestionFromCodex ? 'READY_FOR_REVIEW' : 'VALIDATING';
      }
    }
  } else {
    codexDispatch.state = 'AWAITING_EXTERNAL_EXECUTION';
    codexDispatch.errors.push(codexInterface.authBlocker ?? 'Codex authentication not verified');
    handoffBundlePath = writeExternalHandoffBundle(
      assignment,
      codexDispatch,
      join(params.runRoot, 'external-handoff')
    );
    exactMissingConnection = 'OpenAI API authentication for @openai/codex CLI (401 without OPENAI_API_KEY)';
    requiredFounderAction =
      'In Cursor → Project Settings → Cloud Agent → Secrets, add secret name OPENAI_API_KEY with a valid OpenAI API key authorized for Codex, then re-run: npm run wfe:codex-fabrication-proof';
    nextStepAfterUnblock =
      'npm run wfe:codex-fabrication-proof (same command — will attempt real codex exec and ingest codex-return/)';
  }

  writeFileSync(join(reportDir, 'codex-dispatch-record.json'), JSON.stringify(codexDispatch, null, 2));

  const blenderLocal = runSite00BuildObjectExecutionLoop({
    packageRoot: params.reducedFixtureRoot,
    runRoot: join(params.runRoot, 'blender-local-proof'),
  });

  const fullLoopVerified =
    realCodexDispatch && realCodexExecution && returnIngestionFromCodex && blenderLocal.evidence.returnIngested;

  const result: PipelineActivationResult = {
    prReconciliation: {
      pr49: 'OPEN',
      pr50: 'OPEN',
      pr51: 'OPEN',
      pr52: 'OPEN',
      note: 'Stack #49→#53 open; merge requires founder/repo approval — continued on stacked branch',
    },
    codexInterface,
    codexDispatch,
    realCodexDispatch,
    realCodexExecution,
    blenderLocal,
    blenderViaCodex: false,
    returnIngestionFromCodex,
    fullLoopVerified,
    fullV2Package,
    founderReview: 'PENDING — V2 REVISE',
    handoffBundlePath,
    reportDir,
    exactMissingConnection,
    requiredFounderAction,
    nextStepAfterUnblock,
  };

  writeFileSync(join(reportDir, 'pipeline-activation-result.json'), JSON.stringify(result, null, 2));
  return result;
}
