import { useCallback, useMemo, useState } from 'react';
import {
  compileCreativeStudioPreview,
  compileCreativeStudioPreviewBundle,
  type CreativePreviewCompanyId,
  type CreativePreviewConcept,
  type CreativeStudioPreviewBundle,
  type CreativeStudioPreviewResult,
} from '../studio-os-core/creative-studio-preview';

export function useCreativeStudioPreview(initialCompany: CreativePreviewCompanyId = 'studio-os') {
  const [companyId, setCompanyId] = useState<CreativePreviewCompanyId>(initialCompany);
  const [conceptId, setConceptId] = useState<'a' | 'b' | 'c'>('a');
  const [compareMode, setCompareMode] = useState(false);
  const [blindMode, setBlindMode] = useState(false);
  const [blindTestResult, setBlindTestResult] = useState<'pass' | 'fail' | null>(null);
  const [compileTick, setCompileTick] = useState(0);

  const bundle = useMemo(() => compileCreativeStudioPreviewBundle(), [compileTick]);

  const preview = useMemo(
    () => compileCreativeStudioPreview(companyId),
    [companyId, compileTick]
  );

  const activeConcept = useMemo((): CreativePreviewConcept => {
    return preview.concepts.find((c) => c.conceptId === conceptId) ?? preview.concepts[0]!;
  }, [preview, conceptId]);

  const recompile = useCallback(() => {
    setCompileTick((n) => n + 1);
  }, []);

  const selectCompany = useCallback((id: CreativePreviewCompanyId) => {
    setCompanyId(id);
    setConceptId('a');
  }, []);

  const toggleBlindMode = useCallback(() => {
    setBlindMode((on) => {
      if (on) setBlindTestResult(null);
      return !on;
    });
  }, []);

  const recordBlindTest = useCallback((result: 'pass' | 'fail') => {
    setBlindTestResult(result);
  }, []);

  return {
    companyId,
    conceptId,
    compareMode,
    blindMode,
    blindTestResult,
    preview,
    activeConcept,
    bundle,
    selectCompany,
    setConceptId,
    setCompareMode,
    toggleBlindMode,
    recordBlindTest,
    recompile,
  };
}

export type UseCreativeStudioPreviewReturn = ReturnType<typeof useCreativeStudioPreview>;

export type { CreativePreviewCompanyId, CreativeStudioPreviewResult, CreativeStudioPreviewBundle };
