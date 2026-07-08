import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CareerWorldId } from '../studio-os-core/career-worlds/types';
import {
  STUDIO_EXCHANGE_UPDATED_EVENT,
  acquireProfessionalLicense,
  addExpansionToLicense,
  advanceCertificationCeremony,
  assignMentorApprentice,
  buildStudioExchangeDashboard,
  getStudioExchangeCatalog,
  listProfessionalLicenses,
  listStudioExchangeCareerWorlds,
  professionIdForCareerWorld,
  readStudioExchangeStore,
  recordLicenseProgress,
  scheduleCertificationCeremony,
  type ProfessionalLicense,
} from '../studio-os-core/studio-exchange';

const DEFAULT_ORG = 'studio-world';
const DEFAULT_CITIZEN = 'founder';

export function useStudioExchangeState(organizationId = DEFAULT_ORG, citizenId = DEFAULT_CITIZEN) {
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener(STUDIO_EXCHANGE_UPDATED_EVENT, handler);
    return () => window.removeEventListener(STUDIO_EXCHANGE_UPDATED_EVENT, handler);
  }, [refresh]);

  const store = useMemo(() => readStudioExchangeStore(), [tick]);
  const catalog = useMemo(() => getStudioExchangeCatalog(), [tick]);
  const careerWorlds = useMemo(() => listStudioExchangeCareerWorlds(), [tick]);
  const dashboard = useMemo(
    () => buildStudioExchangeDashboard(citizenId),
    [tick, citizenId],
  );
  const licenses = useMemo(
    () => listProfessionalLicenses(citizenId),
    [tick, citizenId, store.licenses.length],
  );

  const claimLicense = useCallback(
    (careerWorldId: CareerWorldId) =>
      acquireProfessionalLicense({
        organizationId,
        citizenId,
        careerWorldId,
        profession: professionIdForCareerWorld(careerWorldId),
      }),
    [organizationId, citizenId],
  );

  const attachExpansion = useCallback(
    (licenseId: string, expansionId: string) => addExpansionToLicense(licenseId, expansionId),
    [],
  );

  const updateProgress = useCallback(
    (licenseId: string, certificationId: string, progressPercent: number) =>
      recordLicenseProgress(licenseId, certificationId, progressPercent),
    [],
  );

  const startCeremony = useCallback(
    (licenseId: string, certificationId: string) =>
      scheduleCertificationCeremony(licenseId, certificationId),
    [],
  );

  const advanceCeremony = useCallback(
    (ceremonyId: string) => advanceCertificationCeremony(ceremonyId),
    [],
  );

  const mentorAssign = useCallback(
    (mentorLicenseId: string, apprenticeLicenseId: string) =>
      assignMentorApprentice(mentorLicenseId, apprenticeLicenseId),
    [],
  );

  return {
    catalog,
    careerWorlds,
    dashboard,
    licenses,
    store,
    claimLicense,
    attachExpansion,
    updateProgress,
    startCeremony,
    advanceCeremony,
    mentorAssign,
    refresh,
  };
}

export type { ProfessionalLicense };
