/**
 * Foundry asset preview — ready / generating / missing states.
 * Never falls back to emoji or flat symbolic icons.
 */

import { useId } from 'react';
import type { FoundryAsset } from '../../../../studio/foundry';

type Props = {
  asset: FoundryAsset;
  size?: number;
  selected?: boolean;
  className?: string;
};

function FoundryAssetShimmer({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className="foundry-asset-shimmer"
      aria-hidden
    >
      <defs>
        <linearGradient id="foundry-shimmer-grad" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#fffaf5" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#c9a962" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fffaf5" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="32" height="32" rx="10" fill="url(#foundry-shimmer-grad)" opacity="0.85" />
      <ellipse cx="24" cy="40" rx="12" ry="3" fill="#000" opacity="0.08" />
    </svg>
  );
}

function FoundryAssetMissingPlaceholder({
  size,
  uid,
  selected,
}: {
  size: number;
  uid: string;
  selected?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`foundry-asset-missing${selected ? ' is-selected' : ''}`}
      aria-hidden
    >
      <defs>
        <radialGradient id={`${uid}-void-glow`} cx="50%" cy="45%">
          <stop offset="0%" stopColor="#fff8eb" stopOpacity={selected ? 0.95 : 0.65} />
          <stop offset="55%" stopColor="#c9a962" stopOpacity={selected ? 0.45 : 0.22} />
          <stop offset="100%" stopColor="#c9a962" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-shell`} x1="10" y1="8" x2="38" y2="40">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#d4c8b8" stopOpacity="0.18" />
        </linearGradient>
      </defs>
      <ellipse cx="24" cy="40" rx="13" ry="3.5" fill="#000" opacity="0.1" />
      <path
        d="M24 10 L34 18 V30 C34 35 29 38 24 38 C19 38 14 35 14 30 V18 Z"
        fill={`url(#${uid}-shell)`}
        stroke="#c9a962"
        strokeOpacity="0.35"
        strokeWidth="0.8"
      />
      <circle cx="24" cy="24" r="8" fill={`url(#${uid}-void-glow)`} />
      <path
        d="M20 22 H28 M24 18 V26"
        stroke="#c9a962"
        strokeOpacity="0.35"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FoundryAssetPreview({ asset, size = 28, selected = false, className = '' }: Props) {
  const uid = useId().replace(/:/g, '');
  const displayUrl = asset.transparentUrl ?? asset.previewUrl ?? asset.sourceUrl;

  if (asset.status === 'ready' && displayUrl) {
    return (
      <img
        src={displayUrl}
        alt=""
        aria-hidden
        width={size}
        height={size}
        className={`foundry-asset-preview${selected ? ' is-selected' : ''}${className ? ` ${className}` : ''}`}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          display: 'block',
        }}
      />
    );
  }

  if (asset.status === 'generating' || asset.status === 'queued') {
    return (
      <span className={className} data-foundry-status={asset.status} data-foundry-slug={asset.slug}>
        <FoundryAssetShimmer size={size} />
      </span>
    );
  }

  return (
    <span
      className={className}
      data-foundry-status={asset.status}
      data-foundry-slug={asset.slug}
      title={asset.metadata.description ?? asset.name}
    >
      <FoundryAssetMissingPlaceholder size={size} uid={uid} selected={selected} />
    </span>
  );
}
