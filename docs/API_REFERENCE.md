# API Reference

## Authentication Endpoints

### POST `/api/auth/signup`
Create a new user account.

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  user: {
    id: string;
    email: string;
    created_at: string;
  };
  session: {
    access_token: string;
    expires_at: number;
  };
}
```

### POST `/api/auth/signin`
Sign in to an existing account.

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:** Same as signup

## Books API

### GET `/api/books`
Get a list of books with optional filtering.

**Query Parameters:**
- `level`: Filter by book level
- `language`: Filter by language
- `limit`: Number of books to return (default: 10)
- `offset`: Pagination offset (default: 0)

**Response:**
```typescript
{
  books: Array<{
    id: string;
    title: string;
    author: string;
    description: string | null;
    cover_image: string | null;
    language: string;
    level: string;
    total_pages: number;
  }>;
  total: number;
}
```

### GET `/api/books/[id]`
Get detailed information about a specific book.

**Response:**
```typescript
{
  id: string;
  title: string;
  author: string;
  description: string | null;
  cover_image: string | null;
  language: string;
  level: string;
  total_pages: number;
  content: Array<{
    page: number;
    text: string;
  }>;
  words: Array<{
    word: string;
    meaning: string;
    level: string;
  }>;
}
```

## User Progress API

### GET `/api/progress`
Get user's reading progress across all books.

**Response:**
```typescript
{
  books: Array<{
    book_id: string;
    title: string;
    current_page: number;
    total_pages: number;
    last_read_at: string;
  }>;
}
```

### POST `/api/progress/[book_id]`
Update reading progress for a specific book.

**Request Body:**
```typescript
{
  current_page: number;
}
```

## Vocabulary API

### GET `/api/vocabulary`
Get user's vocabulary list.

**Query Parameters:**
- `status`: Filter by word status (learning/known)
- `limit`: Number of words to return (default: 50)
- `offset`: Pagination offset (default: 0)

**Response:**
```typescript
{
  words: Array<{
    word: string;
    status: string;
    next_review_at: string;
  }>;
  total: number;
  stats: {
    total_words: number;
    learning_words: number;
    known_words: number;
    review_streak: number;
  };
}
```

### POST `/api/vocabulary`
Add a word to user's vocabulary.

**Request Body:**
```typescript
{
  word: string;
  book_id: string;
}
```

## User Settings API

### GET `/api/settings`
Get user settings.

**Response:**
```typescript
{
  theme: 'light' | 'dark' | 'system';
  font_size: 'small' | 'medium' | 'large';
  email_notifications: boolean;
  push_notifications: boolean;
  review_reminders: boolean;
  auto_play_pronunciation: boolean;
  show_translation_hints: boolean;
}
```

### PATCH `/api/settings`
Update user settings.

**Request Body:** Partial settings object (same structure as GET response)

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```typescript
{
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### 401 Unauthorized
```typescript
{
  error: {
    code: 'unauthorized';
    message: string;
  };
}
```

### 403 Forbidden
```typescript
{
  error: {
    code: 'forbidden';
    message: string;
  };
}
```

### 404 Not Found
```typescript
{
  error: {
    code: 'not_found';
    message: string;
  };
}
```

### 500 Internal Server Error
```typescript
{
  error: {
    code: 'internal_server_error';
    message: string;
  };
}
``` 