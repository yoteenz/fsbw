import { useMemo } from 'react';
import { loadWorkspace } from '../../../../studio-os-core/workspace/loader';
import type { HeadquartersAtmosphereCue, HeadquartersProfile } from '../../../../studio-os-core/campus-transitions/types';

type Props = {
  profile: HeadquartersProfile;
  visible: boolean;
};

/** Subtle headquarters life — people · reflections · displays · production motion. */
export function HeadquartersAtmosphere({ profile, visible }: Props) {
  const schema = useMemo(() => loadWorkspace(profile.workspaceId)?.schema, [profile.workspaceId]);

  if (!visible) return null;

  return (
    <div className="campus-transition-ambient" aria-hidden>
      {profile.ambientCues.map((cue: HeadquartersAtmosphereCue, i: number) => (
        <span
          key={cue.id}
          className="campus-transition-ambient-dot"
          style={{
            left: `${18 + i * 22}%`,
            top: `${32 + (i % 3) * 12}%`,
            animationDelay: `${i * 0.7}s`,
            background: profile.exteriorAccent,
          }}
        />
      ))}
      <span className="campus-transition-people" style={{ left: '22%', animationDelay: '0s' }} />
      <span className="campus-transition-people" style={{ left: '58%', animationDelay: '2.4s' }} />
      <div
        style={{
          position: 'absolute',
          bottom: '12%',
          right: '8%',
          width: 64,
          height: 36,
          border: '1px solid rgba(255,255,255,0.25)',
          background: `linear-gradient(135deg, ${profile.exteriorAccent}33, transparent)`,
        }}
      >
        <p
          style={{
            fontFamily: '"Futura PT Medium"',
            fontSize: '4px',
            color: 'rgba(255,255,255,0.85)',
            margin: 4,
            lineHeight: 1.3,
          }}
        >
          {schema?.displayName?.slice(0, 12) ?? 'HQ'}
        </p>
      </div>
    </div>
  );
}
