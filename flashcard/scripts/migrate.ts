import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { config } from '../lib/firebase.config';
import { migrateAchievements, rollbackAchievements } from '../lib/migrations/01_add_achievement_fields_firebase';

// Initialize Firebase
const app = initializeApp(config);
const database = getDatabase(app);

async function runMigration() {
  const action = process.argv[2];
  
  try {
    if (action === 'up') {
      console.log('Running achievement migration...');
      await migrateAchievements();
      console.log('Migration completed successfully');
    } else if (action === 'down') {
      console.log('Rolling back achievement migration...');
      await rollbackAchievements();
      console.log('Rollback completed successfully');
    } else {
      console.error('Please specify either "up" or "down" as an argument');
      process.exit(1);
    }
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
