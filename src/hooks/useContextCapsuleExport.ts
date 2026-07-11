import { useCallback, useEffect, useState } from 'react';
import { getAccessToken } from '../utils/api';
import type {
  ContextCapsuleExportRecord,
  ContextCapsuleReleaseManifest,
  ContextCapsuleStatus,
  ContextCapsuleValidationCheck,
} from '../studio-os-core/context-capsule-export/constants';
import {
  AI_ONBOARDING_PROMPT,
  CONTEXT_CAPSULE_PERMANENT_LATEST_PATH,
} from '../studio-os-core/context-capsule-export/constants';

type ApiResponse = {
  status: ContextCapsuleStatus;
  exports: ContextCapsuleExportRecord[];
  release: ContextCapsuleReleaseManifest | null;
};

type ExportResponse = {
  ok: boolean;
  message: string;
  validation: ContextCapsuleValidationCheck[];
  export: ContextCapsuleExportRecord;
  status: ContextCapsuleStatus;
  release: ContextCapsuleReleaseManifest | null;
};

async function authHeaders(): Promise<HeadersInit> {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useContextCapsuleExport() {
  const [status, setStatus] = useState<ContextCapsuleStatus | null>(null);
  const [release, setRelease] = useState<ContextCapsuleReleaseManifest | null>(null);
  const [exports, setExports] = useState<ContextCapsuleExportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readyMessage, setReadyMessage] = useState<string | null>(null);
  const [lastValidation, setLastValidation] = useState<ContextCapsuleValidationCheck[]>([]);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedLatestUrl, setCopiedLatestUrl] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await authHeaders();
      const res = await fetch('/api/admin/context-capsule', { headers });
      const data = (await res.json()) as ApiResponse & { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed to load capsule status');
      setStatus(data.status);
      setRelease(data.release ?? null);
      setExports(data.exports ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runExport = useCallback(async () => {
    setExporting(true);
    setError(null);
    setReadyMessage(null);
    try {
      const headers = await authHeaders();
      const res = await fetch('/api/admin/context-capsule', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
      const data = (await res.json()) as ExportResponse & { error?: string; validation?: ContextCapsuleValidationCheck[] };
      if (!res.ok) {
        if (data.validation) setLastValidation(data.validation);
        throw new Error(data.error ?? 'Export failed');
      }
      setLastValidation(data.validation);
      setReadyMessage(data.message);
      setStatus(data.status);
      setRelease(data.release ?? null);
      setExports((prev) => [data.export, ...prev.filter((e) => e.id !== data.export.id)]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  }, []);

  const deleteExport = useCallback(
    async (id: string) => {
      setError(null);
      try {
        const headers = await authHeaders();
        const res = await fetch(`/api/admin/context-capsule?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers,
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(data.error ?? 'Delete failed');
        setExports((prev) => prev.filter((e) => e.id !== id));
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Delete failed');
      }
    },
    [refresh],
  );

  const copyOnboardingPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(AI_ONBOARDING_PROMPT);
      setCopiedPrompt(true);
      window.setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      setError('Could not copy onboarding prompt');
    }
  }, []);

  const copyLatestUrl = useCallback(async () => {
    const url = `https://fsbw.vercel.app${status?.permanentLatestUrl ?? status?.latestDownloadPath ?? CONTEXT_CAPSULE_PERMANENT_LATEST_PATH}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLatestUrl(true);
      window.setTimeout(() => setCopiedLatestUrl(false), 2000);
    } catch {
      setError('Could not copy permanent download URL');
    }
  }, [status?.permanentLatestUrl, status?.latestDownloadPath]);

  const downloadPath = useCallback((path: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = path;
    a.download = fileName;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, []);

  const downloadLatest = useCallback(() => {
    const path = status?.permanentLatestUrl ?? status?.latestDownloadPath ?? CONTEXT_CAPSULE_PERMANENT_LATEST_PATH;
    const fileName = release?.artifact ?? status?.currentZipFileName ?? undefined;
    if (fileName) {
      downloadPath(path, fileName);
    } else {
      window.location.assign(path);
    }
  }, [downloadPath, release?.artifact, status?.currentZipFileName, status?.permanentLatestUrl, status?.latestDownloadPath]);

  const downloadExport = useCallback(
    async (record: ContextCapsuleExportRecord) => {
      setError(null);
      try {
        if (record.downloadPath.startsWith('/downloads/')) {
          downloadPath(record.downloadPath, record.zipFileName);
          return;
        }
        const headers = await authHeaders();
        const res = await fetch('/api/admin/context-capsule?download=1', { headers });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error ?? 'Download failed');
        }
        downloadPath(
          status?.permanentLatestUrl ?? status?.latestDownloadPath ?? CONTEXT_CAPSULE_PERMANENT_LATEST_PATH,
          release?.artifact ?? status?.currentZipFileName ?? 'StudioOS_ContextCapsule.zip',
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Download failed');
      }
    },
    [downloadPath, release?.artifact, status?.currentZipFileName, status?.permanentLatestUrl, status?.latestDownloadPath],
  );

  const downloadUrl = (record: ContextCapsuleExportRecord) => record.downloadPath;

  return {
    status,
    release,
    exports,
    loading,
    exporting,
    error,
    readyMessage,
    lastValidation,
    copiedPrompt,
    copiedLatestUrl,
    refresh,
    runExport,
    deleteExport,
    copyOnboardingPrompt,
    copyLatestUrl,
    downloadLatest,
    downloadExport,
    downloadUrl,
  };
}
