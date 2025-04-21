# Project Structure Documentation

## Overview
This is a modern Next.js application built with TypeScript, Tailwind CSS, and Supabase. The project follows a well-organized structure with clear separation of concerns and modern best practices for web development.

## Root Directory Structure

```
.
├── app/                    # Next.js App Router directory (main application code)
├── components/            # Reusable UI components
├── lib/                   # Utility functions and shared logic
├── public/               # Static assets
├── styles/               # Global styles and Tailwind configurations
├── types/                # TypeScript type definitions
├── hooks/                # Custom React hooks
├── supabase/             # Supabase configuration and utilities
├── migrations/           # Database migrations
└── docs/                # Project documentation
```

## Core Directories Breakdown

### 📁 app/
The main application directory using Next.js 13+ App Router architecture.

```
app/
├── layout.tsx           # Root layout component
├── page.tsx            # Home page
├── globals.css         # Global styles
├── api/                # API routes
├── auth/               # Authentication related pages
├── dashboard/          # Dashboard pages and components
├── profile/            # User profile related pages
├── settings/           # User settings pages
├── subscription/       # Subscription management
├── library/           # Library related features
├── books/             # Book management features
├── vocabulary/        # Vocabulary related features
├── review/            # Review system
└── types/             # App-specific types
```

### 📁 components/
Reusable UI components organized by feature and functionality.

```
components/
├── ui/                 # Base UI components (buttons, cards, etc.)
├── layout/            # Layout components
├── auth/              # Authentication components
├── dashboard/         # Dashboard specific components
├── profile/           # Profile related components
├── books/             # Book related components
├── reader/            # Reading interface components
├── vocabulary/        # Vocabulary components
├── review/            # Review system components
├── settings/          # Settings components
├── subscription/      # Subscription related components
├── skeletons/         # Loading skeleton components
└── providers/         # Context providers
```

### 📁 lib/
Utility functions and shared business logic.

```
lib/
├── utils/             # General utility functions
├── api/               # API utilities and helpers
├── auth/              # Authentication utilities
├── db/                # Database utilities
└── validation/        # Form validation schemas
```

### 📁 types/
TypeScript type definitions and interfaces.

```
types/
├── api.ts             # API related types
├── auth.ts            # Authentication types
├── books.ts           # Book related types
└── common.ts          # Shared types
```

### 📁 supabase/
Supabase configuration and database utilities.

```
supabase/
├── config.ts          # Supabase configuration
├── schema.ts          # Database schema types
└── queries/           # Database queries
```

## Configuration Files

- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `next.config.mjs` - Next.js configuration
- `middleware.ts` - Next.js middleware for authentication and routing
- `.env.example` - Example environment variables
- `.env.local` - Local environment variables
- `postcss.config.mjs` - PostCSS configuration
- `components.json` - UI components configuration

## Key Features

1. **Authentication System**
   - Secure user authentication
   - Protected routes
   - User session management

2. **Dashboard**
   - User activity tracking
   - Analytics and statistics
   - Administrative features

3. **Profile Management**
   - User profile customization
   - Settings and preferences
   - Account management

4. **Content Management**
   - Book management
   - Library organization
   - Review system
   - Vocabulary tracking

5. **Subscription System**
   - Subscription plans
   - Payment integration
   - Access control

## Technology Stack

- **Frontend Framework**: Next.js 13+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase
- **Authentication**: Built-in auth system
- **State Management**: React Context and Server Components
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Modern, accessible components with proper loading states

## Development Guidelines

1. Follow the established directory structure for new features
2. Use TypeScript for type safety
3. Implement proper error boundaries and loading states
4. Follow React and Next.js best practices
5. Maintain consistent styling with Tailwind CSS
6. Write clean, maintainable, and documented code
7. Implement proper testing for new features
8. Follow accessibility guidelines
9. Optimize for performance

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in required values
3. Install dependencies with `npm install`
4. Run development server with `npm run dev`
5. Access the application at `http://localhost:3000` 