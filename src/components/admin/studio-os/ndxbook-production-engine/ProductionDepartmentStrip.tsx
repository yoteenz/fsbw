import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { ProductionDepartmentId, ProductionDepartmentStatus } from '../../../../studio-os-core/content-pipeline/departments';
import { PRODUCTION_DEPARTMENTS } from '../../../../studio-os-core/content-pipeline/departments';
import { getDepartmentDestination } from '../../../../studio-os-core/experience-dna';
import { adminStudioNdxbookNewsroomDepartmentPath } from '../../../../utils/adminStudioRoutes';
import { NR, nrLabel } from '../ndxbook-newsroom/ndxbookNewsroomTheme';

type Props = {
  statuses: Record<ProductionDepartmentId, ProductionDepartmentStatus>;
  currentId: ProductionDepartmentId;
};

function stripStyle(status: ProductionDepartmentStatus, isCurrent: boolean): CSSProperties {
  if (isCurrent) {
    return {
      borderColor: NR.black,
      background: 'rgba(15,23,42,0.1)',
      color: NR.black,
      opacity: 1,
    };
  }
  if (status === 'complete') {
    return {
      borderColor: '#22C55E',
      background: 'rgba(34,197,94,0.08)',
      color: '#166534',
      opacity: 1,
    };
  }
  if (status === 'locked') {
    return {
      borderColor: NR.panelBorder,
      background: 'rgba(248,250,252,0.8)',
      color: '#CBD5E1',
      opacity: 0.65,
    };
  }
  return {
    borderColor: NR.indigo,
    background: 'rgba(99,102,241,0.06)',
    color: NR.indigo,
    opacity: 1,
  };
}

export function ProductionDepartmentStrip({ statuses, currentId }: Props) {
  const currentDest = getDepartmentDestination(currentId);
  const completed = Object.values(statuses).filter((s) => s === 'complete').length;

  return (
    <div className="mb-3 p-2 border" style={{ borderColor: NR.panelBorder, background: 'rgba(255,255,255,0.72)' }}>
      <p style={{ ...nrLabel, fontFamily: '"Futura PT Medium"', color: NR.black, marginBottom: 4 }}>
        STUDIO LOT · PRODUCTION WING · PAGE 001 IN TRANSIT
      </p>
      <p style={{ ...nrLabel, fontSize: '5px', color: NR.gray, marginBottom: 8 }}>
        {completed}/10 buildings cleared · now at {currentDest.buildingName} · {currentDest.lotZone}
      </p>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {PRODUCTION_DEPARTMENTS.map((dept) => {
          const status = statuses[dept.id];
          const isCurrent = dept.id === currentId;
          const locked = status === 'locked';
          const dest = getDepartmentDestination(dept.id);
          const inner = (
            <div
              className="px-2 py-1.5 border text-center min-w-[80px]"
              style={{
                ...stripStyle(status, isCurrent),
                fontFamily: '"Futura PT Medium"',
                fontSize: '5px',
                fontWeight: 515,
                letterSpacing: '0.06em',
              }}
            >
              <p>{String(dept.number).padStart(2, '0')}</p>
              <p className="mt-0.5">{dept.shortName}</p>
              <p className="mt-0.5 text-[4px] opacity-80">{dest.buildingName}</p>
              {status === 'complete' ? <p className="mt-0.5 text-[4px]">✓</p> : null}
              {locked ? <p className="mt-0.5 text-[4px]">🔒</p> : null}
            </div>
          );

          if (locked) {
            return (
              <div key={dept.id} title="Complete prior departments to unlock">
                {inner}
              </div>
            );
          }

          return (
            <Link
              key={dept.id}
              to={adminStudioNdxbookNewsroomDepartmentPath(dept.id)}
              title={`${dest.buildingName} · ${dept.tagline}`}
              className="shrink-0"
            >
              {inner}
            </Link>
          );
        })}
      </div>
      <p style={{ ...nrLabel, fontSize: '6px', marginTop: 6 }}>
        {currentDest.arrivalLine}
      </p>
    </div>
  );
}
