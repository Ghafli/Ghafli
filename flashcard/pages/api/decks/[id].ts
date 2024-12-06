import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { ref, onValue, update, remove } from 'firebase/database';
import { database } from '@/lib/firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  try {
    const deckRef = ref(database, `users/${session.user.id}/decks/${id}`);

    switch (req.method) {
      case 'GET':
        let deck = null;

        onValue(deckRef, (snapshot) => {
          if (snapshot.exists()) {
            deck = { id: snapshot.key, ...snapshot.val() };
          }
        }, {
          onlyOnce: true
        });

        if (!deck) {
          return res.status(404).json({ error: 'Deck not found' });
        }

        return res.status(200).json(deck);

      case 'PUT':
        await update(deckRef, { ...req.body, updatedAt: new Date().toISOString() });
        return res.status(200).json({ id, ...req.body });

      case 'DELETE':
        await remove(deckRef);
        return res.status(200).json({ message: 'Deck deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
