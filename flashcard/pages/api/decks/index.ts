import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { ref, onValue, push, set } from 'firebase/database';
import { database } from '@/lib/firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decksRef = ref(database, `users/${session.user.id}/decks`);

    switch (req.method) {
      case 'GET':
        let decks = [];

        onValue(decksRef, (snapshot) => {
          snapshot.forEach((childSnapshot) => {
            decks.push({ id: childSnapshot.key, ...childSnapshot.val() });
          });
        }, {
          onlyOnce: true
        });

        return res.status(200).json(decks);

      case 'POST':
        const newDeckRef = push(decksRef);
        const newDeckData = {
          ...req.body,
          userId: session.user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await set(newDeckRef, newDeckData);
        return res.status(201).json({ id: newDeckRef.key, ...newDeckData });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
