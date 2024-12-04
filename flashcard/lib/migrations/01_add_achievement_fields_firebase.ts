import { ref, get, update } from 'firebase/database';
import { database } from '../firebase';
import { Achievement } from '../db/types';

const defaultAchievements: Achievement[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Study your first 10 cards',
    type: 'study_count',
    currentValue: 0,
    requirement: 10
  },
  {
    id: 'dedicated_learner',
    name: 'Dedicated Learner',
    description: 'Maintain a 7-day study streak',
    type: 'streak',
    currentValue: 0,
    requirement: 7
  },
  {
    id: 'master_mind',
    name: 'Master Mind',
    description: 'Master 50 cards',
    type: 'mastery',
    currentValue: 0,
    requirement: 50
  },
  {
    id: 'speed_learner',
    name: 'Speed Learner',
    description: 'Complete a study session with 100% accuracy in under 2 minutes',
    type: 'special',
    currentValue: 0,
    requirement: 1
  }
];

export async function migrateAchievements() {
  try {
    // Get all users
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      console.log('No users found');
      return;
    }

    const users = snapshot.val();
    const updates: { [path: string]: any } = {};

    // For each user
    for (const [userId, userData] of Object.entries(users)) {
      // Skip if user already has achievements
      if (userData.achievements) {
        continue;
      }

      // Initialize achievements for this user
      const userAchievements = defaultAchievements.reduce((acc, achievement) => {
        acc[achievement.id] = achievement;
        return acc;
      }, {} as { [key: string]: Achievement });

      updates[`users/${userId}/achievements`] = userAchievements;
    }

    // Apply all updates in a single transaction
    if (Object.keys(updates).length > 0) {
      await update(ref(database), updates);
      console.log(`Successfully migrated achievements for ${Object.keys(updates).length} users`);
    } else {
      console.log('No users needed migration');
    }
  } catch (error) {
    console.error('Error during achievement migration:', error);
    throw error;
  }
}

export async function rollbackAchievements() {
  try {
    // Get all users
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      console.log('No users found');
      return;
    }

    const users = snapshot.val();
    const updates: { [path: string]: null } = {};

    // For each user
    for (const [userId, userData] of Object.entries(users)) {
      // Skip if user doesn't have achievements
      if (!userData.achievements) {
        continue;
      }

      // Remove achievements
      updates[`users/${userId}/achievements`] = null;
    }

    // Apply all updates in a single transaction
    if (Object.keys(updates).length > 0) {
      await update(ref(database), updates);
      console.log(`Successfully rolled back achievements for ${Object.keys(updates).length} users`);
    } else {
      console.log('No users needed rollback');
    }
  } catch (error) {
    console.error('Error during achievement rollback:', error);
    throw error;
  }
}
