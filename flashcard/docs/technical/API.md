# API Documentation

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://ghafli.github.io/flashcard/api`

## Authentication

All authenticated endpoints require a valid session token in the request cookies.

### POST /auth/login
Authenticates a user and creates a session.

```typescript
Request:
{
  email: string;
  password: string;
}

Response:
{
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
    };
    token: string;
  };
  error?: string;
}

Status Codes:
- 200: Success
- 401: Invalid credentials
- 429: Too many requests
- 500: Server error
```

### POST /auth/register
Creates a new user account.

```typescript
Request:
{
  email: string;
  password: string;
  name: string;
}

Response:
{
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
    };
  };
  error?: string;
}

Status Codes:
- 201: Created
- 400: Invalid input
- 409: Email already exists
- 429: Too many requests
- 500: Server error
```

## Decks

### GET /decks
Retrieves all decks for the authenticated user.

```typescript
Query Parameters:
- page?: number (default: 1)
- limit?: number (default: 10)
- sort?: 'name' | 'created' | 'updated' (default: 'updated')
- order?: 'asc' | 'desc' (default: 'desc')

Response:
{
  success: boolean;
  data?: {
    decks: Array<{
      id: string;
      name: string;
      description: string;
      cardCount: number;
      createdAt: string;
      updatedAt: string;
    }>;
    total: number;
    page: number;
    totalPages: number;
  };
  error?: string;
}

Status Codes:
- 200: Success
- 401: Unauthorized
- 429: Too many requests
- 500: Server error
```

### POST /decks
Creates a new deck.

```typescript
Request:
{
  name: string;
  description?: string;
  isPublic?: boolean;
  tags?: string[];
}

Response:
{
  success: boolean;
  data?: {
    deck: {
      id: string;
      name: string;
      description: string;
      isPublic: boolean;
      tags: string[];
      cardCount: number;
      createdAt: string;
      updatedAt: string;
    };
  };
  error?: string;
}

Status Codes:
- 201: Created
- 400: Invalid input
- 401: Unauthorized
- 429: Too many requests
- 500: Server error
```

## Flashcards

### GET /flashcards/:deckId
Retrieves all flashcards in a deck.

```typescript
Query Parameters:
- page?: number (default: 1)
- limit?: number (default: 20)
- sort?: 'created' | 'updated' | 'difficulty' (default: 'created')
- order?: 'asc' | 'desc' (default: 'asc')

Response:
{
  success: boolean;
  data?: {
    flashcards: Array<{
      id: string;
      front: string;
      back: string;
      tags: string[];
      difficulty: number;
      nextReview: string;
      createdAt: string;
      updatedAt: string;
    }>;
    total: number;
    page: number;
    totalPages: number;
  };
  error?: string;
}

Status Codes:
- 200: Success
- 401: Unauthorized
- 404: Deck not found
- 429: Too many requests
- 500: Server error
```

### POST /flashcards
Creates a new flashcard.

```typescript
Request:
{
  deckId: string;
  front: string;
  back: string;
  tags?: string[];
}

Response:
{
  success: boolean;
  data?: {
    flashcard: {
      id: string;
      front: string;
      back: string;
      tags: string[];
      difficulty: number;
      nextReview: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  error?: string;
}

Status Codes:
- 201: Created
- 400: Invalid input
- 401: Unauthorized
- 404: Deck not found
- 429: Too many requests
- 500: Server error
```

## Study Sessions

### POST /study-sessions/start
Starts a new study session.

```typescript
Request:
{
  deckId: string;
  cardLimit?: number;
}

Response:
{
  success: boolean;
  data?: {
    sessionId: string;
    cards: Array<{
      id: string;
      front: string;
      back: string;
    }>;
  };
  error?: string;
}

Status Codes:
- 201: Created
- 400: Invalid input
- 401: Unauthorized
- 404: Deck not found
- 429: Too many requests
- 500: Server error
```

### POST /study-sessions/:sessionId/complete
Completes a study session.

```typescript
Request:
{
  results: Array<{
    cardId: string;
    performance: 1 | 2 | 3 | 4 | 5;
    timeSpent: number;
  }>;
}

Response:
{
  success: boolean;
  data?: {
    stats: {
      correctCount: number;
      totalTime: number;
      averageScore: number;
      streakDays: number;
    };
    achievements?: Array<{
      id: string;
      name: string;
      description: string;
      unlockedAt: string;
    }>;
  };
  error?: string;
}

Status Codes:
- 200: Success
- 400: Invalid input
- 401: Unauthorized
- 404: Session not found
- 429: Too many requests
- 500: Server error
```

## Error Handling

All endpoints follow a consistent error response format:

```typescript
{
  success: false,
  error: {
    code: string;
    message: string;
    details?: any;
  }
}
```

## Rate Limiting

- 100 requests per 15 minutes per IP for public endpoints
- 1000 requests per 15 minutes per user for authenticated endpoints
- Study session endpoints have higher limits

## Security Headers

```typescript
{
  'Content-Security-Policy': "default-src 'self'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}
