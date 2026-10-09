import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { discoverCodexInterface } from './codex-discovery';
import { attemptCodexDispatch, prepareCodexHandoff, type CodexDispatchRecord } from './codex-dispatch-adapter';
import { runSite00BuildObjectExecutionLoop } from './execution-adapter';
import { resolveFullV2ReviewPackage, writeMissingFullPackageReport } from '../package-ingestion/artifact-intake';
import { dispatchBlenderValidateV2 } from './blender-validate-runner';
import { buildSite00BuildObjectV2Assignment } from './fabrication-assignment';
import type { FabricationAssignmentManifest } from './types';

export type FabricationPipelineResult = {
  fullPackage: Awaited<ReturnType<typeof resolveFullV2ReviewPackage>>;
  codexDiscovery: ReturnType<typeof discoverCodexInterface>;
  codexDispatch: CodexDispatchRecord;
  blenderLoop?: ReturnType<typeof runSite00BuildObjectExecutionLoop>;
  validateV2?: ReturnType<typeof dispatchBlenderValidateV2>;
  fullLoopVerified: false;
  classification: 'PARTIAL_DISPATCH_BLOCKED' | 'PARTIAL_BLENDER_ONLY' | 'BLOCKED';
  reportDir: string;
};

export async function runSite00V2FabricationPipeline(params: {
  reducedFixtureRoot: string;
  runRoot: string;
}): Promise<FabricationPipelineResult> {
  mkdirSync(params.runRoot, { recursive: true });
  const reportDir = join(params.runRoot, 'reports');
  mkdirSync(reportDir, { recursive: true });

  const fullPackage = await resolveFullV2ReviewPackage();
  if (fullPackage.status === 'MISSING') {
    writeMissingFullPackageReport(join(reportDir, 'full-v2-package-intake.json'), fullPackage);
  } else if (fullPackage.status === 'FOUND') {
    writeFileSync(
      join(reportDir, 'full-v2-package-intake.json'),
      JSON.stringify(
        {
          status: fullPackage.status,
          archivePath: fullPackage.archivePath,
          sha256: fullPackage.sha256,
          extractDir: fullPackage.extractDir,
          fileCount: fullPackage.inventory.fileCount,
          missingFromFullReviewPackage: fullPackage.inventory.missingFromFullReviewPackage,
        },
        null,
        2
      )
    );
  } else {
    writeFileSync(join(reportDir, 'full-v2-package-intake.json'), JSON.stringify(fullPackage, null, 2));
  }

  const packageRoot =
    fullPackage.status === 'FOUND' ? fullPackage.extractDir : params.reducedFixtureRoot;

  const codexDiscovery = discoverCodexInterface({ runAuthProbe: true });
  writeFileSync(join(reportDir, 'codex-interface-report.json'), JSON.stringify(codexDiscovery, null, 2));

  const assignmentStub = {
    assignmentId: `pipeline-${Date.now()}`,
    packageRoot,
    returnRoot: join(params.runRoot, 'codex-return'),
  };

  let codexDispatch: CodexDispatchRecord;
  if (codexDiscovery.authStatus !== 'VERIFIED') {
    codexDispatch = prepareCodexHandoff({
      ...buildMinimalAssignment(assignmentStub),
    });
    codexDispatch.state = 'AWAITING_EXTERNAL_EXECUTION';
    codexDispatch.errors.push(codexDiscovery.authBlocker ?? 'Codex auth not verified');
  } else {
    codexDispatch = attemptCodexDispatch(buildMinimalAssignment(assignmentStub), join(params.runRoot, 'codex-work'));
  }
  writeFileSync(join(reportDir, 'codex-dispatch-record.json'), JSON.stringify(codexDispatch, null, 2));

  const validateV2 =
    fullPackage.status === 'FOUND'
      ? dispatchBlenderValidateV2(packageRoot, join(params.runRoot, 'validate-v2-logs'))
      : { status: 'BLOCKED' as const, reason: 'Full package required for validate_v2.py (needs High GLB + FBX)' };

  const blenderLoop = runSite00BuildObjectExecutionLoop({
    packageRoot: params.reducedFixtureRoot,
    runRoot: join(params.runRoot, 'blender-local-loop'),
  });

  writeFileSync(
    join(reportDir, 'pipeline-summary.json'),
    JSON.stringify(
      {
        fullLoopVerified: false,
        codexDispatchVerified: codexDispatch.state === 'DISPATCHED' || codexDispatch.state === 'OUTPUT_PENDING',
        blenderVerified: blenderLoop.evidence.blenderExecuted,
        founderReview: 'PENDING — V2 REVISE',
      },
      null,
      2
    )
  );

  return {
    fullPackage,
    codexDiscovery,
    codexDispatch,
    blenderLoop,
    validateV2,
    fullLoopVerified: false,
    classification: 'PARTIAL_DISPATCH_BLOCKED',
    reportDir,
  };
}

function buildMinimalAssignment(stub: {
  assignmentId: string;
  packageRoot: string;
  returnRoot: string;
}): FabricationAssignmentManifest {
  return buildSite00BuildObjectV2Assignment({
    assignmentId: stub.assignmentId,
    packageRoot: stub.packageRoot,
    returnRoot: stub.returnRoot,
  });
}
