import { loadDemoStore, updateDemoStore } from './demoStore';
import { createActivationInvite } from '../client-migration/services/activationInviteService';

export async function sendClientActivationInvite(
  organizationId: string,
  email: string,
  staffId?: string,
): Promise<{ activationUrl: string; error?: string }> {
  const store = loadDemoStore();
  const client = store.clients.find((c) => c.id === organizationId);
  if (!client) return { activationUrl: '', error: 'Client not found' };
  if (client.clientLifecycle !== 'PREBUILT' && client.clientLifecycle !== 'INVITED') {
    return { activationUrl: '', error: 'Client must be PREBUILT before invite' };
  }

  const { store: next, rawToken } = await createActivationInvite(store, organizationId, email, staffId);
  updateDemoStore(() => next);
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const path = `/all-in-one/office-activation/${rawToken}`;
  return { activationUrl: `${base}${path}` };
}
