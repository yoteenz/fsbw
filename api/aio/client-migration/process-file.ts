import type { MigrationFileInput, MigrationPipelineResult } from '../../../all-in-one-enterprises/src/client-migration/migrationPipeline/types';
import { fixtureMigrationPipelineAdapter } from '../../../all-in-one-enterprises/src/client-migration/migrationPipeline/fixtureAdapter';
import { runContentExtractionOnInput } from '../../../all-in-one-enterprises/src/client-migration/migrationPipeline/runContentExtraction';
import { getAioSupabaseAdmin } from '../../../all-in-one-enterprises/src/client-migration/server/aioSupabaseAdmin';

export const config = {
  runtime: 'nodejs',
};

type Body = {
  input: MigrationFileInput;
  context: {
    organizationId: string;
    batchId: string;
  };
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const provider = process.env.AIO_MIGRATION_EXTRACTION_PROVIDER?.trim().toLowerCase() ?? 'local';
  const allowFixture =
    process.env.AIO_ALLOW_MIGRATION_FIXTURE === '1' &&
    process.env.NODE_ENV !== 'production';

  if (provider === 'fixture' && allowFixture) {
    const result = await fixtureMigrationPipelineAdapter.processFile(body.input, body.context);
    return json(result, 200);
  }

  if (provider === 'none' || provider === '') {
    return json(unavailable(), 503);
  }

  const input = { ...body.input };

  if (!input.fileContentBase64 && input.storageReference) {
    const bytes = await downloadMigrationObject(input.storageReference);
    if (!bytes) {
      return json(
        {
          stage: 'REVIEW_REQUIRED',
          exception: 'PROCESSING_FAILED',
          proposedFacts: [],
        } satisfies MigrationPipelineResult,
        502,
      );
    }
    input.fileContentBase64 = Buffer.from(bytes).toString('base64');
  }

  if (!input.fileContentBase64) {
    return json(
      {
        stage: 'REVIEW_REQUIRED',
        exception: 'PROCESSING_FAILED',
        proposedFacts: [],
      } satisfies MigrationPipelineResult,
      400,
    );
  }

  if (provider === 'local' || provider === 'fixture') {
    const result = await runContentExtractionOnInput(input, body.context);
    return json(result, 200);
  }

  return json(unavailable(), 503);
}

async function downloadMigrationObject(storageReference: string): Promise<Uint8Array | null> {
  const admin = getAioSupabaseAdmin();
  if (!admin) return null;
  const slash = storageReference.indexOf('/');
  if (slash <= 0) return null;
  const bucket = storageReference.slice(0, slash);
  const path = storageReference.slice(slash + 1);
  const { data, error } = await admin.storage.from(bucket).download(path);
  if (error || !data) return null;
  const buf = new Uint8Array(await data.arrayBuffer());
  return buf;
}

function unavailable(): MigrationPipelineResult {
  return {
    stage: 'REVIEW_REQUIRED',
    exception: 'PROVIDER_UNAVAILABLE',
    proposedFacts: [],
  };
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
