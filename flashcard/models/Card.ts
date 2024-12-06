import mongoose from 'mongoose';

export interface ICard {
  deckId: mongoose.Types.ObjectId;
  front: string;
  back: string;
  hint?: string;
  lastReviewed?: Date;
  nextReview?: Date;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CardSchema = new mongoose.Schema<ICard>(
  {
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deck',
      required: true,
    },
    front: {
      type: String,
      required: true,
    },
    back: {
      type: String,
      required: true,
    },
    hint: {
      type: String,
    },
    lastReviewed: {
      type: Date,
    },
    nextReview: {
      type: Date,
    },
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
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
CardSchema.index({ deckId: 1, nextReview: 1 });
CardSchema.index({ deckId: 1, createdAt: -1 });

export const CardModel = mongoose.models.Card || mongoose.model<ICard>('Card', CardSchema);

export default CardModel;
