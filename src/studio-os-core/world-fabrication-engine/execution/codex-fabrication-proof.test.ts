import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { activateProductionPipeline } from './execution-bridge';

const FIXTURE = join(import.meta.dirname, '../benchmarks/site00-build-object-v2/fixture');
const RUN_ROOT = join(import.meta.dirname, '../benchmarks/site00-build-object-v2/execution-runs/pipeline-activation1');

describe('WFE production pipeline activation proof', () => {
  it.skipIf(!existsSync(join(FIXTURE, '01_SOURCE/SITE00_Build_Object_V2.blend')))(
    'activateProductionPipeline — Codex if authed else handoff + Blender proof',
    async () => {
      const result = await activateProductionPipeline({
        reducedFixtureRoot: FIXTURE,
        runRoot: RUN_ROOT,
      });

      expect(result.codexInterface.interfaceName).toBe('@openai/codex');
      expect(result.blenderLocal.evidence.blenderExecuted).toBe(true);
      expect(result.blenderViaCodex).toBe(false);
      expect(result.founderReview).toBe('PENDING — V2 REVISE');

      if (result.codexInterface.authStatus !== 'VERIFIED') {
        expect(result.realCodexDispatch).toBe(false);
        expect(result.realCodexExecution).toBe(false);
        expect(result.fullLoopVerified).toBe(false);
        expect(result.requiredFounderAction).toContain('OPENAI_API_KEY');
        expect(result.handoffBundlePath).toBeTruthy();
        expect(existsSync(join(result.handoffBundlePath!, 'RUN_EXTERNAL_CODEX_HANDOFF.sh'))).toBe(true);
      } else {
        expect(result.realCodexDispatch).toBe(true);
      }

      expect(existsSync(join(result.reportDir, 'pipeline-activation-result.json'))).toBe(true);
    },
    900_000
  );
});
