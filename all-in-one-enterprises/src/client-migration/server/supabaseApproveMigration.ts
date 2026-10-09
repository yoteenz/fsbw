import { getAioSupabaseAdmin } from './aioSupabaseAdmin';
import {
  factsForCanonicalCommit,
  validateApproveMigration,
  type ApproveFactRow,
} from './approveMigrationLogic';

export type ApproveBatchRequest = {
  batchId: string;
  matchResolved: boolean;
  staffUserId: string;
  idempotencyKey?: string;
};

export type ApproveBatchResult =
  | { ok: true; organizationId: string; alreadyCommitted?: boolean }
  | { ok: false; error: string };

export async function supabaseApproveMigrationBatch(req: ApproveBatchRequest): Promise<ApproveBatchResult> {
  const admin = getAioSupabaseAdmin();
  if (!admin) return { ok: false, error: 'Migration approve requires server configuration.' };

  const idempotencyKey = req.idempotencyKey ?? `approve-migration:${req.batchId}`;

  const { data: existingCommit } = await admin
    .from('aio_client_migration_commits')
    .select('organization_id')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();
  if (existingCommit) {
    return { ok: true, organizationId: String(existingCommit.organization_id), alreadyCommitted: true };
  }

  const { data: batch, error: batchError } = await admin
    .from('aio_archive_migration_batches')
    .select('*')
    .eq('id', req.batchId)
    .maybeSingle();
  if (batchError || !batch) return { ok: false, error: 'Batch not found' };

  const organizationId = String(batch.organization_id);

  const { data: factRows } = await admin
    .from('aio_client_extracted_facts')
    .select('*')
    .eq('batch_id', req.batchId);

  const facts: ApproveFactRow[] = (factRows ?? []).map((f) => ({
    id: String(f.id),
    entityType: String(f.entity_type),
    fieldKey: String(f.field_key),
    proposedValue: f.proposed_value ? String(f.proposed_value) : null,
    existingValue: f.existing_value ? String(f.existing_value) : null,
    confidence: String(f.confidence),
    reviewAction: (f.review_action as ApproveFactRow['reviewAction']) ?? null,
    documentId: f.document_id ? String(f.document_id) : null,
    sourceReference: f.source_reference ? String(f.source_reference) : null,
  }));

  const validation = validateApproveMigration({
    batchId: req.batchId,
    organizationId,
    matchResolved: req.matchResolved,
    facts,
    batchState: String(batch.state),
    approvalState: String(batch.approval_state),
  });
  if (!validation.ok) return { ok: false, error: validation.error };

  const commitFacts = factsForCanonicalCommit(facts);

  const { data: orgRow } = await admin.from('aio_organizations').select('name, customer_number, client_lifecycle').eq('id', organizationId).maybeSingle();

  const orgPatch: Record<string, unknown> = {
    client_lifecycle: 'PREBUILT',
    client_review_state: 'REQUIRED',
    profile_completeness_pct: 75,
  };

  for (const fact of commitFacts) {
    if (fact.entityType === 'company' && fact.fieldKey === 'legal_name') {
      orgPatch.name = fact.proposedValue;
    }
  }

  if (!orgRow?.customer_number) {
    const { data: customerNumber } = await admin.rpc('aio_next_customer_number');
    if (customerNumber) orgPatch.customer_number = String(customerNumber);
  }

  const { error: orgError } = await admin.from('aio_organizations').update(orgPatch).eq('id', organizationId);
  if (orgError) return { ok: false, error: orgError.message };

  const { data: roadProfile } = await admin
    .from('aio_road_ready_profiles')
    .select('id')
    .eq('organization_id', organizationId)
    .maybeSingle();
  if (!roadProfile) {
    await admin.from('aio_road_ready_profiles').insert({
      organization_id: organizationId,
      overall_status: 'in_progress',
    });
  } else {
    await admin.from('aio_road_ready_profiles').update({ overall_status: 'in_progress' }).eq('id', roadProfile.id);
  }

  for (const fact of commitFacts) {
    await admin.from('aio_client_profile_provenance').insert({
      organization_id: organizationId,
      entity_type: fact.entityType,
      field_key: fact.fieldKey,
      value: fact.proposedValue,
      provenance: 'MIGRATION_APPROVED',
      source_fact_id: fact.id,
    });

    if (fact.entityType === 'company' && fact.fieldKey === 'mc_number') {
      const { data: existingMc } = await admin
        .from('aio_organization_regulatory_identifiers')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('identifier_type', 'MC')
        .maybeSingle();
      if (!existingMc) {
        await admin.from('aio_organization_regulatory_identifiers').insert({
          organization_id: organizationId,
          identifier_type: 'MC',
          identifier_value: fact.proposedValue!,
          status: 'active',
          source: 'migration',
        });
      }
    }

    if (fact.entityType === 'company' && fact.fieldKey === 'usdot') {
      await upsertRegulatoryIdentifier(admin, organizationId, 'USDOT', fact.proposedValue!);
    }

    if (fact.entityType === 'company' && fact.fieldKey === 'ein') {
      await upsertRegulatoryIdentifier(admin, organizationId, 'EIN', fact.proposedValue!);
    }

    if (fact.entityType === 'vehicle') {
      await upsertFleetVehicleFromFact(admin, organizationId, fact);
    }

    if (fact.entityType === 'person') {
      await upsertContactFromPersonFact(admin, commitFacts, fact);
    }
  }

  const { data: batchFiles } = await admin
    .from('aio_archive_migration_batch_files')
    .select('*')
    .eq('batch_id', req.batchId);

  for (const file of batchFiles ?? []) {
    if (file.document_id) continue;
    const { data: doc, error: docError } = await admin
      .from('aio_documents')
      .insert({
        organization_id: organizationId,
        category: 'legacy',
        name: file.file_name,
        title: String(file.file_name).replace(/\.[^.]+$/, ''),
        document_type: 'Legacy Scan',
        status: 'verified',
        verification_status: 'verified',
        record_lifecycle: 'current',
        review_status: 'approved',
        source: 'legacy_scan',
        visibility_scope: 'internal',
        mime_type: file.mime_type,
        file_name: file.file_name,
        file_size_bytes: file.file_size_bytes,
        file_hash: file.file_hash,
        storage_reference: file.storage_reference,
        migration_batch_id: req.batchId,
        is_current: true,
        metadata_extraction_status: 'complete',
      })
      .select('id')
      .single();
    if (docError || !doc) continue;
    await admin
      .from('aio_archive_migration_batch_files')
      .update({ document_id: doc.id, queue_state: 'READY_FOR_REVIEW', processing_stage: 'READY_FOR_REVIEW' })
      .eq('id', file.id);
  }

  const workspaceCodes = ['dispatch', 'factoring', 'insurance', 'bookkeeping', 'permitting'];
  for (const code of workspaceCodes) {
    const hasService = commitFacts.some(
      (f) => f.entityType === 'service' && f.fieldKey === code && f.reviewAction !== 'REJECT',
    );
    await admin.from('aio_office_workspace_entitlements').upsert(
      {
        organization_id: organizationId,
        workspace_code: code,
        state: hasService ? 'PENDING_SETUP' : 'AVAILABLE_NOT_ACTIVATED',
        confirmed_by_staff_at: hasService ? new Date().toISOString() : null,
      },
      { onConflict: 'organization_id,workspace_code' },
    );
  }

  await admin.from('aio_archive_migration_batches').update({
    state: 'completed',
    approval_state: 'approved',
    review_state: 'complete',
    updated_at: new Date().toISOString(),
  }).eq('id', req.batchId);

  await admin.from('aio_client_lifecycle_events').insert({
    organization_id: organizationId,
    from_state: orgRow?.client_lifecycle ?? null,
    to_state: 'PREBUILT',
    event_type: 'MIGRATION_APPROVED',
    actor_type: 'STAFF',
    actor_user_id: req.staffUserId,
    metadata: { batchId: req.batchId },
  });

  await admin.from('aio_client_lifecycle_events').insert({
    organization_id: organizationId,
    from_state: 'PREBUILT',
    to_state: 'PREBUILT',
    event_type: 'CLIENT_PREBUILT',
    actor_type: 'STAFF',
    actor_user_id: req.staffUserId,
    metadata: { batchId: req.batchId },
  });

  const { error: commitError } = await admin.from('aio_client_migration_commits').insert({
    idempotency_key: idempotencyKey,
    batch_id: req.batchId,
    organization_id: organizationId,
    committed_by_user_id: req.staffUserId,
  });
  if (commitError && !commitError.message.includes('duplicate')) {
    return { ok: false, error: commitError.message };
  }

  return { ok: true, organizationId };
}

async function upsertRegulatoryIdentifier(
  admin: NonNullable<ReturnType<typeof getAioSupabaseAdmin>>,
  organizationId: string,
  identifierType: string,
  value: string,
): Promise<void> {
  const { data: existing } = await admin
    .from('aio_organization_regulatory_identifiers')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('identifier_type', identifierType)
    .maybeSingle();
  if (existing) return;
  await admin.from('aio_organization_regulatory_identifiers').insert({
    organization_id: organizationId,
    identifier_type: identifierType,
    identifier_value: value,
    status: 'active',
    source: 'migration',
  });
}

async function upsertFleetVehicleFromFact(
  admin: NonNullable<ReturnType<typeof getAioSupabaseAdmin>>,
  organizationId: string,
  fact: ApproveFactRow,
): Promise<void> {
  if (!fact.proposedValue) return;
  const vinFact = fact.fieldKey === 'vin' ? fact : null;
  const unitFact = fact.fieldKey === 'unit_number' ? fact : null;
  if (!vinFact && !unitFact) return;

  const lookup = vinFact
    ? { column: 'vin', value: vinFact.proposedValue! }
    : { column: 'unit_number', value: unitFact!.proposedValue! };

  let existingQuery = admin.from('aio_fleet_vehicles').select('id, vin, unit_number').eq('organization_id', organizationId);
  existingQuery =
    lookup.column === 'vin'
      ? existingQuery.eq('vin', lookup.value)
      : existingQuery.eq('unit_number', lookup.value);
  const { data: existing } = await existingQuery.maybeSingle();

  const patch: Record<string, unknown> = { status: 'active' };
  if (fact.fieldKey === 'vin') patch.vin = fact.proposedValue;
  if (fact.fieldKey === 'unit_number') patch.unit_number = fact.proposedValue;

  if (existing) {
    await admin.from('aio_fleet_vehicles').update(patch).eq('id', existing.id);
    return;
  }

  await admin.from('aio_fleet_vehicles').insert({
    organization_id: organizationId,
    ...patch,
    vehicle_type: 'power_unit',
  });
}

async function upsertContactFromPersonFact(
  admin: NonNullable<ReturnType<typeof getAioSupabaseAdmin>>,
  allFacts: ApproveFactRow[],
  fact: ApproveFactRow,
): Promise<void> {
  if (fact.fieldKey !== 'contact_name' || !fact.proposedValue) return;
  const email = allFacts.find((f) => f.entityType === 'company' && f.fieldKey === 'company_email')?.proposedValue;
  const phone = allFacts.find((f) => f.entityType === 'company' && f.fieldKey === 'company_phone')?.proposedValue;
  const parts = fact.proposedValue.split(' ');
  const { data: existing } = await admin
    .from('aio_contacts')
    .select('id')
    .eq('first_name', parts[0] ?? 'Contact')
    .eq('last_name', parts.slice(1).join(' ') || '—')
    .maybeSingle();
  if (existing) {
    if (email || phone) {
      await admin
        .from('aio_contacts')
        .update({
          email: email ?? undefined,
          phone: phone ?? undefined,
        })
        .eq('id', existing.id);
    }
    return;
  }
  await admin.from('aio_contacts').insert({
    first_name: parts[0] ?? 'Contact',
    last_name: parts.slice(1).join(' ') || '—',
    email: email ?? null,
    phone: phone ?? null,
    status: 'active',
  });
}
