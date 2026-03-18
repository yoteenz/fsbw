import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import { buildRevenueOrdersList, getDepletedInventory, getInventoryOverride, setInventoryOverride, STARTING_INVENTORY } from '../../../../utils/adminRevenueStats';
import { pageActionButtonStyle } from '../../../../layouts/PageActionsBelowCard';

const PRODUCT_NAMES = ['NOIR', 'BLANCO', 'SOFT WAVE', 'BEACH WAVE', 'SOFT CURL', 'OCEAN CURL'];

export default function AdminEditInventory() {
  const navigate = useNavigate();
  const orders = buildRevenueOrdersList();
  const computed = getDepletedInventory(orders);
  const override = getInventoryOverride();
  const initial = override ?? computed;

  const [products, setProducts] = useState<Record<string, number>>(() => ({ ...initial.products }));
  const [packaging, setPackaging] = useState<Record<string, number>>(() => ({ ...initial.packaging }));
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setInventoryOverride({ products: { ...products }, packaging: { ...packaging } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateProduct = (name: string, raw: string) => {
    if (raw === '') {
      setProducts((prev) => ({ ...prev, [name]: 0 }));
      return;
    }
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 0) setProducts((prev) => ({ ...prev, [name]: Math.round(n) }));
  };
  const updatePackaging = (name: string, raw: string) => {
    if (raw === '') {
      setPackaging((prev) => ({ ...prev, [name]: 0 }));
      return;
    }
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 0) setPackaging((prev) => ({ ...prev, [name]: Math.round(n) }));
  };

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      <div className="fixed inset-0 -z-10" style={{ backgroundImage: `url('/assets/marble-half.png')`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'repeat', backgroundAttachment: 'fixed' }} />
      <div className="relative z-10" style={{ textTransform: 'uppercase' }}>
        <AdminHeader title="EDIT INVENTORY" showBack onBack={() => navigate('/admin/revenue')} breadcrumbParentLabel="REVENUE" breadcrumbParentPath="/admin/revenue" />
        <div className="pb-8 px-4 max-w-md mx-auto">
          <div className="bg-white/60 backdrop-blur-sm border border-black p-4 mb-4" style={{ borderWidth: '1.3px' }}>
            <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '10px' }}>PRODUCTS</h3>
            {PRODUCT_NAMES.map((name) => (
              <div key={name} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080' }}>{name}</span>
                <input
                  type="number"
                  min={0}
                  value={String(Number(products[name] ?? 0))}
                  onChange={(e) => updateProduct(name, e.target.value)}
                  className="w-20 py-1 px-2 border border-black text-right rounded-none"
                  style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000', borderRadius: 0 }}
                />
              </div>
            ))}
          </div>

          <div className="bg-white/60 backdrop-blur-sm border border-black p-4 mb-4" style={{ borderWidth: '1.3px' }}>
            <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '10px' }}>PACKAGING</h3>
            {Object.keys(STARTING_INVENTORY.packaging).map((name) => (
              <div key={name} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080' }}>{name}</span>
                <input
                  type="number"
                  min={0}
                  value={String(Number(packaging[name] ?? 0))}
                  onChange={(e) => updatePackaging(name, e.target.value)}
                  className="w-20 py-1 px-2 border border-black text-right rounded-none"
                  style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000', borderRadius: 0 }}
                />
              </div>
            ))}
          </div>

          <button type="button" onClick={handleSave} className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50 mt-2" style={{ ...pageActionButtonStyle, borderWidth: '1.3px' }}>
            {saved ? 'SAVED' : 'SAVE INVENTORY'}
          </button>
          <button type="button" onClick={() => navigate('/admin/revenue?tab=PRODUCTS')} className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50 mt-2" style={{ ...pageActionButtonStyle, borderWidth: '1.3px' }}>BACK TO PRODUCTS</button>
        </div>
      </div>
    </div>
  );
}
