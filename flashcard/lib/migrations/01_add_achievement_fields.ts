import { Db } from 'mongodb';

export async function up(db: Db) {
  await db.collection('users').updateMany(
    {},
    {
      $set: {
        achievements: [],
        totalCardsStudied: 0,
        studyStreak: 0,
        lastStudyDate: null,
        level: 1,
        experience: 0
      }
    }
  );

  await db.createCollection('achievements', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'description', 'type', 'requirement'],
        properties: {
          name: { bsonType: 'string' },
          description: { bsonType: 'string' },
          type: { enum: ['study_count', 'streak', 'mastery', 'special'] },
          requirement: { bsonType: 'int' },
          icon: { bsonType: 'string' }
        }
      }
    }
  });

  // Insert default achievements
  await db.collection('achievements').insertMany([
    {
      name: 'First Steps',
      description: 'Study your first 10 cards',
      type: 'study_count',
      requirement: 10,
      icon: 'school'
    },
    {
      name: 'Dedicated Learner',
      description: 'Maintain a 7-day study streak',
      type: 'streak',
      requirement: 7,
      icon: 'trending_up'
    },
    {
      name: 'Master Mind',
      description: 'Achieve 100% accuracy in a deck',
      type: 'mastery',
      requirement: 100,
      icon: 'stars'
    }
  ]);
}

export async function down(db: Db) {
  await db.collection('users').updateMany(
    {},
    {
      $unset: {
        achievements: '',
        totalCardsStudied: '',
        studyStreak: '',
        lastStudyDate: '',
        level: '',
        experience: ''
      }
    }
  );

  await db.collection('achievements').drop();
}
