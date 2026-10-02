/**
 * Google OAuth 2.0 Sign-In using Google Identity Services (GIS)
 *
 * Setup (one-time):
 *  1. Go to https://console.cloud.google.com → APIs & Services → Credentials
 *  2. Create OAuth 2.0 Client ID → Web application
 *  3. Add Authorized JS origin: http://localhost:5173 (and your production URL)
 *  4. Copy the Client ID and add to client/.env:
 *       VITE_GOOGLE_CLIENT_ID=XXXXXXXXXX.apps.googleusercontent.com
 *  5. Restart dev server — Google Sign-In will work automatically.
 */

export interface GoogleUserProfile {
  email: string;
  name: string;
  picture: string;
  sub: string; // Google's unique user ID
}

/**
 * Opens the real Google account chooser popup and returns the user's profile.
 * Requires VITE_GOOGLE_CLIENT_ID to be set in .env
 */
export const signInWithGoogle = (): Promise<GoogleUserProfile> => {
  return new Promise((resolve, reject) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      reject(new Error('NO_CLIENT_ID'));
      return;
    }

    const google = (window as any).google;
    if (!google?.accounts?.oauth2) {
      reject(new Error('GOOGLE_GIS_NOT_LOADED'));
      return;
    }

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
  return !!import.meta.env.VITE_GOOGLE_CLIENT_ID;
};
