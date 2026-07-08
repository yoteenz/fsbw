import { useCallback, useEffect, useMemo, useState } from 'react';
import { requireDepartmentPackage } from '../studio-os-core/department-package';
import { resolveWalkableZones, resolveRoomAtmosphere } from '../studio-os-core/department-room';
import { ensureProjectGenome, resolveActiveProjectGenome } from '../studio-os-core/project-genome';
import { bootstrapCompanyGenomePlatform } from '../studio-os-core/company-genome/bootstrap';

export function useDepartmentVerticalSlice(departmentId: string) {
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    bootstrapCompanyGenomePlatform();
    ensureProjectGenome(departmentId);
  }, [departmentId]);

  const pkg = useMemo(() => requireDepartmentPackage(departmentId), [departmentId]);
  const project = useMemo(() => {
    void version;
    return resolveActiveProjectGenome(departmentId);
  }, [departmentId, version]);

  const atmosphere = useMemo(() => resolveRoomAtmosphere(pkg.roomDna), [pkg]);
  const zones = useMemo(() => resolveWalkableZones(pkg), [pkg]);

  const activeZone = useMemo(
    () => zones.find((z) => z.id === activeZoneId) ?? zones.find((z) => z.isEntry) ?? zones[0] ?? null,
    [zones, activeZoneId]
  );

  return {
    pkg,
    project,
    atmosphere,
    zones,
    activeZone,
    activeZoneId: activeZone?.id ?? null,
    setActiveZoneId,
    bump,
  };
}
