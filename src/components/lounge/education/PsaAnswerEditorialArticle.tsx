import type { ReactNode } from 'react';
import type {
  PsaAnswerArticleModule,
  PsaAnswerEditorialContent,
} from '../../../content/education/psa-answers/types';
import type { SlayTipEditorialImage } from '../../../content/education/types';
import type { PSATodayEpisode } from '../psa-today/types';
import type { PsaAnswerPresentationEntry } from './psaAnswersPresentation';
import { listPsaAnswerPresentationEntries } from './psaAnswersPresentation';
import { getEducationMasteryById, getEducationSeasonById } from '../../../content/education';
import { getPsaTodayEpisodeById } from '../psa-today/psaTodayCatalog';
import { getContentPackById } from '../loungeTvContentPack';
import { resolvePackArtwork } from '../loungeTvArtwork';
import { slayTipRelatedClassMetaLine, slayTipRelatedClassThumbnail } from '../slay-tips/slayTipDetailMeta';
import {
  psaAnswerAccessMetaLabel,
  psaAnswerReadTimeLabel,
  resolvePsaAnswerHeroMedia,
  resolvePsaAnswerImage,
} from './psaAnswerEditorialResolve';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../loungeTvFocusHandlers';

type PsaAnswerMastheadProps = {
  entry: PsaAnswerPresentationEntry;
  content: PsaAnswerEditorialContent;
  unlocks?: import('../../../utils/slayTicketHistoryDisplay').LoungeContentUnlock[];
  isUnlocked: (contentId: string) => boolean;
};

export function PsaAnswerMasthead({ entry, content, unlocks, isUnlocked }: PsaAnswerMastheadProps) {
  const hero = resolvePsaAnswerHeroMedia(content).find((img) => img.role === 'hero') ?? resolvePsaAnswerHeroMedia(content)[0];
  const deck = content.deck ?? entry.focusTeaser;
  const readTime = psaAnswerReadTimeLabel(entry, content);
  const access = psaAnswerAccessMetaLabel(entry, unlocks, isUnlocked);

  return (
    <header className="lounge-tv-psa-answer-editorial__masthead">
      <div className="lounge-tv-psa-answer-editorial__masthead-copy">
        <p className="lounge-tv-psa-answer-editorial__eyebrow">PSA ANSWERS · {entry.category}</p>
        <h1 className="lounge-tv-psa-answer-editorial__question">{entry.displayQuestion}</h1>
        {deck ? <p className="lounge-tv-psa-answer-editorial__deck">{deck}</p> : null}
        <p className="lounge-tv-psa-answer-editorial__meta">
          {readTime} · {access}
        </p>
      </div>
      {hero ? (
        <div className="lounge-tv-psa-answer-editorial__masthead-visual">
          <EditorialImage image={hero} priority />
        </div>
      ) : null}
    </header>
  );
}

function EditorialImage({
  image,
  priority,
  className,
}: {
  image: SlayTipEditorialImage;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`lounge-tv-psa-answer-editorial__figure${className ? ` ${className}` : ''}`}>
      <img
        src={image.src}
        alt={image.alt ?? ''}
        draggable={false}
        loading={priority ? 'eager' : 'lazy'}
        style={{ objectPosition: image.objectPosition ?? 'center center' }}
        className="lounge-tv-psa-answer-editorial__img"
      />
      {image.annotations?.length ? (
        <div className="lounge-tv-psa-answer-editorial__annotations" aria-hidden>
          {image.annotations.map((ann) => (
            <span
              key={ann.id}
              className="lounge-tv-psa-answer-editorial__annotation"
              style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
            >
              {ann.marker ?? ann.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="lounge-tv-psa-answer-editorial__section-heading">
      <span className="lounge-tv-psa-answer-editorial__section-rule" aria-hidden />
      {children}
    </h2>
  );
}

export function PsaAnswerArticleRenderer({
  content,
  modules,
}: {
  content: PsaAnswerEditorialContent;
  modules: PsaAnswerArticleModule[];
}) {
  if (!modules.length) return null;

  const nodes: ReactNode[] = [];
  let index = 0;
  while (index < modules.length) {
    const mod = modules[index];
    const next = modules[index + 1];
    if (mod.type === 'psaNote' && next?.type === 'tryThisFirst') {
      nodes.push(
        <div key={`corrective-${index}`} className="lounge-tv-psa-answer-editorial__corrective-row">
          <AnswerModule content={content} module={mod} />
          <AnswerModule content={content} module={next} />
        </div>,
      );
      index += 2;
      continue;
    }
    nodes.push(<AnswerModule key={`${mod.type}-${index}`} content={content} module={mod} />);
    index += 1;
  }

  return <div className="lounge-tv-psa-answer-editorial__article">{nodes}</div>;
}

function AnswerModule({
  content,
  module: mod,
}: {
  content: PsaAnswerEditorialContent;
  module: PsaAnswerArticleModule;
}) {
  switch (mod.type) {
    case 'psaSays':
      return (
        <section className="lounge-tv-psa-answer-editorial__psa-says" aria-label="PSA Says">
          <div className="lounge-tv-psa-answer-editorial__psa-says-inner">
            <div className="lounge-tv-psa-answer-editorial__psa-mark" aria-hidden>
              <span className="lounge-tv-psa-answer-editorial__psa-mark-circle">PSA</span>
              <span className="lounge-tv-psa-answer-editorial__psa-mark-label">SAYS</span>
            </div>
            <blockquote className="lounge-tv-psa-answer-editorial__psa-says-body">{mod.body}</blockquote>
          </div>
        </section>
      );
    case 'likelyCauses':
      return (
        <section className="lounge-tv-psa-answer-editorial__module">
          <SectionHeading>MOST LIKELY CAUSES</SectionHeading>
          <div className="lounge-tv-psa-answer-editorial__causes">
            {mod.causes.map((cause) => (
              <article key={cause.number} className="lounge-tv-psa-answer-editorial__cause">
                <p className="lounge-tv-psa-answer-editorial__cause-number">{cause.number}</p>
                <p className="lounge-tv-psa-answer-editorial__cause-label">{cause.label}</p>
                <p className="lounge-tv-psa-answer-editorial__cause-body">{cause.body}</p>
              </article>
            ))}
          </div>
        </section>
      );
    case 'lookHere':
      return (
        <section className="lounge-tv-psa-answer-editorial__module lounge-tv-psa-answer-editorial__module--look-here">
          <SectionHeading>LOOK HERE</SectionHeading>
          <div
            className={
              mod.items.length >= 3
                ? 'lounge-tv-psa-answer-editorial__look-here lounge-tv-psa-answer-editorial__look-here--editorial'
                : 'lounge-tv-psa-answer-editorial__look-here'
            }
          >
            {mod.items.map((item) => {
              const image = resolvePsaAnswerImage(content, item.imageId, item.image);
              return (
                <article key={item.label} className="lounge-tv-psa-answer-editorial__look-item">
                  {image ? (
                    <EditorialImage image={image} className="lounge-tv-psa-answer-editorial__look-img" />
                  ) : null}
                  <p className="lounge-tv-psa-answer-editorial__look-label">{item.label}</p>
                  <p className="lounge-tv-psa-answer-editorial__look-caption">{item.caption}</p>
                </article>
              );
            })}
          </div>
        </section>
      );
    case 'psaNote':
      return (
        <aside className="lounge-tv-psa-answer-editorial__psa-note">
          <p className="lounge-tv-psa-answer-editorial__psa-note-label">
            <span className="lounge-tv-psa-answer-editorial__psa-note-script">PSA&apos;s Note</span>
            {mod.number ? ` ${mod.number}` : ' 01'}
          </p>
          <p className="lounge-tv-psa-answer-editorial__psa-note-body">{mod.body}</p>
        </aside>
      );
    case 'tryThisFirst':
      return (
        <section className="lounge-tv-psa-answer-editorial__module lounge-tv-psa-answer-editorial__module--try-first">
          <SectionHeading>TRY THIS FIRST</SectionHeading>
          <div className="lounge-tv-psa-answer-editorial__steps">
            {mod.steps.map((step, stepIndex) => (
              <article key={step.number} className="lounge-tv-psa-answer-editorial__step">
                <p className="lounge-tv-psa-answer-editorial__step-number">{step.number}</p>
                <p className="lounge-tv-psa-answer-editorial__step-label">{step.label}</p>
                <p className="lounge-tv-psa-answer-editorial__step-body">{step.body}</p>
                {stepIndex < mod.steps.length - 1 ? (
                  <span className="lounge-tv-psa-answer-editorial__step-connector" aria-hidden>
                    →
                  </span>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      );
    case 'escalation':
      return (
        <section className="lounge-tv-psa-answer-editorial__module lounge-tv-psa-answer-editorial__module--escalation">
          <SectionHeading>IF THAT DOESN&apos;T FIX IT</SectionHeading>
          <p className="lounge-tv-psa-answer-editorial__escalation-body">{mod.body}</p>
        </section>
      );
    case 'text':
      return (
        <section className="lounge-tv-psa-answer-editorial__module">
          {mod.heading ? <h3 className="lounge-tv-psa-answer-editorial__text-heading">{mod.heading}</h3> : null}
          {mod.body ? <p className="lounge-tv-psa-answer-editorial__body">{mod.body}</p> : null}
        </section>
      );
    default:
      return null;
  }
}

type PsaAnswerRelatedFooterProps = {
  entry: PsaAnswerPresentationEntry;
  content: PsaAnswerEditorialContent;
  onViewRelatedAnswer: (entry: PsaAnswerPresentationEntry) => void;
  onViewRelatedPsa: (episode: PSATodayEpisode) => void;
  onViewDeeperSeason?: (seasonId: string) => void;
  onViewDeeperMastery?: (masteryId: string) => void;
};

export function PsaAnswerRelatedFooter({
  entry,
  content,
  onViewRelatedAnswer,
  onViewRelatedPsa,
  onViewDeeperSeason,
  onViewDeeperMastery,
}: PsaAnswerRelatedFooterProps) {
  const related = content.relatedAnswerId
    ? listPsaAnswerPresentationEntries().find((e) => e.id === content.relatedAnswerId)
    : undefined;
  const deeper = resolveDeeperLink(content, { onViewRelatedPsa, onViewDeeperSeason, onViewDeeperMastery });
  if (!related && !deeper) return null;

  const pack = getContentPackById(entry.packId);

  return (
    <footer className="lounge-tv-psa-answer-editorial__related">
      {related ? (
        <RelatedLink
          eyebrow="RELATED ANSWER"
          title={related.displayQuestion}
          description={related.focusTeaser}
          thumbnail={resolvePackArtwork(getContentPackById(related.packId) ?? pack!, 'card')}
          onClick={() => onViewRelatedAnswer(related)}
        />
      ) : null}
      {deeper ? (
        <RelatedLink
          eyebrow="GO DEEPER"
          title={deeper.title}
          description={deeper.description}
          thumbnail={deeper.thumbnail}
          onClick={deeper.onClick}
        />
      ) : null}
    </footer>
  );
}

type DeeperLink = {
  title: string;
  description?: string;
  thumbnail?: string;
  onClick: () => void;
};

function resolveDeeperLink(
  content: PsaAnswerEditorialContent,
  handlers: {
    onViewRelatedPsa: (episode: PSATodayEpisode) => void;
    onViewDeeperSeason?: (seasonId: string) => void;
    onViewDeeperMastery?: (masteryId: string) => void;
  },
): DeeperLink | undefined {
  const deeper = content.deeperContent;
  if (deeper?.episodeId) {
    const episode = getPsaTodayEpisodeById(deeper.episodeId);
    if (episode) {
      return {
        title: deeper.title ?? episode.title,
        description: deeper.description ?? episode.shortDescription ?? slayTipRelatedClassMetaLine(episode) ?? undefined,
        thumbnail: slayTipRelatedClassThumbnail(episode),
        onClick: () => handlers.onViewRelatedPsa(episode),
      };
    }
  }
  if (deeper?.contentType === 'season' && deeper.seasonId && handlers.onViewDeeperSeason) {
    const season = getEducationSeasonById(deeper.seasonId);
    return {
      title: deeper.title ?? season?.title ?? 'GO DEEPER',
      description: deeper.description ?? season?.shortPremise ?? season?.description,
      thumbnail: undefined,
      onClick: () => handlers.onViewDeeperSeason!(deeper.seasonId!),
    };
  }
  if (deeper?.contentType === 'mastery' && deeper.masteryId && handlers.onViewDeeperMastery) {
    const mastery = getEducationMasteryById(deeper.masteryId);
    return {
      title: deeper.title ?? mastery?.title ?? 'GO DEEPER',
      description: deeper.description ?? mastery?.description,
      thumbnail: undefined,
      onClick: () => handlers.onViewDeeperMastery!(deeper.masteryId!),
    };
  }
  return undefined;
}

function RelatedLink({
  eyebrow,
  title,
  description,
  thumbnail,
  onClick,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  thumbnail?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-lounge-tv-focusable
      className="lounge-tv-psa-answer-editorial__related-link"
      onClick={onClick}
      onFocusCapture={loungeTvFocusGlowIn}
      onBlurCapture={loungeTvFocusGlowOut}
    >
      {thumbnail ? (
        <span className="lounge-tv-psa-answer-editorial__related-thumb">
          <img src={thumbnail} alt="" draggable={false} />
        </span>
      ) : null}
      <span className="lounge-tv-psa-answer-editorial__related-copy">
        <span className="lounge-tv-psa-answer-editorial__related-eyebrow">{eyebrow}</span>
        <span className="lounge-tv-psa-answer-editorial__related-title">{title}</span>
        {description ? (
          <span className="lounge-tv-psa-answer-editorial__related-desc">{description}</span>
        ) : null}
        <span className="lounge-tv-psa-answer-editorial__related-arrow">→</span>
      </span>
    </button>
  );
}
