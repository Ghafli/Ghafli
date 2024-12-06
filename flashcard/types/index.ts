import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  hint?: string;
  lastReviewed?: Date;
  nextReview?: Date;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  reviewed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deck {
  id: string;
  userId: string;
  title: string;
  description?: string;
  isPublic: boolean;
  tags: string[];
  cardCount: number;
  lastStudied?: Date;
  createdAt: Date;
  updatedAt: Date;
  cards?: Card[];
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

export interface StudyProgress {
  total: number;
  completed: number;
  correct: number;
  incorrect: number;
}

export interface StudySession {
  deckId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  cardsStudied: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

export interface StudyStats {
  totalCards: number;
  reviewedCards: number;
  correctAnswers: number;
  incorrectAnswers: number;
  reviewSessions: number;
  cardsStudied: number;
  cardsMastered: number;
  studyStreak: number;
  lastStudyDate: number;
  totalDecks: number;
  totalReviews: number;
  accuracy: number;
  perfectReviews: number;
  cardsStudiedToday: number;
  lastStreakCheck: number;
  totalStudyTime: number;
  averageResponseTime: number;
}
