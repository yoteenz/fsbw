/**
 * App-layer auth bridge — wires adminAuth into studio-os-core without core importing utils directly.
 */
import { configureStudioOsAuth } from '../../studio-os-core/auth/provider';
import {
  getCurrentUser,
  isAdminEmail,
  isAdminFounderAccount,
} from '../../utils/adminAuth';

function readPortfolioOwnerEmails(): string[] {
  const raw =
    (typeof import.meta !== 'undefined' &&
      (import.meta as { env?: { VITE_PORTFOLIO_OWNER_EMAILS?: string } }).env?.VITE_PORTFOLIO_OWNER_EMAILS) ||
    '';
  return String(raw)
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function registerStudioOsAuthBridge(): void {
  configureStudioOsAuth({
    getCurrentUser: () => {
      const user = getCurrentUser();
      if (!user) return null;
      return { email: user.email };
    },
    isAdminEmail: (email) => isAdminEmail(email),
    isPortfolioOwnerEmail: (email) => {
      const normalized = email.trim().toLowerCase();
      if (isAdminFounderAccount({ email: normalized })) return true;
      const envOwners = readPortfolioOwnerEmails();
      return envOwners.length > 0 && envOwners.includes(normalized);
    },
  });
}
