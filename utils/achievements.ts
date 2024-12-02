import Achievement, { ACHIEVEMENTS } from '../models/Achievement';
import StudySession from '../models/StudySession';
import User from '../models/User';
import Deck from '../models/Deck';
import Flashcard from '../models/Flashcard';

interface CheckAchievementParams {
  type: 'STUDY_SESSION' | 'CARDS_CREATED' | 'DECK_MASTERED';
  session?: any;
  deckId?: string;
}

export async function checkAchievements(userId: string, params: CheckAchievementParams) {
  try {
    switch (params.type) {
      case 'STUDY_SESSION':
        await checkStudyAchievements(userId, params.session);
        break;
      case 'CARDS_CREATED':
        await checkCardCreationAchievements(userId);
        break;
      case 'DECK_MASTERED':
        await checkMasteryAchievements(userId);
        break;
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}

async function checkStudyAchievements(userId: string, session: any) {
  // Check study streak
  const user = await User.findById(userId);
  const streak = calculateStreak(user.lastStudyDates || []);
  await updateAchievementProgress(userId, 'STUDY_STREAK', streak);

  // Check perfect score
  if (session.stats.accuracy === 100 && session.stats.cardsStudied >= 10) {
    const perfectScores = await StudySession.countDocuments({
      userId,
      'stats.accuracy': 100,
      'stats.cardsStudied': { $gte: 10 },
    });
    await updateAchievementProgress(userId, 'PERFECT_SCORE', perfectScores);
  }

  // Update total cards studied
  const totalCardsStudied = await StudySession.aggregate([
    { $match: { userId } },
    { $group: { _id: null, total: { $sum: '$stats.cardsStudied' } } },
  ]);
  await updateAchievementProgress(userId, 'CARDS_STUDIED', totalCardsStudied[0]?.total || 0);
}

async function checkCardCreationAchievements(userId: string) {
  const cardCount = await Flashcard.countDocuments({ userId });
  await updateAchievementProgress(userId, 'CARDS_CREATED', cardCount);
}

async function checkMasteryAchievements(userId: string) {
  const masteredDecks = await Deck.countDocuments({
    userId,
    'studyStats.mastered': true,
  });
  await updateAchievementProgress(userId, 'MASTERY_LEVEL', masteredDecks);
}

async function updateAchievementProgress(userId: string, type: string, currentValue: number) {
  const achievements = ACHIEVEMENTS[type];
  if (!achievements) return;

  for (const achievementDef of achievements) {
    let achievement = await Achievement.findOne({
      userId,
      type,
      level: achievementDef.level,
    });

    if (!achievement) {
      achievement = new Achievement({
        userId,
        type,
        level: achievementDef.level,
        name: achievementDef.name,
        description: achievementDef.description,
        progress: {
          current: currentValue,
          target: achievementDef.target,
        },
        icon: achievementDef.icon,
        reward: achievementDef.reward,
      });
    } else {
      achievement.progress.current = currentValue;
    }

    if (achievement.progress.current >= achievement.progress.target && !achievement.completed) {
      achievement.completed = true;
      achievement.completedAt = new Date();
      
      // Grant reward
      await grantAchievementReward(userId, achievement);
    }

    await achievement.save();
  }
}

async function calculateStreak(dates: Date[]): Promise<number> {
  if (!dates.length) return 0;

  const sortedDates = dates
    .map(d => new Date(d).toISOString().split('T')[0])
    .sort()
    .reverse();

  let streak = 1;
  const today = new Date().toISOString().split('T')[0];
  let lastDate = sortedDates[0];

  if (lastDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (lastDate !== yesterday) return 0;
  }

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);
    const expectedDate = new Date(lastDate);
    expectedDate.setDate(expectedDate.getDate() - 1);

    if (currentDate.toISOString().split('T')[0] !== expectedDate.toISOString().split('T')[0]) {
      break;
    }

    streak++;
    lastDate = sortedDates[i];
  }

  return streak;
}

async function grantAchievementReward(userId: string, achievement: any) {
  const user = await User.findById(userId);

  switch (achievement.reward.type) {
    case 'XP':
      user.xp = (user.xp || 0) + achievement.reward.value;
      break;
    case 'BADGE':
      user.badges = [...(user.badges || []), achievement.reward.value];
      break;
    case 'THEME':
      user.availableThemes = [...(user.availableThemes || []), achievement.reward.value];
      break;
  }

  await user.save();
}
