import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import { buildRevenueOrdersList } from '../../../../utils/adminRevenueStats';
import { pageActionButtonStyle } from '../../../../layouts/PageActionsBelowCard';

const FULFILLED_STATUSES = ['SHIPPED', 'DELIVERED', 'FULFILLED'];

function isDeliveredOrder(o: { status?: string; deliveredAt?: unknown }): boolean {
  const s = (o.status || '').toUpperCase().trim();
  if (s === 'DELIVERED') return true;
  const at = (o as { deliveredAt?: string | number }).deliveredAt;
  if (at != null && at !== '') return true;
  return false;
}

function getProductImage(productName: string): string {
  switch ((productName || '').toUpperCase()) {
    case 'BLANCO': return '/assets/2D BLANCO FRONT.png';
    case 'SOFT WAVE':
    case 'BEACH WAVE': return '/assets/2D WAVY FRONT.png';
    case 'SOFT CURL':
    case 'OCEAN CURL': return '/assets/2D CURLY FRONT.png';
    case 'NOIR':
    default: return '/assets/natural front.png';
  }
}

export default function AdminFulfilledOrders() {
  const navigate = useNavigate();
  const orders = useMemo(() => buildRevenueOrdersList(), []);
  const fulfilled = useMemo(() => orders.filter((o) => FULFILLED_STATUSES.includes((o.status || '').toUpperCase().trim())), [orders]);

  const byClient = useMemo(() => {
    const map = new Map<string, typeof fulfilled>();
    for (const o of fulfilled) {
      const email = (o as { userEmail?: string }).userEmail || 'Unknown';
      if (!map.has(email)) map.set(email, []);
      map.get(email)!.push(o);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => {
        const da = isDeliveredOrder(a as { status?: string; deliveredAt?: unknown });
        const db = isDeliveredOrder(b as { status?: string; deliveredAt?: unknown });
        if (da !== db) return da ? 1 : -1;
        return new Date((b.date || '').toString()).getTime() - new Date((a.date || '').toString()).getTime();
      });
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [fulfilled]);

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      <div className="fixed inset-0 -z-10" style={{ backgroundImage: `url('/assets/marble-half.png')`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'repeat', backgroundAttachment: 'fixed' }} />
      <div className="relative z-10" style={{ textTransform: 'uppercase' }}>
        <AdminHeader title="FULFILLED ORDERS" showBack onBack={() => navigate('/admin/revenue?tab=ORDERS')} breadcrumbParentLabel="REVENUE" breadcrumbParentPath="/admin/revenue" />
        <div className="pb-8 px-4 max-w-md mx-auto">
          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#808080', marginBottom: '16px', textTransform: 'none' }}>
            Archived orders (shipped, delivered, or fulfilled) organized by client.
          </p>
          {byClient.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-sm border border-black p-6 text-center" style={{ borderWidth: '1.3px' }}>
              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>NO FULFILLED ORDERS YET</p>
            </div>
          ) : (
            <div className="space-y-4">
              {byClient.map(([email, clientOrders]) => (
                <div key={email} className="bg-white/60 backdrop-blur-sm border border-black p-4" style={{ borderWidth: '1.3px' }}>
                  <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '10px' }}>{email}</h3>
                  <div className="space-y-2">
                    {clientOrders.map((order) => {
                      const items = order.lineItems?.length ? order.lineItems : [{ productName: order.productName || 'NOIR' }];
                      const total = order.total ?? order.amount ?? 0;
                      const orderNum = (order.orderNumber || order.id || '').toString().replace(/^ORDER\s*#?\s*/i, '') || '—';
                      return (
                        <div key={order.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <img src={getProductImage(items[0]?.productName || 'NOIR')} alt="" style={{ width: 48, height: 48, objectFit: 'contain' }} />
                          <div className="flex-1 min-w-0">
                            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#000' }}>#{orderNum} · ${total.toLocaleString()}</p>
                            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080' }}>{order.date || '—'}</p>
                          </div>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#15803d' }}>{(order.status || '').toUpperCase()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          <button type="button" onClick={() => navigate('/admin/revenue?tab=ORDERS')} className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50 bg-white mt-4" style={pageActionButtonStyle}>BACK TO ORDERS</button>
        </div>
      </div>
    </div>
  );
}
