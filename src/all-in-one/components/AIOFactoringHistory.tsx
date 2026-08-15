import type { FactoringInvoiceStatus } from '../services/factoring/factoringTypes';
import { AIOFactoringStatusBadge } from './AIOFactoringStatusBadge';

type HistoryRow = {
  id: string;
  invoice: string;
  originalAmount: number;
  fee: number;
  netFunded: number;
  fundedDate: string;
  debtor: string;
  status: FactoringInvoiceStatus;
};

type Props = {
  rows: HistoryRow[];
};

export function AIOFactoringHistory({ rows }: Props) {
  return (
    <div className="aio-factoring-history">
      <div className="aio-factoring-history__table-wrap">
        <table className="aio-factoring-table aio-factoring-table--history">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Original</th>
              <th>Fee</th>
              <th>Net Funded</th>
              <th>Funded Date</th>
              <th>Debtor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td data-label="Invoice">{row.invoice}</td>
                <td data-label="Original">${row.originalAmount.toLocaleString()}</td>
                <td data-label="Fee">${row.fee.toLocaleString()}</td>
                <td data-label="Net Funded">${row.netFunded.toLocaleString()}</td>
                <td data-label="Funded Date">{row.fundedDate}</td>
                <td data-label="Debtor">{row.debtor}</td>
                <td data-label="Status">
                  <AIOFactoringStatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="aio-factoring-sample-note">Sample activity for prototype demonstration only.</p>
    </div>
  );
}
