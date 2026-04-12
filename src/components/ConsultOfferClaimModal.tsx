import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccessToken } from '../utils/api';
import { isSupabaseConfigured } from '../utils/supabase';
import { signInHrefWithReturnTo } from '../utils/signInReturnTo';
import {
  buildConsultOfferCartItemFromQuote,
  consultQuoteBreakdownFromRow,
  consultSelectionsToSpecialOfferOptions,
  SESSION_CONSULT_CLAIM_CODE,
  SESSION_CONSULT_CLAIM_QUOTE_ID,
} from '../utils/consultOfferFromQuote';
import { consultDigitalOrderTrackingBarFillPct } from '../utils/digitalOrderFulfillment';
import type { ConsultOrderLike } from '../utils/consultOrderLifecycle';
import { expandStylingBreakdownLineForDisplay, type SpecialOfferBreakdownLine } from '../utils/specialOfferPrice';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  quote: Record<string, unknown> | null;
  /** When true, parent is still resolving quote data. */
  loading?: boolean;
  error?: string | null;
  locationForSignIn: { pathname: string; search?: string };
  /** Shown in red header (e.g. ORDER #331); falls back if omitted. */
  orderNumberDisplay?: string;
};

function formatCreateOfferBreakdownAmount(amountUsd: number, includeSign: boolean): string {
  const usd = `$${Math.abs(Math.round(amountUsd)).toLocaleString('en-US')} USD`;
  if (!includeSign) return usd;
  return amountUsd > 0 ? `+${usd}` : `-${usd}`;
}

const CLOSE_ICON_RED_FILTER =
  'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)';

/** Anchor **placedAt** so the offer window maps onto the same 72h consult bar as Concierge (offer end = +72h). */
function consultOfferBarAnchorMs(quote: Record<string, unknown> | null): number | null {
  if (!quote) return null;
  const expRaw = quote.expires_at;
  if (typeof expRaw !== 'string') return null;
  const exp = new Date(expRaw).getTime();
  if (!Number.isFinite(exp)) return null;
  return exp - 72 * 60 * 60 * 1000;
}

export default function ConsultOfferClaimModal({
  isOpen,
  onClose,
  quote,
  loading = false,
  error = null,
  locationForSignIn,
  orderNumberDisplay,
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

  const headerTitle = (orderNumberDisplay || '').trim().toUpperCase() || 'YOUR CUSTOM UNIT';

  const capSizeLabel = useMemo(() => {
    if (!quote) return '';
    try {
      const s = consultSelectionsToSpecialOfferOptions(quote.selections);
      return String(s.capSize || '').trim().toUpperCase();
    } catch {
      return '';
    }
  }, [quote]);

  const unitPriceDisplayUsd = useMemo(() => {
    if (!quote) return 0;
    try {
      const lines = consultQuoteBreakdownFromRow(quote).lines;
      let unit = 0;
      for (const line of lines) {
        const lab = String(line.label || '').toUpperCase();
        if (lab === 'UNIT' || lab === 'BASE UNIT') unit += line.amountUsd;
      }
      return Math.round(unit);
    } catch {
      return 0;
    }
  }, [quote]);

  const breakdownLines = useMemo(() => {
    if (!quote) return [];
    try {
      const lines = consultQuoteBreakdownFromRow(quote).lines;
      const partRaw = lines.find((l) => l.label === 'PARTING')?.selection ?? '';
      return lines
        .filter((l) => l.label !== 'PARTING')
        .flatMap((line) =>
          line.label === 'STYLING' ? expandStylingBreakdownLineForDisplay(line, String(partRaw || '')) : [line]
        )
        .filter((line) => String(line.label || '').toUpperCase() !== 'CAP SIZE');
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

  const offerTrackingFillPct = useMemo(() => {
    if (!quote || expired) return 100;
    const anchor = consultOfferBarAnchorMs(quote);
    if (anchor == null) return 50;
    const sym: ConsultOrderLike = {
      bookingFlowType: 'consult',
      status: 'PROCESSING',
      placedAt: anchor,
    };
    return consultDigitalOrderTrackingBarFillPct(sym, Date.now()) ?? 0;
  }, [quote, expired, tick]);

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
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 gap-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md overflow-y-auto max-h-[85vh]"
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
        <div className="flex justify-between items-start gap-2">
          <p
            id="consult-offer-title"
            style={{
              fontFamily: '"Futura PT Medium"',
              color: '#EB1C24',
              fontSize: '12px',
              margin: 0,
              textTransform: 'uppercase',
              flex: 1,
              minWidth: 0,
            }}
          >
            {headerTitle}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 cursor-pointer"
            style={{ lineHeight: 0, padding: 0, border: 'none', background: 'none' }}
          >
            <img src="/assets/close-icon.svg" alt="" width={16} height={16} style={{ display: 'block', filter: CLOSE_ICON_RED_FILTER }} />
          </button>
        </div>
        <div style={{ borderBottom: '1px solid #d1d5db', marginTop: '10px', marginBottom: '12px' }} />

        {loading ? (
          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '11px' }}>LOADING…</p>
        ) : error ? (
          <p style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px' }}>{error}</p>
        ) : quote ? (
          <>
            <div className="flex flex-col items-center gap-2 mt-1">
              <img src={thumb} alt="" width={122} height={122} style={{ objectFit: 'contain', display: 'block' }} />
              <p
                style={{
                  fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", cursive',
                  fontSize: '19px',
                  margin: 0,
                  textTransform: 'uppercase',
                  color: '#000',
                  lineHeight: 1.1,
                }}
              >
                {unitKey}
              </p>
              {capSizeLabel ? (
                <p
                  style={{
                    fontFamily: '"Futura PT Book"',
                    fontSize: '10px',
                    color: '#808080',
                    margin: 0,
                    textTransform: 'uppercase',
                  }}
                >
                  CAP SIZE: {capSizeLabel}
                </p>
              ) : null}
              <p
                style={{
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '11px',
                  color: '#000',
                  margin: 0,
                  textTransform: 'uppercase',
                }}
              >
                ${unitPriceDisplayUsd.toLocaleString('en-US')} USD
              </p>
            </div>

            {message ? (
              <p
                style={{
                  fontFamily: '"Futura PT Book"',
                  fontSize: '9px',
                  marginTop: '12px',
                  marginBottom: '10px',
                  lineHeight: 1.5,
                  textTransform: 'uppercase',
                  color: '#EB1C24',
                  textAlign: 'center',
                }}
              >
                {message}
              </p>
            ) : null}

            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', marginTop: '14px', textTransform: 'uppercase' }}>
              PRICE BREAKDOWN
            </p>
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
                        <span>{line.label}: </span>
                        <span>{selection}</span>
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

            <p
              style={{
                fontFamily: '"Futura PT Book"',
                fontSize: '9px',
                color: '#000',
                marginTop: '12px',
                marginBottom: '6px',
                textTransform: 'uppercase',
                textAlign: 'center',
              }}
            >
              OFFER {expired ? 'ENDED' : 'ENDS IN'} {expired ? '' : countdown}
            </p>
            <div style={{ marginTop: '2px', marginBottom: '4px' }}>
              <div
                style={{
                  width: '100%',
                  height: '7px',
                  backgroundColor: '#E0E0E0',
                  borderRadius: offerTrackingFillPct > 0 ? '4px' : '0',
                  overflow: 'hidden',
                  border: offerTrackingFillPct === 0 ? '1px solid #808080' : 'none',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, Math.max(0, offerTrackingFillPct))}%`,
                    height: '100%',
                    backgroundColor: '#EB1C24',
                    transition: 'width 0.3s ease',
                    borderRadius: offerTrackingFillPct > 0 ? '4px' : '0',
                  }}
                />
              </div>
            </div>

            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080', marginTop: '10px', textTransform: 'uppercase' }}>
              $40 OFF AT CHECKOUT WHEN THE CODE IS APPLIED (WHILE OFFER IS ACTIVE).
            </p>
          </>
        ) : (
          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '11px' }}>NO OFFER DATA.</p>
        )}
      </div>

      {!loading && !error && quote ? (
        <button
          type="button"
          className="w-full max-w-md border border-black font-futura text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            borderWidth: '1.3px',
            color: '#EB1C24',
            fontFamily: '"Futura PT Medium"',
            backgroundColor: '#FFFFFF',
          }}
          disabled={expired || !code}
          onClick={(e) => {
            e.stopPropagation();
            void handleClaim();
          }}
        >
          CLAIM OFFER
        </button>
      ) : null}
    </div>
  );
}
