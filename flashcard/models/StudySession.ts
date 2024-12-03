import mongoose from 'mongoose';

const StudySessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deckId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: true,
  },
  mode: {
    type: String,
    enum: ['learn', 'quiz', 'review'],
    required: true,
  },
  stats: {
    cardsStudied: {
      type: Number,
      required: true,
    },
    correctCount: {
      type: Number,
      required: true,
    },
    incorrectCount: {
      type: Number,
      required: true,
    },
    accuracy: {
      type: Number,
      required: true,
    },
    timeSpent: {
      type: Number, // in seconds
      required: true,
    },
    averageTimePerCard: {
      type: Number, // in seconds
      required: true,
    },
  },
  cards: [{
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flashcard',
    },
    correct: Boolean,
    timeSpent: Number, // in seconds
    confidence: Number, // 1-5 rating
  }],
  startedAt: {
    type: Date,
    required: true,
  },
  completedAt: {
    type: Date,
    required: true,
  },
});

// Calculate session statistics before saving
StudySessionSchema.pre('save', function(next) {
  const session = this;
  
  // Calculate accuracy
  session.stats.accuracy = (session.stats.correctCount / session.stats.cardsStudied) * 100;
  
  // Calculate average time per card
  session.stats.averageTimePerCard = session.stats.timeSpent / session.stats.cardsStudied;
  
  next();
});

export default mongoose.models.StudySession || mongoose.model('StudySession', StudySessionSchema);
