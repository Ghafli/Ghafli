import mongoose from 'mongoose';

const AchievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'CARDS_CREATED',
      'CARDS_STUDIED',
      'STUDY_STREAK',
      'PERFECT_SCORE',
      'TIME_SPENT',
      'DECKS_CREATED',
      'MASTERY_LEVEL',
    ],
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  progress: {
    current: {
      type: Number,
      required: true,
    },
    target: {
      type: Number,
      required: true,
    },
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  icon: {
    type: String,
    required: true,
  },
  reward: {
    type: {
      type: String,
      enum: ['XP', 'BADGE', 'THEME'],
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Update achievement status when progress changes
AchievementSchema.pre('save', function(next) {
  if (this.progress.current >= this.progress.target && !this.completed) {
    this.completed = true;
    this.completedAt = new Date();
  }
  next();
});

export default mongoose.models.Achievement || mongoose.model('Achievement', AchievementSchema);

// Achievement definitions
export const ACHIEVEMENTS = {
  CARDS_CREATED: [
    {
      level: 1,
      name: 'Card Creator',
      description: 'Create your first 10 flashcards',
      target: 10,
      icon: '📝',
      reward: { type: 'XP', value: 100 },
    },
    {
      level: 2,
      name: 'Deck Builder',
      description: 'Create 50 flashcards',
      target: 50,
      icon: '🎴',
      reward: { type: 'XP', value: 250 },
    },
    {
      level: 3,
      name: 'Card Master',
      description: 'Create 100 flashcards',
      target: 100,
      icon: '👑',
      reward: { type: 'BADGE', value: 'card_master' },
    },
  ],
  STUDY_STREAK: [
    {
      level: 1,
      name: 'Getting Started',
      description: 'Study for 3 days in a row',
      target: 3,
      icon: '🌱',
      reward: { type: 'XP', value: 150 },
    },
    {
      level: 2,
      name: 'Consistent Learner',
      description: 'Study for 7 days in a row',
      target: 7,
      icon: '📚',
      reward: { type: 'XP', value: 300 },
    },
    {
      level: 3,
      name: 'Study Champion',
      description: 'Study for 30 days in a row',
      target: 30,
      icon: '🏆',
      reward: { type: 'BADGE', value: 'study_champion' },
    },
  ],
  PERFECT_SCORE: [
    {
      level: 1,
      name: 'Perfect Quiz',
      description: 'Get 100% on a quiz with at least 10 cards',
      target: 1,
      icon: '⭐',
      reward: { type: 'XP', value: 200 },
    },
    {
      level: 2,
      name: 'Quiz Master',
      description: 'Get 5 perfect scores',
      target: 5,
      icon: '🌟',
      reward: { type: 'THEME', value: 'golden_theme' },
    },
  ],
  MASTERY_LEVEL: [
    {
      level: 1,
      name: 'Knowledge Seeker',
      description: 'Master your first deck',
      target: 1,
      icon: '🎓',
      reward: { type: 'XP', value: 500 },
    },
    {
      level: 2,
      name: 'Subject Expert',
      description: 'Master 3 decks',
      target: 3,
      icon: '🎯',
      reward: { type: 'BADGE', value: 'expert' },
    },
  ],
};
