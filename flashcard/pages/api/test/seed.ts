import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not available in production' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const client = await clientPromise;
    const db = client.db();

    // Create test user if not exists
    const userId = new ObjectId(session.user.id);

    // Sample flashcards data
    const testDecks = [
      {
        name: 'JavaScript Basics',
        cards: [
          { front: 'What is a closure?', back: 'A function that has access to variables in its outer scope' },
          { front: 'What is hoisting?', back: 'Variable and function declarations are moved to the top of their scope' },
          { front: 'What is the event loop?', back: 'Mechanism that handles asynchronous callbacks in JavaScript' },
        ]
      },
      {
        name: 'React Fundamentals',
        cards: [
          { front: 'What is JSX?', back: 'A syntax extension for JavaScript that allows you to write HTML-like code' },
          { front: 'What is a React Hook?', back: 'Functions that allow you to use state and lifecycle features in functional components' },
          { front: 'What is the virtual DOM?', back: 'A lightweight copy of the actual DOM that React uses for performance optimization' },
        ]
      }
    ];

    // Insert flashcards
    const flashcards = testDecks.flatMap(deck => 
      deck.cards.map(card => ({
        userId,
        front: card.front,
        back: card.back,
        deck: deck.name,
        tags: [deck.name.toLowerCase()],
        studyStats: {
          repetitions: 0,
          easeFactor: 2.5,
          interval: 0,
          timesReviewed: 0,
          correctCount: 0,
          incorrectCount: 0,
        },
        nextReview: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    await db.collection('flashcards').insertMany(flashcards);

    res.status(200).json({ message: 'Test data seeded successfully' });
  } catch (error) {
    console.error('Error seeding test data:', error);
    res.status(500).json({ error: 'Error seeding test data' });
  }
}
