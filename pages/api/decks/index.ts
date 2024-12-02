import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import Deck from '../../../models/Deck';
import Flashcard from '../../../models/Flashcard';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const decks = await Deck.find({ userId: session.user.id })
          .sort({ updatedAt: -1 });

        // Get card counts for each deck
        const decksWithCounts = await Promise.all(decks.map(async (deck) => {
          const cardCount = await Flashcard.countDocuments({
            userId: session.user.id,
            deck: deck.name,
          });

          return {
            id: deck._id,
            name: deck.name,
            description: deck.description,
            cardCount,
            lastStudied: deck.lastStudied,
            studyStats: deck.studyStats,
          };
        }));

        res.status(200).json(decksWithCounts);
      } catch (error) {
        console.error('Error fetching decks:', error);
        res.status(500).json({ error: 'Error fetching decks' });
      }
      break;

    case 'POST':
      try {
        const { name, description } = req.body;

        // Check if deck already exists for this user
        const existingDeck = await Deck.findOne({
          userId: session.user.id,
          name,
        });

        if (existingDeck) {
          return res.status(400).json({ error: 'Deck already exists' });
        }

        const deck = await Deck.create({
          userId: session.user.id,
          name,
          description,
        });

        res.status(201).json(deck);
      } catch (error) {
        console.error('Error creating deck:', error);
        res.status(500).json({ error: 'Error creating deck' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
