import type { ProductionDepartmentId, ProductionDepartmentStatus } from '../../../../studio-os-core/content-pipeline/departments';
import {
  countCompletedDepartments,
  getDepartmentDestination,
  MASTERY_TIER_LABELS,
  resolveHeadquartersProgression,
  STUDIO_ROLES,
} from '../../../../studio-os-core/experience-dna';
import { NR, nrLabel, nrPanel, nrSectionTitle } from '../ndxbook-newsroom/ndxbookNewsroomTheme';

type Props = {
  projectLabel: string;
  currentDepartment: ProductionDepartmentId;
  statuses: Record<ProductionDepartmentId, ProductionDepartmentStatus>;
};

export function StudioDirectorBanner({ projectLabel, currentDepartment, statuses }: Props) {
  const completed = countCompletedDepartments(statuses);
  const progression = resolveHeadquartersProgression(completed, 10, currentDepartment);
  const destination = getDepartmentDestination(currentDepartment);

  return (
    <header className="mb-3 p-3 border" style={{ ...nrPanel, borderLeft: `4px solid ${NR.black}` }}>
      <p style={{ ...nrLabel, fontSize: '5px', color: NR.indigo }}>
        LIVING CREATIVE HEADQUARTERS · EXPERIENCE DNA™
      </p>
      <p style={{ ...nrSectionTitle, marginTop: 4 }}>{STUDIO_ROLES['studio-director'].title.toUpperCase()} ON LOT</p>
      <p style={{ ...nrLabel, fontFamily: '"Futura PT Medium"', color: NR.black, fontSize: '7px' }}>
        {projectLabel} · {STUDIO_ROLES['project-protagonist'].title.toUpperCase()} IN TRANSIT
      </p>
      <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-3">
        <RoleChip
          label={STUDIO_ROLES['studio-director'].title}
          value={STUDIO_ROLES['studio-director'].holder}
        />
        <RoleChip
          label={STUDIO_ROLES['executive-creative-director'].title}
          value={STUDIO_ROLES['executive-creative-director'].holder}
        />
        <RoleChip label="DEPARTMENT HEAD" value={destination.departmentHead} />
      </div>
      <p style={{ ...nrLabel, fontSize: '6px', marginTop: 8, color: NR.gray }}>
        {MASTERY_TIER_LABELS[progression.masteryTier]} · {completed}/10 buildings cleared ·{' '}
        {destination.lotZone}
      </p>
    </header>
  );
}

function RoleChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-1.5 border" style={{ borderColor: NR.panelBorder }}>
      <p style={{ ...nrLabel, fontSize: '5px', color: NR.gray }}>{label}</p>
      <p style={{ ...nrLabel, fontFamily: '"Futura PT Medium"', fontSize: '6px', color: NR.black }}>{value}</p>
    </div>
  );
}

export function DepartmentArrivalPanel({ departmentId }: { departmentId: ProductionDepartmentId }) {
  const dest = getDepartmentDestination(departmentId);
  return (
    <div className="p-3 mb-3 border" style={{ ...nrPanel, borderLeft: `4px solid ${NR.indigo}`, background: 'rgba(99,102,241,0.04)' }}>
      <p style={{ ...nrLabel, fontSize: '5px', color: NR.indigo }}>YOU HAVE ARRIVED · BUILDING ON THE LOT</p>
      <p style={{ ...nrSectionTitle, marginTop: 4 }}>{dest.buildingName.toUpperCase()}</p>
      <p style={{ ...nrLabel, fontFamily: '"Futura PT Medium"', fontSize: '7px', color: NR.black }}>{dest.arrivalLine}</p>
      <p style={{ ...nrLabel, fontSize: '6px', marginTop: 6 }}>
        Atmosphere · {dest.atmosphere}
      </p>
      <p style={{ ...nrLabel, fontSize: '6px' }}>
        Ambient overlay · {dest.ambientOverlay}
      </p>
      <p style={{ ...nrLabel, fontSize: '5px', marginTop: 4, color: NR.gray }}>
        Milestone on exit · {dest.milestoneLabel}
      </p>
    </div>
  );
}
