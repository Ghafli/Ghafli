import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { auth } from '../lib/firebase';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithProvider: (provider: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sync NextAuth session with Firebase
  useEffect(() => {
    const syncAuth = async () => {
      if (session?.user && !user) {
        try {
          // This endpoint should be implemented in your API routes
          const response = await fetch('/api/auth/firebase-token');
          const { token } = await response.json();
          await signInWithCustomToken(auth, token);
        } catch (error) {
          console.error('Error syncing auth:', error);
        }
      }
    };

    if (status !== 'loading') {
      syncAuth();
    }
  }, [session, user, status]);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithProvider = async (provider: string) => {
    await nextAuthSignIn(provider);
  };

  const logout = async () => {
    await Promise.all([
      signOut(auth),
      nextAuthSignOut()
    ]);
  };

  const value = {
    user,
    loading: loading || status === 'loading',
    signIn,
    signUp,
    signInWithProvider,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
