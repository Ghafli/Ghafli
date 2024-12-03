import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import StudySession from '../../../models/StudySession';
import { checkAchievements } from '../../../utils/achievements';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const { limit = 10, page = 1, deckId } = req.query;
        const query = {
          userId: session.user.id,
          ...(deckId && { deckId }),
        };

        const total = await StudySession.countDocuments(query);
        const sessions = await StudySession.find(query)
          .sort({ completedAt: -1 })
          .skip((Number(page) - 1) * Number(limit))
          .limit(Number(limit))
          .populate('deckId', 'name');

        res.status(200).json({
          sessions,
          pagination: {
            total,
            pages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
          },
        });
      } catch (error) {
        console.error('Error fetching study sessions:', error);
        res.status(500).json({ error: 'Error fetching study sessions' });
      }
      break;

    case 'POST':
      try {
        const {
          deckId,
          mode,
          stats,
          cards,
          startedAt,
          completedAt,
        } = req.body;

        const studySession = await StudySession.create({
          userId: session.user.id,
          deckId,
          mode,
          stats,
          cards,
          startedAt,
          completedAt,
        });

        // Check and update achievements
        await checkAchievements(session.user.id, {
          type: 'STUDY_SESSION',
          session: studySession,
        });

        res.status(201).json(studySession);
      } catch (error) {
        console.error('Error creating study session:', error);
        res.status(500).json({ error: 'Error creating study session' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
