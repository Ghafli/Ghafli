import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import Deck from '../../../models/Deck';
import Flashcard from '../../../models/Flashcard';

interface ImportData {
  deck: {
    name: string;
    description: string;
  };
  flashcards: Array<{
    front: string;
    back: string;
    tags?: string[];
  }>;
  metadata?: {
    version: string;
    cardCount: number;
    exportDate: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const importData: ImportData = req.body;

    // Validate import data structure
    if (!importData.deck || !importData.flashcards || !Array.isArray(importData.flashcards)) {
      return res.status(400).json({ error: 'Invalid import data format' });
    }

    // Check if deck name already exists
    let deckName = importData.deck.name;
    let nameCounter = 1;
    
    while (await Deck.findOne({ userId: session.user.id, name: deckName })) {
      deckName = `${importData.deck.name} (${nameCounter})`;
      nameCounter++;
    }

    // Create new deck
    const deck = await Deck.create({
      userId: session.user.id,
      name: deckName,
      description: importData.deck.description,
      cardCount: importData.flashcards.length,
    });

    // Create flashcards
    const flashcardPromises = importData.flashcards.map(card => 
      Flashcard.create({
        userId: session.user.id,
        deck: deckName,
        front: card.front,
        back: card.back,
        tags: card.tags || [],
      })
    );

    await Promise.all(flashcardPromises);

    res.status(201).json({
      message: 'Deck imported successfully',
      deck: {
        id: deck._id,
        name: deckName,
        cardCount: importData.flashcards.length,
      },
    });
  } catch (error) {
    console.error('Error importing deck:', error);
    res.status(500).json({ error: 'Error importing deck' });
  }
}
