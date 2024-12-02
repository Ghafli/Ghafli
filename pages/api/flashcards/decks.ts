import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import Flashcard from '../../../models/Flashcard';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = session.user.id;

    // Get all flashcards for the user
    const flashcards = await Flashcard.find({ userId });

    // Group flashcards by deck and count cards
    const decks = flashcards.reduce((acc, card) => {
      if (!acc[card.deck]) {
        acc[card.deck] = {
          name: card.deck,
          cardCount: 0,
          lastStudied: null
        };
      }
      acc[card.deck].cardCount++;
      
      // Update last studied date if it exists and is more recent
      if (card.lastReviewed && (!acc[card.deck].lastStudied || 
          new Date(card.lastReviewed) > new Date(acc[card.deck].lastStudied))) {
        acc[card.deck].lastStudied = card.lastReviewed;
      }
      
      return acc;
    }, {});

    // Convert to array and sort by deck name
    const decksArray = Object.values(decks).sort((a, b) => 
      a.name.localeCompare(b.name)
    );

    res.status(200).json(decksArray);
  } catch (error) {
    console.error('Error fetching decks:', error);
    res.status(500).json({ error: 'Error fetching decks' });
  }
}
