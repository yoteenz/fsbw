import { useCallback, useEffect, useState } from 'react';
import {
  ARCHITECTURE_AUDITOR_EVENT,
  runStudioWorldArchitectureAudit,
  type ArchitectureAuditReport,
} from '../studio-os-core/architecture-auditor';

export function useArchitectureAuditor(options?: { autoRefreshMs?: number }) {
  const [report, setReport] = useState<ArchitectureAuditReport | null>(null);
  const [scanning, setScanning] = useState(false);

  const scan = useCallback(async () => {
    setScanning(true);
    try {
      const result = runStudioWorldArchitectureAudit({ kind: 'continuous' });
      setReport(result);
      return result;
    } finally {
      setScanning(false);
    }
  }, []);

  useEffect(() => {
    void scan();
  }, [scan]);

  useEffect(() => {
    const onRequest = () => void scan();
    window.addEventListener(ARCHITECTURE_AUDITOR_EVENT, onRequest);
    return () => window.removeEventListener(ARCHITECTURE_AUDITOR_EVENT, onRequest);
  }, [scan]);

  useEffect(() => {
    const ms = options?.autoRefreshMs;
    if (!ms || ms < 5000) return;
    const id = window.setInterval(() => void scan(), ms);
    return () => window.clearInterval(id);
  }, [options?.autoRefreshMs, scan]);

  return { report, scanning, scan };
}
