import { useState } from 'react';
import type { CampusArrivalBriefing, CampusTransitionSpeed } from '../../../../studio-os-core/campus-transitions/types';
import { CAMPUS_TRANSITION_SPEED_KEY } from '../../../../studio-os-core/campus-transitions/types';
import {
  writeCampusTransitionSpeed,
  readCampusTransitionSpeed,
} from '../../../../studio-os-core/campus-transitions/preferences';

type Props = {
  briefing: CampusArrivalBriefing;
  expanded: boolean;
  onToggleExpand: () => void;
  onBeginDay: () => void;
  onSkipToMissionControl: () => void;
  accent: string;
};

const SPEED_OPTIONS: { id: CampusTransitionSpeed; label: string }[] = [
  { id: 'cinematic', label: 'CINEMATIC' },
  { id: 'standard', label: 'STANDARD' },
  { id: 'instant', label: 'INSTANT' },
];

function BriefSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '5px', color: '#92704A', margin: '0 0 4px' }}>
        {title}
      </p>
      {items.map((item) => (
        <p key={item} style={{ fontFamily: '"Futura PT Book"', fontSize: '6px', color: '#333', margin: '2px 0', lineHeight: 1.45 }}>
          · {item}
        </p>
      ))}
    </div>
  );
}

export function CampusMorningBriefing({
  briefing,
  expanded,
  onToggleExpand,
  onBeginDay,
  onSkipToMissionControl,
  accent,
}: Props) {
  const [speed, setSpeed] = useState<CampusTransitionSpeed>(() => readCampusTransitionSpeed());

  const setSpeedPref = (next: CampusTransitionSpeed) => {
    setSpeed(next);
    writeCampusTransitionSpeed(next);
  };

  return (
    <div className="campus-transition-briefing-panel p-4">
      <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '6px', color: '#92704A', margin: 0 }}>
        CHIEF CONCIERGE · MORNING BRIEFING
      </p>
      <p
        style={{
          fontFamily: '"Covered By Your Grace", sans-serif',
          fontSize: '18px',
          color: '#1a1a1a',
          margin: '6px 0 8px',
        }}
      >
        {briefing.greeting}
      </p>
      <div className="space-y-1">
        {briefing.conciergeLines.map((line: string) => (
          <p key={line} style={{ fontFamily: '"Futura PT Book"', fontSize: '7px', color: '#444', margin: 0, lineHeight: 1.45 }}>
            {line}
          </p>
        ))}
      </div>

      {expanded ? (
        <>
          <BriefSection title="TODAY'S PRIORITIES" items={briefing.priorities} />
          <BriefSection title="EXECUTIVE UPDATES" items={briefing.executiveUpdates} />
          <BriefSection title="URGENT APPROVALS" items={briefing.urgentApprovals} />
          <BriefSection title="PRODUCTION STATUS" items={briefing.productionStatus} />
          <BriefSection title="PUBLISHING SCHEDULE" items={briefing.publishingSchedule} />
          <BriefSection title="ORGANIZATIONAL HEALTH" items={briefing.organizationalHealth} />
          <BriefSection title="RECENT ACHIEVEMENTS" items={briefing.recentAchievements} />
          <BriefSection title="UPCOMING MILESTONES" items={briefing.upcomingMilestones} />
        </>
      ) : null}

      <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button
          type="button"
          onClick={onBeginDay}
          style={{
            fontFamily: '"Futura PT Medium"',
            fontSize: '7px',
            padding: '8px 12px',
            color: '#fff',
            background: accent,
            border: `1px solid ${accent}`,
            cursor: 'pointer',
          }}
        >
          BEGIN DAY
        </button>
        <button
          type="button"
          onClick={onToggleExpand}
          style={{
            fontFamily: '"Futura PT Medium"',
            fontSize: '6px',
            padding: '8px 10px',
            border: '1.3px solid #9ca3af',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          {expanded ? 'COLLAPSE BRIEFING' : 'REVIEW BRIEFING'}
        </button>
        <button
          type="button"
          onClick={onSkipToMissionControl}
          style={{
            fontFamily: '"Futura PT Medium"',
            fontSize: '6px',
            padding: '8px 10px',
            border: '1.3px solid #9ca3af',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          SKIP TO MISSION CONTROL
        </button>
      </div>

      <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #eee' }}>
        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '5px', color: '#888', margin: '0 0 6px' }}>
          TRANSITION SPEED · {CAMPUS_TRANSITION_SPEED_KEY.replace('studioOs_', '').replace('_v1', '').toUpperCase()}
        </p>
        <div style={{ display: 'flex', gap: 6 }}>
          {SPEED_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSpeedPref(opt.id)}
              style={{
                fontFamily: '"Futura PT Medium"',
                fontSize: '5px',
                padding: '4px 8px',
                border: speed === opt.id ? `1px solid ${accent}` : '1px solid #ddd',
                background: speed === opt.id ? `${accent}12` : '#fff',
                color: speed === opt.id ? accent : '#666',
                cursor: 'pointer',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
