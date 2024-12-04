# Database Schema Documentation

## Collections

### Users Collection
```typescript
{
  _id: ObjectId,
  email: string,
  name: string,
  passwordHash: string,
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
  settings: {
    theme: 'light' | 'dark',
    emailNotifications: boolean,
    studyReminders: boolean
  }
}

Indexes:
- email: unique
- createdAt: -1
```

### Decks Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  name: string,
  description: string,
  isPublic: boolean,
  tags: string[],
  cardCount: number,
  createdAt: Date,
  updatedAt: Date,
  lastStudied: Date
}

Indexes:
- userId: 1
- isPublic: 1
- tags: 1
- createdAt: -1
```

### Flashcards Collection
```typescript
{
  _id: ObjectId,
  deckId: ObjectId,
  userId: ObjectId,
  front: string,
  back: string,
  tags: string[],
  difficulty: number,
  nextReview: Date,
  reviewCount: number,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- deckId: 1
- userId: 1
- tags: 1
- nextReview: 1
```

### StudySessions Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  deckId: ObjectId,
  startTime: Date,
  endTime: Date,
  cardsStudied: number,
  correctAnswers: number,
  performance: {
    cardId: ObjectId,
    score: number,
    timeSpent: number
  }[]
}

Indexes:
- userId: 1
- deckId: 1
- startTime: -1
```

### Achievements Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  type: string,
  name: string,
  description: string,
  progress: number,
  completed: boolean,
  completedAt: Date,
  createdAt: Date
}

Indexes:
- userId: 1
- type: 1
- completedAt: -1
```

## Relationships

1. **User -> Decks**
   - One-to-Many
   - User._id -> Deck.userId

2. **Deck -> Flashcards**
   - One-to-Many
   - Deck._id -> Flashcard.deckId

3. **User -> StudySessions**
   - One-to-Many
   - User._id -> StudySession.userId

4. **User -> Achievements**
   - One-to-Many
   - User._id -> Achievement.userId

## Data Integrity Rules

1. **Cascading Deletes**
   - Deleting a Deck deletes all associated Flashcards
   - Deleting a User deletes all associated Decks, Flashcards, StudySessions, and Achievements

2. **Validation Rules**
   - Email must be valid format
   - Passwords must meet security requirements
   - Deck names must be unique per user
   - Study session end time must be after start time

3. **Default Values**
   - createdAt: current timestamp
   - updatedAt: current timestamp
   - isPublic: false
   - difficulty: 1
   - reviewCount: 0
