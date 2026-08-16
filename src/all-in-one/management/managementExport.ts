/** CSV export for management reports — respects column visibility; neutralizes formula injection. */

import { escapeCsvCell } from '../security/securityRedaction';

export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const lines = [headers.map(escapeCsvCell).join(','), ...rows.map((r) => r.map(escapeCsvCell).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
