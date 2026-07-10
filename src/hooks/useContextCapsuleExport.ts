import { useCallback, useEffect, useState } from 'react';
import { getAccessToken } from '../utils/api';
import type {
  ContextCapsuleExportRecord,
  ContextCapsuleStatus,
  ContextCapsuleValidationCheck,
} from '../studio-os-core/context-capsule-export/constants';
import { AI_ONBOARDING_PROMPT } from '../studio-os-core/context-capsule-export/constants';

type ApiResponse = {
  status: ContextCapsuleStatus;
  exports: ContextCapsuleExportRecord[];
};

type ExportResponse = {
  ok: boolean;
  message: string;
  validation: ContextCapsuleValidationCheck[];
  export: ContextCapsuleExportRecord;
  status: ContextCapsuleStatus;
};

async function authHeaders(): Promise<HeadersInit> {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useContextCapsuleExport() {
  const [status, setStatus] = useState<ContextCapsuleStatus | null>(null);
  const [exports, setExports] = useState<ContextCapsuleExportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readyMessage, setReadyMessage] = useState<string | null>(null);
  const [lastValidation, setLastValidation] = useState<ContextCapsuleValidationCheck[]>([]);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await authHeaders();
      const res = await fetch('/api/admin/context-capsule', { headers });
      const data = (await res.json()) as ApiResponse & { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed to load capsule status');
      setStatus(data.status);
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

  const downloadExport = useCallback(async (record: ContextCapsuleExportRecord) => {
    setError(null);
    try {
      const headers = await authHeaders();
      if (record.downloadPath.startsWith('/downloads/')) {
        const a = document.createElement('a');
        a.href = record.downloadPath;
        a.download = record.zipFileName;
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }
      const res = await fetch('/api/admin/context-capsule?download=1', { headers });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? 'Download failed');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = record.zipFileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Download failed');
    }
  }, []);

  const downloadUrl = (record: ContextCapsuleExportRecord) => record.downloadPath;

  return {
    status,
    exports,
    loading,
    exporting,
    error,
    readyMessage,
    lastValidation,
    copiedPrompt,
    refresh,
    runExport,
    deleteExport,
    copyOnboardingPrompt,
    downloadExport,
    downloadUrl,
  };
}
