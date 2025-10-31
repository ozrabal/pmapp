# Plan My App - AI Coding Agent Instructions

## Project Overview

Plan My App is an **AI-powered project planning tool** built with Next.js 15 App Router, React 19, TypeScript, Supabase, and Drizzle ORM. It helps project managers and developers structure projects by generating functional blocks, schedules, and tasks through AI-assisted conversations.

**Key Technologies:** Next.js App Router, React 19, TypeScript 5, Hono (API), Drizzle ORM, Supabase Auth, Vercel AI SDK, TanStack Query, shadcn/ui, Tailwind CSS 4

## Critical Architecture Patterns

### Dual-Client Supabase Pattern
The app uses **two separate Supabase client patterns** - mixing them causes auth failures:

1. **Server Components/Actions** (`src/lib/supabase/server.ts`):
   ```typescript
   const supabase = await createClient(); // Server-side with cookies
   ```

2. **Client Components** (`src/lib/supabase/client.ts`):
   ```typescript
   const supabase = createClient(); // Browser-side
   ```

**Critical:** Never import server client in Client Components or vice versa. The middleware (`src/middleware.ts`) handles session refresh for all routes.

### Hybrid API Architecture
The app uses **Hono for API routes** + **Server Components for page rendering**, not Next.js API routes:

- **API Routes:** `/api/*` → Hono router at `src/app/api/[[...route]]/route.ts`
- **All API routes** require JWT authentication (from Supabase access_token)
- **API modules** live in `src/api/modules/{feature}/` (e.g., `planning/`, `project/`)
- **Client-side API calls** use `src/api/utils/client.ts` (axios with auto token injection)

Example API module structure:
```
src/api/modules/planning/
  ├── index.ts           # Hono router setup
  ├── routes/            # Route handlers
  ├── schemas/           # Zod validation schemas
  ├── consts/            # Step definitions, prompts
  └── utils.ts           # Business logic
```

### Database Layer - Drizzle with Supabase Constraints

**Critical migration workflow** (Drizzle generates references to `auth.users` which Supabase manages):

1. Define schema in `src/db/schema/`
2. Run `npm run db:generate` (includes `fix-drizzle-migration.sh` to remove `auth.users` creation)
3. Run `npm run db:migrate`

**Database patterns:**
- Use `foreignKey()` helper to reference `auth.users` (see `src/db/schema/chat.ts`)
- Single DB connection for serverless (`max: 1, prepare: false` in `src/db/service.ts`)
- Always use `db()` as a function, not `db` directly (lazy initialization)
- Schema uses `snake_case` casing (configured in Drizzle)

### AI Service Pattern
`src/lib/services/ai/index.ts` provides a singleton `AIService` class:

- Use `aiService.generateText()` for text generation with full control
- Use `aiService.generateObjectWithSchema()` for structured outputs with Zod schemas
- Use `aiService.quickGenerate()` for simple prompts
- **Default model:** `GPT_4O_MINI` (cost-effective)
- Error handling covers quota limits, rate limits, invalid keys

AI integration lives in planning routes (`src/api/modules/planning/`) where it drives conversational project definition.

### Chat Session State Management
Chat sessions use a **normalized database design**:
- `chat_sessions` table stores session metadata + `collectedData` (JSONB)
- `chat_messages` table stores conversation history (user/assistant messages)
- Service layer: `src/lib/services/chatSession.service.ts` handles CRUD operations
- In-memory `Map` at `src/api/modules/planning/index.ts` for legacy compatibility (being phased out)

**Pattern:** Multi-step conversational flow defined in `src/api/modules/planning/consts.ts` with step validation and progress tracking.

## Development Workflows

### Running the App
```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint check
npm run format       # Prettier format all files
```

### Database Operations
```bash
npm run db:generate  # Generate migration (auto-fixes auth.users issue)
npm run db:migrate   # Apply migrations
npm run db:push      # Push schema directly (dev only)
npm run db:studio    # Open Drizzle Studio GUI
```

**Local Supabase:** Port 54330, credentials in `.env.local`

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
DATABASE_URL
JWT_SECRET
OPENAI_API_KEY
```

## Project-Specific Conventions

### Version Control
- **Branch naming:** Use prefixes `feature/`, `fix/`, `chore/`, `docs/`, `refactor/` (e.g., `feature/chat-session-persistence`)
- **Commits:** Follow conventional commits format: `type(scope): description`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
  - Example: `feat(planning): add AI validation for project assumptions`

### Code Quality Rules (ESLint)
- **NO console.log** - use structured logging or remove (enforced as error)
- **Inline type imports** - `import { type User }` not `import type { User }`
- **Import order** - builtin → external → `@/*` → internal → parent/sibling
- **JSX prop sorting** - callbacks last, shorthand first, `key` reserved first

### File Structure Patterns
```
src/
├── api/              # Backend: Hono modules, middleware, utils
├── app/              # Frontend: Next.js App Router pages
│   ├── (protected)/  # Requires authentication (wrapped in Guard)
│   ├── (public)/     # Public routes
│   └── api/          # API route handlers (Hono integration)
├── components/       # React components
│   └── ui/           # shadcn/ui primitives
├── db/               # Database: Drizzle schema, queries, service
├── lib/              # Utilities, services, Supabase clients
└── hooks/            # Custom React hooks
```

### Route Protection Pattern
Protected routes use `src/components/guard.tsx`:
```tsx
<Guard>  {/* Checks auth, redirects to /auth/login if not authenticated */}
  <YourProtectedContent />
</Guard>
```

Middleware (`src/middleware.ts`) sets `x-current-path` header for post-login redirects.

### Component Patterns (shadcn/ui)
- **New York style** with CSS variables for theming
- Components in `src/components/ui/` are auto-generated (don't manually edit)
- Custom components extend ui primitives (e.g., `src/components/app-sidebar.tsx`)
- Use `cn()` utility (`src/lib/utils.ts`) to merge Tailwind classes

### State Management
- **Server state:** TanStack Query (configured in `src/app/providers.tsx`)
- **Client state:** React hooks (useState, useReducer)
- **Auth state:** `useUser()` hook (`src/hooks/useUser.tsx`) wraps Supabase auth listener

## Key Gotchas & Best Practices

1. **Always create new Supabase clients** in server functions (not global) - see `src/lib/supabase/server.ts` comment
2. **API authentication:** Hono JWT middleware validates Supabase `access_token`, not custom tokens
3. **Drizzle migrations:** ALWAYS run `npm run db:generate` (includes fix script), never `drizzle-kit generate` directly
4. **Type imports:** Use inline style (`import { type T }`) per ESLint config
5. **Soft deletes:** Tables have `isDeleted`/`deletedAt` fields (see `chat_messages` schema) - filter in queries
6. **JSONB data:** `collectedData` in `chat_sessions` stores flexible project definition data
7. **Zod validation:** Use `@hono/zod-validator` for API request validation (see `src/api/modules/planning/routes/message.ts`)

## Testing (In Progress)

### Unit Testing (Vitest + React Testing Library)
- Test files: `*.test.ts`, `*.test.tsx` co-located with source files
- Focus on testing business logic, utilities, and component behavior
- Mock Supabase clients and API calls in tests
- Use React Testing Library for component tests (user-centric queries)

### E2E Testing (Playwright)
- E2E tests for critical user flows: auth, project creation, chat sessions
- Test against local Supabase instance (port 54330)
- Mock AI service calls to avoid API costs in tests

### Best Practices
- Write tests for new features before marking PRs ready
- Test error states and edge cases (auth failures, network errors)
- Use factories/fixtures for test data (especially for chat sessions with complex state)
- Snapshot test Zod schemas to catch unintended validation changes

## Related Documentation
- **PRD:** `docs/prd.md` (detailed user stories, success metrics)
- **Tech Stack:** `docs/tech-stack.md` (comprehensive dependency documentation)
- **Drizzle-Supabase:** `docs/drizzle-supabase-integration.md`

## AI Agent Guidelines
- **Assume expert-level understanding** - focus on "why" over "what"
- **Proactively handle** edge cases, security (RLS policies), race conditions
- **Update docs** in `/docs` when changing features
- **Use conventional commits** (feat/fix/docs/refactor/test/chore)
- **Consider performance** - serverless constraints (cold starts, connection limits)
