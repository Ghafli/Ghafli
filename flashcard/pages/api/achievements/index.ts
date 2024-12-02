import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import Achievement from '../../../models/Achievement';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const achievements = await Achievement.find({ userId: session.user.id })
          .sort({ type: 1, level: 1 });
        
        res.status(200).json(achievements);
      } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({ error: 'Error fetching achievements' });
      }
      break;

    case 'GET /recent':
      try {
        const recentAchievements = await Achievement.find({
          userId: session.user.id,
          completed: true,
          completedAt: {
            $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }).sort({ completedAt: -1 });

        res.status(200).json(recentAchievements);
      } catch (error) {
        console.error('Error fetching recent achievements:', error);
        res.status(500).json({ error: 'Error fetching recent achievements' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
