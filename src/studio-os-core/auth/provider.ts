import type { StudioOsAuthProvider } from './types';

let authProvider: StudioOsAuthProvider | null = null;

export function configureStudioOsAuth(provider: StudioOsAuthProvider): void {
  authProvider = provider;
}

export function getStudioOsAuthProvider(): StudioOsAuthProvider {
  if (!authProvider) {
    throw new Error(
      'Studio OS auth provider is not configured. Register via configureStudioOsAuth() during app bootstrap.'
    );
  }
  return authProvider;
}

export function tryGetStudioOsAuthProvider(): StudioOsAuthProvider | null {
  return authProvider;
}
