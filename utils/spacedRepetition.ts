// SuperMemo 2 Algorithm implementation
interface ReviewInfo {
  repetitions: number;  // number of times the card has been reviewed
  easeFactor: number;  // how easy the card is (minimum 1.3)
  interval: number;    // interval in days
}

export function calculateNextReview(
  correct: boolean,
  quality: number, // 0-5 rating of how well the answer was remembered
  currentInfo?: ReviewInfo
): ReviewInfo {
  // Default values for new cards
  const info: ReviewInfo = currentInfo || {
    repetitions: 0,
    easeFactor: 2.5,
    interval: 0,
  };

  if (!correct) {
    // Reset on incorrect answer
    return {
      repetitions: 0,
      easeFactor: Math.max(1.3, info.easeFactor - 0.2),
      interval: 1,
    };
  }

  // Calculate new ease factor
  const newEaseFactor = info.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Ensure ease factor doesn't go below 1.3
  const adjustedEaseFactor = Math.max(1.3, newEaseFactor);

  let nextInterval: number;
  if (info.repetitions === 0) {
    nextInterval = 1;
  } else if (info.repetitions === 1) {
    nextInterval = 6;
  } else {
    nextInterval = Math.round(info.interval * adjustedEaseFactor);
  }

  return {
    repetitions: info.repetitions + 1,
    easeFactor: adjustedEaseFactor,
    interval: nextInterval,
  };
}

export function getNextReviewDate(reviewInfo: ReviewInfo): Date {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + reviewInfo.interval);
  return nextDate;
}

export function getDueCards(cards: any[]): any[] {
  const now = new Date();
  return cards.filter(card => {
    if (!card.nextReview) return true;
    return new Date(card.nextReview) <= now;
  });
}

export function calculateReviewPriority(card: any): number {
  if (!card.nextReview) return 1; // Highest priority for new cards
  
  const now = new Date();
  const dueDate = new Date(card.nextReview);
  const daysOverdue = (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysOverdue <= 0) return 0; // Not due yet
  
  // Priority increases with days overdue and difficulty
  return daysOverdue * (1 + (card.difficulty || 0) / 5);
}
