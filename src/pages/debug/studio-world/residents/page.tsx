import { useMemo, useState } from 'react';
import {
  getInspectorSnapshot,
  getSeason1ResidentRegistry,
  listSeason1Residents,
} from '../../../../studio-os-core/studio-world-residents';
import type { ResidentId } from '../../../../studio-os-core/studio-world-residents';
import { RESIDENT_WORKSPACE_SECTIONS } from '../../../../studio-os-core/studio-world-residents/life-os/workspace-contract';

export default function StudioWorldResidentsDebugPage() {
  const registry = useMemo(() => getSeason1ResidentRegistry(), []);
  const [selectedId, setSelectedId] = useState<ResidentId>(
    registry.residents[0]?.residentId ?? 'SW-RESIDENT-001'
  );

  const inspector = useMemo(() => getInspectorSnapshot(selectedId), [selectedId]);
  const resident = registry.residents.find((r) => r.residentId === selectedId);
  const edges = inspector.relationships;
  const documentary = inspector.documentary;
  const fabrication = registry.fabricationRequirements.find((f) => f.residentId === selectedId);
  const twin = inspector.twin;

  return (
    <div style={{ fontFamily: 'monospace', padding: 16, maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: 18 }}>Studio World — Resident Life OS Inspector (QA)</h1>
      <p style={{ fontSize: 12, color: '#555' }}>
        Internal read-only proof surface. Season 1 canon + Life OS foundation2 — not public storefront.
      </p>
      <p style={{ fontSize: 11 }}>
        Residents: {listSeason1Residents().length} · Registry: {registry.version} · Life OS: {twin.worldId}
      </p>

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
            <strong>Presence:</strong> {twin.current.presence} · <strong>Location:</strong>{' '}
            {twin.current.locationLabel}
          </p>
          <p>
            <strong>Activity:</strong> {twin.current.activity}
          </p>
          <p>
            <strong>Intent:</strong> {twin.current.currentIntent}
          </p>
          <p>
            <strong>Career:</strong> {twin.career.careerState} — {twin.career.title}
          </p>
          <p>
            <strong>Autonomy:</strong> {twin.autonomy.level}
          </p>

          <h3 style={{ fontSize: 13, marginTop: 16 }}>Needs (with causes)</h3>
          <pre style={{ fontSize: 11, background: '#f4f4f4', padding: 8, overflow: 'auto' }}>
            {JSON.stringify({ levels: twin.needs.levels, causes: twin.needs.causes.slice(-4) }, null, 2)}
          </pre>

          <h3 style={{ fontSize: 13, marginTop: 16 }}>Goals</h3>
          <ul>
            {twin.goals.personalObjectives.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>

          <h3 style={{ fontSize: 13, marginTop: 16 }}>Relationships ({edges.length})</h3>
          <ul>
            {edges.slice(0, 8).map((e) => (
              <li key={e.residentBId}>
                {e.residentBId}: trust {e.trust.toFixed(2)}
              </li>
            ))}
          </ul>

          <h3 style={{ fontSize: 13, marginTop: 16 }}>Memories / Knowledge / Rumors</h3>
          <p>
            Memories: {inspector.memories.length} · Beliefs: {inspector.knowledge.beliefs.length} · Rumors held:{' '}
            {inspector.rumors.length}
          </p>

          <h3 style={{ fontSize: 13, marginTop: 16 }}>Interventions</h3>
          <p>{inspector.interventions.length ? inspector.interventions[0]?.directive : 'None recorded'}</p>

          <h3 style={{ fontSize: 13, marginTop: 16 }}>Cast roles (active)</h3>
          <p>{inspector.castRoles.length ? inspector.castRoles.map((c) => c.roleName).join(', ') : 'None'}</p>

          <h3 style={{ fontSize: 13, marginTop: 16 }}>Workspace sections (IA contract)</h3>
          <p style={{ fontSize: 10 }}>{RESIDENT_WORKSPACE_SECTIONS.join(' · ')}</p>

          <p style={{ marginTop: 16 }}>
            <strong>Core role:</strong> {resident.coreWorldRole}
          </p>
          <p>
            <strong>Fabrication:</strong> {resident.fabricationStatus} · <strong>Canon:</strong>{' '}
            {resident.canonLifecycleStatus} {resident.canonVersion}
          </p>

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
