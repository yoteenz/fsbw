import { isAyoteenzAdminAccount } from './adminAuth';
import { isClientBlocked } from './blockedClients';
import { getMockClientsForAyoteenz } from '../pages/admin/clients/page';

/** Same client list as admin clients overview: API + mock merge, dedupe by email, filter blocked. */
export function buildClientListFromOverview(
  apiClients: Array<Record<string, unknown>>,
  currentUser: { email?: string } | null
): Array<{ id?: string; email?: string; firstName?: string; lastName?: string }> {
  const norm = (e: string) => (e || '').trim().toLowerCase();
  const dedupe = (list: any[]) => {
    const seen = new Set<string>();
    return list.filter((u: any) => {
      const e = norm(u.email || '');
      if (seen.has(e)) return false;
      seen.add(e);
      return true;
    });
  };
  const list = Array.isArray(apiClients) ? apiClients : [];
  if (list.length > 0) {
    let fromApi = dedupe(list as any[]);
    const mockClients = getMockClientsForAyoteenz();
    const mockByEmail = new Map(mockClients.map((m: any) => [norm(m.email || ''), m]));
    const existingEmails = new Set(fromApi.map((u: any) => norm(u.email || '')));
    const toAdd = mockClients.filter((m: any) => !existingEmails.has(norm(m.email || '')));
    fromApi = fromApi.map((u: any) => {
      const fresh = mockByEmail.get(norm(u.email || ''));
      return fresh ? { ...u, ...fresh } : u;
    });
    if (toAdd.length > 0) fromApi = [...fromApi, ...toAdd];
    return fromApi.filter((u: any) => !isClientBlocked(u));
  }
  let fallback = list as any[];
  try {
    const localReg = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    fallback = dedupe(Array.isArray(localReg) ? localReg : []);
    if (currentUser && isAyoteenzAdminAccount(currentUser)) {
      const mockClients = getMockClientsForAyoteenz();
      const mockByEmail = new Map(mockClients.map((m: any) => [norm(m.email || ''), m]));
      const existingFallback = new Set(fallback.map((u: any) => norm(u.email || '')));
      const toAddMock = mockClients.filter((m: any) => !existingFallback.has(norm(m.email || '')));
      fallback = fallback.map((u: any) => {
        const fresh = mockByEmail.get(norm(u.email || ''));
        return fresh ? { ...u, ...fresh } : u;
      });
      if (toAddMock.length > 0) fallback = [...fallback, ...toAddMock];
    }
  } catch (_) {
    /* ignore */
  }
  return fallback.filter((u: any) => !isClientBlocked(u));
}
