import { isMockProfileChromeActive } from '../../utils/adminAuth';

type VoucherHistoryRow = { date: string; transaction: string; amount: number };

type VoucherHistoryPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  userData: { email?: string; role?: string; voucherHistory?: unknown; vouchers?: Record<string, number> } | null;
  mockHistory?: VoucherHistoryRow[];
};

const MOCK_VOUCHER_HISTORY: VoucherHistoryRow[] = [
  { date: '2-12-2025', transaction: '1X FLEXIBLE CAP', amount: 1 },
  { date: '2-10-2025', transaction: '1X HAIRLINE', amount: 1 },
  { date: '1-28-2025', transaction: 'REDEEMED', amount: -1 },
  { date: '1-15-2025', transaction: '1X COLOR', amount: 1 },
];

const VOUCHER_DISPLAY_ORDER = ['COLOR', 'HAIRLINE', 'STYLING', 'FLEXIBLE CAP', 'FLEX CAP'];

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

function parseDateMs(dateStr: string): number {
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3) {
    const [month, day, year] = parts;
    return new Date(year, month - 1, day).getTime();
  }
  return new Date(dateStr).getTime();
}

export default function VoucherHistoryPopup({
  isOpen,
  onClose,
  userData,
  mockHistory = MOCK_VOUCHER_HISTORY,
}: VoucherHistoryPopupProps) {
  if (!isOpen) return null;

  const history = (userData?.voucherHistory ?? []) as VoucherHistoryRow[];
  const profileUsesMockChrome = Boolean(userData && isMockProfileChromeActive(userData));
  const displayHistory =
    history.length === 0 && profileUsesMockChrome ? mockHistory : history;
  const sorted = [...displayHistory].sort((a, b) => parseDateMs(b.date) - parseDateMs(a.date));
  const transactionDisplay = (tx: string) => tx.replace(/\bFLEXIBLE CAP\b/gi, 'FLEX CAP');

  const vouchers = userData?.vouchers ?? {};
  const availableText = VOUCHER_DISPLAY_ORDER.filter((key) => (vouchers[key] ?? 0) > 0)
    .map((key) => `${vouchers[key]}X ${key}`)
    .join(' · ');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
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
          style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
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
            VOUCHER HISTORY
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
              YOU HAVEN&apos;T HAD ANY VOUCHER TRANSACTIONS YET.
            </p>
          ) : (
            sorted.map((row, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                }}
              >
                <span
                  style={{
                    flex: '1 1 0',
                    minWidth: 0,
                    textAlign: 'left',
                    color: '#000000',
                    fontFamily: '"Futura PT Book"',
                  }}
                >
                  {formatDate(row.date)}
                </span>
                <span
                  style={{
                    flex: '1 1 0',
                    minWidth: 0,
                    textAlign: 'center',
                    color: '#808080',
                    fontFamily: '"Futura PT Medium"',
                    fontWeight: '500',
                  }}
                >
                  {transactionDisplay(row.transaction)}
                </span>
                <span
                  style={{
                    flex: '1 1 0',
                    minWidth: 0,
                    textAlign: 'right',
                    color: row.amount >= 0 ? '#16a34a' : '#EB1C24',
                    fontFamily: '"Futura PT Medium"',
                    fontWeight: '500',
                  }}
                >
                  {row.amount >= 0 ? '+' : ''}
                  {row.amount}
                </span>
              </div>
            ))
          )}
        </div>
        <p
          style={{
            fontFamily: '"Futura PT Medium"',
            fontWeight: '500',
            fontSize: '9px',
            color: '#000000',
            margin: '12px 0 0 0',
            paddingTop: '12px',
            borderTop: '1px solid #E5E5E5',
            textTransform: 'uppercase',
          }}
        >
          VOUCHERS AVAILABLE: {availableText || 'NONE'}
        </p>
      </div>
    </div>
  );
}
