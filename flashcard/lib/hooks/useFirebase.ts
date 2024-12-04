import { useState, useEffect } from 'react';
import { ref, onValue, set, push, remove, DatabaseReference } from 'firebase/database';
import { database, auth } from '../firebase';

export const useFirebaseData = <T>(path: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const dataRef = ref(database, `users/${user.uid}/${path}`);
    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        setData(snapshot.val());
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [path]);

  return { data, loading, error };
};

export const useFirebaseWrite = (path: string) => {
  const writeData = async (data: any) => {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    const dataRef = ref(database, `users/${user.uid}/${path}`);
    await set(dataRef, data);
  };

  return writeData;
};

export const useFirebasePush = (path: string) => {
  const pushData = async (data: any) => {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    const listRef = ref(database, `users/${user.uid}/${path}`);
    const newRef = push(listRef);
    await set(newRef, data);
    return newRef.key;
  };

  return pushData;
};

export const useFirebaseDelete = (path: string) => {
  const deleteData = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    const dataRef = ref(database, `users/${user.uid}/${path}`);
    await remove(dataRef);
  };

  return deleteData;
};
