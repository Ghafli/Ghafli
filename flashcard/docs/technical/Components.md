# Component Documentation

## Dashboard Components

### Dashboard
Main dashboard container component that displays user's study progress and quick actions.
```typescript
Props: {
  user: User;
}
```

### AchievementsSummary
Displays user achievements and progress.
```typescript
Props: {
  achievements: Achievement[];
  onAchievementClick?: (achievement: Achievement) => void;
}
```

### RecentDecks
Shows recently accessed or modified decks.
```typescript
Props: {
  decks: Deck[];
  onDeckClick?: (deck: Deck) => void;
}
```

### StudyStats
Displays study statistics and progress.
```typescript
Props: {
  stats: StudyStats;
}
```

## Flashcard Components

### FlashcardEditor
Component for creating and editing flashcards.
```typescript
Props: {
  initialData?: Flashcard;
  onSave: (data: FlashcardData) => Promise<void>;
  onCancel: () => void;
}
```

### StudyMode
Interactive study mode for reviewing flashcards.
```typescript
Props: {
  deck: Deck;
  onComplete: (results: StudyResults) => void;
  onExit: () => void;
}
```

### DeckManager
Component for managing flashcard decks.
```typescript
Props: {
  decks: Deck[];
  onCreateDeck: (data: DeckData) => Promise<void>;
  onEditDeck: (id: string, data: DeckData) => Promise<void>;
  onDeleteDeck: (id: string) => Promise<void>;
}
```

## Layout Components

### Layout
Main layout wrapper with navigation and header.
```typescript
Props: {
  children: React.ReactNode;
  user?: User;
}
```

### Navigation
Main navigation component.
```typescript
Props: {
  user?: User;
  onLogout: () => void;
}
```

### Header
Application header with user menu.
```typescript
Props: {
  user?: User;
  onLogout: () => void;
}
```

## Auth Components

### LoginForm
User login form component.
```typescript
Props: {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  onRegisterClick: () => void;
}
```

### RegisterForm
User registration form component.
```typescript
Props: {
  onSubmit: (data: RegisterData) => Promise<void>;
  onLoginClick: () => void;
}
```

## Common Components

### ErrorBoundary
Error boundary component for handling component errors.
```typescript
Props: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

### LoadingSpinner
Loading indicator component.
```typescript
Props: {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}
```
