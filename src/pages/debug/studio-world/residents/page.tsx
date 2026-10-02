import { useMemo, useState } from 'react';
import {
  getRelationshipGraph,
  getSeason1ResidentRegistry,
  listSeason1Residents,
} from '../../../../studio-os-core/studio-world-residents';
import type { ResidentId } from '../../../../studio-os-core/studio-world-residents';

export default function StudioWorldResidentsDebugPage() {
  const registry = useMemo(() => getSeason1ResidentRegistry(), []);
  const [selectedId, setSelectedId] = useState<ResidentId>(
    registry.residents[0]?.residentId ?? 'SW-RESIDENT-001'
  );

  const resident = registry.residents.find((r) => r.residentId === selectedId);
  const graph = useMemo(() => getRelationshipGraph(), []);
  const edges = graph.byResident.get(selectedId as (typeof registry.residents)[0]['residentId']) ?? [];
  const documentary = registry.documentaryProfiles.find((p) => p.residentId === selectedId);
  const fabrication = registry.fabricationRequirements.find((f) => f.residentId === selectedId);

  return (
    <div style={{ fontFamily: 'monospace', padding: 16, maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: 18 }}>Studio World — Resident Registry (QA)</h1>
      <p style={{ fontSize: 12, color: '#555' }}>
        Internal read-only proof surface. Season 1 canon — not public. Studio World residents, not Studio OS
        machinery.
      </p>
      <p style={{ fontSize: 11 }}>Residents loaded: {listSeason1Residents().length} · Version: {registry.version}</p>

      <label style={{ display: 'block', marginTop: 16, fontSize: 12 }}>
        Resident
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value as ResidentId)}
          style={{ display: 'block', marginTop: 4, width: '100%', padding: 8 }}
        >
          {registry.residents.map((r) => (
            <option key={r.residentId} value={r.residentId}>
              {r.residentId} — {r.displayName}
            </option>
          ))}
        </select>
      </label>

      {resident ? (
        <section style={{ marginTop: 24, fontSize: 12, lineHeight: 1.5 }}>
          <h2 style={{ fontSize: 14 }}>{resident.displayName}</h2>
          <p>
            <strong>Core role:</strong> {resident.coreWorldRole}
          </p>
          <p>
            <strong>Fabrication:</strong> {resident.fabricationStatus} · <strong>Canon:</strong>{' '}
            {resident.canonLifecycleStatus} {resident.canonVersion}
          </p>
          <p>
            <strong>Embodiment (UE):</strong> {resident.embodimentTargets[0]?.status ?? 'unknown'}
          </p>
          <p>
            <strong>Traits:</strong> {resident.personality.traits.join(' · ')}
          </p>

          <h3 style={{ fontSize: 13, marginTop: 16 }}>Relationships ({edges.length})</h3>
          <ul>
            {edges.slice(0, 12).map((e) => (
              <li key={e.id}>
                {e.personAId === resident.residentId ? e.personBId : e.personAId}: {e.label}{' '}
                {e.mutual ? '(mutual)' : '(asymmetric)'}
              </li>
            ))}
          </ul>

          {documentary ? (
            <>
              <h3 style={{ fontSize: 13, marginTop: 16 }}>Documentary</h3>
              <p>Camera: {documentary.cameraAwareness}</p>
              <p>{documentary.confessionalStyle}</p>
            </>
          ) : null}

          {fabrication ? (
            <>
              <h3 style={{ fontSize: 13, marginTop: 16 }}>Fabrication angles pending</h3>
              <p>
                {fabrication.referenceAngles.filter((a) => a.status === 'pending').length} /{' '}
                {fabrication.referenceAngles.length} reference angles pending
              </p>
            </>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
