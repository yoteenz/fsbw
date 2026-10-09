import { getMigrationPipelineAdapter } from '../migrationPipeline';
import { readFileAsBase64 } from '../migrationPipeline/documentTextExtraction';
import { profileOf } from '../visual/migrationData';
import { loadDemoStore, updateDemoStore } from '../../demo/demoStore';
import type { VaultDocument } from '../../vault/vaultTypes';
import { recordExtractedFacts } from './migrationCommitService';
import { transitionClientLifecycle } from './lifecycleEvents';
import { applyExtractedIdentityHints } from './intakeProvisionalClient';

type PendingJob = {
  batchId: string;
  batchFileId: string;
  organizationId: string;
  file: File;
  pendingDoc: VaultDocument;
};

const queue: PendingJob[] = [];
let draining = false;

export function enqueueDemoMigrationFileProcessing(job: PendingJob): void {
  queue.push(job);
  void drainDemoMigrationQueue();
}

async function drainDemoMigrationQueue(): Promise<void> {
  if (draining) return;
  draining = true;
  while (queue.length) {
    const job = queue.shift()!;
    await runDemoMigrationFileJob(job);
  }
  draining = false;
}

async function runDemoMigrationFileJob(job: PendingJob): Promise<void> {
  updateDemoStore((s) => {
    const row = s.archiveMigrationBatchFiles?.find((f) => f.id === job.batchFileId);
    if (row) {
      row.processingState = 'processing';
      row.queueState = 'PROCESSING';
    }
    return s;
  });

  const fileHash = job.pendingDoc.fileHash ?? '';
  const fileContentBase64 = await readFileAsBase64(job.file);
  const pipeline = getMigrationPipelineAdapter();
  const store = loadDemoStore();
  const profile = profileOf(store, job.organizationId);

  let pipelineResult;
  try {
    pipelineResult = await pipeline.processFile(
      {
        fileName: job.file.name,
        mimeType: job.file.type || 'application/octet-stream',
        sizeBytes: job.file.size,
        sha256: fileHash,
        documentId: job.pendingDoc.id,
        fileContentBase64,
      },
      { organizationId: job.organizationId, batchId: job.batchId },
    );
  } catch {
    pipelineResult = {
      stage: 'REVIEW_REQUIRED' as const,
      exception: 'PROCESSING_FAILED' as const,
      proposedFacts: [],
    };
  }

  const extractionHardFail =
    pipelineResult.exception === 'UNREADABLE_DOCUMENT' || pipelineResult.exception === 'EXTRACTION_FAILED';

  updateDemoStore((s) => {
    const row = s.archiveMigrationBatchFiles?.find((f) => f.id === job.batchFileId);
    if (row) {
      row.processingState = extractionHardFail ? 'failed' : 'ready';
      row.queueState = extractionHardFail ? 'NEEDS_ATTENTION' : 'READY_FOR_REVIEW';
      row.processingError = pipelineResult.exception;
    }
    const b = s.archiveMigrationBatches?.find((x) => x.id === job.batchId);
    if (b && !extractionHardFail) {
      b.state = 'ready_for_review';
      b.reviewState = 'pending';
      b.updatedAt = new Date().toISOString();
    }
    if (!extractionHardFail && pipelineResult.proposedFacts.length) {
      recordExtractedFacts(
        s,
        pipelineResult.proposedFacts.map((f) => {
          let existingValue = f.existingValue;
          if (!existingValue && profile) {
            if (f.fieldKey === 'legal_name') existingValue = profile.business.legalName || s.clients.find((c) => c.id === job.organizationId)?.companyName;
            if (f.fieldKey === 'usdot') existingValue = profile.authority.usdotNumber;
            if (f.fieldKey === 'mc_number') existingValue = profile.authority.mcNumber;
            if (f.fieldKey === 'company_phone') existingValue = profile.business.phone;
          }
          const confidence =
            existingValue && existingValue.trim().toLowerCase() !== f.proposedValue.trim().toLowerCase()
              ? ('CONFLICT' as const)
              : f.confidence;
          return {
            batchId: job.batchId,
            organizationId: job.organizationId,
            documentId: job.pendingDoc.id,
            entityType: f.entityType,
            fieldKey: f.fieldKey,
            proposedValue: f.proposedValue,
            existingValue,
            confidence,
            sourceReference: f.sourceReference,
          };
        }),
      );
      applyExtractedIdentityHints(s, job.organizationId, job.batchId);
      transitionClientLifecycle(s, job.organizationId, 'MIGRATION_REVIEW_REQUIRED', 'FACT_EXTRACTED', 'SYSTEM');
    }
    return s;
  });
}
