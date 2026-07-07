import type { NdxbookPage } from '../../../../studio-os-core/ndxbook/types';
import { VOLUME_LABELS } from '../../../../studio-os-core/ndxbook/constants';
import { NR, nrLabel, nrPanel, nrSectionTitle } from '../ndxbook-newsroom/ndxbookNewsroomTheme';
import type { ProductionDepartmentDef } from '../../../../studio-os-core/content-pipeline/departments';

type Props = {
  page: NdxbookPage | null;
  department: ProductionDepartmentDef;
};

export function MasterAssetPassport({ page, department }: Props) {
  return (
    <aside className="p-3 mb-3 border-l-4" style={{ ...nrPanel, borderLeftColor: NR.indigo }}>
      <p style={nrSectionTitle}>MASTER CONTENT ASSET · PASSPORT</p>
      <p style={{ ...nrLabel, fontFamily: '"Futura PT Medium"', color: NR.accent }}>
        {page ? page.pageLabel.toUpperCase() : 'PAGE 001 · NOT CREATED'}
      </p>
      {page ? (
        <>
          <p style={nrLabel}>{page.title} · {VOLUME_LABELS[page.volumeId]}</p>
          <p style={{ ...nrLabel, fontSize: '6px', marginTop: 4 }}>
            STATUS · {page.status.replace('-', ' ').toUpperCase()}
          </p>
        </>
      ) : (
        <p style={nrLabel}>Living asset record — created in Production Department.</p>
      )}
      <p style={{ ...nrLabel, fontSize: '6px', marginTop: 8, color: NR.indigo }}>
        CURRENT ROOM · {department.name}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-1">
        {[
          ['BRIEF', page ? '✓' : '—'],
          ['PACKAGE', page ? '✓' : '—'],
          ['MASTER', page ? '✓' : '—'],
          ['REVIEW', page?.pipeline?.studioReview ? '✓' : '—'],
        ].map(([label, val]) => (
          <div key={label} className="p-1 border text-center" style={{ borderColor: NR.panelBorder }}>
            <p style={{ ...nrLabel, fontSize: '5px' }}>{label}</p>
            <p style={{ ...nrLabel, fontFamily: '"Futura PT Medium"', color: NR.black }}>{val}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
