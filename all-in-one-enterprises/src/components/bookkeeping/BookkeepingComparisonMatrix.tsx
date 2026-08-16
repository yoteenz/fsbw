import { useState } from 'react';
import {
  BOOKKEEPING_COMPARISON_MATRIX,
  COMPARISON_MATRIX_DISCLAIMER,
  type ComparisonCellValue,
} from '../../bookkeeping/autopilot/competitiveMatrix';

type CompareColumn = 'diy' | 'generalManaged' | 'truckingService' | 'allInOne';

const COLUMN_LABELS: Record<CompareColumn, string> = {
  diy: 'DIY Software',
  generalManaged: 'General Managed',
  truckingService: 'Trucking Service',
  allInOne: 'All In One',
};

function cellText(value: ComparisonCellValue): string {
  return value;
}

export function BookkeepingComparisonMatrix() {
  const [mobileColumn, setMobileColumn] = useState<CompareColumn>('allInOne');
  const rows = BOOKKEEPING_COMPARISON_MATRIX.filter((r) => r.visible);

  return (
    <div className="aio-bk-compare">
      <div className="aio-bk-compare__desktop">
        <table className="aio-bk-compare__table">
          <thead>
            <tr>
              <th scope="col">Capability</th>
              <th scope="col">DIY Bookkeeping Software</th>
              <th scope="col">General Managed Bookkeeping</th>
              <th scope="col">Trucking Bookkeeping Service</th>
              <th scope="col" className="aio-bk-compare__aio-col">All In One</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <th scope="row">
                  {row.label}
                  {row.footnote && <span className="aio-bk-compare__footnote">{row.footnote}</span>}
                </th>
                <td>{cellText(row.diy)}</td>
                <td>{cellText(row.generalManaged)}</td>
                <td>{cellText(row.truckingService)}</td>
                <td className="aio-bk-compare__aio-col">{cellText(row.allInOne)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="aio-bk-compare__mobile">
        <div className="aio-bk-compare__mobile-tabs" role="tablist" aria-label="Compare service models">
          {(Object.keys(COLUMN_LABELS) as CompareColumn[]).map((col) => (
            <button
              key={col}
              type="button"
              role="tab"
              aria-selected={mobileColumn === col}
              className={`aio-bk-compare__mobile-tab${mobileColumn === col ? ' is-active' : ''}${col === 'allInOne' ? ' aio-bk-compare__mobile-tab--aio' : ''}`}
              onClick={() => setMobileColumn(col)}
            >
              {COLUMN_LABELS[col]}
            </button>
          ))}
        </div>
        <ul className="aio-bk-compare__mobile-list">
          {rows.map((row) => (
            <li key={row.id}>
              <span>{row.label}</span>
              <span className={mobileColumn === 'allInOne' ? 'aio-bk-compare__mobile-value--aio' : undefined}>
                {cellText(row[mobileColumn])}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="aio-bk-compare__disclaimer">{COMPARISON_MATRIX_DISCLAIMER}</p>
    </div>
  );
}
