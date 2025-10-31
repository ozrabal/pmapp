# Technology Stack Documentation

## Overview

This document describes the complete technology stack used in the Plan My App (pmapp) project. The application is built using modern web technologies with a focus on developer experience, performance, and scalability.

**Last Updated:** October 31, 2025  
**Version:** 0.0.1

---

## Table of Contents

- [Core Framework](#core-framework)
- [Frontend Technologies](#frontend-technologies)
- [Backend Technologies](#backend-technologies)
- [Database](#database)
- [AI Integration](#ai-integration)
- [Authentication](#authentication)
- [API Layer](#api-layer)
- [Development Tools](#development-tools)
- [Code Quality & Formatting](#code-quality--formatting)
- [UI Components & Design System](#ui-components--design-system)
- [Testing](#testing)
- [Build & Deployment](#build--deployment)
- [Environment & Configuration](#environment--configuration)

---

## Core Framework

### Next.js (Latest)

- **Purpose:** React-based framework for building full-stack web applications
- **Features Used:**
  - App Router (recommended routing system)
  - Server Components for improved performance
  - API Routes via route handlers
  - Turbopack for faster development builds
  - Built-in image optimization
  - Server-side rendering (SSR) and static generation (SSG)
- **Configuration:** `next.config.ts`
- **Type:** Full-stack framework

---

## Frontend Technologies

### React 19

- **Purpose:** UI library for building interactive user interfaces
- **Features Used:**
  - Functional components with hooks
  - Modern React 19 features
  - Client and Server Components
  - Suspense boundaries
- **Type:** UI Library

### TypeScript 5

- **Purpose:** Static type checking for JavaScript
- **Configuration:** `tsconfig.json`
- **Features Used:**
  - Strict mode enabled
  - Path aliases (`@/*` pointing to `src/*`)
  - ES2017 target
  - ESNext modules
  - Incremental compilation
- **Type:** Programming Language

### Tailwind CSS 4.1.13

- **Purpose:** Utility-first CSS framework for styling
- **Configuration:**
  - PostCSS config: `postcss.config.mjs`
  - Uses `@tailwindcss/postcss` plugin
- **Features Used:**
  - Just-in-Time (JIT) compilation
  - CSS variables for theming
  - Responsive design utilities
  - Animation utilities via `tailwindcss-animate`
- **Type:** CSS Framework

### Next Themes 0.4.6

- **Purpose:** Theme management (dark/light mode)
- **Features:**
  - System preference detection
  - Theme persistence
  - Smooth transitions disabled for performance
- **Type:** Theme Management

---

## Backend Technologies

### Node.js

- **Version:** 22.14.0 (managed via nvm)
- **Package Manager:** npm 10.7.0
- **Module System:** ES Modules (type: "module")
- **Type:** Runtime Environment

### Hono 4.9.8

- **Purpose:** Lightweight web framework for API routes
- **Features Used:**
  - JWT authentication middleware
  - Zod validation middleware
  - Route grouping and composition
  - Error handling
  - Integration with Next.js via Vercel adapter
- **Configuration:** Used in `src/app/api/[[...route]]/route.ts`
- **Modules:**
  - Project management routes
  - Planning/chat routes
- **Type:** Web Framework

### Drizzle ORM 0.44.5

- **Purpose:** TypeScript ORM for PostgreSQL
- **Configuration:** `drizzle.config.ts`
- **Features Used:**
  - Schema definition with TypeScript
  - Type-safe queries
  - Migration management
  - Schema introspection
- **CLI:** drizzle-kit 0.31.4
- **Scripts:**
  - `db:generate` - Generate migrations
  - `db:migrate` - Run migrations
  - `db:push` - Push schema to database
  - `db:studio` - Database GUI
- **Type:** ORM

### Postgres 3.4.7

- **Purpose:** PostgreSQL client for Node.js
- **Features Used:**
  - Connection pooling
  - Prepared statements disabled for serverless
  - Single connection optimization
  - Connection lifecycle management
- **Type:** Database Client

---

## Database

### PostgreSQL (via Supabase)

- **Version:** 15
- **Port:** 54330 (local development)
- **Schema Management:**
  - Main schema: `public`
  - Auth schema: `auth` (managed by Supabase)
- **Schema Location:** `src/db/schema/`
- **Key Tables:**
  - `chat_sessions` - Chat conversation sessions
  - `chat_messages` - Individual chat messages
  - User profiles (integrated with Supabase auth)
- **Features:**
  - UUID primary keys
  - JSONB for flexible data storage
  - Foreign key constraints
  - Indexes for query optimization
  - Full-text search capabilities
  - Soft deletes (is_deleted, deleted_at)
- **Type:** Relational Database

---

## AI Integration

### Vercel AI SDK 5.0.60

- **Purpose:** Framework-agnostic AI integration
- **Features Used:**
  - Text generation
  - Object generation with schema validation
  - Streaming responses
  - Multi-provider support
- **Type:** AI SDK

### AI SDK OpenAI 2.0.42

- **Purpose:** OpenAI model integration
- **Models Available:**
  - GPT-4o
  - GPT-4o-mini (default)
  - GPT-3.5-turbo
- **Implementation:** Custom `AIService` class in `src/lib/services/ai/`
- **Features:**
  - Singleton and instance-based patterns
  - Error handling for API limits and quota
  - Temperature control
  - Usage tracking
  - Structured output with Zod schemas
- **Type:** AI Provider Integration

---

## Authentication

### Supabase Auth

- **Version:** Latest (via @supabase/supabase-js)
- **SSR Support:** @supabase/ssr
- **Features Used:**
  - User registration and login
  - Session management with cookies
  - JWT token generation
  - Password recovery
  - User profile management
- **Implementation:**
  - Client: `src/lib/supabase/client.ts`
  - Server: `src/lib/supabase/server.ts`
  - Middleware: `src/lib/supabase/middleware.ts`
- **Custom Hook:** `useUser()` for client-side auth state
- **Type:** Authentication Service

---

## API Layer

### Route Architecture

- **Pattern:** Catch-all API routes `[[...route]]`
- **Framework:** Hono
- **Authentication:** JWT middleware for protected routes
- **Validation:** Zod schema validation via `@hono/zod-validator`
- **Error Handling:** Custom error responses with HTTPException
- **Modules:**
  - `/api/project` - Project management
  - `/api/planning` - AI planning and chat

### HTTP Client

- **Axios 1.12.2**
  - Promise-based HTTP client
  - Request/response interceptors
  - Used for internal API communication

---

## Development Tools

### tsx 4.20.5

- **Purpose:** TypeScript execution for Node.js
- **Use Cases:**
  - Running TypeScript scripts
  - Database operations
  - Development utilities

### dotenv 17.2.2

- **Purpose:** Environment variable management
- **Configuration:** Loads from `.env.local` or `.env`

---

## Code Quality & Formatting

### ESLint 9

- **Configuration:** `eslint.config.mjs`
- **Extends:**
  - `next/core-web-vitals`
  - `next/typescript`
  - `@typescript-eslint/recommended`
  - `plugin:prettier/recommended`
  - `plugin:import/recommended`
- **Custom Rules:**
  - `no-console: error` - No console logs in production
  - JSX prop sorting with callbacks last
  - Import ordering with path group for `@/*`
  - Consistent type imports (inline style)
- **Type:** Linter

### Prettier 3.6.2

- **Configuration:** `prettier.config.mjs`
- **Settings:**
  - Print width: 120
  - Semi: true
  - Single quotes: false
  - Trailing commas: all
  - Tab width: 2
  - Single attribute per line: true
- **Plugins:**
  - `prettier-plugin-tailwindcss` - Automatic Tailwind class sorting
- **Scripts:**
  - `format` - Format all files
  - `format:check` - Check formatting
- **Type:** Code Formatter

### Import Plugins

- **eslint-plugin-import 2.31.0**
  - Import order enforcement
  - TypeScript import resolution
- **Type:** ESLint Plugin

---

## UI Components & Design System

### shadcn/ui

- **Version:** Latest
- **Configuration:** `components.json`
- **Style:** New York
- **Features:**
  - React Server Components support
  - TypeScript-first
  - CSS variables for theming
  - Neutral base color
- **Icon Library:** Lucide React 0.511.0
- **Path Aliases:**
  - `@/components` - React components
  - `@/components/ui` - UI primitives
  - `@/lib` - Utility functions
  - `@/hooks` - Custom React hooks

### Radix UI Primitives

- **Components Used:**
  - Avatar 1.1.10
  - Checkbox 1.3.1
  - Collapsible 1.1.12
  - Dialog 1.1.15
  - Dropdown Menu 2.1.16
  - Label 2.1.6
  - Select 2.2.6
  - Separator 1.1.7
  - Slot 1.2.3
  - Tooltip 1.2.8
- **Purpose:** Accessible, unstyled UI primitives
- **Type:** Component Library

### Utility Libraries

- **clsx 2.1.1** - Conditional className composition
- **class-variance-authority 0.7.1** - Component variant management
- **tailwind-merge 3.3.0** - Tailwind class merging utility
- **Custom `cn()` function** - Combines clsx and tailwind-merge

---

## Testing

### Planned (Not Yet Implemented)

- **Unit Testing:**
  - Vitest (Fast Vite-native test runner)
  - React Testing Library
- **E2E Testing:**
  - Playwright (Browser automation)

**Note:** Testing infrastructure is documented in README but not yet configured in the codebase.

---

## Build & Deployment

### Build System

- **Turbopack:** Next.js's fast bundler (used in development)
- **Scripts:**
  - `dev` - Development server with Turbopack
  - `build` - Production build
  - `start` - Production server
  - `lint` - Run ESLint

### Planned Deployment

- **CI/CD:** GitHub Actions
- **Hosting:** Cloudflare Pages
- **Note:** Deployment configuration not yet implemented

---

## Environment & Configuration

### Environment Variables (Required)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY - Supabase anon key
DATABASE_URL - PostgreSQL connection string

# Authentication
JWT_SECRET - Secret for JWT token signing

# AI
OPENAI_API_KEY - OpenAI API key for AI features

# Optional
VERCEL_URL - Deployment URL (for metadata)
TURBOPACK_ROOT - Turbopack root directory
```

### Configuration Files

- `tsconfig.json` - TypeScript configuration
- `eslint.config.mjs` - ESLint rules
- `prettier.config.mjs` - Prettier formatting rules
- `postcss.config.mjs` - PostCSS/Tailwind configuration
- `next.config.ts` - Next.js configuration
- `drizzle.config.ts` - Database ORM configuration
- `components.json` - shadcn/ui configuration
- `supabase/config.toml` - Local Supabase configuration

---

## State Management

### TanStack Query 5.90.2

- **Purpose:** Server state management
- **Features Used:**
  - Query caching
  - Automatic refetching
  - Optimistic updates
  - DevTools for debugging
- **Configuration:** In `src/app/providers.tsx`
- **Type:** Data Fetching Library

---

## Validation

### Zod 4.1.11

- **Purpose:** TypeScript-first schema validation
- **Used For:**
  - API request validation
  - Form validation
  - AI input/output validation
  - Type inference
- **Additional:** zod-validation-error 4.0.2 for human-readable error messages
- **Type:** Validation Library

---

## Project Structure

```
pmapp/
├── src/
│   ├── api/              # API modules (Hono routes)
│   │   ├── middlewares/  # API middleware
│   │   ├── modules/      # Feature modules
│   │   ├── types/        # Type definitions
│   │   └── utils/        # API utilities
│   ├── app/              # Next.js app router
│   │   ├── (protected)/  # Protected routes
│   │   ├── (public)/     # Public routes
│   │   └── api/          # API route handlers
│   ├── components/       # React components
│   │   └── ui/           # shadcn/ui components
│   ├── db/               # Database layer
│   │   ├── schema/       # Drizzle schemas
│   │   └── queries/      # Database queries
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   │   ├── consts/       # Constants
│   │   ├── queries/      # React Query hooks
│   │   ├── services/     # Service layer
│   │   └── supabase/     # Supabase clients
│   └── middleware.ts     # Next.js middleware
├── migrations/           # Database migrations
├── docs/                 # Documentation
├── scripts/              # Build and utility scripts
└── supabase/             # Supabase configuration
```

---

## Development Workflow

### Version Control

- **Git** with conventional commits
- **Branch Strategy:** Feature branches with descriptive names
- **Protected Branches:** Enforced quality checks

### Code Quality Checks

1. **Linting:** ESLint with TypeScript support
2. **Formatting:** Prettier with Tailwind plugin
3. **Type Checking:** TypeScript strict mode
4. **Pre-commit:** (Planned) Husky + lint-staged

### Database Workflow

1. **Schema Changes:** Update `src/db/schema/`
2. **Generate Migration:** `npm run db:generate`
3. **Apply Migration:** `npm run db:migrate`
4. **Visual Inspection:** `npm run db:studio`

---

## Performance Optimizations

### Frontend

- Server Components for reduced client JavaScript
- Image optimization with Next.js Image component
- Code splitting with dynamic imports
- Tailwind CSS purging for minimal bundle size

### Backend

- Single database connection for serverless
- Connection pooling with timeout management
- Prepared statements optimization

### Caching

- React Query for client-side caching
- Server-side caching via Next.js

---

## Security

### Authentication & Authorization

- JWT-based API authentication
- Supabase Auth for user management
- Row-level security (RLS) in PostgreSQL
- Secure cookie handling with httpOnly flags

### Data Protection

- GDPR-compliant user data handling
- Soft deletes for data retention
- Environment variable security
- CORS and security headers via middleware

---

## Accessibility

### Standards

- WCAG 2.1 compliance (via Radix UI)
- Semantic HTML
- Keyboard navigation support
- Screen reader support
- Focus management

### Tools

- Radix UI primitives (accessible by default)
- Proper ARIA attributes
- Color contrast adherence

---

## Browser Support

### Targets

- Modern browsers (last 2 versions)
- ES2017+ JavaScript features
- CSS Grid and Flexbox

### Progressive Enhancement

- Core functionality without JavaScript
- Enhanced experience with JavaScript enabled

---

## Dependencies Summary

### Production Dependencies (22)

- **Framework:** Next.js, React 19, React DOM 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4, @tailwindcss/postcss
- **UI:** 10 Radix UI primitives, lucide-react
- **Backend:** Hono, Drizzle ORM, postgres
- **Auth:** @supabase/ssr, @supabase/supabase-js
- **AI:** @ai-sdk/openai, ai (Vercel AI SDK)
- **State:** @tanstack/react-query
- **Validation:** Zod, @hono/zod-validator
- **Utilities:** axios, class-variance-authority, clsx, tailwind-merge, next-themes

### Development Dependencies (15)

- **Linting:** ESLint 9 + 4 plugins
- **Formatting:** Prettier 3 + 1 plugin
- **Build:** PostCSS, Autoprefixer, Tailwind plugins
- **Types:** @types/node, @types/react, @types/react-dom
- **Database:** drizzle-kit
- **Utils:** tsx

---

## Future Considerations

### Planned Additions

- **Testing:** Vitest, React Testing Library, Playwright
- **CI/CD:** GitHub Actions workflows
- **Monitoring:** Error tracking and analytics
- **Documentation:** API documentation (OpenAPI/Swagger)

### Potential Upgrades

- Additional AI model providers
- Real-time features with Supabase Realtime
- Advanced caching strategies
- Performance monitoring
- A/B testing framework

---

## References

### Official Documentation

- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase](https://supabase.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [Hono](https://hono.dev/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zod](https://zod.dev/)

---

## Changelog

### Version 0.0.1 (Current)

- Initial technology stack established
- Core framework and dependencies configured
- Basic project structure implemented
- Authentication and database integration complete
- AI service layer implemented
- UI component library integrated

---

**Document Maintained By:** Development Team  
**Last Review Date:** October 31, 2025
