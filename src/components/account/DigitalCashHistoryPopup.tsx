import {
  digitalCashHistorySortTimestampMs,
  type DigitalCashHistoryRow,
  withAdminMockDigitalCashHistoryRow,
} from '../../utils/digitalCashHistoryDisplay';

type DigitalCashHistoryPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  userData: Record<string, unknown> | null | undefined;
  fallbackHistory?: DigitalCashHistoryRow[];
};

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3) {
    const [month, day, year] = parts;
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  const d = new Date(dateStr);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return dateStr;
}

function formatAmount(amount: number): string {
  return `$${Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} USD`;
}

export default function DigitalCashHistoryPopup({
  isOpen,
  onClose,
  userData,
  fallbackHistory = [],
}: DigitalCashHistoryPopupProps) {
  if (!isOpen) return null;

  const storedHistory = Array.isArray(userData?.digitalCashHistory)
    ? (userData.digitalCashHistory as DigitalCashHistoryRow[])
    : [];
  const baseHistory = storedHistory.length > 0 ? storedHistory : fallbackHistory;
  const history = withAdminMockDigitalCashHistoryRow(baseHistory, userData);
  const sorted = [...history].sort(
    (a, b) => digitalCashHistorySortTimestampMs(b) - digitalCashHistorySortTimestampMs(a)
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="bg-white/60 backdrop-blur-sm border border-black"
        style={{
          borderWidth: '1.3px',
          padding: '16px',
          maxWidth: '400px',
          width: '100%',
          maxHeight: '85vh',
          overflow: 'auto',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="-mt-1 pb-1 border-b border-gray-200"
          style={{
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <p
            style={{
              fontFamily: '"Futura PT Medium"',
              color: '#EB1C24',
              fontSize: '12px',
              margin: '0',
              textTransform: 'uppercase',
              fontWeight: '500',
              textAlign: 'left',
            }}
          >
            DIGITAL CASH HISTORY
          </p>
          <img
            src="/assets/points-history.svg"
            alt=""
            style={{ width: '16px', height: '16px', flexShrink: 0, objectFit: 'contain' }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            fontSize: '10px',
            textTransform: 'uppercase',
            marginBottom: '8px',
            fontFamily: '"Futura PT Medium"',
            fontWeight: '500',
            color: '#000000',
          }}
        >
          <span style={{ flex: '1 1 0', minWidth: 0, textAlign: 'left' }}>DATE</span>
          <span style={{ flex: '1 1 0', minWidth: 0, textAlign: 'center' }}>TRANSACTION</span>
          <span style={{ flex: '1 1 0', minWidth: 0, textAlign: 'right' }}>AMOUNT</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sorted.length === 0 ? (
            <p
              style={{
                fontFamily: '"Futura PT Medium"',
                fontWeight: '500',
                fontSize: '10px',
                color: '#808080',
                margin: '6px 0',
                textTransform: 'uppercase',
                textAlign: 'center',
              }}
            >
              YOU HAVEN&apos;T HAD ANY DIGITAL CASH TRANSACTIONS YET.
            </p>
          ) : (
            sorted.map((row, i) => (
              <div
                key={`${row.date}-${row.transaction}-${row.amount}-${i}`}
                style={{ display: 'flex', alignItems: 'center', width: '100%', fontSize: '10px', textTransform: 'uppercase' }}
              >
                <span style={{ flex: '1 1 0', minWidth: 0, textAlign: 'left', color: '#000000', fontFamily: '"Futura PT Book"' }}>
                  {formatDate(row.date)}
                </span>
                <span style={{ flex: '1 1 0', minWidth: 0, textAlign: 'center', color: '#808080', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>
                  {row.transaction}
                </span>
                <span style={{ flex: '1 1 0', minWidth: 0, textAlign: 'right', color: row.amount >= 0 ? '#16a34a' : '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>
                  {row.amount >= 0 ? '+' : ''}
                  {formatAmount(row.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
