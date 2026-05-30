export const LOUNGE_TV_POWER_OFF_MS = 480;

type LoungeTvPowerOffEffectProps = {
  active: boolean;
};

/** CRT power-off — bright horizontal zap line collapses to center (no static). */
export function LoungeTvPowerOffEffect({ active }: LoungeTvPowerOffEffectProps) {
  if (!active) return null;

  return (
    <div className="lounge-tv-power-off" aria-hidden>
      <div className="lounge-tv-power-off__flash" />
      <div className="lounge-tv-power-off__beam" />
    </div>
  );
}
