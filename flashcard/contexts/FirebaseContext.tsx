import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useSession } from 'next-auth/react';

interface FirebaseContextType {
  firebaseUser: User | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  firebaseUser: null,
  loading: true,
});

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Sync Firebase user with NextAuth session
  useEffect(() => {
    if (session?.user && !firebaseUser) {
      // If we have a session but no Firebase user, sign in to Firebase
      // This would typically involve creating a custom token on the server
      // and signing in with it here
      console.log('Session exists but no Firebase user');
    }
  }, [session, firebaseUser]);

  return (
    <FirebaseContext.Provider value={{ firebaseUser, loading }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export default FirebaseContext;
