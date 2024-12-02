import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import Deck from '../../../models/Deck';
import Flashcard from '../../../models/Flashcard';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        const deck = await Deck.findOne({
          _id: id,
          userId: session.user.id,
        });

        if (!deck) {
          return res.status(404).json({ error: 'Deck not found' });
        }

        const cards = await Flashcard.find({
          userId: session.user.id,
          deck: deck.name,
        });

        res.status(200).json({ deck, cards });
      } catch (error) {
        console.error('Error fetching deck:', error);
        res.status(500).json({ error: 'Error fetching deck' });
      }
      break;

    case 'PUT':
      try {
        const { name, description } = req.body;

        // Check if new name conflicts with existing deck
        if (name) {
          const existingDeck = await Deck.findOne({
            userId: session.user.id,
            name,
            _id: { $ne: id },
          });

          if (existingDeck) {
            return res.status(400).json({ error: 'Deck name already exists' });
          }
        }

        const deck = await Deck.findOneAndUpdate(
          { _id: id, userId: session.user.id },
          { name, description },
          { new: true }
        );

        if (!deck) {
          return res.status(404).json({ error: 'Deck not found' });
        }

        // Update deck name in flashcards if name changed
        if (name) {
          await Flashcard.updateMany(
            { userId: session.user.id, deck: deck.name },
            { deck: name }
          );
        }

        res.status(200).json(deck);
      } catch (error) {
        console.error('Error updating deck:', error);
        res.status(500).json({ error: 'Error updating deck' });
      }
      break;

    case 'DELETE':
      try {
        const deck = await Deck.findOneAndDelete({
          _id: id,
          userId: session.user.id,
        });

        if (!deck) {
          return res.status(404).json({ error: 'Deck not found' });
        }

        // Delete all flashcards in the deck
        await Flashcard.deleteMany({
          userId: session.user.id,
          deck: deck.name,
        });

        res.status(200).json({ message: 'Deck deleted successfully' });
      } catch (error) {
        console.error('Error deleting deck:', error);
        res.status(500).json({ error: 'Error deleting deck' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
