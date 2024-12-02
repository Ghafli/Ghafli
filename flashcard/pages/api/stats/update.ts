import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import User from '../../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { cardsStudied, timeSpent, correctCount, incorrectCount } = req.body;

    // Update user statistics
    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        $inc: {
          'statistics.cardsStudied': cardsStudied,
          'statistics.totalStudyTime': timeSpent,
        },
        $set: {
          'statistics.lastStudySession': new Date(),
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'Statistics updated successfully',
      statistics: user.statistics,
    });
  } catch (error) {
    console.error('Error updating statistics:', error);
    res.status(500).json({ error: 'Error updating statistics' });
  }
}
