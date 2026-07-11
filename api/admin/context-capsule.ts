import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { writeAuditLog } from '../_lib/auditLog.js';
import {
  loadBuildManifest,
  loadCapsuleSourceInfo,
  loadReleaseManifest,
  validateCapsulePackage,
  zipFileName,
} from '../_lib/contextCapsuleExport.js';
import {
  CONTEXT_CAPSULE_EXPORTS_CONFIG_KEY,
  CONTEXT_CAPSULE_LATEST_DOWNLOAD_PATH,
  CONTEXT_CAPSULE_PERMANENT_LATEST_PATH,
  CONTEXT_CAPSULE_REQUIRED_FILES,
  type ContextCapsuleExportRecord,
  type ContextCapsuleExportsState,
  type ContextCapsuleReleaseManifest,
  type ContextCapsuleStatus,
} from '../_lib/contextCapsuleConstants.js';

const EMPTY_STATE: ContextCapsuleExportsState = {
  schemaVersion: 1,
  exports: [],
  lastExportId: null,
};

async function loadExportsState(): Promise<ContextCapsuleExportsState> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', CONTEXT_CAPSULE_EXPORTS_CONFIG_KEY)
      .maybeSingle();
    if (error || !data?.value) return { ...EMPTY_STATE };
    const value = data.value as ContextCapsuleExportsState;
    if (value?.schemaVersion !== 1 || !Array.isArray(value.exports)) return { ...EMPTY_STATE };
    return value;
  } catch {
    return { ...EMPTY_STATE };
  }
}

async function saveExportsState(state: ContextCapsuleExportsState): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('app_config').upsert(
    {
      key: CONTEXT_CAPSULE_EXPORTS_CONFIG_KEY,
      value: state,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' },
  );
  if (error) throw new Error(error.message);
}

function buildStatus(
  info: ReturnType<typeof loadCapsuleSourceInfo>,
  validation: ReturnType<typeof validateCapsulePackage>,
  latest: ContextCapsuleExportRecord | null,
  buildManifest: ReturnType<typeof loadBuildManifest> | null,
  release: ContextCapsuleReleaseManifest | null,
): ContextCapsuleStatus {
  const allPassed = validation.every((v) => v.passed);
  const releasePassed = release?.validationStatus === 'pass';
  return {
    capsuleVersion: release?.currentVersion ?? info.version,
    capsuleFolder: info.capsuleFolderName,
    lastGenerated: release?.generatedAt ?? latest?.generatedAt ?? buildManifest?.generatedAt ?? null,
    projectVersion: info.projectVersion,
    studioOsVersion: info.studioOsVersion,
    documentCount: release?.documentCount ?? CONTEXT_CAPSULE_REQUIRED_FILES.length,
    packageHealth: info.packageHealth,
    checksumSha256: release?.checksumSha256 ?? latest?.checksumSha256 ?? buildManifest?.checksumSha256 ?? null,
    generationStatus: allPassed && (releasePassed || !release) ? 'ready' : 'error',
    compatibility: info.compatibility,
    aiManualVersion: info.aiManualVersion,
    founderProfileVersion: info.founderProfileVersion,
    sprintVersion: info.sprintVersion,
    validation,
    currentDownloadPath:
      release?.versionedDownloadPath ?? latest?.downloadPath ?? buildManifest?.versionedDownloadPath ?? buildManifest?.downloadPath ?? null,
    currentZipFileName: release?.artifact ?? latest?.zipFileName ?? buildManifest?.artifact ?? null,
    latestDownloadPath:
      release?.permanentLatestUrl ??
      release?.latestDownloadPath ??
      buildManifest?.permanentLatestUrl ??
      buildManifest?.latestDownloadPath ??
      CONTEXT_CAPSULE_PERMANENT_LATEST_PATH,
    permanentLatestUrl:
      release?.permanentLatestUrl ??
      buildManifest?.permanentLatestUrl ??
      CONTEXT_CAPSULE_PERMANENT_LATEST_PATH,
    legacyLatestDownloadPath:
      release?.legacyLatestDownloadPath ??
      buildManifest?.legacyLatestDownloadPath ??
      CONTEXT_CAPSULE_LATEST_DOWNLOAD_PATH,
    archiveBasePath: release?.archiveBasePath,
    manifestDocumentCount: release?.manifestDocumentCount ?? release?.documentCount,
    versionedDownloadPath:
      release?.versionedDownloadPath ??
      buildManifest?.versionedDownloadPath ??
      buildManifest?.downloadPath ??
      '',
    validationStatus: release?.validationStatus ?? (allPassed ? 'pass' : 'fail'),
    readyForAiOnboarding: release?.readyForAiOnboarding ?? (releasePassed && allPassed),
    gitCommit: release?.gitCommit ?? null,
    previousVersion: release?.previousVersion ?? null,
    releaseHistory: release?.releaseHistory ?? [],
  };
}

/**
 * GET  /api/admin/context-capsule — status + export history + release manifest
 * POST /api/admin/context-capsule — validate + register prebuilt download
 * DELETE /api/admin/context-capsule?id= — remove history entry
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  try {
    let buildManifest: ReturnType<typeof loadBuildManifest> | null = null;
    let release: ContextCapsuleReleaseManifest | null = null;
    try {
      buildManifest = loadBuildManifest();
    } catch {
      buildManifest = null;
    }
    try {
      release = loadReleaseManifest();
    } catch {
      release = null;
    }

    if (req.method === 'GET') {
      const download = typeof req.query.download === 'string' ? req.query.download : '';
      if (download === '1' || download === 'true') {
        const target =
          release?.latestDownloadPath ??
          buildManifest?.latestDownloadPath ??
          buildManifest?.downloadPath;
        if (!target) {
          return res.status(503).json({ error: 'Prebuilt capsule artifact not available' });
        }
        res.setHeader('Location', target);
        return res.status(302).end();
      }

      const info = loadCapsuleSourceInfo();
      const validation = validateCapsulePackage(info);
      const cloudState = await loadExportsState();
      const exports = [...cloudState.exports].sort(
        (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime(),
      );
      const latest = exports[0] ?? null;

      return res.status(200).json({
        status: buildStatus(info, validation, latest, buildManifest, release),
        exports,
        release,
      });
    }

    if (req.method === 'POST') {
      const info = loadCapsuleSourceInfo();
      const validation = validateCapsulePackage(info);
      const validationPassed = validation.every((v) => v.passed);
      if (!validationPassed) {
        return res.status(400).json({
          error: 'Validation failed',
          validation,
          status: buildStatus(info, validation, null, buildManifest, release),
          release,
        });
      }

      if (!buildManifest || release?.validationStatus !== 'pass') {
        return res.status(503).json({ error: 'Prebuilt capsule artifact not available or not validated' });
      }

      const generatedAt = new Date().toISOString();
      const id = `export-${generatedAt.replace(/[:.]/g, '-')}`;
      const fileName = zipFileName(info.version);

      const record: ContextCapsuleExportRecord = {
        id,
        version: release.currentVersion,
        zipFileName: fileName,
        generatedAt,
        projectVersion: info.projectVersion,
        studioOsVersion: info.studioOsVersion,
        documentCount: CONTEXT_CAPSULE_REQUIRED_FILES.length,
        checksumSha256: release.checksumSha256,
        sizeBytes: buildManifest.sizeBytes,
        downloadPath: release.versionedDownloadPath,
        validationPassed: true,
      };

      const cloudState = await loadExportsState();
      const nextState: ContextCapsuleExportsState = {
        schemaVersion: 1,
        exports: [record, ...cloudState.exports.filter((e) => e.id !== record.id)],
        lastExportId: record.id,
      };
      await saveExportsState(nextState);

      try {
        await writeAuditLog({
          actorId: admin.id,
          actorEmail: admin.email,
          action: 'context_capsule.export',
          resourceType: 'ai_context_capsule',
          resourceId: record.id,
          details: {
            version: record.version,
            checksumSha256: record.checksumSha256,
            sizeBytes: record.sizeBytes,
            latestDownloadPath: release.latestDownloadPath,
          },
        });
      } catch {
        /* audit optional */
      }

      return res.status(200).json({
        ok: true,
        message: `Context Capsule Ready — v${release.currentVersion} · validation pass · ${release.documentCount} documents`,
        validation,
        export: record,
        status: buildStatus(info, validation, record, buildManifest, release),
        release,
      });
    }

    if (req.method === 'DELETE') {
      const id = typeof req.query.id === 'string' ? req.query.id.trim() : '';
      if (!id) return res.status(400).json({ error: 'id required' });

      const cloudState = await loadExportsState();
      cloudState.exports = cloudState.exports.filter((e) => e.id !== id);
      if (cloudState.lastExportId === id) {
        cloudState.lastExportId = cloudState.exports[0]?.id ?? null;
      }
      await saveExportsState(cloudState);

      return res.status(200).json({ ok: true, deletedId: id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error';
    return res.status(500).json({ error: message });
  }
}
