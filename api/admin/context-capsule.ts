import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'node:fs';
import path from 'node:path';
import { requireAdmin } from '../_lib/adminAuth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { writeAuditLog } from '../_lib/auditLog.js';
import {
  buildCapsuleZipBuffer,
  loadCapsuleSourceInfo,
  readPublicHistoryIndex,
  sha256Hex,
  updatePublicHistoryIndex,
  validateCapsulePackage,
  writeCapsuleZipToPublicDownloads,
  zipFileName,
} from '../_lib/contextCapsuleExport.js';
import {
  CONTEXT_CAPSULE_EXPORTS_CONFIG_KEY,
  CONTEXT_CAPSULE_REQUIRED_FILES,
  type ContextCapsuleExportRecord,
  type ContextCapsuleExportsState,
  type ContextCapsuleStatus,
} from '../../src/studio-os-core/context-capsule-export/constants.js';

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

function mergeHistory(
  cloud: ContextCapsuleExportRecord[],
  local: ReturnType<typeof readPublicHistoryIndex>,
): ContextCapsuleExportRecord[] {
  const byId = new Map<string, ContextCapsuleExportRecord>();
  for (const row of local) {
    byId.set(row.id, {
      ...row,
      documentCount: CONTEXT_CAPSULE_REQUIRED_FILES.length,
      validationPassed: true,
    });
  }
  for (const row of cloud) {
    byId.set(row.id, row);
  }
  return [...byId.values()].sort(
    (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime(),
  );
}

function buildStatus(
  info: ReturnType<typeof loadCapsuleSourceInfo>,
  validation: ReturnType<typeof validateCapsulePackage>,
  latest: ContextCapsuleExportRecord | null,
): ContextCapsuleStatus {
  const allPassed = validation.every((v) => v.passed);
  return {
    capsuleVersion: info.version,
    capsuleFolder: info.capsuleFolderName,
    lastGenerated: latest?.generatedAt ?? null,
    projectVersion: info.projectVersion,
    studioOsVersion: info.studioOsVersion,
    documentCount: CONTEXT_CAPSULE_REQUIRED_FILES.length,
    packageHealth: info.packageHealth,
    checksumSha256: latest?.checksumSha256 ?? null,
    generationStatus: allPassed ? 'ready' : 'error',
    compatibility: info.compatibility,
    aiManualVersion: info.aiManualVersion,
    founderProfileVersion: info.founderProfileVersion,
    sprintVersion: info.sprintVersion,
    validation,
    currentDownloadPath: latest?.downloadPath ?? null,
    currentZipFileName: latest?.zipFileName ?? null,
  };
}

/**
 * GET  /api/admin/context-capsule — status + export history
 * POST /api/admin/context-capsule — export + validate + register download
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
    if (req.method === 'GET') {
      const download = typeof req.query.download === 'string' ? req.query.download : '';
      if (download === '1' || download === 'true') {
        const info = loadCapsuleSourceInfo();
        const validation = validateCapsulePackage(info);
        if (!validation.every((v) => v.passed)) {
          return res.status(400).json({ error: 'Validation failed', validation });
        }
        const buffer = await buildCapsuleZipBuffer(info);
        const fileName = zipFileName(info.version);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('X-Capsule-Checksum-Sha256', sha256Hex(buffer));
        return res.status(200).send(buffer);
      }

      const info = loadCapsuleSourceInfo();
      const validation = validateCapsulePackage(info);
      const cloudState = await loadExportsState();
      const localHistory = readPublicHistoryIndex();
      const exports = mergeHistory(cloudState.exports, localHistory);
      const latest = exports[0] ?? null;

      return res.status(200).json({
        status: buildStatus(info, validation, latest),
        exports,
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
          status: buildStatus(info, validation, null),
        });
      }

      const buffer = await buildCapsuleZipBuffer(info);
      const checksumSha256 = sha256Hex(buffer);
      const generatedAt = new Date().toISOString();
      const id = `export-${generatedAt.replace(/[:.]/g, '-')}`;
      const fileName = zipFileName(info.version);

      let downloadPath = `/downloads/context-capsules/${fileName}`;
      try {
        const written = writeCapsuleZipToPublicDownloads(buffer, info.version);
        downloadPath = written.downloadPath;
        updatePublicHistoryIndex({
          id,
          version: info.version,
          zipFileName: fileName,
          generatedAt,
          projectVersion: info.projectVersion,
          studioOsVersion: info.studioOsVersion,
          checksumSha256,
          sizeBytes: buffer.length,
          downloadPath,
        });
      } catch {
        // Read-only FS on serverless — download via GET ?download=1 or redeploy prebuild artifact
        downloadPath = `/api/admin/context-capsule?download=1`;
      }

      const record: ContextCapsuleExportRecord = {
        id,
        version: info.version,
        zipFileName: fileName,
        generatedAt,
        projectVersion: info.projectVersion,
        studioOsVersion: info.studioOsVersion,
        documentCount: CONTEXT_CAPSULE_REQUIRED_FILES.length,
        checksumSha256,
        sizeBytes: buffer.length,
        downloadPath,
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
          details: { version: record.version, checksumSha256, sizeBytes: record.sizeBytes },
        });
      } catch {
        /* audit optional */
      }

      return res.status(200).json({
        ok: true,
        message: 'Context Capsule Ready',
        validation,
        export: record,
        status: buildStatus(info, validation, record),
      });
    }

    if (req.method === 'DELETE') {
      const id = typeof req.query.id === 'string' ? req.query.id.trim() : '';
      if (!id) return res.status(400).json({ error: 'id required' });

      const cloudState = await loadExportsState();
      const target = cloudState.exports.find((e) => e.id === id);
      cloudState.exports = cloudState.exports.filter((e) => e.id !== id);
      if (cloudState.lastExportId === id) {
        cloudState.lastExportId = cloudState.exports[0]?.id ?? null;
      }
      await saveExportsState(cloudState);

      if (target?.downloadPath.startsWith('/downloads/context-capsules/')) {
        const absolute = path.join(
          process.cwd(),
          'public',
          target.downloadPath.replace(/^\//, ''),
        );
        if (fs.existsSync(absolute)) {
          try {
            fs.unlinkSync(absolute);
          } catch {
            /* ignore on read-only */
          }
        }
        const indexPath = path.join(process.cwd(), 'public/downloads/context-capsules/history.json');
        if (fs.existsSync(indexPath)) {
          try {
            const history = JSON.parse(fs.readFileSync(indexPath, 'utf8')) as {
              schemaVersion: number;
              exports: ContextCapsuleExportRecord[];
            };
            history.exports = history.exports.filter((e) => e.id !== id);
            fs.writeFileSync(indexPath, JSON.stringify(history, null, 2) + '\n');
          } catch {
            /* ignore */
          }
        }
      }

      return res.status(200).json({ ok: true, deletedId: id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error';
    return res.status(500).json({ error: message });
  }
}
