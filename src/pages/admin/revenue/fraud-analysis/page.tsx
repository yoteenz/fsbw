import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import { buildRevenueOrdersList } from '../../../../utils/adminRevenueStats';
import { pageActionButtonStyle } from '../../../../layouts/PageActionsBelowCard';

type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAR';

type ScoredOrder = {
  order: ReturnType<typeof buildRevenueOrdersList>[0];
  score: number;
  level: RiskLevel;
  flags: string[];
};

function runFraudAnalysis(orders: ReturnType<typeof buildRevenueOrdersList>): ScoredOrder[] {
  const byEmail = new Map<string, typeof orders>();
  for (const o of orders) {
    const e = (o as { userEmail?: string }).userEmail || '';
    if (!byEmail.has(e)) byEmail.set(e, []);
    byEmail.get(e)!.push(o);
  }
  const scored: ScoredOrder[] = [];
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  for (const order of orders) {
    const flags: string[] = [];
    let score = 0;
    const email = (order as { userEmail?: string }).userEmail || '';
    const ordersSameEmail = byEmail.get(email) || [];
    const total = order.total ?? order.amount ?? 0;
    const orderDate = new Date((order.date || '').toString()).getTime();

    if (ordersSameEmail.length >= 5) {
      flags.push('Multiple orders same client (velocity)');
      score += 25;
    }
    if (ordersSameEmail.length >= 3 && ordersSameEmail.filter((o) => now - new Date((o.date || '').toString()).getTime() < 7 * oneDay).length >= 3) {
      flags.push('High velocity (3+ orders in 7 days)');
      score += 30;
    }
    if (total > 2000) {
      flags.push('Unusually high order amount');
      score += 20;
    }
    if (total < 50 && total > 0) {
      flags.push('Very low order amount');
      score += 10;
    }
    if (!email || email.length < 5) {
      flags.push('Missing or invalid email');
      score += 35;
    }
    if (/^(test|fake|temp|noreply|no-reply|admin@)/i.test(email)) {
      flags.push('Suspicious email pattern');
      score += 40;
    }
    const duplicateAmount = orders.filter((o) => (o.total ?? o.amount ?? 0) === total && o.id !== order.id).length;
    if (duplicateAmount >= 2) {
      flags.push('Duplicate amount across orders');
      score += 15;
    }
    if (orderDate > now + oneDay) {
      flags.push('Future-dated order');
      score += 50;
    }

    let level: RiskLevel = 'CLEAR';
    if (score >= 50) level = 'HIGH';
    else if (score >= 25) level = 'MEDIUM';
    else if (score >= 10) level = 'LOW';

    scored.push({ order, score, level, flags });
  }

  return scored.sort((a, b) => b.score - a.score);
}

export default function AdminFraudAnalysis() {
  const navigate = useNavigate();
  const orders = useMemo(() => buildRevenueOrdersList(), []);
  const [filter, setFilter] = useState<RiskLevel | 'ALL'>('ALL');
  const report = useMemo(() => runFraudAnalysis(orders), [orders]);
  const filtered = filter === 'ALL' ? report : report.filter((r) => r.level === filter);
  const flaggedCount = report.filter((r) => r.level !== 'CLEAR').length;

  const levelColor: Record<RiskLevel, string> = { HIGH: '#dc2626', MEDIUM: '#ea580c', LOW: '#ca8a04', CLEAR: '#16a34a' };

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      <div className="fixed inset-0 -z-10" style={{ backgroundImage: `url('/assets/marble-half.png')`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'repeat', backgroundAttachment: 'fixed' }} />
      <div className="relative z-10" style={{ textTransform: 'uppercase' }}>
        <AdminHeader title="FRAUD" showBack onBack={() => navigate('/admin/revenue')} breadcrumbParentLabel="REVENUE" breadcrumbParentPath="/admin/revenue" />
        <div className="pb-8 px-4 max-w-md mx-auto">
          <div className="bg-white/60 backdrop-blur-sm border border-black p-4 mb-4" style={{ borderWidth: '1.3px' }}>
            <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>SUMMARY</h3>
            <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080' }}>TOTAL ORDERS SCANNED</span>
              <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000' }}>{orders.length}</span>
            </div>
            <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080' }}>FLAGGED / POTENTIAL RISK</span>
              <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: flaggedCount ? '#EB1C24' : '#16a34a' }}>{flaggedCount}</span>
            </div>
            <div className="flex justify-between py-2">
              <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080' }}>CLEAR</span>
              <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#16a34a' }}>{orders.length - flaggedCount}</span>
            </div>
          </div>
          <div className="flex w-full gap-1 mb-4" style={{ width: '100%' }}>
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW', 'CLEAR'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className="py-2 flex-1 border font-medium bg-white"
                style={{
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '9px',
                  borderColor: filter === f ? '#EB1C24' : '#000',
                  color: filter === f ? '#EB1C24' : '#000',
                  backgroundColor: '#FFFFFF',
                  borderWidth: '1.3px',
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#808080' }}>No orders match this filter.</p>
            ) : (
              filtered.map(({ order, score, level, flags }) => (
                <div key={order.id} className="bg-white/60 backdrop-blur-sm border border-black p-4" style={{ borderWidth: '1.3px', borderLeftColor: levelColor[level], borderLeftWidth: '4px' }}>
                  <div className="flex justify-between items-start mb-2">
                    <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#000' }}>#{(order.orderNumber || order.id || '').toString().replace(/^ORDER\s*#?\s*/i, '') || '—'}</span>
                    <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: levelColor[level] }}>{level} · {score} pts</span>
                  </div>
                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080' }}>{(order as { userEmail?: string }).userEmail || '—'} · ${(order.total ?? order.amount ?? 0).toLocaleString()} · {order.date || '—'}</p>
                  {flags.length > 0 && (
                    <ul className="mt-2 space-y-1" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {flags.map((f, i) => (
                        <li key={i} style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080' }}>• {f}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}
          </div>
          <button type="button" onClick={() => navigate('/admin/revenue')} className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50 bg-white mt-4" style={pageActionButtonStyle}>BACK TO REVENUE</button>
        </div>
      </div>
    </div>
  );
}
