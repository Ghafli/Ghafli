import mongoose from 'mongoose';

export interface IDeck {
  userId: string;
  title: string;
  description?: string;
  isPublic: boolean;
  tags: string[];
  cardCount: number;
  lastStudied?: Date;
  createdAt: Date;
  updatedAt: Date;
  cards?: string[];
  reviewCount?: number;
  correctCount?: number;
  incorrectCount?: number;
  reviewSessions?: number;
  cardsStudied?: number;
  cardsMastered?: number;
  studyStreak?: number;
  perfectReviews?: number;
  cardsStudiedToday?: number;
}

const DeckSchema = new mongoose.Schema<IDeck>(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [{
      type: String,
    }],
    cardCount: {
      type: Number,
      default: 0,
    },
    lastStudied: {
      type: Date,
    },
    cards: [{
      type: String,
    }],
    reviewCount: {
      type: Number,
      default: 0,
    },
    correctCount: {
      type: Number,
      default: 0,
    },
    incorrectCount: {
      type: Number,
      default: 0,
    },
    reviewSessions: {
      type: Number,
    },
    cardsStudied: {
      type: Number,
    },
    cardsMastered: {
      type: Number,
    },
    studyStreak: {
      type: Number,
    },
    perfectReviews: {
      type: Number,
    },
    cardsStudiedToday: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
DeckSchema.index({ userId: 1, createdAt: -1 });
DeckSchema.index({ isPublic: 1, createdAt: -1 });
DeckSchema.index({ tags: 1 });

// Virtual populate for cards
DeckSchema.virtual('cards', {
  ref: 'Card',
  localField: '_id',
  foreignField: 'deckId',
});

// Update cardCount when cards are added or removed
DeckSchema.methods.updateCardCount = async function() {
  const cardCount = await mongoose.models.Card.countDocuments({ deckId: this._id });
  this.cardCount = cardCount;
  await this.save();
};

export const DeckModel = mongoose.models.Deck || mongoose.model<IDeck>('Deck', DeckSchema);

export default DeckModel;
