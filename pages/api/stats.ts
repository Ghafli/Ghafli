import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import Flashcard from '../../models/Flashcard';
import User from '../../models/User';

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

    // Get total cards and unique decks
    const [cards, user] = await Promise.all([
      Flashcard.find({ userId }),
      User.findById(userId),
    ]);

    const uniqueDecks = new Set(cards.map(card => card.deck)).size;

    const stats = {
      totalCards: cards.length,
      totalDecks: uniqueDecks,
      cardsStudied: user?.statistics?.cardsStudied || 0,
      studyTime: user?.statistics?.totalStudyTime || 0, // in minutes
      lastStudySession: user?.statistics?.lastStudySession,
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Error fetching statistics' });
  }
}
