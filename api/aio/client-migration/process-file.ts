import { fixtureMigrationPipelineAdapter } from '../../../all-in-one-enterprises/src/client-migration/migrationPipeline/fixtureAdapter';
import type { MigrationPipelineResult } from '../../../all-in-one-enterprises/src/client-migration/migrationPipeline/types';

export const config = {
  runtime: 'nodejs',
};

type Body = {
  input: {
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    sha256: string;
  };
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

  const provider = process.env.AIO_MIGRATION_EXTRACTION_PROVIDER?.trim().toLowerCase() ?? '';
  const allowFixture =
    process.env.AIO_ALLOW_MIGRATION_FIXTURE === '1' &&
    process.env.NODE_ENV !== 'production';
  if (provider === 'fixture' && allowFixture) {
    const result = await fixtureMigrationPipelineAdapter.processFile(body.input, body.context);
    return json(result, 200);
  }

  if (!provider || provider === 'none') {
    return json(
      {
        stage: 'REVIEW_REQUIRED',
        exception: 'PROVIDER_UNAVAILABLE',
        proposedFacts: [],
      } satisfies MigrationPipelineResult,
      503,
    );
  }

  return json(
    {
      stage: 'REVIEW_REQUIRED',
      exception: 'PROVIDER_UNAVAILABLE',
      proposedFacts: [],
    } satisfies MigrationPipelineResult,
    503,
  );
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
