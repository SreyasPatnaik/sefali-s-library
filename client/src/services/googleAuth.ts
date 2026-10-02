/**
 * Google OAuth 2.0 Sign-In using Google Identity Services (GIS)
 */

export interface GoogleUserProfile {
  email: string;
  name: string;
  picture: string;
  sub: string; // Google's unique user ID
}

export const DEFAULT_GOOGLE_CLIENT_ID = '923229991059-7lolb3vtcoiqp0298arum249b8ie1t6q.apps.googleusercontent.com';

export const getGoogleClientId = (): string => {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;
};

const waitForGoogleGIS = (timeoutMs: number = 3500): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.accounts?.oauth2) {
      resolve((window as any).google);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      if ((window as any).google?.accounts?.oauth2) {
        clearInterval(interval);
        resolve((window as any).google);
      } else if (Date.now() - startTime > timeoutMs) {
        clearInterval(interval);
        reject(new Error('GOOGLE_GIS_NOT_LOADED'));
      }
    }, 100);
  });
};

/**
 * Opens the real Google account chooser popup and returns the user's profile.
 */
export const signInWithGoogle = async (): Promise<GoogleUserProfile> => {
  const clientId = getGoogleClientId();

  if (!clientId) {
    throw new Error('NO_CLIENT_ID');
  }

  const google = await waitForGoogleGIS();

  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      callback: async (tokenResponse: any) => {
        if (tokenResponse.error) {
          reject(new Error(tokenResponse.error_description || tokenResponse.error));
          return;
        }

        try {
          // Fetch the user's real profile from Google's UserInfo endpoint
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
          });

          if (!res.ok) {
            reject(new Error('Failed to fetch Google profile'));
            return;
          }

          const profile = await res.json();

          resolve({
            email: profile.email,
            name: profile.name || profile.email.split('@')[0],
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
          reject(new Error(err.message || 'Google sign-in failed'));
        }
      }
    });

    client.requestAccessToken({ prompt: 'select_account' });
  });
};

export const isGoogleAuthConfigured = (): boolean => {
  return !!getGoogleClientId();
};
