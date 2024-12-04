export interface UserProfile {
  email: string;
  createdAt: number;
  displayName?: string;
}

export interface StudyStats {
  totalCards: number;
  cardsStudied: number;
  cardsMastered: number;
  studyStreak: number;
  lastStudyDate: number | null;
  accuracy: number;
  perfectReviews: number;
  cardsStudiedToday: number;
  lastStreakCheck: number;
  totalStudyTime: number;
  averageResponseTime: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  nextReview: number;
  lastReview?: number;
  reviewCount?: number;
  difficulty?: number;
}

export interface Deck {
  id: string;
  name: string;
  createdAt: number;
  lastStudied: number;
  description?: string;
  cards: { [key: string]: Flashcard };
  totalCards?: number;
  masteredCards?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt?: number;
  condition: () => boolean;
  unlockedAt?: number;
  currentValue: number;
  requirement: number;
  name: string;
}

export interface UserData {
  profile: UserProfile;
  stats: StudyStats;
  decks: { [key: string]: Deck };
  achievements: { [key: string]: Achievement };
}
