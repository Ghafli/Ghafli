import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import Flashcard from '../../../models/Flashcard';
import { calculateNextReview, getNextReviewDate } from '../../../utils/spacedRepetition';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { flashcardId, correct, quality } = req.body;

    const flashcard = await Flashcard.findOne({
      _id: flashcardId,
      userId: session.user.id,
    });

    if (!flashcard) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    // Calculate next review information
    const currentInfo = {
      repetitions: flashcard.studyStats?.repetitions || 0,
      easeFactor: flashcard.studyStats?.easeFactor || 2.5,
      interval: flashcard.studyStats?.interval || 0,
    };

    const newInfo = calculateNextReview(correct, quality, currentInfo);
    const nextReviewDate = getNextReviewDate(newInfo);

    // Update flashcard with new review information
    const updatedFlashcard = await Flashcard.findByIdAndUpdate(
      flashcardId,
      {
        $set: {
          'studyStats.repetitions': newInfo.repetitions,
          'studyStats.easeFactor': newInfo.easeFactor,
          'studyStats.interval': newInfo.interval,
          nextReview: nextReviewDate,
          lastReviewed: new Date(),
        },
        $inc: {
          'studyStats.timesReviewed': 1,
          'studyStats.correctCount': correct ? 1 : 0,
          'studyStats.incorrectCount': correct ? 0 : 1,
        },
      },
      { new: true }
    );

    res.status(200).json(updatedFlashcard);
  } catch (error) {
    console.error('Error updating review information:', error);
    res.status(500).json({ error: 'Error updating review information' });
  }
}
