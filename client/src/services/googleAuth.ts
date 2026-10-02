/**
 * Google Authentication Service
 * Compatible with Google Identity Services (GIS), OpenID Connect & token clients.
 */

export interface GoogleUserProfile {
  email: string;
  name: string;
  picture: string;
  sub: string;
  credential?: string;
}

export const DEFAULT_GOOGLE_CLIENT_ID = '923229991059-7lolb3vtcoiqp0298arum249b8ie1t6q.apps.googleusercontent.com';

export const getGoogleClientId = (): string => {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;
};

/**
 * Decodes a Google JWT credential payload safely
 */
export const decodeGoogleJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.warn('Failed to decode Google JWT:', err);
    return null;
  }
};

/**
 * Triggers Google Sign In directly via Google GIS OAuth2 or Google ID Prompt
 */
export const triggerGoogleSignIn = async (): Promise<GoogleUserProfile> => {
  const clientId = getGoogleClientId();
  const google = (window as any).google;

  if (!clientId) {
    throw new Error('Google Client ID is missing.');
  }

  // 1. Try Google Identity Services Token Client (direct account selector popup)
  if (google?.accounts?.oauth2?.initTokenClient) {
    return new Promise((resolve, reject) => {
      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              reject(new Error(tokenResponse.error_description || tokenResponse.error));
              return;
            }

            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });

              if (!res.ok) {
                reject(new Error('Failed to fetch Google profile.'));
                return;
              }

              const profile = await res.json();
              resolve({
                email: profile.email,
                name: profile.name || profile.email.split('@')[0] || 'Studio Customer',
                picture: profile.picture || '',
                sub: profile.sub || profile.email
              });
            } catch (err) {
              reject(err);
            }
          },
          error_callback: (err: any) => {
            if (err.type === 'popup_closed') {
              reject(new Error('POPUP_CLOSED'));
            } else {
              reject(new Error(err.message || 'Google Sign-In was closed.'));
            }
          }
        });

        client.requestAccessToken({ prompt: 'select_account' });
      } catch (err) {
        reject(err);
      }
    });
  }

  // 2. Try Google accounts.id (One-Tap / ID Token flow)
  if (google?.accounts?.id) {
    return new Promise((resolve, reject) => {
      try {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (!response.credential) {
              reject(new Error('No Google credential received.'));
              return;
            }
            const payload = decodeGoogleJwt(response.credential);
            if (!payload || !payload.email) {
              reject(new Error('Invalid Google credential payload.'));
              return;
            }
            resolve({
              email: payload.email,
              name: payload.name || payload.email.split('@')[0],
              picture: payload.picture || '',
              sub: payload.sub || payload.email,
              credential: response.credential
            });
          },
          auto_select: false
        });

        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            reject(new Error('Google Sign-In prompt is unavailable in this browser. Please try signing in with email.'));
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  throw new Error('Google Identity services are still loading. Please check your internet connection or try again in a few seconds.');
};

export const isGoogleAuthConfigured = (): boolean => {
  return !!getGoogleClientId();
};
