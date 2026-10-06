import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { aioPaths } from '../../utils/paths';
import { findCaseById } from '../iftaRouteHelpers';

/** Legacy `/portal/services/ifta` swallowed by service tracker — redirect to workspace filing room. */
export function PortalIftaLegacyRedirect() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const quarter = params.get('quarter');
  if (quarter) return <Navigate to={aioPaths.portalWorkspaceIftaQuarter(quarter)} replace />;
  return <Navigate to={aioPaths.portalWorkspaceIfta} replace />;
}

export function OfficeFuelTaxLegacyRedirect() {
  const { caseId } = useParams<{ caseId?: string }>();
  const store = useDemoStore();
  if (caseId) {
    const q = findCaseById(store, caseId);
    if (q) return <Navigate to={aioPaths.officeWorkspaceIftaCase(q.organizationId, `${q.year}-Q${q.quarter}`)} replace />;
  }
  return <Navigate to={aioPaths.officeWorkspaceIfta} replace />;
}
