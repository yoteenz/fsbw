/// <reference types="vite/client" />

declare module '*.svg?url' {
  const url: string;
  export default url;
}

declare global {
  interface FacebookAuthResponse {
    accessToken: string;
    expiresIn: number;
    signedRequest: string;
    userID: string;
  }

  interface FacebookLoginStatus {
    status: 'connected' | 'not_authorized' | 'unknown';
    authResponse?: FacebookAuthResponse;
  }

  interface FacebookStatic {
    init(params: { appId: string; cookie?: boolean; xfbml?: boolean; version: string }): void;
    login(callback: (response: FacebookLoginStatus) => void, options?: { scope?: string }): void;
    api(path: string, params: { fields?: string }, callback: (response: { id?: string; name?: string; email?: string; link?: string }) => void): void;
  }

  interface GoogleTokenResponse {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
  }

  interface GoogleAccountsOAuth2 {
    initTokenClient(config: {
      client_id: string;
      scope: string;
      callback: (response: GoogleTokenResponse) => void;
    }): { requestAccessToken: () => void };
  }

  interface GoogleAccounts {
    oauth2: GoogleAccountsOAuth2;
  }

  interface Window {
    FB?: FacebookStatic;
    fbAsyncInit?: () => void;
    google?: { accounts: GoogleAccounts };
  }
}

export {};
