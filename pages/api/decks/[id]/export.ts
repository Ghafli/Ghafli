import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import Deck from '../../../../models/Deck';
import Flashcard from '../../../../models/Flashcard';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.query;

    // Get deck information
    const deck = await Deck.findOne({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    // Get all flashcards in the deck
    const flashcards = await Flashcard.find({
      userId: session.user.id,
      deck: deck.name,
    }).select('-userId -__v').lean();

    // Prepare export data
    const exportData = {
      deck: {
        name: deck.name,
        description: deck.description,
      },
      flashcards: flashcards.map(card => ({
        front: card.front,
        back: card.back,
        tags: card.tags,
      })),
      metadata: {
        exportDate: new Date().toISOString(),
        cardCount: flashcards.length,
        version: '1.0',
      },
    };

    res.status(200).json(exportData);
  } catch (error) {
    console.error('Error exporting deck:', error);
    res.status(500).json({ error: 'Error exporting deck' });
  }
}
