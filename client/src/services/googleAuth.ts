/**
 * Google Identity Services (GIS) - Modern Sign In with Google
 * Fully compliant with Google's OAuth 2.0 and FedCM policies.
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
 * Decodes a Google JWT credential payload safely in browser
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
    console.warn('Failed to decode Google JWT token:', err);
    return null;
  }
};

/**
 * Waits for Google Identity Services script (window.google.accounts.id) to be ready
 */
export const waitForGoogleGIS = (timeoutMs: number = 4000): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.accounts?.id) {
      resolve((window as any).google.accounts.id);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        clearInterval(interval);
        resolve((window as any).google.accounts.id);
      } else if (Date.now() - startTime > timeoutMs) {
        clearInterval(interval);
        reject(new Error('GOOGLE_GIS_NOT_LOADED'));
      }
    }, 100);
  });
};

/**
 * Initializes Google Identity and renders official Google button into a container element
 */
export const renderGoogleSignInButton = async (
  containerElement: HTMLElement,
  onSuccess: (profile: GoogleUserProfile) => void,
  onError?: (err: any) => void
): Promise<void> => {
  const clientId = getGoogleClientId();
  if (!clientId) {
    if (onError) onError(new Error('NO_CLIENT_ID'));
    return;
  }

  try {
    const googleAccountsId = await waitForGoogleGIS();

    googleAccountsId.initialize({
      client_id: clientId,
      callback: (response: any) => {
        if (!response.credential) {
          if (onError) onError(new Error('No Google credential returned'));
          return;
        }

        const payload = decodeGoogleJwt(response.credential);
        if (!payload || !payload.email) {
          if (onError) onError(new Error('Invalid Google credential payload'));
          return;
        }

        onSuccess({
          email: payload.email,
          name: payload.name || payload.email.split('@')[0] || 'Studio Customer',
          picture: payload.picture || '',
          sub: payload.sub || payload.email,
          credential: response.credential
        });
      },
      auto_select: false,
      cancel_on_tap_outside: true
    });

    // Clear previous renders if any
    containerElement.innerHTML = '';

    googleAccountsId.renderButton(containerElement, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: containerElement.clientWidth || 360
    });
  } catch (err) {
    console.warn('Google button render error:', err);
    if (onError) onError(err);
  }
};

/**
 * Fallback prompt if user clicks custom button
 */
export const promptGoogleOneTap = async (
  onSuccess: (profile: GoogleUserProfile) => void,
  onError?: (err: any) => void
): Promise<void> => {
  const clientId = getGoogleClientId();
  try {
    const googleAccountsId = await waitForGoogleGIS();
    googleAccountsId.initialize({
      client_id: clientId,
      callback: (response: any) => {
        const payload = decodeGoogleJwt(response.credential);
        if (payload && payload.email) {
          onSuccess({
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
            picture: payload.picture || '',
            sub: payload.sub || payload.email,
            credential: response.credential
          });
        }
      }
    });
    googleAccountsId.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        if (onError) onError(new Error('ONE_TAP_UNAVAILABLE'));
      }
    });
  } catch (err) {
    if (onError) onError(err);
  }
};

export const isGoogleAuthConfigured = (): boolean => {
  return !!getGoogleClientId();
};
