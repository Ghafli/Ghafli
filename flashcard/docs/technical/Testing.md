# Testing Documentation

## Testing Strategy

### Unit Tests
Located in `__tests__` directories next to components.

```typescript
// Example Component Test (components/flashcards/__tests__/CardEditor.test.tsx)
import { render, fireEvent } from '@testing-library/react';
import CardEditor from '../CardEditor';

describe('CardEditor', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<CardEditor />);
    expect(getByTestId('card-editor')).toBeInTheDocument();
  });

  it('handles save action', async () => {
    const onSave = jest.fn();
    const { getByTestId } = render(<CardEditor onSave={onSave} />);
    
    fireEvent.click(getByTestId('save-button'));
    expect(onSave).toHaveBeenCalled();
  });
});
```

### Integration Tests
Located in `tests/integration/`.

```typescript
// Example API Integration Test (tests/integration/api/decks.test.ts)
import { createMocks } from 'node-mocks-http';
import decksHandler from '@/pages/api/decks';

describe('Decks API', () => {
  it('creates a new deck', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'Test Deck',
        description: 'Test Description'
      }
    });

    await decksHandler(req, res);
    expect(res._getStatusCode()).toBe(201);
  });
});
```

### E2E Tests
Using Cypress, located in `cypress/`.

```typescript
// Example E2E Test (cypress/e2e/study-flow.cy.ts)
describe('Study Flow', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/decks');
  });

  it('completes study session', () => {
    cy.get('[data-testid="deck-card"]').first().click();
    cy.get('[data-testid="start-study"]').click();
    cy.get('[data-testid="card-front"]').should('be.visible');
  });
});
```

## Test Coverage

### Current Coverage Goals
- Lines: 85%
- Functions: 90%
- Branches: 80%
- Statements: 85%

### Critical Paths
1. Authentication Flow
   - Login/Register
   - Session management
   - Protected routes

2. Study Session Flow
   - Card presentation
   - Progress tracking
   - Statistics update

3. Deck Management
   - CRUD operations
   - Validation
   - Error handling

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### E2E Tests
```bash
# Open Cypress
npm run cypress:open

# Run headless
npm run cypress:run
```

## Test Environment Setup

### Jest Configuration
```javascript
// jest.config.ts
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest'
  },
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'pages/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    '!**/*.d.ts'
  ]
};
```

### Mock Data
Located in `__mocks__/`.

```typescript
// __mocks__/data/decks.ts
export const mockDeck = {
  id: '1',
  name: 'Test Deck',
  description: 'Test Description',
  cardCount: 10,
  createdAt: new Date().toISOString()
};
```

## CI/CD Integration

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run cypress:run
```

## Performance Testing

### Load Tests
Using k6, located in `tests/load/`.

```javascript
// tests/load/api.js
export default function() {
  const response = http.get('http://localhost:3000/api/decks');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200
  });
}
```

### Benchmark Tests
```typescript
describe('Performance', () => {
  it('loads dashboard under 200ms', async () => {
    const start = performance.now();
    await renderDashboard();
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(200);
  });
});
```

## Security Testing

### Authentication Tests
```typescript
describe('Auth Security', () => {
  it('prevents unauthorized access', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/api/protected'
    });
    
    await protectedHandler(req, res);
    expect(res._getStatusCode()).toBe(401);
  });
});
```

### API Security Tests
```typescript
describe('API Security', () => {
  it('validates input data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { invalidData: true }
    });
    
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });
});
```

## Pre-commit Hooks
```bash
#!/bin/sh
# .husky/pre-commit

npm run test
npm run lint
npm run type-check
```

## Test Reports
Generated in `coverage/` and `reports/`.
