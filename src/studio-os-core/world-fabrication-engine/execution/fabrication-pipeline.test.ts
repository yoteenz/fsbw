import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { runSite00V2FabricationPipeline } from './fabrication-pipeline';

const FIXTURE = join(import.meta.dirname, '../benchmarks/site00-build-object-v2/fixture');
const RUN_ROOT = join(import.meta.dirname, '../benchmarks/site00-build-object-v2/execution-runs/codex-dispatch-integration1');

describe('fabrication pipeline integration', () => {
  it.skipIf(!existsSync(join(FIXTURE, '01_SOURCE/SITE00_Build_Object_V2.blend')))(
    'runs pipeline and writes reports (dispatch blocked, blender verified)',
    async () => {
      const result = await runSite00V2FabricationPipeline({
        reducedFixtureRoot: FIXTURE,
        runRoot: RUN_ROOT,
      });
      expect(result.fullLoopVerified).toBe(false);
      expect(result.classification).toBe('PARTIAL_DISPATCH_BLOCKED');
      expect(result.codexDiscovery.interfaceName).toBe('@openai/codex');
      expect(result.codexDispatch.state).toBe('AWAITING_EXTERNAL_EXECUTION');
      expect(result.blenderLoop?.evidence.blenderExecuted).toBe(true);
      expect(existsSync(join(RUN_ROOT, 'reports/codex-interface-report.json'))).toBe(true);
    },
    180_000
  );
});
