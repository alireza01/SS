# Testing Guide

## Overview

This guide covers testing practices for the Project Y application, including unit tests, integration tests, and end-to-end tests.

## Test Stack

- Jest: Unit and integration testing
- React Testing Library: Component testing
- Cypress: End-to-end testing
- MSW: API mocking
- Vitest: Unit testing runner

## Directory Structure

```
project-y/
├── __tests__/              # Jest tests
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── utils/             # Test utilities
├── cypress/               # Cypress tests
│   ├── e2e/              # End-to-end tests
│   ├── fixtures/         # Test data
│   └── support/          # Support files
└── src/
    └── __tests__/        # Component tests
```

## Running Tests

### Unit and Integration Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test path/to/test
```

### End-to-End Tests

```bash
# Open Cypress UI
pnpm cypress:open

# Run Cypress tests headlessly
pnpm cypress:run
```

## Writing Tests

### Unit Tests

Example of a utility function test:

```typescript
// utils/formatDate.test.ts
import { formatDate } from './formatDate'

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2024-03-20')
    expect(formatDate(date)).toBe('March 20, 2024')
  })

  it('handles invalid dates', () => {
    expect(formatDate(null)).toBe('')
  })
})
```

### Component Tests

Example of a React component test:

```typescript
// components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const onClick = jest.fn()
    render(<Button onClick={onClick}>Click me</Button>)
    fireEvent.click(screen.getByText('Click me'))
    expect(onClick).toHaveBeenCalled()
  })
})
```

### API Tests

Example of an API route test:

```typescript
// __tests__/api/books.test.ts
import { createMocks } from 'node-mocks-http'
import booksHandler from '@/app/api/books/route'

describe('/api/books', () => {
  it('returns books list', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await booksHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(Array.isArray(data.books)).toBe(true)
  })
})
```

### Database Tests

Example of a database operation test:

```typescript
// __tests__/db/books.test.ts
import { createClient } from '@/lib/supabase/server'
import { createBook, getBook } from '@/lib/db/books'

describe('Book operations', () => {
  const supabase = createClient()

  beforeEach(async () => {
    await supabase.from('books').delete()
  })

  it('creates and retrieves a book', async () => {
    const book = await createBook({
      title: 'Test Book',
      author: 'Test Author',
    })

    const retrieved = await getBook(book.id)
    expect(retrieved.title).toBe('Test Book')
  })
})
```

### End-to-End Tests

Example of a Cypress test:

```typescript
// cypress/e2e/auth.cy.ts
describe('Authentication', () => {
  it('allows user to sign in', () => {
    cy.visit('/auth/signin')
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
  })
})
```

## Test Data

### Fixtures

```typescript
// cypress/fixtures/books.json
{
  "books": [
    {
      "id": "1",
      "title": "Test Book 1",
      "author": "Author 1"
    },
    {
      "id": "2",
      "title": "Test Book 2",
      "author": "Author 2"
    }
  ]
}
```

### Factories

```typescript
// __tests__/utils/factories.ts
import { faker } from '@faker-js/faker'

export const createBookData = (overrides = {}) => ({
  title: faker.lorem.words(3),
  author: faker.person.fullName(),
  description: faker.lorem.paragraph(),
  ...overrides,
})
```

## Mocking

### API Mocking

```typescript
// __tests__/mocks/api.ts
import { rest } from 'msw'
import { setupServer } from 'msw/node'

export const handlers = [
  rest.get('/api/books', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        books: [
          { id: '1', title: 'Book 1' },
          { id: '2', title: 'Book 2' },
        ],
      })
    )
  }),
]

export const server = setupServer(...handlers)
```

### Database Mocking

```typescript
// __tests__/mocks/db.ts
import { createClient } from '@supabase/supabase-js'

export const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}))
```

## Test Coverage

### Coverage Goals

- Unit Tests: 80% coverage
- Integration Tests: 70% coverage
- E2E Tests: Critical user paths

### Coverage Report

```bash
pnpm test:coverage
```

Example output:
```
--------------------------|---------|----------|---------|---------|-------------------
File                      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------------|---------|----------|---------|---------|-------------------
All files                 |   85.71 |    78.57 |   88.89 |   85.71 |                   
 components/             |   90.91 |    83.33 |   88.89 |   90.91 |                   
  Button.tsx             |     100 |      100 |     100 |     100 |                   
  Input.tsx              |   83.33 |       75 |      80 |   83.33 | 20-30            
 utils/                  |   81.82 |    71.43 |   88.89 |   81.82 |                   
  format.ts              |   90.91 |       80 |     100 |   90.91 | 15               
  validation.ts          |   72.73 |    62.86 |   77.78 |   72.73 | 25-40,55-70      
--------------------------|---------|----------|---------|---------|-------------------
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm test
      - run: pnpm cypress:run
```

## Best Practices

### General Guidelines

1. Write tests before fixing bugs
2. Keep tests focused and atomic
3. Use meaningful test descriptions
4. Avoid test interdependence
5. Clean up after tests

### Component Testing

1. Test behavior, not implementation
2. Use proper queries
3. Test accessibility
4. Test error states
5. Test loading states

### API Testing

1. Test success and error cases
2. Validate response formats
3. Test authentication
4. Test rate limiting
5. Test edge cases

### Database Testing

1. Use isolated test database
2. Clean up test data
3. Test constraints
4. Test transactions
5. Test migrations

## Debugging Tests

### Common Issues

1. Asynchronous Operations
```typescript
// Wrong
test('async operation', () => {
  const result = asyncOperation()
  expect(result).toBe(true)
})

// Right
test('async operation', async () => {
  const result = await asyncOperation()
  expect(result).toBe(true)
})
```

2. Setup and Teardown
```typescript
describe('Test suite', () => {
  beforeAll(() => {
    // Setup before all tests
  })

  afterAll(() => {
    // Cleanup after all tests
  })

  beforeEach(() => {
    // Setup before each test
  })

  afterEach(() => {
    // Cleanup after each test
  })
})
```

### Debugging Tools

1. Jest Debug Mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

2. Cypress Debug
```typescript
cy.debug()
cy.pause()
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Cypress Documentation](https://docs.cypress.io)
- [MSW Documentation](https://mswjs.io/docs) 