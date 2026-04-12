import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInHrefWithReturnTo } from '../utils/signInReturnTo';
import { isSignedIn as isAppSignedIn } from '../utils/adminAuth';
import {
  appendConsultOfferClaimedQuoteId,
  buildConsultOfferCartItemFromQuote,
  consultQuoteBreakdownFromRow,
  readConsultOfferClaimedQuoteIds,
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

/** Line-item amounts in the consult offer modal always show a leading **+** / **-** (e.g. **+$740 USD**). */
function formatConsultOfferModalBreakdownAmount(amountUsd: number): string {
  return formatCreateOfferBreakdownAmount(amountUsd, true);
}

/** **14D 1H LEFT**-style remaining time (days/hours; finer than hours when &lt;1d). */
function formatOfferTimeLeftLabel(msRemain: number): string {
  const left = Math.max(0, msRemain);
  const days = Math.floor(left / 86400000);
  const hours = Math.floor((left % 86400000) / 3600000);
  const minutes = Math.floor((left % 3600000) / 60000);
  if (days > 0) return `${days}D ${hours}H LEFT`;
  if (hours > 0) return `${hours}H ${minutes}M LEFT`;
  return `${Math.max(0, minutes)}M LEFT`;
}

const CLOSE_ICON_RED_FILTER =
  'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)';

/** Default admin send-offer copy — shown in **gray** (custom admin messages stay red). */
const DEFAULT_INSPO_DISCLAIMER =
  'BASED ON YOUR INSPO AND NOTES, THESE SELECTIONS WILL GIVE YOU THE CLOSEST MATCH TO YOUR GOAL LOOK.';

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
  const [claimUiTick, setClaimUiTick] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [isOpen]);

  useEffect(() => {
    const bump = () => setClaimUiTick((x) => x + 1);
    window.addEventListener('consultOfferClaimedIdsChanged', bump);
    window.addEventListener('storage', bump);
    return () => {
      window.removeEventListener('consultOfferClaimedIdsChanged', bump);
      window.removeEventListener('storage', bump);
    };
  }, []);

  const expiresMs = useMemo(() => {
    const raw = quote?.expires_at;
    if (typeof raw !== 'string') return null;
    const ms = new Date(raw).getTime();
    return Number.isFinite(ms) ? ms : null;
  }, [quote]);

  const expired = expiresMs != null && expiresMs <= Date.now();

  const offerLeftMs = useMemo(() => {
    if (expiresMs == null) return 0;
    return Math.max(0, expiresMs - Date.now());
  }, [expiresMs, tick]);

  const offerCountdownText = useMemo(() => {
    if (expiresMs == null) return '—';
    if (expired) return '';
    return formatOfferTimeLeftLabel(offerLeftMs);
  }, [expiresMs, expired, offerLeftMs, tick]);
  const thumb =
    typeof quote?.thumbnail_src === 'string' && quote.thumbnail_src.trim()
      ? quote.thumbnail_src.trim()
      : '/assets/NOIR/noir-thumb.png';
  const message = String(quote?.admin_message || '');
  const isDefaultInspoDisclaimer =
    message.trim().toUpperCase() === DEFAULT_INSPO_DISCLAIMER.toUpperCase();
  const code = String(quote?.discount_code || '').trim().toUpperCase();
  const quoteIdForClaim = String(quote?.id || '').trim();
  const claimedSet = readConsultOfferClaimedQuoteIds();
  const offerAlreadyClaimed = Boolean(quoteIdForClaim && claimedSet.has(quoteIdForClaim));
  const cartHasThisConsultOffer = useMemo(() => {
    if (!quoteIdForClaim || typeof window === 'undefined') return false;
    try {
      const raw = localStorage.getItem('cartItems');
      const arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) return false;
      return arr.some(
        (it: { consultOfferQuoteId?: string; id?: string }) =>
          String(it?.consultOfferQuoteId || '').trim() === quoteIdForClaim ||
          String(it?.id || '').includes(`consult-offer-${quoteIdForClaim}-`)
      );
    } catch {
      return false;
    }
  }, [quoteIdForClaim, claimUiTick, quote]);

  const headerTitle = (orderNumberDisplay || '').trim().toUpperCase() || 'YOUR CUSTOM UNIT';

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
    if (!quote) return;
    if (!expired && !code) return;
    if (!expired && offerAlreadyClaimed) return;
    try {
      /** Use shared auth helper (backup restore) — raw `isSignedIn` alone can be false when flag was cleared. */
      if (!isAppSignedIn()) {
        navigate(signInHrefWithReturnTo(locationForSignIn));
        return;
      }

      const { cartItem } = buildConsultOfferCartItemFromQuote(
        quote,
        1,
        !expired ? { consultOfferQtyLocked: true } : undefined
      );

      const existing = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const next = Array.isArray(existing) ? [...existing, cartItem] : [cartItem];
      localStorage.setItem('cartItems', JSON.stringify(next));
      const prevCount = parseInt(localStorage.getItem('cartCount') || '0', 10) || 0;
      const q = Number(cartItem.quantity) || 1;
      const newCount = prevCount + q;
      localStorage.setItem('cartCount', String(newCount));

      if (!expired && quoteIdForClaim) {
        appendConsultOfferClaimedQuoteId(quoteIdForClaim);
      }

      window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      window.dispatchEvent(new CustomEvent('cartItemsChanged'));
      setClaimUiTick((x) => x + 1);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 gap-3"
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
            </div>

            {message ? (
              <p
                style={{
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '9px',
                  marginTop: '12px',
                  marginBottom: '10px',
                  lineHeight: 1.5,
                  textTransform: 'uppercase',
                  color: isDefaultInspoDisclaimer ? '#808080' : '#EB1C24',
                  textAlign: 'center',
                }}
              >
                {message}
              </p>
            ) : null}

            <div
              style={{
                marginTop: '14px',
                border: '1.3px solid #000',
                background: '#fff',
                padding: '10px',
              }}
            >
              <div style={{ display: 'grid', rowGap: '6px' }}>
                {breakdownLines.map((line: SpecialOfferBreakdownLine, lineIdx: number) => {
                  const selection = line.selection;
                  const amountText =
                    line.amountUsd === 0 ? '' : formatConsultOfferModalBreakdownAmount(line.amountUsd);
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
                fontFamily: '"Futura PT Medium"',
                fontSize: '9px',
                color: '#808080',
                marginTop: '22px',
                marginBottom: '8px',
                textTransform: 'uppercase',
                textAlign: 'left',
                lineHeight: 1.4,
              }}
            >
              $40 DISCOUNT APPLIES ONLY WHILE OFFER IS ACTIVE.
            </p>
            <div style={{ marginTop: '0', marginBottom: '4px' }}>
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

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
                marginTop: '8px',
              }}
            >
              <p
                style={{
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '9px',
                  color: '#EB1C24',
                  margin: 0,
                  textTransform: 'uppercase',
                  flex: '1 1 auto',
                  minWidth: 0,
                }}
              >
                STATUS: {expired ? 'INACTIVE' : 'ACTIVE'}
              </p>
              {!expired && expiresMs != null ? (
                <p
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '9px',
                    color: '#000000',
                    margin: 0,
                    textTransform: 'uppercase',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {offerCountdownText}
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '11px' }}>NO OFFER DATA.</p>
        )}
      </div>

      {!loading && !error && quote ? (
        <button
          type="button"
          className={`w-full max-w-md border border-black font-futura text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50 ${
            !quote || (!expired && !code) ? 'disabled:opacity-50 disabled:cursor-not-allowed' : ''
          }`}
          style={{
            borderWidth: '1.3px',
            color: '#EB1C24',
            fontFamily: '"Futura PT Medium"',
            backgroundColor: '#FFFFFF',
          }}
          disabled={!quote || (!expired && !code)}
          onClick={(e) => {
            e.stopPropagation();
            void handleClaim();
          }}
        >
          {expired
            ? 'ADD TO BAG'
            : offerAlreadyClaimed || cartHasThisConsultOffer
              ? 'OFFER CLAIMED'
              : 'CLAIM OFFER'}
        </button>
      ) : null}
    </div>
  );
}
