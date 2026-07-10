import { useCallback, useState } from 'react';
import {
  EXPERIENCE_ENGINE_MIGRATION_LEDGER_KEY,
  quarantineExperienceEngineDnaSlice,
  XEE_SUBSYSTEM_VERSION,
} from '../../../../studio-os-core/genesis';
import { EXPERIENCE_ENGINE_STORAGE_KEY } from '../../../../studio-os-core/experience-engine/constants';
import { invalidateGenesisStoreCache } from '../../../../studio-os-core/genesis/persistence/store';

type Props = {
  reasons: string[];
  bootError?: string | null;
  onRepaired: () => void;
};

/** Targeted recovery — clears only Experience Engine-owned persisted slices. */
export function ExperienceEngineRecoveryPanel({ reasons, bootError, onRepaired }: Props) {
  const [busy, setBusy] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const repair = useCallback(() => {
    setBusy(true);
    try {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(EXPERIENCE_ENGINE_STORAGE_KEY);
        } catch {
          /* ignore */
        }
      }
      invalidateGenesisStoreCache();
      const result = quarantineExperienceEngineDnaSlice();
      setLastAction(result.reasons.join('; ') || 'Experience Engine DNA reset to bundled defaults.');
      onRepaired();
    } finally {
      setBusy(false);
    }
  }, [onRepaired]);

  return (
    <div
      data-xee-recovery="1"
      style={{
        margin: 16,
        padding: 16,
        borderRadius: 12,
        border: '1px solid #fecaca',
        background: '#fff7f7',
        fontFamily: 'system-ui, sans-serif',
        fontSize: 12,
        lineHeight: 1.55,
        color: '#1f2937',
      }}
    >
      <p style={{ margin: 0, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#991b1b' }}>
        Experience Engine state recovery
      </p>
      <p style={{ margin: '8px 0 0' }}>
        Normal-browser persisted data is incompatible with the current Experience Engine schema. Private/incognito sessions
        start clean and load successfully.
      </p>

      <dl style={{ margin: '12px 0 0', display: 'grid', gap: 6 }}>
        <Row label="Failing subsystem" value="Experience Engine DNA (genesis_v1.experienceEngineDna)" />
        <Row label="Storage keys" value={`genesis_v1 · ${EXPERIENCE_ENGINE_STORAGE_KEY}`} />
        <Row label="Expected schema" value={XEE_SUBSYSTEM_VERSION} />
        <Row label="Recovery attempted" value={reasons.length ? reasons.join('; ') : 'Automatic boot repair pending'} />
        <Row label="User data preserved" value="Unrelated genesis, workspace, auth, and Scene Stack keys are kept" />
        {bootError ? <Row label="Terminal error" value={bootError} /> : null}
      </dl>

      {lastAction ? (
        <p style={{ margin: '10px 0 0', color: '#166534' }}>Repair complete: {lastAction}</p>
      ) : null}

      <button
        type="button"
        disabled={busy}
        onClick={repair}
        style={{
          marginTop: 12,
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid #991b1b',
          background: '#fff',
          cursor: busy ? 'wait' : 'pointer',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.04em',
        }}
      >
        {busy ? 'Repairing…' : 'Repair Experience Engine State'}
      </button>

      <p style={{ margin: '8px 0 0', fontSize: 10, color: '#6b7280' }}>
        Migration ledger: {EXPERIENCE_ENGINE_MIGRATION_LEDGER_KEY}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt style={{ fontWeight: 700, display: 'inline' }}>{label}: </dt>
      <dd style={{ display: 'inline', margin: 0 }}>{value}</dd>
    </div>
  );
}
