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
 * Initiates real OpenID Connect Google Sign-In via Firebase Authentication popup.
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
    // If popup was blocked or canceled, re-throw with informative error
    console.error('Firebase Google OpenID Sign-In error:', error);
    throw error;
  }
};

export const logoutFirebase = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (e) {
    console.warn('Firebase signout warning:', e);
  }
};
