import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import Flashcard from '../../../models/Flashcard';
import { getDueCards, calculateReviewPriority } from '../../../utils/spacedRepetition';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { deck } = req.query;
    const query: any = { userId: session.user.id };
    
    if (deck) {
      query.deck = deck;
    }

    // Get all cards for the user
    const cards = await Flashcard.find(query).lean();
    
    // Filter due cards and sort by priority
    const dueCards = getDueCards(cards)
      .sort((a, b) => calculateReviewPriority(b) - calculateReviewPriority(a))
      .slice(0, 50); // Limit to 50 cards per review session

    res.status(200).json(dueCards);
  } catch (error) {
    console.error('Error fetching due cards:', error);
    res.status(500).json({ error: 'Error fetching due cards' });
  }
}
