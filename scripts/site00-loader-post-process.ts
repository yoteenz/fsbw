/**
 * SITE 00 loader geometry post-processing CLI.
 * Usage:
 *   npx tsx scripts/site00-loader-post-process.ts inspect
 *   npx tsx scripts/site00-loader-post-process.ts submit [modelId]
 *   npx tsx scripts/site00-loader-post-process.ts poll [jobId]
 *   npx tsx scripts/site00-loader-post-process.ts status
 */
import { ensureLoaderGeometryAssetsRegistered, getLoaderPipelineContext } from '../api/_lib/site00Assts/postProcess/loaderGeometry.js';
import {
  pollLoaderPostProcessJob,
  pollPendingLoaderPostProcessJobs,
  submitLoaderBackgroundRemoval,
} from '../api/_lib/site00Assts/postProcess/pipeline.js';

const cmd = process.argv[2] ?? 'status';
const arg = process.argv[3];

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  if (cmd === 'inspect' || cmd === 'status') {
    await ensureLoaderGeometryAssetsRegistered();
    const ctx = await getLoaderPipelineContext();
    console.log(JSON.stringify(ctx, null, 2));
    return;
  }

  if (cmd === 'submit') {
    const modelId = arg ?? 'bria/video/background-removal/v3';
    const result = await submitLoaderBackgroundRemoval({ modelId, jobKey: 'POST-ASSET-LOADER-001' });
    console.log(JSON.stringify({ ok: true, ...result }, null, 2));
    return;
  }

  if (cmd === 'poll') {
    if (arg) {
      const result = await pollLoaderPostProcessJob(arg);
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    const maxRounds = Number(process.argv[4] ?? 60);
    for (let i = 0; i < maxRounds; i += 1) {
      const n = await pollPendingLoaderPostProcessJobs(3);
      const ctx = await getLoaderPipelineContext();
      const job = ctx.latestJob;
      console.log(`[poll ${i + 1}] completed=${n} status=${job?.status ?? 'none'}`);
      if (job && job.status !== 'PROCESSING') {
        console.log(JSON.stringify(ctx, null, 2));
        return;
      }
      await sleep(5000);
    }
    console.log(JSON.stringify({ ok: false, error: 'Timed out waiting for post-process' }, null, 2));
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  process.exit(1);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
