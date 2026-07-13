import { useCallback, useMemo, useState } from 'react';
import type { ExperienceLabIndustryPackOptionId } from '../studio-os-core/canonical-studio-world';
import {
  getExperienceLabPackOption,
  listExperienceLabPackOptions,
  planExperienceLabHeadquartersFromPack,
  resolveExperienceLabEntry,
} from '../studio-os-core/canonical-studio-world';
import { getIndustryPack } from '../studio-os-core/industry-packs';

export function useExperienceLabIndustryPack(initialPackOptionId: ExperienceLabIndustryPackOptionId = 'hair-brand') {
  const [packOptionId, setPackOptionId] = useState<ExperienceLabIndustryPackOptionId>(initialPackOptionId);
  const [companyHqOrganizationId] = useState('founder-company-hq');

  const packOption = useMemo(() => getExperienceLabPackOption(packOptionId), [packOptionId]);
  const packOptions = useMemo(() => listExperienceLabPackOptions(), []);

  const entry = useMemo(
    () => resolveExperienceLabEntry({ packOptionId, companyHqOrganizationId }),
    [packOptionId, companyHqOrganizationId]
  );

  const headquartersPlan = useMemo(() => {
    const result = planExperienceLabHeadquartersFromPack({ packOptionId, companyHqOrganizationId });
    return result.ok ? result : null;
  }, [packOptionId, companyHqOrganizationId]);

  const industryPack = useMemo(() => {
    if (!packOption) return null;
    return getIndustryPack(packOption.industryPackId) ?? null;
  }, [packOption]);

  const selectPackOption = useCallback((id: ExperienceLabIndustryPackOptionId) => {
    setPackOptionId(id);
  }, []);

  return {
    packOptionId,
    packOption,
    packOptions,
    entry,
    headquartersPlan,
    industryPack,
    companyHqOrganizationId,
    selectPackOption,
  };
}
