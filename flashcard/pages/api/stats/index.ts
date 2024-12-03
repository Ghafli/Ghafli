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

    // Get user's stats
    const userId = session.user.id;

    // Get total cards count
    const totalCards = await db.collection('flashcards')
      .countDocuments({ userId: new ObjectId(userId) });

    // Get total decks count
    const totalDecks = await db.collection('decks')
      .countDocuments({ userId: new ObjectId(userId) });

    // Get study stats from user's study history
    const studyStats = await db.collection('studyHistory')
      .aggregate([
        { $match: { userId: new ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalStudyTime: { $sum: '$duration' },
            cardsStudied: { $sum: '$cardsReviewed' },
            totalCorrect: { $sum: '$correctAnswers' },
            totalAnswered: { $sum: '$totalAnswers' }
          }
        }
      ]).toArray();

    // Get study streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const studyDates = await db.collection('studyHistory')
      .find({ 
        userId: new ObjectId(userId),
        createdAt: { $lte: today }
      })
      .sort({ createdAt: -1 })
      .toArray();

    let studyStreak = 0;
    let currentDate = today;

    for (const session of studyDates) {
      const sessionDate = new Date(session.createdAt);
      sessionDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        studyStreak++;
        currentDate = sessionDate;
      } else {
        break;
      }
    }

    // Get recent activity
    const recentActivity = await db.collection('studyHistory')
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    const activity = recentActivity.map(session => ({
      date: session.createdAt,
      action: 'Study Session',
      details: `Studied ${session.cardsReviewed} cards with ${session.correctAnswers} correct answers`
    }));

    // Get weekly progress
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyProgress = await db.collection('studyHistory')
      .aggregate([
        {
          $match: {
            userId: new ObjectId(userId),
            createdAt: { $gte: weekAgo }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            cardsStudied: { $sum: "$cardsReviewed" }
          }
        },
        { $sort: { "_id": 1 } }
      ]).toArray();

    const stats = studyStats[0] || { totalStudyTime: 0, cardsStudied: 0, totalCorrect: 0, totalAnswered: 0 };
    const averageAccuracy = stats.totalAnswered > 0 
      ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) 
      : 0;

    res.status(200).json({
      totalCards,
      totalDecks,
      totalStudyTime: stats.totalStudyTime || 0,
      cardsStudied: stats.cardsStudied || 0,
      averageAccuracy,
      studyStreak,
      recentActivity: activity,
      weeklyProgress: weeklyProgress.map(wp => ({
        day: wp._id,
        cardsStudied: wp.cardsStudied
      }))
    });
  } catch (error) {
    console.error('Error in /api/stats:', error);
    res.status(500).json({ 
      message: 'Error fetching stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
