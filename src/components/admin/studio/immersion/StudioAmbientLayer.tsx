import type { StudioRoomVariant } from '../../../../studio-os-core/studio-immersion/types';

type Props = {
  variant: StudioRoomVariant;
  timeClass?: string;
};

/** Subtle ambient life behind Studio OS — daylight shift · time-of-day tone. */
export function StudioAmbientLayer({ variant, timeClass }: Props) {
  return (
    <div
      className={`studio-ambient-layer fixed inset-0 -z-[5] studio-room-${variant.replace(/-/g, '-')} ${timeClass ?? ''}`}
      aria-hidden
    >
      <div className="absolute inset-0 studio-daylight-shift studio-ambient-warm" />
      <div className="absolute inset-0 studio-ambient-drift opacity-40">
        <span className="studio-particle" style={{ left: '12%', top: '20%' }} />
        <span className="studio-particle" />
        <span className="studio-particle" />
        <span className="studio-particle" />
      </div>
    </div>
  );
}
