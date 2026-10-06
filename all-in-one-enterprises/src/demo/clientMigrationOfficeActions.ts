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
  const activationUrl = `${base}${path}`;

  try {
    const res = await fetch('/api/aio/client-migration/send-activation-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        companyName: client.companyName,
        activationUrl,
      }),
    });
    if (!res.ok) {
      return { activationUrl, error: 'Invite created but email delivery failed — copy the link manually.' };
    }
  } catch {
    return { activationUrl, error: 'Invite created but email delivery failed — copy the link manually.' };
  }

  return { activationUrl };
}
