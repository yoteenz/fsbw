import React from 'react';

const downloadLinkStyle: React.CSSProperties = {
  fontFamily: '"Futura PT Medium", Futura, sans-serif',
  fontSize: '10px',
  fontWeight: 500,
  color: '#EB1C24',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  textDecoration: 'underline',
  lineHeight: 1,
  whiteSpace: 'nowrap',
  pointerEvents: 'auto',
  zIndex: 200,
  background: 'rgba(255,255,255,0.92)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
  padding: '2px 4px',
  borderRadius: '2px',
};

type LobbyAssetDownloadLinkProps = {
  href: string;
  downloadFilename: string;
  /** Tooltip: Fal prompt for regenerating this asset. */
  falPrompt?: string;
  style?: React.CSSProperties;
};

export function LobbyAssetDownloadLink({
  href,
  downloadFilename,
  falPrompt,
  style,
}: LobbyAssetDownloadLinkProps) {
  return (
    <a
      href={href}
      download={downloadFilename}
      title={falPrompt ? `Fal prompt: ${falPrompt}` : `Download ${downloadFilename}`}
      style={{ ...downloadLinkStyle, ...style }}
      onClick={(e) => e.stopPropagation()}
    >
      DOWNLOAD
    </a>
  );
}

type LobbyAssetDownloadAnchorProps = {
  href: string;
  downloadFilename: string;
  falPrompt?: string;
  /** Where to pin the link relative to the asset. */
  placement?: 'top-right' | 'bottom-right' | 'bottom-center';
  children: React.ReactNode;
};

const placementStyle: Record<
  NonNullable<LobbyAssetDownloadAnchorProps['placement']>,
  React.CSSProperties
> = {
  'top-right': { top: 0, right: 0 },
  'bottom-right': { bottom: 0, right: 0 },
  'bottom-center': { bottom: 0, left: '50%', transform: 'translateX(-50%)' },
};

/** Wraps a lobby asset; shows DOWNLOAD in dev, `?lobbyAssets=1`, or signed-in admin. */
export function LobbyAssetDownloadAnchor({
  href,
  downloadFilename,
  falPrompt,
  placement = 'top-right',
  visible,
  children,
}: LobbyAssetDownloadAnchorProps & { visible: boolean }) {
  if (!visible) return <>{children}</>;

  return (
    <div style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
      {children}
      <LobbyAssetDownloadLink
        href={href}
        downloadFilename={downloadFilename}
        falPrompt={falPrompt}
        style={{ position: 'absolute', ...placementStyle[placement] }}
      />
    </div>
  );
}
