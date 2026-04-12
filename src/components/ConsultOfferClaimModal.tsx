import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccessToken } from '../utils/api';
import { isSupabaseConfigured } from '../utils/supabase';
import { signInHrefWithReturnTo } from '../utils/signInReturnTo';
import {
  buildConsultOfferCartItemFromQuote,
  consultQuoteBreakdownFromRow,
  SESSION_CONSULT_CLAIM_CODE,
  SESSION_CONSULT_CLAIM_QUOTE_ID,
} from '../utils/consultOfferFromQuote';
import { expandStylingBreakdownLineForDisplay, type SpecialOfferBreakdownLine } from '../utils/specialOfferPrice';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  quote: Record<string, unknown> | null;
  /** When true, parent is still resolving quote data. */
  loading?: boolean;
  error?: string | null;
  locationForSignIn: { pathname: string; search?: string };
};

function formatCreateOfferBreakdownAmount(amountUsd: number, includeSign: boolean): string {
  const usd = `$${Math.abs(Math.round(amountUsd)).toLocaleString('en-US')} USD`;
  if (!includeSign) return usd;
  return amountUsd > 0 ? `+${usd}` : `-${usd}`;
}

export default function ConsultOfferClaimModal({
  isOpen,
  onClose,
  quote,
  loading = false,
  error = null,
  locationForSignIn,
}: Props) {
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [isOpen]);

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

  const expired = expiresMs != null && expiresMs <= Date.now();
  const unitKey = String(quote?.unit_key || 'NOIR').toUpperCase();
  const thumb =
    typeof quote?.thumbnail_src === 'string' && quote.thumbnail_src.trim()
      ? quote.thumbnail_src.trim()
      : '/assets/NOIR/noir-thumb.png';
  const message = String(quote?.admin_message || '');
  const code = String(quote?.discount_code || '').trim().toUpperCase();

  const breakdownLines = useMemo(() => {
    if (!quote) return [];
    try {
      const lines = consultQuoteBreakdownFromRow(quote).lines;
      const partRaw = lines.find((l) => l.label === 'PARTING')?.selection ?? '';
      return lines
        .filter((l) => l.label !== 'PARTING')
        .flatMap((line) =>
          line.label === 'STYLING' ? expandStylingBreakdownLineForDisplay(line, String(partRaw || '')) : [line]
        );
    } catch {
      return [];
    }
  }, [quote]);

  const estimatedTotalUsd = useMemo(() => {
    if (!quote) return 0;
    try {
      return Math.round(consultQuoteBreakdownFromRow(quote).totalUsd);
    } catch {
      return 0;
    }
  }, [quote]);

  const handleClaim = async () => {
    if (!quote || expired || !code) return;
    try {
      const signedIn = localStorage.getItem('isSignedIn') === 'true';
      if (isSupabaseConfigured()) {
        const token = await getAccessToken();
        if (!signedIn || !token) {
          navigate(signInHrefWithReturnTo(locationForSignIn));
          return;
        }
      } else if (!signedIn) {
        navigate(signInHrefWithReturnTo(locationForSignIn));
        return;
      }

      const { cartItem, totalPrice } = buildConsultOfferCartItemFromQuote(quote, 1);
      cartItem.price = totalPrice;

      const existing = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const next = Array.isArray(existing) ? [...existing, cartItem] : [cartItem];
      localStorage.setItem('cartItems', JSON.stringify(next));
      const prevCount = parseInt(localStorage.getItem('cartCount') || '0', 10) || 0;
      const q = Number(cartItem.quantity) || 1;
      const newCount = prevCount + q;
      localStorage.setItem('cartCount', String(newCount));

      try {
        sessionStorage.setItem(SESSION_CONSULT_CLAIM_QUOTE_ID, String(quote.id || ''));
        sessionStorage.setItem(SESSION_CONSULT_CLAIM_CODE, code);
      } catch {
        /* ignore */
      }

      window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
      window.dispatchEvent(new CustomEvent('cartUpdated'));

      const id = String(quote.id || '').trim();
      navigate(id ? `/checkout?consultClaim=${encodeURIComponent(id)}` : '/checkout');
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md overflow-y-auto max-h-[90vh]"
        style={{
          border: '1.3px solid #000',
          background: '#fff',
          padding: '16px',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="consult-offer-title"
      >
        <div className="flex justify-between items-start gap-2 mb-2">
          <p id="consult-offer-title" style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', margin: 0 }}>
            YOUR CUSTOM UNIT
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] shrink-0"
            style={{ fontFamily: '"Futura PT Book"', color: '#808080' }}
          >
            CLOSE
          </button>
        </div>

        {loading ? (
          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '11px' }}>LOADING…</p>
        ) : error ? (
          <p style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px' }}>{error}</p>
        ) : quote ? (
          <>
            <div className="flex flex-col items-center gap-2 mt-2">
              <img src={thumb} alt="" width={102} height={102} style={{ objectFit: 'contain', display: 'block' }} />
              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', margin: 0, textTransform: 'uppercase' }}>{unitKey}</p>
              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', margin: 0, textTransform: 'uppercase' }}>
                OFFER {expired ? 'ENDED' : 'ENDS IN'} {expired ? '' : countdown}
              </p>
            </div>

            {message ? (
              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', marginTop: '12px', lineHeight: 1.5, textTransform: 'uppercase' }}>
                {message}
              </p>
            ) : null}

            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', marginTop: '14px', textTransform: 'uppercase' }}>PRICE BREAKDOWN</p>
            <div
              className="mt-1"
              style={{
                border: '1.3px solid #000',
                background: '#fff',
                padding: '10px',
              }}
            >
              <div style={{ display: 'grid', rowGap: '6px' }}>
                {breakdownLines.map((line: SpecialOfferBreakdownLine, lineIdx: number) => {
                  const selection = line.selection;
                  const amountText =
                    line.amountUsd === 0 ? '' : formatCreateOfferBreakdownAmount(line.amountUsd, line.label !== 'BASE UNIT' && line.label !== 'UNIT');
                  const concatLeft = line.formatting === 'concat' ? `${line.label}${selection}`.trim() : null;
                  return (
                    <div
                      key={`${line.label}-${selection}-${lineIdx}`}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '10px',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000',
                          lineHeight: 1.35,
                          textTransform: 'uppercase',
                          minWidth: 0,
                        }}
                      >
                        {concatLeft ? (
                          <span>{concatLeft}</span>
                        ) : (
                          <>
                            <span>{line.label}: </span>
                            <span>{selection}</span>
                          </>
                        )}
                      </div>
                      {amountText ? (
                        <span
                          style={{
                            fontFamily: '"Futura PT Medium"',
                            fontSize: '10px',
                            color: '#EB1C24',
                            lineHeight: 1.35,
                            textTransform: 'uppercase',
                            flexShrink: 0,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {amountText}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
                <div
                  style={{
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '8px',
                    marginTop: '2px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: '"Futura PT Book"',
                      fontSize: '10px',
                      color: '#000',
                      lineHeight: 1.35,
                      textTransform: 'uppercase',
                    }}
                  >
                    ESTIMATED TOTAL:
                  </span>
                  <span
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '10px',
                      color: '#EB1C24',
                      lineHeight: 1.35,
                      textTransform: 'uppercase',
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ${estimatedTotalUsd.toLocaleString('en-US')} USD
                  </span>
                </div>
              </div>
            </div>

            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080', marginTop: '10px', textTransform: 'uppercase' }}>
              $40 OFF AT CHECKOUT WHEN THE CODE IS APPLIED (WHILE OFFER IS ACTIVE).
            </p>

            <button
              type="button"
              className="w-full mt-4 border border-black font-futura text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderWidth: '1.3px',
                color: '#EB1C24',
                fontFamily: '"Futura PT Medium"',
                backgroundColor: '#FFFFFF',
              }}
              disabled={expired || !code}
              onClick={() => void handleClaim()}
            >
              CLAIM OFFER
            </button>
          </>
        ) : (
          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '11px' }}>NO OFFER DATA.</p>
        )}
      </div>
    </div>
  );
}
