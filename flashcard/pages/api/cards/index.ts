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
    switch (req.method) {
      case 'GET':
        const { deckId } = req.query;
        const deckIdString = Array.isArray(deckId) ? deckId[0] : deckId;

        const deckRef = ref(database, `users/${session.user.id}/decks/${deckIdString}`);
        let deckExists = false;

        onValue(deckRef, (snapshot) => {
          if (snapshot.exists()) {
            deckExists = true;
          }
        }, {
          onlyOnce: true
        });

        if (!deckExists) {
          return res.status(404).json({ error: 'Deck not found' });
        }

        const cardsRef = ref(database, `users/${session.user.id}/decks/${deckIdString}/cards`);
        let cards = [];

        onValue(cardsRef, (snapshot) => {
          snapshot.forEach((childSnapshot) => {
            cards.push({ id: childSnapshot.key, ...childSnapshot.val() });
          });
        }, {
          onlyOnce: true
        });

        return res.status(200).json(cards);

      case 'POST':
        const { deckId: newCardDeckId } = req.body;
        const newCardDeckIdString = Array.isArray(newCardDeckId) ? newCardDeckId[0] : newCardDeckId;

        const targetDeckRef = ref(database, `users/${session.user.id}/decks/${newCardDeckIdString}`);
        let targetDeckExists = false;

        onValue(targetDeckRef, (snapshot) => {
          if (snapshot.exists()) {
            targetDeckExists = true;
          }
        }, {
          onlyOnce: true
        });

        if (!targetDeckExists) {
          return res.status(404).json({ error: 'Deck not found' });
        }

        const newCardRef = push(ref(database, `users/${session.user.id}/decks/${newCardDeckIdString}/cards`));
        await set(newCardRef, {
          ...req.body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        return res.status(201).json({ id: newCardRef.key, ...req.body });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
