import type { RefObject } from 'react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  REWARDS_CERTIFICATION_DISPLAY_SLOTS,
  REWARDS_CERTIFICATION_WALL_SURFACE_ID,
} from '../../content/education/collectibles/displaySlots';
import { useUserCollectibles } from '../account/collectibles/useUserCollectibles';
import { CertificationCollectibleAsset } from '../account/collectibles/CertificationCollectibleAsset';
import { getCollectibleDefinitionById } from '../../content/education/collectibles/definitions';
import { buildDesktopElevatorHref } from '../../constants/desktopNavQuickRoutes';
import { DESKTOP_GALLERY_PATH } from '../../constants/desktopFloors';

type RewardsRoomCertificationWallProps = {
  measureRef?: RefObject<HTMLElement>;
};

/** Dynamic certification wall overlay — not baked into room background. */
export function RewardsRoomCertificationWall({ measureRef }: RewardsRoomCertificationWallProps) {
  const navigate = useNavigate();
  const { allItems, loading } = useUserCollectibles();

  const certificationItems = useMemo(
    () =>
      allItems.filter(
        (i) => i.sourceType === 'education' || i.definition?.type === 'season-certification',
      ),
    [allItems],
  );

  const slotAssignments = useMemo(() => {
    const slots = REWARDS_CERTIFICATION_DISPLAY_SLOTS.filter(
      (s) => s.surfaceId === REWARDS_CERTIFICATION_WALL_SURFACE_ID,
    );
    return slots.map((slot, index) => {
      const assigned =
        certificationItems.find((i) => i.displaySlotId === slot.id) ??
        certificationItems[index] ??
        null;
      return { slot, assigned };
    });
  }, [certificationItems]);

  if (loading) return null;

  return (
    <div
      aria-label="Certification display wall"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 12,
      }}
    >
      {slotAssignments.map(({ slot, assigned }) => {
        const definition = assigned
          ? assigned.definition ?? getCollectibleDefinitionById(assigned.collectibleId)
          : undefined;
        const earned = Boolean(assigned);

        return (
          <div
            key={slot.id}
            style={{
              position: 'absolute',
              left: `${slot.position.x}%`,
              top: `${slot.position.y}%`,
              transform: `translate(-50%, -50%) rotate(${slot.rotation ?? 0}deg) scale(${slot.scale ?? 1})`,
              width: '8%',
              minWidth: 56,
              pointerEvents: earned ? 'auto' : 'none',
            }}
          >
            <button
              type="button"
              disabled={!earned}
              onClick={() => {
                if (earned) navigate('/account/collectibles');
              }}
              style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                cursor: earned ? 'pointer' : 'default',
                width: '100%',
              }}
              aria-label={
                earned
                  ? `${definition?.title ?? 'Certification'} on rewards wall`
                  : 'Empty certification display slot'
              }
            >
              {earned ? (
                <CertificationCollectibleAsset
                  definition={definition}
                  earned
                  title={definition?.title}
                  size={64}
                />
              ) : (
                <div
                  style={{
                    width: 48,
                    height: 60,
                    margin: '0 auto',
                    border: '1px dashed rgba(255,255,255,0.2)',
                    borderRadius: 4,
                    opacity: 0.35,
                    background: 'rgba(255,255,255,0.04)',
                  }}
                  aria-hidden="true"
                />
              )}
            </button>
          </div>
        );
      })}

      <div
        style={{
          position: 'absolute',
          right: '4%',
          bottom: '6%',
          pointerEvents: 'auto',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/account/collectibles')}
          style={{
            padding: '10px 16px',
            border: '1px solid rgba(255,255,255,0.35)',
            background: 'rgba(0,0,0,0.45)',
            color: '#fff',
            fontFamily: '"Futura PT Medium"',
            fontSize: 10,
            letterSpacing: '0.08em',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          MASTERY COLLECTION
        </button>
      </div>

      {measureRef ? null : null}
    </div>
  );
}

export function rewardsGalleryHref(): string {
  return buildDesktopElevatorHref(DESKTOP_GALLERY_PATH, 'rewards-gallery');
}
