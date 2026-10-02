import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  User as FirebaseUser
} from 'firebase/auth';

// Standard Firebase Configuration (can be overridden via environment variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD-sefali-library-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "the-shefalis-space.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "the-shefalis-space",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "the-shefalis-space.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "987654321000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:987654321000:web:abcdef123456"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('openid');
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export interface FirebaseLoginResult {
  credential?: string;
  idToken?: string;
  email: string;
  name: string;
  picture?: string;
  uid: string;
}

/**
 * Initiates OpenID Connect Google Sign-In via Firebase Authentication popup.
 */
export const signInWithGoogleFirebase = async (): Promise<FirebaseLoginResult> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user: FirebaseUser = result.user;
    const idToken = await user.getIdToken();

    return {
      credential: idToken,
      idToken,
      email: user.email || '',
      name: user.displayName || user.email?.split('@')[0] || 'Studio Customer',
      picture: user.photoURL || '',
      uid: user.uid
    };
  } catch (error: any) {
    console.warn('Firebase Google OpenID Sign-In error:', error);
    throw error;
  }
};

// Helper to generate a client-side OpenID Connect compliant JWT simulation for instant testing
export const createMockGoogleOpenIdToken = (email: string, name: string, picture?: string): string => {
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT", kid: "google-openid-key" }))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  
  const payload = btoa(JSON.stringify({
    iss: "https://accounts.google.com",
    sub: "google-oauth2|" + Math.floor(Math.random() * 10000000000000000000),
    azp: "the-shefalis-space.apps.googleusercontent.com",
    aud: "the-shefalis-space.apps.googleusercontent.com",
    email,
    email_verified: true,
    name,
    picture: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F6E58D&color=1C1917&bold=true`,
    given_name: name.split(' ')[0] || name,
    family_name: name.split(' ').slice(1).join(' ') || '',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  })).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const signature = btoa("sefali-signature-verification-ok")
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  return `${header}.${payload}.${signature}`;
};

/**
 * Dual OpenID Connect Sign-In (Firebase Auth + Google GIS + OpenID Fallback)
 */
export const signInWithGoogleOpenID = async (): Promise<FirebaseLoginResult> => {
  // 1. If Google GIS OAuth2 is available with live client id
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2 && googleClientId && !googleClientId.includes('placeholder')) {
    try {
      return await new Promise((resolve, reject) => {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
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
              const profile = await res.json();
              resolve({
                email: profile.email,
                name: profile.name || profile.email.split('@')[0],
                picture: profile.picture,
                uid: profile.sub || profile.email
              });
            } catch (fetchErr) {
              reject(fetchErr);
            }
          }
        });
        client.requestAccessToken();
      });
    } catch (gisErr) {
      console.warn('Google GIS attempt fallback:', gisErr);
    }
  }

  // 2. Primary: Firebase OpenID Connect Popup if valid API key is present
  const isPlaceholderApiKey = !firebaseConfig.apiKey || firebaseConfig.apiKey.includes('sefali-library-api-key');
  if (!isPlaceholderApiKey) {
    try {
      return await signInWithGoogleFirebase();
    } catch (fbErr: any) {
      console.warn('Firebase OpenID sign-in error, falling back to Google account dialog:', fbErr);
      throw fbErr;
    }
  }

  // 3. If no live API keys are provided in .env, indicate fallback to Account Chooser
  throw new Error('OPENID_ACCOUNT_CHOOSER_REQUIRED');
};

export const logoutFirebase = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (e) {
    console.warn('Firebase signout warning:', e);
  }
};

