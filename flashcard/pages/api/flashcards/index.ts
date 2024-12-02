import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { dbConnect } from '../../../lib/mongodb';
import Flashcard from '../../../models/Flashcard';
import { rateLimitMiddleware } from '../middleware/rateLimit';
import { authOptions } from '../auth/[...nextauth]';

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
  try {
    // Apply rate limiting
    await rateLimitMiddleware(req, res);
    
    // Connect to database
    await dbConnect();

    // Get session using getServerSession
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      console.error('Authentication failed: No valid session');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = session.user.id;

    switch (req.method) {
      case 'GET':
        try {
          const flashcards = await Flashcard.find({ 
            userId: new mongoose.Types.ObjectId(userId)
          }).sort({ createdAt: -1 });
          
          return res.status(200).json(flashcards);
        } catch (error) {
          console.error('Error fetching flashcards:', error);
          return res.status(500).json({ 
            error: 'Error fetching flashcards',
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }

      case 'POST':
        try {
          const { front, back, deck, tags } = req.body;
          
          // Validate required fields
          if (!front || !back || !deck) {
            return res.status(400).json({ 
              error: 'Missing required fields',
              details: 'Front, back, and deck are required'
            });
          }

          // Create new flashcard
          const flashcard = await Flashcard.create({
            userId: new mongoose.Types.ObjectId(userId),
            front,
            back,
            deck,
            tags: tags || [],
            createdAt: new Date(),
            nextReview: new Date(),
            studyStats: {
              repetitions: 0,
              easeFactor: 2.5,
              interval: 0,
              timesReviewed: 0,
              correctCount: 0,
              incorrectCount: 0,
            }
          });

          return res.status(201).json(flashcard);
        } catch (error) {
          console.error('Error creating flashcard:', error);
          return res.status(500).json({ 
            error: 'Error creating flashcard',
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Rate limit exceeded') {
      // Rate limit error already handled
      return;
    }
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
