import type { CSSProperties } from 'react';
import {
  buildAdminAccountingSpreadsheet,
  formatAccountingMargin,
  formatAccountingUsd,
  type AccountingSpreadsheetRow,
} from '../../../utils/adminAccountingSpreadsheet';
import { buildRevenueOrdersList } from '../../../utils/adminRevenueStats';

const sectionTitleStyle = {
  fontFamily: '"Futura PT Medium"',
  color: '#EB1C24',
  fontSize: '11px',
  marginBottom: '8px',
  textTransform: 'uppercase' as const,
};

const thStyle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '8px',
  color: '#808080',
  textTransform: 'uppercase',
  textAlign: 'right',
  padding: '6px 4px',
  borderBottom: '1px solid #000',
  whiteSpace: 'nowrap',
};

const tdStyle: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '8px',
  color: '#000',
  textAlign: 'right',
  padding: '5px 4px',
  borderBottom: '1px solid #e5e7eb',
  whiteSpace: 'nowrap',
};

function rowStyles(row: AccountingSpreadsheetRow): { line: CSSProperties; cells: CSSProperties } {
  if (row.isSection) {
    return {
      line: { ...tdStyle, textAlign: 'left', color: '#EB1C24', fontFamily: '"Futura PT Medium"', borderBottom: '1px solid #d1d5db', background: '#fafafa' },
      cells: { ...tdStyle, borderBottom: '1px solid #d1d5db', background: '#fafafa' },
    };
  }
  if (row.isTotal) {
    return {
      line: { ...tdStyle, textAlign: 'left', fontFamily: '"Futura PT Medium"', borderTop: '1px solid #000', borderBottom: 'none', background: '#fff' },
      cells: { ...tdStyle, fontFamily: '"Futura PT Medium"', borderTop: '1px solid #000', borderBottom: 'none', background: '#fff' },
    };
  }
  return {
    line: { ...tdStyle, textAlign: 'left' },
    cells: tdStyle,
  };
}

type Props = {
  totalRevenueHint?: number;
};

export default function AccountingSpreadsheetCard({ totalRevenueHint = 0 }: Props) {
  const orders = buildRevenueOrdersList();
  const model = buildAdminAccountingSpreadsheet(orders, totalRevenueHint);

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-black p-4 mb-4" style={{ borderWidth: '1.3px' }}>
      <h3 style={sectionTitleStyle}>BUSINESS SPREADSHEET</h3>
      <p
        style={{
          fontFamily: '"Futura PT Book"',
          fontSize: '9px',
          color: '#808080',
          marginBottom: '10px',
          textTransform: 'uppercase',
          lineHeight: 1.4,
        }}
      >
        SURGICAL BREAKDOWN BY LINE — LIST PRICE, ACTUAL REVENUE, EST. UNIT COST, COGS, GROSS PROFIT & MARGIN. PACKAGING COGS = ${model.totals.packagingCogsUsd.toLocaleString()} ACROSS {model.totals.physicalOrders} PHYSICAL ORDERS.
      </p>
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: '520px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, textAlign: 'left' }}>LINE</th>
              <th style={thStyle}>UNITS</th>
              <th style={thStyle}>LIST</th>
              <th style={thStyle}>AVG SALE</th>
              <th style={thStyle}>REVENUE</th>
              <th style={thStyle}>UNIT COST</th>
              <th style={thStyle}>COGS</th>
              <th style={thStyle}>PROFIT</th>
              <th style={thStyle}>MARGIN</th>
            </tr>
          </thead>
          <tbody>
            {model.rows.map((row) => {
              const styles = rowStyles(row);
              const profitColor = row.profitUsd < 0 ? '#EB1C24' : row.isTotal ? '#000' : '#000';
              return (
                <tr key={row.key}>
                  <td style={styles.line}>{row.line}</td>
                  <td style={styles.cells}>{row.isSection ? '—' : row.units.toLocaleString()}</td>
                  <td style={styles.cells}>{row.isSection || row.isTotal ? '—' : formatAccountingUsd(row.listPriceUsd)}</td>
                  <td style={styles.cells}>
                    {row.isSection ? '—' : row.avgSalePriceUsd > 0 ? formatAccountingUsd(row.avgSalePriceUsd) : '—'}
                  </td>
                  <td style={{ ...styles.cells, color: row.revenueUsd > 0 || row.isTotal ? '#EB1C24' : '#808080' }}>
                    {row.isSection ? '—' : formatAccountingUsd(row.revenueUsd)}
                  </td>
                  <td style={styles.cells}>{row.isSection ? '—' : formatAccountingUsd(row.unitCostUsd)}</td>
                  <td style={styles.cells}>{row.isSection ? '—' : formatAccountingUsd(row.cogsUsd)}</td>
                  <td style={{ ...styles.cells, color: profitColor }}>{row.isSection ? '—' : formatAccountingUsd(row.profitUsd)}</td>
                  <td style={styles.cells}>{row.isSection ? '—' : formatAccountingMargin(row.marginPct)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
