# Development Guide

## Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher
- Supabase CLI
- Git

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd project-y
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google AI
GOOGLE_AI_API_KEY=your_google_ai_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=your_price_id
```

4. Start Supabase locally:
```bash
supabase start
```

5. Run database migrations:
```bash
supabase migration up
```

6. Start the development server:
```bash
pnpm dev
```

## Project Structure

```
project-y/
├── app/                    # Next.js app router pages
├── components/             # React components
│   ├── ui/                # Shadcn UI components
│   ├── books/             # Book-related components
│   └── shared/            # Shared components
├── lib/                    # Utility functions and configurations
│   ├── supabase/          # Supabase client setup
│   └── utils/             # Helper functions
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
├── public/                # Static assets
├── styles/                # Global styles
├── supabase/              # Supabase configurations
│   ├── migrations/        # Database migrations
│   └── seed.sql          # Seed data
└── docs/                  # Documentation
```

## Development Workflow

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check code style
pnpm lint

# Format code
pnpm format
```

### TypeScript

- Always use TypeScript for new files
- Avoid using `any` type
- Use proper type imports
- Create reusable types in `types/` directory

### Components

- Use functional components with hooks
- Follow atomic design principles
- Place components in appropriate directories
- Create stories for UI components
- Write unit tests for complex components

### State Management

- Use React hooks for local state
- Implement custom hooks for reusable logic
- Use SWR for server state management
- Follow optimistic update patterns

### API Routes

- Place API routes in `app/api` directory
- Use proper HTTP methods
- Implement proper error handling
- Follow RESTful conventions
- Add appropriate TypeScript types

### Database

- Create migrations for schema changes
- Test migrations locally before deployment
- Add appropriate indexes
- Implement RLS policies
- Document schema changes

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test path/to/test
```

### Git Workflow

1. Create feature branch from `main`:
```bash
git checkout -b feature/your-feature
```

2. Make changes and commit using conventional commits:
```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update documentation"
```

3. Push changes and create pull request:
```bash
git push origin feature/your-feature
```

4. Ensure CI passes and get code review
5. Squash and merge to main

### Deployment

1. Staging deployment:
- Automatically deployed from `main` branch
- Available at staging URL

2. Production deployment:
- Create release tag
- Automatically deployed from tags
- Available at production URL

## Performance Considerations

1. Image Optimization
- Use Next.js Image component
- Optimize images before upload
- Use appropriate image formats

2. Code Splitting
- Use dynamic imports
- Implement proper loading states
- Optimize bundle size

3. Database Queries
- Use proper indexes
- Implement pagination
- Cache frequently accessed data

4. API Optimization
- Implement rate limiting
- Use proper caching strategies
- Optimize response payload

## Security Best Practices

1. Authentication
- Use Supabase authentication
- Implement proper session management
- Handle token refresh

2. Authorization
- Use RLS policies
- Implement proper role-based access
- Validate user permissions

3. Data Protection
- Sanitize user inputs
- Implement proper validation
- Use HTTPS everywhere
- Handle sensitive data properly

4. Error Handling
- Don't expose sensitive information
- Log errors properly
- Implement proper fallbacks

## Monitoring and Debugging

1. Error Tracking
- Use error boundaries
- Implement proper logging
- Monitor performance metrics

2. Analytics
- Track user interactions
- Monitor system health
- Analyze performance data

3. Debugging
- Use proper development tools
- Implement proper logging
- Use debugging utilities

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) 