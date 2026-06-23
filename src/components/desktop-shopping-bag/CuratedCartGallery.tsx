import { useMemo, useState } from 'react';
import { CuratedCartItemCard } from './CuratedCartItemCard';

type Props = {
  items: Record<string, unknown>[];
  removingIds: Set<string>;
  onEdit: (item: Record<string, unknown>) => void;
  onRemove: (itemId: string) => void;
  onOpenPdp: (item: Record<string, unknown>) => void;
};

const VISIBLE_DESKTOP = 3;

export function CuratedCartGallery({
  items,
  removingIds,
  onEdit,
  onRemove,
  onOpenPdp,
}: Props) {
  const [startIndex, setStartIndex] = useState(0);
  const count = items.length;
  const canCarousel = count > VISIBLE_DESKTOP;

  const visibleItems = useMemo(() => {
    if (!canCarousel) return items;
    const slice: Record<string, unknown>[] = [];
    for (let i = 0; i < VISIBLE_DESKTOP; i += 1) {
      slice.push(items[(startIndex + i) % count]);
    }
    return slice;
  }, [canCarousel, count, items, startIndex]);

  const remaining = canCarousel ? Math.max(0, count - VISIBLE_DESKTOP) : 0;

  const prev = () => {
    if (!canCarousel) return;
    setStartIndex((i) => (i - 1 + count) % count);
  };

  const next = () => {
    if (!canCarousel) return;
    setStartIndex((i) => (i + 1) % count);
  };

  const layoutClass =
    count === 1
      ? 'curated-gallery--one'
      : count === 2
        ? 'curated-gallery--two'
        : count === 3
          ? 'curated-gallery--three'
          : 'curated-gallery--carousel';

  return (
    <div className={`curated-gallery ${layoutClass}`}>
      {canCarousel ? (
        <button type="button" className="curated-gallery__arrow curated-gallery__arrow--prev" onClick={prev} aria-label="Previous items">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      ) : null}

      <div className="curated-gallery__track">
        {visibleItems.map((item) => (
          <CuratedCartItemCard
            key={String(item.id)}
            item={item}
            removing={removingIds.has(String(item.id))}
            onEdit={onEdit}
            onRemove={onRemove}
            onOpenPdp={onOpenPdp}
          />
        ))}
      </div>

      {canCarousel ? (
        <>
          <button type="button" className="curated-gallery__arrow curated-gallery__arrow--next" onClick={next} aria-label="Next items">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          {remaining > 0 ? (
            <p className="curated-gallery__more">+ {remaining} More</p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
