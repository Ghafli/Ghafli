import mongoose from 'mongoose';

const DeckSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  cardCount: {
    type: Number,
    default: 0,
  },
  lastStudied: {
    type: Date,
  },
  studyStats: {
    totalCards: {
      type: Number,
      default: 0,
    },
    cardsLearned: {
      type: Number,
      default: 0,
    },
    totalStudyTime: {
      type: Number,
      default: 0,
    },
    averageAccuracy: {
      type: Number,
      default: 0,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

DeckSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Deck || mongoose.model('Deck', DeckSchema);
