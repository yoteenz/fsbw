import type { FscsTitleKind, FscsTitleProps } from '../utilities/types';
import {
  CampaignTitle,
  ChapterTitle,
  CrystalSubtitle,
  CrystalTitle,
  LogoReveal,
} from '../../motion';
import type { FsmsPresetId } from '../../motion/tokens/types';

const KIND_PRESET: Partial<Record<FscsTitleKind, FsmsPresetId>> = {
  campaign: 'campaign-intro',
  chapter: 'morning-reveal',
  scene: 'luxury-reveal',
  location: 'elegant-dissolve',
  product: 'sunlight-sweep',
  episode: 'crystal-fade',
};

function resolveTitlePreset(kind: FscsTitleKind, override?: FsmsPresetId): FsmsPresetId {
  return override ?? KIND_PRESET[kind] ?? 'luxury-reveal';
}

export function CinematicTitle({
  text,
  kind = 'scene',
  duration,
  delay,
  className,
  style,
}: FscsTitleProps & { preset?: FsmsPresetId }) {
  const preset = resolveTitlePreset(kind);

  if (kind === 'campaign') {
    return (
      <CampaignTitle
        text={text}
        preset={preset}
        duration={duration}
        delay={delay}
        className={className}
        style={style}
      />
    );
  }

  if (kind === 'chapter') {
    return (
      <ChapterTitle
        text={text}
        preset={preset}
        duration={duration}
        delay={delay}
        className={className}
        style={style}
      />
    );
  }

  if (kind === 'credits') {
    return (
      <CrystalSubtitle
        text={text}
        preset="elegant-dissolve"
        duration={duration}
        delay={delay}
        className={className}
        style={style}
      />
    );
  }

  return (
    <CrystalTitle
      text={text}
      preset={preset}
      duration={duration}
      delay={delay}
      className={className}
      style={style}
    />
  );
}

export function CampaignCinematicTitle(props: Omit<FscsTitleProps, 'kind'>) {
  return <CinematicTitle {...props} kind="campaign" />;
}

export function ChapterCinematicTitle(props: Omit<FscsTitleProps, 'kind'>) {
  return <CinematicTitle {...props} kind="chapter" />;
}

export function SceneCinematicTitle(props: Omit<FscsTitleProps, 'kind'>) {
  return <CinematicTitle {...props} kind="scene" />;
}

export function LocationCinematicTitle(props: Omit<FscsTitleProps, 'kind'>) {
  return <CinematicTitle {...props} kind="location" />;
}

export function ProductCinematicTitle(props: Omit<FscsTitleProps, 'kind'>) {
  return <CinematicTitle {...props} kind="product" />;
}

export function EpisodeCinematicTitle(props: Omit<FscsTitleProps, 'kind'>) {
  return <CinematicTitle {...props} kind="episode" />;
}

export function CreditsCinematicTitle(props: Omit<FscsTitleProps, 'kind'>) {
  return <CinematicTitle {...props} kind="credits" />;
}

export function CinematicLogoEnding(props: Omit<FscsTitleProps, 'kind' | 'text'> & { text?: string }) {
  return (
    <LogoReveal
      text={props.text ?? 'FRONTAL SLAYER'}
      preset="luxury-reveal"
      duration={props.duration ?? 2800}
      delay={props.delay}
      className={props.className}
      style={props.style}
    />
  );
}

export { CinematicTitle as FscsTitle };
