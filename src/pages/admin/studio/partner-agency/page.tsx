import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { StudioWorldOrgContextBar } from '../../../../components/admin/studio/StudioWorldOrgContextBar';
import { StudioWorldOrganizationSwitcher } from '../../../../components/admin/studio/StudioWorldOrganizationSwitcher';
import { useStudioWorldOperatorContext } from '../../../../hooks/useStudioWorldOperatorContext';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import type { OperatorProductionContext } from '../../../../studio-os-core/partner-onboarding/types';

const API = '/api/admin/studio-partner-onboarding';

type ClientRow = { id: string; name: string; client_key: string };
type ProjectRow = { id: string; name: string; project_key: string; client_id: string };
type InvitationRow = { id: string; invited_email: string; status: string; proposed_role: string };

export default function AdminStudioPartnerAgencyPage() {
  const navigate = useNavigate();
  const { context, loading, reload } = useStudioWorldOperatorContext();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const slug = context?.activeOrganizationSlug ?? 'founding-partner-agency';

  const loadAgencyData = useCallback(async () => {
    if (!slug) return;
    try {
      const [cRes, pRes, iRes, uRes] = await Promise.all([
        fetch(`${API}?action=clients&organizationSlug=${encodeURIComponent(slug)}`),
        fetch(`${API}?action=projects&organizationSlug=${encodeURIComponent(slug)}`),
        fetch(`${API}?action=invitations&organizationSlug=${encodeURIComponent(slug)}`),
        fetch(`${API}?action=usage&organizationSlug=${encodeURIComponent(slug)}`),
      ]);
      const [cJson, pJson, iJson, uJson] = await Promise.all([
        cRes.json(),
        pRes.json(),
        iRes.json(),
        uRes.json(),
      ]);
      if (cRes.ok) setClients(cJson.clients ?? []);
      if (pRes.ok) setProjects(pJson.projects ?? []);
      if (iRes.ok) setInvitations(iJson.invitations ?? []);
      if (uRes.ok) setAnalytics(uJson.analytics ?? null);
    } catch {
      /* non-fatal */
    }
  }, [slug]);

  useEffect(() => {
    void loadAgencyData();
  }, [loadAgencyData]);

  const postAction = async (action: string, extra: Record<string, unknown> = {}) => {
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, organizationSlug: slug, ...extra }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setMessage(`${action} OK`);
      await reload();
      await loadAgencyData();
      return json;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
      return null;
    }
  };

  return (
    <AdminStudioStageShell
      title="PARTNER / AGENCY"
      subtitle="ORGANIZATION INVITATIONS · CLIENTS · PROJECTS · GOVERNED PRODUCTION CONTEXT"
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
      navGroupId="settings"
    >
      <StudioWorldOrganizationSwitcher />
      <StudioWorldOrgContextBar context={context} loading={loading} />

      {error ? (
        <p className="text-[7px] font-futura" style={{ color: ADMIN_STUDIO_THEME.accent }}>
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-[7px] font-futura" style={{ color: '#0a6' }}>
          {message}
        </p>
      ) : null}

      <CapabilityPanel context={context} />

      <section className="mt-3 p-2 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <h3 className="text-[8px] font-futura uppercase mb-2" style={{ fontWeight: 515 }}>
          CLIENTS ({clients.length})
        </h3>
        <ul className="text-[7px] font-futura space-y-1">
          {clients.map((c) => (
            <li key={c.id}>
              {c.name} · {c.client_key}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-3 p-2 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <h3 className="text-[8px] font-futura uppercase mb-2" style={{ fontWeight: 515 }}>
          PROJECTS ({projects.length})
        </h3>
        <ul className="text-[7px] font-futura space-y-1">
          {projects.map((p) => (
            <li key={p.id}>
              {p.name} · {p.project_key}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-3 p-2 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <h3 className="text-[8px] font-futura uppercase mb-2" style={{ fontWeight: 515 }}>
          INVITATIONS ({invitations.length})
        </h3>
        <ul className="text-[7px] font-futura space-y-1">
          {invitations.map((i) => (
            <li key={i.id}>
              {i.invited_email} · {i.proposed_role} · {i.status}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-2 py-1 px-2 text-[6px] font-futura uppercase border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
          onClick={() =>
            void postAction('invite_member', {
              invitedEmail: `invite-${Date.now()}@pilot.test`,
              proposedRole: 'PRODUCER',
            })
          }
        >
          CREATE TEST INVITATION
        </button>
      </section>

      {analytics ? (
        <section className="mt-3 p-2 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
          <h3 className="text-[8px] font-futura uppercase mb-2" style={{ fontWeight: 515 }}>
            USAGE ANALYTICS
          </h3>
          <pre className="text-[6px] overflow-auto max-h-40">{JSON.stringify(analytics.totals, null, 2)}</pre>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2 mt-4">
        <button
          type="button"
          className="py-1 px-2 text-[6px] font-futura uppercase border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
          onClick={() => void postAction('seed_pilot_fixtures')}
        >
          SEED PILOT FIXTURES
        </button>
        <button
          type="button"
          className="py-1 px-2 text-[6px] font-futura uppercase border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
          onClick={() => void postAction('simulate_dual_context')}
        >
          RUN DUAL-CONTEXT PILOT
        </button>
      </div>

      <AdminStudioDisclaimerFooter>
        PARTNER / AGENCY ONBOARDING · GOVERNED PRODUCTION · NO REAL PARTNER INVITES IN SPRINT
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}

function CapabilityPanel({ context }: { context: OperatorProductionContext | null }) {
  if (!context) return null;
  return (
    <section className="mt-2 p-2 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
      <h3 className="text-[8px] font-futura uppercase mb-2" style={{ fontWeight: 515 }}>
        PRODUCTION CAPABILITIES
      </h3>
      <ul className="text-[6px] font-futura space-y-0.5">
        {context.capabilities.map((c) => (
          <li key={c.routeKey}>
            {c.label}: <strong>{c.state}</strong> — {c.message}
          </li>
        ))}
      </ul>
    </section>
  );
}
