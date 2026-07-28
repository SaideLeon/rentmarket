import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import rawConfigFile from '../firebase-applet-config.json';

const isPlaceholder = (val?: string) => !val || val.includes('remixed-') || val.includes('your-');

const firebaseConfig = {
  projectId: !isPlaceholder(rawConfigFile?.projectId)
    ? rawConfigFile.projectId
    : process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'quelimercado-prod',

  appId: !isPlaceholder(rawConfigFile?.appId)
    ? rawConfigFile.appId
    : process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1234567890:web:abcdef',

  apiKey: !isPlaceholder(rawConfigFile?.apiKey)
    ? rawConfigFile.apiKey
    : process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyFakeKeyForFallback',

  authDomain: !isPlaceholder(rawConfigFile?.authDomain)
    ? rawConfigFile.authDomain
    : process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'quelimercado-prod.firebaseapp.com',

  storageBucket: !isPlaceholder(rawConfigFile?.storageBucket)
    ? rawConfigFile.storageBucket
    : process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'quelimercado-prod.appspot.com',

  messagingSenderId: !isPlaceholder(rawConfigFile?.messagingSenderId)
    ? rawConfigFile.messagingSenderId
    : process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1234567890'
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
provider.addScope('https://www.googleapis.com/auth/gmail.compose');
provider.addScope('https://mail.google.com/');

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Não foi possível obter o token de acesso da Conta Google.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Erro de Autenticação Google:', error);
    
    // Map known Firebase auth error codes to user-friendly messages
    if (error?.code === 'auth/configuration-not-found' || error?.message?.includes('configuration-not-found')) {
      const err = new Error(
        'A autenticação Google não está ativada no Firebase Console para o projeto mussika-fc4fb. ' +
        'Por favor, vá a Consola Firebase > Authentication > Sign-in method e ative o fornecedor Google.'
      );
      (err as any).code = 'auth/configuration-not-found';
      throw err;
    }
    if (error?.code === 'auth/popup-closed-by-user') {
      const err = new Error('Janela de autenticação fechada pelo utilizador.');
      (err as any).code = 'auth/popup-closed-by-user';
      throw err;
    }
    if (error?.code === 'auth/cancelled-popup-request') {
      const err = new Error('Solicitação de autenticação cancelada.');
      (err as any).code = 'auth/cancelled-popup-request';
      throw err;
    }
    if (error?.code === 'auth/operation-not-allowed') {
      const err = new Error('Login com Google não permitido no Firebase. Ative-o em Authentication > Sign-in method.');
      (err as any).code = 'auth/operation-not-allowed';
      throw err;
    }
    if (error?.code === 'auth/unauthorized-domain') {
      const err = new Error('Este domínio não está autorizado no Firebase Auth. Adicione o domínio às definições do Firebase.');
      (err as any).code = 'auth/unauthorized-domain';
      throw err;
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const mockGoogleSignIn = (
  email = 'usuario.demo@gmail.com',
  displayName = 'Utilizador Demo Google'
): { user: User; accessToken: string } => {
  const mockUser = {
    uid: 'google_demo_usr_' + Date.now(),
    email,
    displayName,
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    emailVerified: true,
  } as unknown as User;

  const mockToken = 'mock_google_access_token_' + Date.now();
  cachedAccessToken = mockToken;
  return { user: mockUser, accessToken: mockToken };
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
