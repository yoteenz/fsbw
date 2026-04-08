import { useState, useCallback, type ReactNode } from 'react';
import {
  compactRegionCodeForReviewHeader,
  regionParenLabelFromAddressLine,
  usStateAbbrevFromAddressLine,
} from '../../utils/usAddressStateDisplay';
import { getMockClientsForAyoteenz } from '../../pages/admin/clients/page';

const REVIEW_STAR_PX = Math.round(14 * 0.65 * 10) / 10;
const REVIEW_MEDIA_THUMB_PX = 72;
const NOIR_REVIEW_STAR_FILLED_SRC = '/assets/NOIR/filled-star.png';
const NOIR_REVIEW_STAR_OUTLINE_SRC = '/assets/NOIR/star-symbol.png';
const DEFAULT_CLIENT_PROFILE_THUMB = '/assets/profile-thumb.png';

function reviewStarCount(rating: number): number {
  const n = Math.round(Number(rating));
  if (!Number.isFinite(n)) return 0;
  return Math.min(5, Math.max(0, n));
}

function mockReviewMediaPlaceholders(seed: string, photoCount: number, videoCount: number): { photoUrls: string[]; videoUrls: string[] } {
  const h = seed.replace(/\W/g, '').slice(0, 12) || '0';
  const photoUrls = Array.from({ length: Math.max(0, photoCount) }, (_, i) =>
    `https://picsum.photos/seed/baw-pend-${h}-p${i}/200/200`
  );
  const videoUrls = Array.from({ length: Math.max(0, videoCount) }, () =>
    `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4`
  );
  return { photoUrls, videoUrls };
}

function enrichRegionFromMockEmail(email: string, existingParen?: string, existingCode?: string): { paren?: string; code?: string } {
  const em = email.trim().toLowerCase();
  if (!em) return {};
  const mock = getMockClientsForAyoteenz().find((c: { email?: string }) => (c.email || '').trim().toLowerCase() === em);
  const addr = mock && typeof mock === 'object' && 'address' in mock ? String((mock as { address?: string }).address || '') : '';
  const region = regionParenLabelFromAddressLine(addr);
  const abbr = usStateAbbrevFromAddressLine(addr);
  const mergedParen = (existingParen || '').trim() || region;
  let code = (existingCode || '').trim().toUpperCase() || undefined;
  if (abbr) code = abbr;
  else if (!code && mergedParen) code = compactRegionCodeForReviewHeader(mergedParen);
  if (!mergedParen && !code) return {};
  return { paren: mergedParen || undefined, code: code ?? undefined };
}

function ReviewClientAvatarButton({
  srcPrimary,
  clientLabel,
  email,
  onOpenClientDetails,
}: {
  srcPrimary: string;
  clientLabel: string;
  email: string;
  onOpenClientDetails?: (e: string) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const primary =
    srcPrimary && (srcPrimary.startsWith('http') || srcPrimary.startsWith('/') || srcPrimary.startsWith('data:'))
      ? srcPrimary
      : '';
  const src = !imgError && primary ? primary : DEFAULT_CLIENT_PROFILE_THUMB;
  const interactive = Boolean(onOpenClientDetails && email.trim());

  const inner = (
    <div
      className="rounded-full shrink-0 overflow-hidden"
      style={{
        width: '44px',
        height: '44px',
        border: '0.8px solid #000',
      }}
      aria-hidden
    >
      <img
        src={src}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        onError={() => {
          if (primary) setImgError(true);
        }}
      />
    </div>
  );

  if (!interactive) return inner;

  return (
    <button
      type="button"
      onClick={() => onOpenClientDetails!(email.trim())}
      className="p-0 border-0 bg-transparent cursor-pointer"
      style={{ lineHeight: 0 }}
      aria-label={`Open client details for ${clientLabel}`}
    >
      {inner}
    </button>
  );
}

export type AdminReviewStyleCardProps = {
  client: string;
  clientEmail?: string;
  clientProfilePhotoUrl?: string;
  /** Full region e.g. CALIFORNIA — used with mock client lookup when code missing */
  clientRegionParen?: string;
  clientRegionCode?: string;
  productLine: string;
  bodyText: string;
  date: string;
  rating: number;
  photos: number;
  videos: number;
  photoUrls?: string[];
  videoUrls?: string[];
  verifiedPurchase?: boolean;
  /** Red label on media row right (e.g. PENDING) */
  statusLabel?: string;
  footerLinkLabel?: string;
  onFooterLinkClick?: () => void;
  onOpenClientDetails?: (email: string) => void;
  /** When false, star row omitted (e.g. affiliate submissions). */
  showStars?: boolean;
  /** e.g. approve / decline row */
  children?: ReactNode;
};

/**
 * Single review row — matches Admin → Reviews list card layout (avatar, date, header, product, stars, body, media, footer).
 */
export function AdminReviewStyleCard({
  client,
  clientEmail = '',
  clientProfilePhotoUrl,
  clientRegionParen: parenIn,
  clientRegionCode: codeIn,
  productLine,
  bodyText,
  date,
  rating,
  photos,
  videos,
  photoUrls: photoUrlsIn,
  videoUrls: videoUrlsIn,
  verifiedPurchase = true,
  statusLabel,
  footerLinkLabel,
  onFooterLinkClick,
  onOpenClientDetails,
  showStars = true,
  children,
}: AdminReviewStyleCardProps) {
  const enriched = enrichRegionFromMockEmail(clientEmail, parenIn, codeIn);
  const clientRegionParen = (parenIn || '').trim() || enriched.paren || '';
  const regionBit = (
    (codeIn || '').trim() ||
    enriched.code ||
    compactRegionCodeForReviewHeader(clientRegionParen) ||
    ''
  )
    .trim()
    .toUpperCase();
  const clientHeader = `${client.trim().toUpperCase()}${regionBit ? ` · ${regionBit}` : ''}`;

  let photoUrls = photoUrlsIn ?? [];
  let videoUrls = videoUrlsIn ?? [];
  if (photoUrls.length === 0 && videoUrls.length === 0 && (photos > 0 || videos > 0)) {
    const ph = mockReviewMediaPlaceholders(`${client}-${date}`, photos, videos);
    photoUrls = ph.photoUrls;
    videoUrls = ph.videoUrls;
  }

  const [mediaOpen, setMediaOpen] = useState(false);
  const toggleMedia = useCallback(() => setMediaOpen((v) => !v), []);
  const mediaCount = photos + videos;
  const hasMediaUrls = photoUrls.length > 0 || videoUrls.length > 0;
  const hasExpandableMedia = mediaCount > 0 && hasMediaUrls;
  const mediaSummaryParts: string[] = [];
  if (photos > 0) mediaSummaryParts.push(`${photos} ${photos === 1 ? 'PHOTO' : 'PHOTOS'}`);
  if (videos > 0) mediaSummaryParts.push(`${videos} ${videos === 1 ? 'VIDEO' : 'VIDEOS'}`);
  const mediaSummary = mediaSummaryParts.length > 0 ? mediaSummaryParts.join(' · ') : `${photos} PHOTOS`;

  const stars = reviewStarCount(rating);

  return (
    <div className="py-3" style={{ borderBottom: '1px solid #e5e7eb' }}>
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0 flex-1 flex flex-col">
          <div className="flex flex-col items-start w-full">
            <ReviewClientAvatarButton
              srcPrimary={(clientProfilePhotoUrl || '').trim()}
              clientLabel={client}
              email={clientEmail}
              onOpenClientDetails={onOpenClientDetails}
            />
            <p
              style={{
                fontFamily: '"Futura PT Medium"',
                fontSize: '11px',
                color: '#000',
                margin: '8px 0 0',
                textAlign: 'left',
                width: '100%',
                lineHeight: 1.35,
              }}
            >
              <span>{clientHeader}</span>
              {verifiedPurchase !== false ? (
                <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"' }}>{' '}(VERIFIED)</span>
              ) : null}
            </p>
          </div>
          <p
            className="mt-1 w-full"
            style={{
              fontFamily: '"Futura PT Medium"',
              fontSize: '11px',
              color: '#808080',
              margin: 0,
              textAlign: 'left',
            }}
          >
            {productLine}
          </p>
          {showStars ? (
            <div className="flex items-center gap-1" style={{ marginTop: 'calc(0.25rem + 2px)' }}>
              {[...Array(5)].map((_, i) => {
                const filled = i < stars;
                return (
                  <img
                    key={i}
                    src={filled ? NOIR_REVIEW_STAR_FILLED_SRC : NOIR_REVIEW_STAR_OUTLINE_SRC}
                    alt=""
                    width={REVIEW_STAR_PX}
                    height={REVIEW_STAR_PX}
                    style={{
                      width: `${REVIEW_STAR_PX}px`,
                      height: `${REVIEW_STAR_PX}px`,
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 0 0 1px black)',
                    }}
                  />
                );
              })}
            </div>
          ) : null}
        </div>
        <span
          style={{
            fontFamily: '"Futura PT Book"',
            fontSize: '11px',
            color: '#000',
            flexShrink: 0,
            textAlign: 'right',
          }}
        >
          {date}
        </span>
      </div>
      <p
        style={{
          fontFamily: '"Futura PT Book"',
          fontSize: '11px',
          color: '#000',
          margin: 'calc(0.25rem + 4px) 0 0',
        }}
      >
        {bodyText}
      </p>
      <div className="mt-2">
        <div className="flex justify-between items-center gap-2">
          <div className="min-w-0 flex-1 pr-2">
            {hasExpandableMedia ? (
              <button
                type="button"
                onClick={toggleMedia}
                className="text-left p-0 border-0 bg-transparent cursor-pointer"
                style={{
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '11px',
                  color: '#808080',
                  textTransform: 'uppercase',
                }}
              >
                {mediaSummary}
              </button>
            ) : (
              <span
                style={{
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '11px',
                  color: '#808080',
                  textTransform: 'uppercase',
                }}
              >
                {mediaSummary}
              </span>
            )}
          </div>
          {statusLabel ? (
            <span
              style={{
                fontFamily: '"Futura PT Book"',
                fontSize: '11px',
                color: '#EB1C24',
                flexShrink: 0,
              }}
            >
              {statusLabel}
            </span>
          ) : null}
        </div>
        {mediaOpen && hasExpandableMedia ? (
          <div className="mt-2 w-full flex flex-col gap-2">
            {photoUrls.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {photoUrls.map((url, idx) => (
                  <a
                    key={`p-${idx}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block shrink-0 overflow-hidden"
                    style={{
                      width: `${REVIEW_MEDIA_THUMB_PX}px`,
                      height: `${REVIEW_MEDIA_THUMB_PX}px`,
                      border: '0.8px solid #000',
                    }}
                  >
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </a>
                ))}
              </div>
            ) : null}
            {videoUrls.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {videoUrls.map((url, idx) => (
                  <div
                    key={`v-${idx}`}
                    className="shrink-0 overflow-hidden bg-black"
                    style={{
                      width: `${REVIEW_MEDIA_THUMB_PX}px`,
                      height: `${REVIEW_MEDIA_THUMB_PX}px`,
                      border: '0.8px solid #000',
                    }}
                  >
                    <video src={url} controls playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {footerLinkLabel && onFooterLinkClick ? (
        <button
          type="button"
          onClick={onFooterLinkClick}
          style={{
            fontFamily: '"Futura PT Medium"',
            fontSize: '11px',
            color: '#EB1C24',
            fontWeight: 500,
            margin: '10px 0 0',
            padding: 0,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            textTransform: 'uppercase',
            display: 'block',
          }}
        >
          {footerLinkLabel}
        </button>
      ) : null}
      {children}
    </div>
  );
}
