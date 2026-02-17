/**
 * WebAuthn / passkey support for sign-in (Face ID, Touch ID, Windows Hello).
 * Works in Chrome, Safari, Edge when a backend is configured.
 *
 * Setup: see docs/WEBAUTHN_SETUP.md. Set VITE_WEBAUTHN_API_URL to your API base (e.g. /api) to enable.
 */

declare global {
  interface PublicKeyCredentialRequestOptionsJSON {
    challenge: string;
    allowCredentials?: Array<{ id: string; type: string; transports?: string[] }>;
    rpId?: string;
    userVerification?: UserVerificationRequirement;
    timeout?: number;
  }
}

/** True if the browser supports WebAuthn conditional UI (passkey autofill). */
export async function isPasskeyAvailable(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) return false;
  if (!PublicKeyCredential.isConditionalMediationAvailable) return false;
  try {
    return await PublicKeyCredential.isConditionalMediationAvailable();
  } catch {
    return false;
  }
}

/** Get the WebAuthn API base URL from env (no trailing slash). Empty = disabled. */
export function getWebAuthnApiBase(): string {
  const base =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_WEBAUTHN_API_URL) ||
    (typeof process !== 'undefined' && process.env?.REACT_APP_WEBAUTHN_API_URL) ||
    '';
  return (base || '').toString().trim().replace(/\/+$/, '');
}

/**
 * Start conditional passkey sign-in (autofill UI).
 * Fetches challenge from backend, runs credentials.get(mediation: 'conditional'), then posts credential to backend.
 * Returns the backend response body on success (e.g. { user, token }); throws on failure or cancel.
 * Only call when getWebAuthnApiBase() is non-empty and backend is deployed.
 */
export async function signInWithPasskey(apiBase: string): Promise<unknown> {
  const base = apiBase.replace(/\/+$/, '');
  const requestUrl = `${base}/webauthn/signinRequest`;
  const verifyUrl = `${base}/webauthn/signinResponse`;

  const res = await fetch(requestUrl, { credentials: 'include' });
  if (!res.ok) throw new Error(`WebAuthn challenge failed: ${res.status}`);
  const requestJson = await res.json();

  const PKC = PublicKeyCredential as unknown as {
    parseRequestOptionsFromJSON?: (json: PublicKeyCredentialRequestOptionsJSON) => unknown;
    signalUnknownCredential?: (opts: { rpId: string; credentialId: string }) => Promise<void>;
  };
  const options = PKC.parseRequestOptionsFromJSON?.(requestJson as PublicKeyCredentialRequestOptionsJSON);
  if (!options) throw new Error('Invalid WebAuthn options from server');

  const credential = (await navigator.credentials.get({
    publicKey: options as PublicKeyCredentialRequestOptions,
    mediation: 'conditional',
  })) as PublicKeyCredential | null;

  if (!credential) throw new Error('No passkey selected');

  const credWithToJSON = credential as PublicKeyCredential & { toJSON?: () => unknown };
  const body = JSON.stringify(typeof credWithToJSON.toJSON === 'function' ? credWithToJSON.toJSON() : { id: credential.id, response: credential.response });
  const verifyRes = await fetch(verifyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body,
  });

  if (verifyRes.status === 404 && PKC.signalUnknownCredential) {
    try {
      const rpId = requestJson.rpId || window.location.hostname;
      await PKC.signalUnknownCredential({
        rpId,
        credentialId: (credential as any).id,
      });
    } catch (_) {}
  }

  if (!verifyRes.ok) {
    const errText = await verifyRes.text();
    throw new Error(errText || `Passkey sign-in failed: ${verifyRes.status}`);
  }

  return verifyRes.json();
}

/**
 * Start conditional passkey sign-in only if WebAuthn API is configured and available.
 * Resolves with backend result or null (user chose password or cancelled). Rejects on network/parse errors.
 */
export async function tryPasskeySignIn(): Promise<unknown | null> {
  const apiBase = getWebAuthnApiBase();
  if (!apiBase) return null;
  if (!(await isPasskeyAvailable())) return null;
  try {
    return await signInWithPasskey(apiBase);
  } catch (e: any) {
    if (e?.name === 'NotAllowedError' || e?.message?.includes('No passkey selected')) return null;
    throw e;
  }
}
