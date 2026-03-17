import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import {
  getOptionsForUnit,
  getDefaultColorForUnit,
  getDefaultDensityForUnit,
  ADDON_COMBO_OPTIONS,
  type UnitId
} from '../../../utils/productOptions';

const SPECIAL_OFFER_ADMIN_KEY = 'specialOfferAdminConfig';

const UNITS = [
  { id: 'noir', name: 'NOIR', route: '/straight/noir', basePrice: 740, image: '/assets/natural front.png' },
  { id: 'blanco', name: 'BLANCO', route: '/straight/blanco', basePrice: 820, image: '/assets/2D BLANCO FRONT.png' },
  { id: 'soft-wave', name: 'SOFT WAVE', route: '/wavy/soft-wave', basePrice: 980, image: '/assets/natural front.png' },
  { id: 'beach-wave', name: 'BEACH WAVE', route: '/wavy/beach-wave', basePrice: 980, image: '/assets/natural front.png' },
  { id: 'soft-curl', name: 'SOFT CURL', route: '/curly/soft-curl', basePrice: 900, image: '/assets/natural front.png' },
  { id: 'ocean-curl', name: 'OCEAN CURL', route: '/curly/ocean-curl', basePrice: 900, image: '/assets/natural front.png' }
];

type SpecialOfferConfig = {
  unitId: string;
  length: string;
  density: string;
  texture: string;
  lace: string;
  hairline: string;
  color: string;
  styling: string;
  addOns: string[];
  thumbnailDataUrl: string;
  startDate: string; // YYYY-MM-DD
};

const defaultConfig: SpecialOfferConfig = {
  unitId: 'noir',
  length: '24"',
  density: '200%',
  texture: 'SILKY',
  lace: '13X6',
  hairline: 'NATURAL',
  color: 'OFF BLACK',
  styling: 'NONE',
  addOns: [],
  thumbnailDataUrl: '',
  startDate: new Date().toISOString().slice(0, 10)
};

type AdminSpecialOfferPageProps = { embedded?: boolean };

export default function AdminSpecialOfferPage({ embedded = false }: AdminSpecialOfferPageProps) {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [config, setConfig] = useState<SpecialOfferConfig>(defaultConfig);
  const [saved, setSaved] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SPECIAL_OFFER_ADMIN_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const unitId = (parsed.unitId || defaultConfig.unitId) as UnitId;
        const opts = getOptionsForUnit(unitId);
        const color = opts.color.includes(parsed.color) ? parsed.color : getDefaultColorForUnit(unitId);
        const density = opts.density.includes(parsed.density) ? parsed.density : getDefaultDensityForUnit(unitId);
        const hairline = opts.hairline.includes(parsed.hairline) ? parsed.hairline : defaultConfig.hairline;
        const styling = opts.styling.includes(parsed.styling) ? parsed.styling : defaultConfig.styling;
        setConfig({
          ...defaultConfig,
          ...parsed,
          unitId,
          color,
          density,
          hairline,
          styling
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(SPECIAL_OFFER_ADMIN_KEY, JSON.stringify(config));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Save special offer config:', e);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setConfig((c) => ({ ...c, thumbnailDataUrl: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const addOnDisplay = (() => {
    const match = ADDON_COMBO_OPTIONS.find(
      (opt) => opt.value.length === config.addOns.length && opt.value.every((a) => config.addOns.includes(a))
    );
    return match ? match.label : config.addOns.length === 0 ? 'NONE' : config.addOns.join(' + ');
  })();

  const options = useMemo(() => getOptionsForUnit(config.unitId as UnitId), [config.unitId]);

  /** Display "LAGOS + PEAK" for stored value "LAGOS, PEAK" in hairline dropdown. */
  const hairlineDisplay = (val: string) => (val === 'LAGOS, PEAK' ? 'LAGOS + PEAK' : val);

  const handleProductChange = (unitId: string) => {
    const nextId = unitId as UnitId;
    const nextOptions = getOptionsForUnit(nextId);
    setConfig((c) => {
      const next = { ...c, unitId: nextId };
      if (!nextOptions.color.includes(c.color)) next.color = getDefaultColorForUnit(nextId);
      next.density = getDefaultDensityForUnit(nextId);
      return next;
    });
  };

  const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const handleRandomize = () => {
    const unit = pick(UNITS);
    const opts = getOptionsForUnit(unit.id as UnitId);
    const addOns = pick(ADDON_COMBO_OPTIONS).value;
    setConfig((c) => ({
      ...c,
      unitId: unit.id,
      length: pick(opts.length),
      density: pick(opts.density),
      texture: pick(opts.texture),
      lace: pick(opts.lace),
      hairline: pick(opts.hairline),
      color: pick(opts.color),
      styling: pick(opts.styling),
      addOns
    }));
    setOpenDropdown(null);
  };

  const formCard = (
    <>
      <div
        className="bg-white/60 backdrop-blur-sm border border-black overflow-hidden"
        style={{ borderWidth: '1.3px', borderRadius: 0 }}
      >
              <div className="px-4 pt-4 pb-2">
                <h2
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    color: '#EB1C24',
                    fontSize: '12px',
                    fontWeight: 500,
                    margin: 0,
                    textTransform: 'uppercase'
                  }}
                >
                  CONFIGURE SPECIAL OFFER
                </h2>
              </div>
              <div style={{ borderBottom: '1px solid #e5e7eb', margin: '0 20px 12px' }} />

              <div className="px-4 pb-4 space-y-4">
                {/* Product – square dropdown like client overview "Most recent" sort */}
                <div className="relative">
                  <label style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#666', display: 'block', marginBottom: '4px' }}>PRODUCT</label>
                  <button
                    type="button"
                    onClick={() => setOpenDropdown((v) => (v === 'product' ? null : 'product'))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1.3px solid #000',
                      borderRadius: 0,
                      fontFamily: '"Futura PT Book"',
                      fontSize: '11px',
                      background: '#fff',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      color: '#000'
                    }}
                  >
                    <span>{UNITS.find((u) => u.id === config.unitId)?.name ?? config.unitId}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0" style={{ transform: openDropdown === 'product' ? 'rotate(180deg)' : 'none', color: '#EB1C24', marginLeft: '8px' }}>
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {openDropdown === 'product' && (
                    <>
                      <div className="fixed inset-0 z-10" aria-hidden="true" onClick={() => setOpenDropdown(null)} />
                      <div className="absolute left-0 right-0 py-1 bg-white border border-black shadow-lg z-20 max-h-48 overflow-y-auto" style={{ borderWidth: '1.3px', borderRadius: 0, marginTop: '7px' }}>
                        {UNITS.filter((u) => u.id !== config.unitId).map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => { handleProductChange(u.id); setOpenDropdown(null); }}
                            className="w-full text-left px-3 py-2 text-xs uppercase hover:bg-gray-100 transition-colors"
                            style={{ fontFamily: '"Futura PT Book"', color: '#000', fontWeight: 400 }}
                          >
                            {u.name}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Length */}
                <div className="relative">
                  <label style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#666', display: 'block', marginBottom: '4px' }}>LENGTH</label>
                  <button
                    type="button"
                    onClick={() => setOpenDropdown((v) => (v === 'length' ? null : 'length'))}
                    style={{ width: '100%', padding: '8px 10px', border: '1.3px solid #000', borderRadius: 0, fontFamily: '"Futura PT Book"', fontSize: '11px', background: '#fff', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: '#000' }}
                  >
                    <span>{config.length}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0" style={{ transform: openDropdown === 'length' ? 'rotate(180deg)' : 'none', color: '#EB1C24', marginLeft: '8px' }}>
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {openDropdown === 'length' && (
                    <>
                      <div className="fixed inset-0 z-10" aria-hidden="true" onClick={() => setOpenDropdown(null)} />
                      <div className="absolute left-0 right-0 py-1 bg-white border border-black shadow-lg z-20 max-h-48 overflow-y-auto" style={{ borderWidth: '1.3px', borderRadius: 0, marginTop: '7px' }}>
                        {options.length.filter((o) => o !== config.length).map((o) => (
                          <button key={o} type="button" onClick={() => { setConfig((c) => ({ ...c, length: o })); setOpenDropdown(null); }} className="w-full text-left px-3 py-2 text-xs uppercase hover:bg-gray-100 transition-colors" style={{ fontFamily: '"Futura PT Book"', color: '#000', fontWeight: 400 }}>{o}</button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Density */}
                <div className="relative">
                  <label style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#666', display: 'block', marginBottom: '4px' }}>DENSITY</label>
                  <button
                    type="button"
                    onClick={() => setOpenDropdown((v) => (v === 'density' ? null : 'density'))}
                    style={{ width: '100%', padding: '8px 10px', border: '1.3px solid #000', borderRadius: 0, fontFamily: '"Futura PT Book"', fontSize: '11px', background: '#fff', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: '#000' }}
                  >
                    <span>{config.density}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0" style={{ transform: openDropdown === 'density' ? 'rotate(180deg)' : 'none', color: '#EB1C24', marginLeft: '8px' }}>
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {openDropdown === 'density' && (
                    <>
                      <div className="fixed inset-0 z-10" aria-hidden="true" onClick={() => setOpenDropdown(null)} />
                      <div className="absolute left-0 right-0 py-1 bg-white border border-black shadow-lg z-20 max-h-48 overflow-y-auto" style={{ borderWidth: '1.3px', borderRadius: 0, marginTop: '7px' }}>
                        {options.density.filter((o) => o !== config.density).map((o) => (
                          <button key={o} type="button" onClick={() => { setConfig((c) => ({ ...c, density: o })); setOpenDropdown(null); }} className="w-full text-left px-3 py-2 text-xs uppercase hover:bg-gray-100 transition-colors" style={{ fontFamily: '"Futura PT Book"', color: '#000', fontWeight: 400 }}>{o}</button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Texture */}
                <div className="relative">
                  <label style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#666', display: 'block', marginBottom: '4px' }}>TEXTURE</label>
                  <button
                    type="button"
                    onClick={() => setOpenDropdown((v) => (v === 'texture' ? null : 'texture'))}
                    style={{ width: '100%', padding: '8px 10px', border: '1.3px solid #000', borderRadius: 0, fontFamily: '"Futura PT Book"', fontSize: '11px', background: '#fff', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: '#000' }}
                  >
                    <span>{config.texture}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0" style={{ transform: openDropdown === 'texture' ? 'rotate(180deg)' : 'none', color: '#EB1C24', marginLeft: '8px' }}>
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {openDropdown === 'texture' && (
                    <>
                      <div className="fixed inset-0 z-10" aria-hidden="true" onClick={() => setOpenDropdown(null)} />
                      <div className="absolute left-0 right-0 py-1 bg-white border border-black shadow-lg z-20" style={{ borderWidth: '1.3px', borderRadius: 0, marginTop: '7px' }}>
                        {options.texture.filter((o) => o !== config.texture).map((o) => (
                          <button key={o} type="button" onClick={() => { setConfig((c) => ({ ...c, texture: o })); setOpenDropdown(null); }} className="w-full text-left px-3 py-2 text-xs uppercase hover:bg-gray-100 transition-colors" style={{ fontFamily: '"Futura PT Book"', color: '#000', fontWeight: 400 }}>{o}</button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Lace */}
                <div className="relative">
                  <label style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#666', display: 'block', marginBottom: '4px' }}>LACE</label>
                  <button
                    type="button"
                    onClick={() => setOpenDropdown((v) => (v === 'lace' ? null : 'lace'))}
                    style={{ width: '100%', padding: '8px 10px', border: '1.3px solid #000', borderRadius: 0, fontFamily: '"Futura PT Book"', fontSize: '11px', background: '#fff', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: '#000' }}
                  >
                    <span>{config.lace}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0" style={{ transform: openDropdown === 'lace' ? 'rotate(180deg)' : 'none', color: '#EB1C24', marginLeft: '8px' }}>
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {openDropdown === 'lace' && (
                    <>
                      <div className="fixed inset-0 z-10" aria-hidden="true" onClick={() => setOpenDropdown(null)} />
                      <div className="absolute left-0 right-0 py-1 bg-white border border-black shadow-lg z-20 max-h-48 overflow-y-auto" style={{ borderWidth: '1.3px', borderRadius: 0, marginTop: '7px' }}>
                        {options.lace.filter((o) => o !== config.lace).map((o) => (
                          <button key={o} type="button" onClick={() => { setConfig((c) => ({ ...c, lace: o })); setOpenDropdown(null); }} className="w-full text-left px-3 py-2 text-xs uppercase hover:bg-gray-100 transition-colors" style={{ fontFamily: '"Futura PT Book"', color: '#000', fontWeight: 400 }}>{o}</button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Hairline */}
                <div className="relative">
                  <label style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#666', display: 'block', marginBottom: '4px' }}>HAIRLINE</label>
                  <button
                    type="button"
                    onClick={() => setOpenDropdown((v) => (v === 'hairline' ? null : 'hairline'))}
                    style={{ width: '100%', padding: '8px 10px', border: '1.3px solid #000', borderRadius: 0, fontFamily: '"Futura PT Book"', fontSize: '11px', background: '#fff', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: '#000' }}
                  >
                    <span>{hairlineDisplay(config.hairline)}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0" style={{ transform: openDropdown === 'hairline' ? 'rotate(180deg)' : 'none', color: '#EB1C24', marginLeft: '8px' }}>
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {openDropdown === 'hairline' && (
                    <>
                      <div className="fixed inset-0 z-10" aria-hidden="true" onClick={() => setOpenDropdown(null)} />
                      <div className="absolute left-0 right-0 py-1 bg-white border border-black shadow-lg z-20" style={{ borderWidth: '1.3px', borderRadius: 0, marginTop: '7px' }}>
                        {options.hairline.filter((o) => o !== config.hairline).map((o) => (
                          <button key={o} type="button" onClick={() => { setConfig((c) => ({ ...c, hairline: o })); setOpenDropdown(null); }} className="w-full text-left px-3 py-2 text-xs uppercase hover:bg-gray-100 transition-colors" style={{ fontFamily: '"Futura PT Book"', color: '#000', fontWeight: 400 }}>{hairlineDisplay(o)}</button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Color */}
                <div className="relative">
                  <label style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#666', display: 'block', marginBottom: '4px' }}>COLOR</label>
                  <button
                    type="button"
                    onClick={() => setOpenDropdown((v) => (v === 'color' ? null : 'color'))}
                    style={{ width: '100%', padding: '8px 10px', border: '1.3px solid #000', borderRadius: 0, fontFamily: '"Futura PT Book"', fontSize: '11px', background: '#fff', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: '#000' }}
                  >
                    <span>{config.color}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0" style={{ transform: openDropdown === 'color' ? 'rotate(180deg)' : 'none', color: '#EB1C24', marginLeft: '8px' }}>
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {openDropdown === 'color' && (
                    <>
                      <div className="fixed inset-0 z-10" aria-hidden="true" onClick={() => setOpenDropdown(null)} />
                      <div className="absolute left-0 right-0 py-1 bg-white border border-black shadow-lg z-20 max-h-48 overflow-y-auto" style={{ borderWidth: '1.3px', borderRadius: 0, marginTop: '7px' }}>
                        {options.color.filter((o) => o !== config.color).map((o) => (
                          <button key={o} type="button" onClick={() => { setConfig((c) => ({ ...c, color: o })); setOpenDropdown(null); }} className="w-full text-left px-3 py-2 text-xs uppercase hover:bg-gray-100 transition-colors" style={{ fontFamily: '"Futura PT Book"', color: '#000', fontWeight: 400 }}>{o}</button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Styling */}
                <div className="relative">
                  <label style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#666', display: 'block', marginBottom: '4px' }}>STYLING</label>
                  <button
                    type="button"
                    onClick={() => setOpenDropdown((v) => (v === 'styling' ? null : 'styling'))}
                    style={{ width: '100%', padding: '8px 10px', border: '1.3px solid #000', borderRadius: 0, fontFamily: '"Futura PT Book"', fontSize: '11px', background: '#fff', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: '#000' }}
                  >
                    <span>{config.styling}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0" style={{ transform: openDropdown === 'styling' ? 'rotate(180deg)' : 'none', color: '#EB1C24', marginLeft: '8px' }}>
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {openDropdown === 'styling' && (
                    <>
                      <div className="fixed inset-0 z-10" aria-hidden="true" onClick={() => setOpenDropdown(null)} />
                      <div className="absolute left-0 right-0 py-1 bg-white border border-black shadow-lg z-20 max-h-48 overflow-y-auto" style={{ borderWidth: '1.3px', borderRadius: 0, marginTop: '7px' }}>
                        {options.styling.filter((o) => o !== config.styling).map((o) => (
                          <button key={o} type="button" onClick={() => { setConfig((c) => ({ ...c, styling: o })); setOpenDropdown(null); }} className="w-full text-left px-3 py-2 text-xs uppercase hover:bg-gray-100 transition-colors" style={{ fontFamily: '"Futura PT Book"', color: '#000', fontWeight: 400 }}>{o}</button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Add-ons (multi) – dropdown same style as other dropdowns */}
                <div className="relative">
                  <label style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#666', display: 'block', marginBottom: '4px' }}>ADD-ONS</label>
                  <button
                    type="button"
                    onClick={() => setOpenDropdown((v) => (v === 'addOns' ? null : 'addOns'))}
                    style={{ width: '100%', padding: '8px 10px', border: '1.3px solid #000', borderRadius: 0, fontFamily: '"Futura PT Book"', fontSize: '11px', background: '#fff', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: '#000' }}
                  >
                    <span>{addOnDisplay}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0" style={{ transform: openDropdown === 'addOns' ? 'rotate(180deg)' : 'none', color: '#EB1C24', marginLeft: '8px' }}>
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {openDropdown === 'addOns' && (
                    <>
                      <div className="fixed inset-0 z-10" aria-hidden="true" onClick={() => setOpenDropdown(null)} />
                      <div className="absolute left-0 right-0 py-1 bg-white border border-black shadow-lg z-20 max-h-48 overflow-y-auto" style={{ borderWidth: '1.3px', borderRadius: 0, marginTop: '7px' }}>
                        {ADDON_COMBO_OPTIONS.filter(
                          (opt) => !(opt.value.length === config.addOns.length && opt.value.every((a) => config.addOns.includes(a)))
                        ).map((opt) => (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => {
                              setConfig((c) => ({ ...c, addOns: [...opt.value] }));
                              setOpenDropdown(null);
                            }}
                            className="w-full text-left px-3 py-2 text-xs uppercase hover:bg-gray-100 transition-colors"
                            style={{ fontFamily: '"Futura PT Book"', color: '#000', fontWeight: 400 }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnail upload */}
                <div>
                  <label style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#666', display: 'block', marginBottom: '4px' }}>THUMBNAIL</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1.3px solid #000',
                      borderRadius: 0,
                      background: '#fff',
                      fontFamily: '"Futura PT Book"',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                  >
                    {config.thumbnailDataUrl ? 'CHANGE PHOTO' : 'UPLOAD PHOTO'}
                  </button>
                  {config.thumbnailDataUrl && (
                    <div style={{ marginTop: '8px', width: '72px', height: '72px', border: '1px solid #e5e7eb', overflow: 'hidden', backgroundColor: '#f9fafb' }}>
                      <img src={config.thumbnailDataUrl} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                {/* Start date */}
                <div>
                  <label style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#666', display: 'block', marginBottom: '4px' }}>START DATE</label>
                  <input
                    type="date"
                    value={config.startDate}
                    onChange={(e) => setConfig((c) => ({ ...c, startDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1.3px solid #000',
                      borderRadius: 0,
                      fontFamily: '"Futura PT Book"',
                      fontSize: '11px',
                      background: '#fff',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>

      {/* Save Config button below card – same height as concierge page buttons (py-2) */}
      <button
        type="button"
        onClick={handleSave}
        style={{
          width: '100%',
          marginTop: '10px',
          padding: '8px 10px',
          border: '1.3px solid #000',
          borderRadius: 0,
          background: saved ? '#e5e7eb' : '#fff',
          fontFamily: '"Futura PT Medium"',
          fontSize: '11px',
          color: '#EB1C24',
          textTransform: 'uppercase',
          cursor: 'pointer'
        }}
      >
        {saved ? 'SAVED' : 'SAVE CONFIG'}
      </button>
      <button
        type="button"
        onClick={handleRandomize}
        style={{
          width: '100%',
          marginTop: '8px',
          padding: '8px 10px',
          border: '1.3px solid #000',
          borderRadius: 0,
          background: '#fff',
          fontFamily: '"Futura PT Medium"',
          fontSize: '11px',
          color: '#EB1C24',
          textTransform: 'uppercase',
          cursor: 'pointer'
        }}
      >
        RANDOMIZE
      </button>
    </>
  );

  if (embedded) {
    return <div className="w-full">{formCard}</div>;
  }

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed'
        }}
      />
      <div className="relative z-10" style={{ textTransform: 'uppercase' }}>
        <AdminHeader
          title={isUnderMarketing ? 'OFFERS' : 'MARKETING'}
          showBack
          onBack={() => navigate(isUnderMarketing ? '/admin/marketing' : '/admin/dashboard')}
          breadcrumbParentLabel="ADMIN"
          breadcrumbParentPath={isUnderMarketing ? '/admin/marketing' : '/admin/dashboard'}
        />
        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
            {formCard}
          </div>
        </div>
      </div>
    </div>
  );
}
