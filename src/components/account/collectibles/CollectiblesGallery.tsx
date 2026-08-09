import { useEffect } from 'react';
import { CollectibleCard } from './CollectibleCard';
import { CertificationCollectibleAsset } from './CertificationCollectibleAsset';
import { useUserCollectibles, type CollectiblesFilter } from './useUserCollectibles';
import { trackEducationHierarchyEvent } from '../../lounge/education/educationHierarchyAnalytics';
import { getEducationMasteryById, getEducationSeasonById } from '../../../content/education/hierarchy/catalog';

const FILTERS: { id: CollectiblesFilter; label: string; showWhenEmpty?: boolean }[] = [
  { id: 'all', label: 'ALL' },
  { id: 'certifications', label: 'CERTIFICATIONS' },
  { id: 'rewards', label: 'REWARDS' },
  { id: 'slay-challenge', label: 'SLAY CHALLENGE' },
  { id: 'special', label: 'SPECIAL' },
];

export function CollectiblesGallery() {
  const { items, allItems, stats, filter, setFilter, latestUnlock, loading } = useUserCollectibles();

  useEffect(() => {
    trackEducationHierarchyEvent('collectibles_gallery_opened', {});
  }, []);

  const visibleFilters = FILTERS.filter(
    (f) =>
      f.id === 'all' ||
      f.id === 'certifications' ||
      (f.id === 'slay-challenge' && allItems.some((i) => i.sourceType === 'slay-challenge')) ||
      (f.id === 'rewards' && allItems.some((i) => i.sourceType === 'reward')) ||
      (f.id === 'special' &&
        allItems.some((i) => i.sourceType === 'special' || i.sourceType === 'promotion')),
  );

  const latestSeason = latestUnlock?.definition?.seasonId
    ? getEducationSeasonById(latestUnlock.definition.seasonId)
    : undefined;
  const latestMastery = latestSeason ? getEducationMasteryById(latestSeason.masteryId) : undefined;

  if (loading) {
    return (
      <p style={{ fontFamily: '"Futura PT Book"', color: '#666', textTransform: 'uppercase', fontSize: 12 }}>
        Loading collection…
      </p>
    );
  }

  if (allItems.length === 0) {
    return (
      <div style={{ padding: '32px 20px', textAlign: 'center' }}>
        <CertificationCollectibleAsset earned={false} size={100} title="YOUR COLLECTION" />
        <p
          style={{
            margin: '20px 0 8px',
            fontFamily: '"Futura PT Medium"',
            fontSize: 14,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#111',
          }}
        >
          YOUR COLLECTION STARTS HERE
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: '"Futura PT Book"',
            fontSize: 12,
            lineHeight: 1.55,
            color: '#666',
            textTransform: 'uppercase',
          }}
        >
          Complete Seasons, Slay Challenges, and special experiences to build your Frontal Slayer collection.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 0 48px' }}>
      <header style={{ marginBottom: 28 }}>
        <p
          style={{
            margin: 0,
            fontFamily: '"Futura PT Medium"',
            fontSize: 11,
            color: '#EB1C24',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Collectibles
        </p>
        <h1
          style={{
            margin: '8px 0 0',
            fontFamily: '"Futura PT Medium"',
            fontSize: 22,
            color: '#111',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Your Frontal Slayer Collection
        </h1>
      </header>

      {latestUnlock ? (
        <section
          style={{
            marginBottom: 28,
            padding: 20,
            background: 'linear-gradient(145deg, #fafafa, #f0f0f0)',
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <p
            style={{
              margin: '0 0 12px',
              fontFamily: '"Futura PT Medium"',
              fontSize: 10,
              color: '#EB1C24',
              letterSpacing: '0.1em',
            }}
          >
            LATEST UNLOCK
          </p>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <CertificationCollectibleAsset
              definition={latestUnlock.definition}
              earned
              title={latestUnlock.definition?.title}
              size={96}
            />
            <div>
              <p style={{ margin: 0, fontFamily: '"Futura PT Medium"', fontSize: 14, textTransform: 'uppercase' }}>
                {latestUnlock.definition?.title}
              </p>
              {latestSeason ? (
                <p style={{ margin: '6px 0 0', fontFamily: '"Futura PT Book"', fontSize: 11, color: '#666', textTransform: 'uppercase' }}>
                  {latestMastery?.title} · SEASON {latestSeason.seasonNumber}
                </p>
              ) : null}
              <p style={{ margin: '6px 0 0', fontFamily: '"Futura PT Book"', fontSize: 10, color: '#888', textTransform: 'uppercase' }}>
                Earned{' '}
                {new Date(latestUnlock.earnedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 28,
        }}
      >
        {[
          { label: 'CERTIFICATIONS', value: stats.certificationsEarned },
          { label: 'COLLECTIBLES', value: stats.totalCollectibles },
          { label: 'SEASONS COMPLETE', value: stats.seasonsCompleted },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: '12px 8px',
              textAlign: 'center',
              border: '1px solid rgba(0,0,0,0.08)',
              background: '#fff',
            }}
          >
            <p style={{ margin: 0, fontFamily: '"Futura PT Medium"', fontSize: 18, color: '#111' }}>
              {stat.value}
            </p>
            <p
              style={{
                margin: '4px 0 0',
                fontFamily: '"Futura PT Book"',
                fontSize: 8,
                color: '#888',
                letterSpacing: '0.06em',
              }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <p
        style={{
          margin: '0 0 12px',
          fontFamily: '"Futura PT Medium"',
          fontSize: 11,
          color: '#111',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        Explore Your Collection
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {visibleFilters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            style={{
              padding: '8px 14px',
              border: filter === f.id ? '1px solid #EB1C24' : '1px solid rgba(0,0,0,0.12)',
              background: filter === f.id ? 'rgba(235,28,36,0.06)' : '#fff',
              fontFamily: '"Futura PT Medium"',
              fontSize: 9,
              letterSpacing: '0.08em',
              color: filter === f.id ? '#EB1C24' : '#666',
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {items.map((item) => (
          <CollectibleCard
            key={item.id}
            item={item}
            onOpen={() => {
              trackEducationHierarchyEvent('collectible_opened', {
                collectibleId: item.collectibleId,
              });
            }}
          />
        ))}
      </div>
    </div>
  );
}
