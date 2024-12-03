import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import Flashcard from '../../../models/Flashcard';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        const flashcard = await Flashcard.findOne({
          _id: id,
          userId: session.user.id,
        });
        
        if (!flashcard) {
          return res.status(404).json({ error: 'Flashcard not found' });
        }
        
        res.status(200).json(flashcard);
      } catch (error) {
        res.status(500).json({ error: 'Error fetching flashcard' });
      }
      break;

    case 'PUT':
      try {
        const flashcard = await Flashcard.findOneAndUpdate(
          { _id: id, userId: session.user.id },
          req.body,
          { new: true }
        );
        
        if (!flashcard) {
          return res.status(404).json({ error: 'Flashcard not found' });
        }
        
        res.status(200).json(flashcard);
      } catch (error) {
        res.status(500).json({ error: 'Error updating flashcard' });
      }
      break;

    case 'DELETE':
      try {
        const flashcard = await Flashcard.findOneAndDelete({
          _id: id,
          userId: session.user.id,
        });
        
        if (!flashcard) {
          return res.status(404).json({ error: 'Flashcard not found' });
        }
        
        res.status(204).end();
      } catch (error) {
        res.status(500).json({ error: 'Error deleting flashcard' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
