import { useCallback, useEffect, useState } from 'react';
import {
  EXPERIENCE_INTELLIGENCE_EVENT,
  runExperienceIntelligenceAudit,
  type ExperienceIntelligenceReport,
} from '../studio-os-core/experience-intelligence-engine';

export function useExperienceIntelligence(options?: { autoRefreshMs?: number }) {
  const [report, setReport] = useState<ExperienceIntelligenceReport | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  const evaluate = useCallback(async () => {
    setEvaluating(true);
    try {
      const result = runExperienceIntelligenceAudit({ kind: 'continuous' });
      setReport(result);
      return result;
    } finally {
      setEvaluating(false);
    }
  }, []);

  useEffect(() => {
    void evaluate();
  }, [evaluate]);

  useEffect(() => {
    const onRequest = () => void evaluate();
    window.addEventListener(EXPERIENCE_INTELLIGENCE_EVENT, onRequest);
    return () => window.removeEventListener(EXPERIENCE_INTELLIGENCE_EVENT, onRequest);
  }, [evaluate]);

  useEffect(() => {
    const ms = options?.autoRefreshMs;
    if (!ms || ms < 5000) return;
    const id = window.setInterval(() => void evaluate(), ms);
    return () => window.clearInterval(id);
  }, [options?.autoRefreshMs, evaluate]);

  return { report, evaluating, evaluate };
}
