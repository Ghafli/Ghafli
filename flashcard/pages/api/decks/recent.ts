import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// Extend the default session type
interface ExtendedSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req }) as ExtendedSession | null;
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const client = await clientPromise;
    if (!client) {
      throw new Error('Failed to connect to MongoDB');
    }

    const db = client.db();
    if (!db) {
      throw new Error('Failed to get database instance');
    }

    const userId = session.user.id;

    // Get recent decks with card count
    const recentDecks = await db.collection('decks')
      .aggregate([
        { $match: { userId: new ObjectId(userId) } },
        {
          $lookup: {
            from: 'flashcards',
            localField: '_id',
            foreignField: 'deckId',
            as: 'cards'
          }
        },
        {
          $lookup: {
            from: 'studyHistory',
            let: { deckId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$deckId', '$$deckId'] },
                      { $eq: ['$userId', new ObjectId(userId)] }
                    ]
                  }
                }
              },
              { $sort: { studiedAt: -1 } },
              { $limit: 1 }
            ],
            as: 'lastStudySession'
          }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            cardCount: { $size: '$cards' },
            lastStudied: { $arrayElemAt: ['$lastStudySession.studiedAt', 0] },
            createdAt: 1
          }
        },
        { $sort: { lastStudied: -1, createdAt: -1 } },
        { $limit: 5 }
      ]).toArray();

    res.status(200).json(recentDecks);
  } catch (error) {
    console.error('Error in /api/decks/recent:', error);
    res.status(500).json({ 
      message: 'Error fetching recent decks',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
