import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { getConsultQuote } from '../../../utils/api';
import LiveTryOnLaunchButton from '../../../components/liveTryOn/LiveTryOnLaunchButton';

const UNIT_HREF: Record<string, string> = {
  NOIR: '/straight/noir',
  BLANCO: '/straight/blanco',
  'SOFT WAVE': '/wavy/soft-wave',
  'SOFT CURL': '/curly/soft-curl',
  'BEACH WAVE': '/wavy/beach-wave',
  'OCEAN CURL': '/curly/ocean-curl',
};

export default function ConsultOfferPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') || '';
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [quote, setQuote] = useState<Record<string, unknown> | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) {
        setErr('MISSING OFFER ID');
        setLoading(false);
        return;
      }
      try {
        const res = await getConsultQuote(id);
        if (cancelled) return;
        if (!res?.quote) {
          setErr('OFFER NOT FOUND');
        } else {
          setQuote(res.quote);
        }
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message.toUpperCase() : 'LOAD FAILED');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const expiresMs = useMemo(() => {
    const raw = quote?.expires_at;
    if (typeof raw !== 'string') return null;
    const ms = new Date(raw).getTime();
    return Number.isFinite(ms) ? ms : null;
  }, [quote, tick]);

  const countdown = useMemo(() => {
    if (expiresMs == null) return '—';
    const left = Math.max(0, expiresMs - Date.now());
    const h = Math.floor(left / 3600000);
    const m = Math.floor((left % 3600000) / 60000);
    const s = Math.floor((left % 60000) / 1000);
    return `${h}H ${m}M ${s}S`;
  }, [expiresMs, tick]);

  const unitKey = String(quote?.unit_key || 'NOIR').toUpperCase();
  const thumb = typeof quote?.thumbnail_src === 'string' ? quote.thumbnail_src : '/assets/NOIR/noir-thumb.png';
  const message = String(quote?.admin_message || '');
  const code = String(quote?.discount_code || '');
  const breakdown = Array.isArray(quote?.price_breakdown) ? quote.price_breakdown : [];

  const startBuild = () => {
    const href = UNIT_HREF[unitKey] || '/straight/noir';
    try {
      sessionStorage.setItem('bawConsultQuoteId', id);
    } catch {
      /* ignore */
    }
    navigate(href);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ fontFamily: '"Futura PT Medium"' }}>
        LOADING…
      </div>
    );
  }

  if (err || !quote) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-4">
        <p style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24' }}>{err || 'UNAVAILABLE'}</p>
        <button type="button" className="border border-black px-4 py-2 text-[11px]" onClick={() => navigate('/account/alerts')}>
          BACK TO ALERTS
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundImage: `url('/assets/marble-half.png')` }}>
      <div
        className="max-w-md mx-auto bg-white/90 border border-black p-4 mt-6"
        style={{ borderWidth: '1.3px', fontFamily: '"Futura PT Book"', textTransform: 'uppercase' }}
      >
        <p style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px' }}>YOUR CUSTOM UNIT</p>
        <div className="flex gap-3 mt-3 items-center">
          <img src={thumb} alt="" width={72} height={72} className="object-contain border border-gray-200" />
          <div>
            <p style={{ fontSize: '11px', margin: 0 }}>{unitKey}</p>
            <p style={{ fontSize: '9px', color: '#808080', margin: '4px 0 0' }}>OFFER EXPIRES IN {countdown}</p>
          </div>
        </div>
        {message ? (
          <p style={{ fontSize: '9px', marginTop: '12px', lineHeight: 1.5 }}>{message}</p>
        ) : null}
        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', marginTop: '14px' }}>PRICE BREAKDOWN</p>
        <ul style={{ fontSize: '9px', margin: '6px 0 0', paddingLeft: '16px' }}>
          {breakdown.map((row: unknown, i: number) => {
            const r = row as { label?: string; value?: string };
            return (
              <li key={i}>
                {r.label} {r.value ? `… ${r.value}` : ''}
              </li>
            );
          })}
        </ul>
        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', marginTop: '14px' }}>CONSULT CODE</p>
        <p style={{ fontSize: '14px', letterSpacing: '0.08em' }}>{code}</p>
        <p style={{ fontSize: '8px', color: '#808080' }}>$40 OFF AT CHECKOUT WHEN APPLIED WITHIN 72 HOURS.</p>
        <div className="flex flex-col gap-2 mt-4">
          <button
            type="button"
            className="w-full py-2 border border-black text-[11px]"
            style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24' }}
            onClick={() => void copyCode()}
          >
            COPY CODE
          </button>
          <button
            type="button"
            className="w-full py-2 border border-black text-[11px]"
            style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24' }}
            onClick={startBuild}
          >
            ADD TO BAG (START BUILD)
          </button>
          <LiveTryOnLaunchButton
            returnTo={{ pathname: location.pathname, search: location.search }}
          />
          <button type="button" className="w-full py-2 text-[10px] text-gray-500" onClick={() => navigate('/account/alerts')}>
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
