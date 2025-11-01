# Plan My App

![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)
![License](https://img.shields.io/badge/license-GNU_AFFERO_GPL-green.svg)

> AI-powered project planning tool that streamlines application development planning through structured workflows, intelligent automation, and conversational AI assistance

## Table of Contents

- [Plan My App](#plan-my-app)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
    - [The Problem](#the-problem)
    - [The Solution](#the-solution)
    - [Target Users](#target-users)
  - [Features](#features)
    - [Core Capabilities (MVP)](#core-capabilities-mvp)
  - [Tech Stack](#tech-stack)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [Development \& Quality](#development--quality)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Database backup \& restore](#database-backup--restore)
  - [Available Scripts](#available-scripts)
    - [Development](#development)
    - [Database Operations](#database-operations)
    - [Code Quality](#code-quality)
  - [Architecture Highlights](#architecture-highlights)
    - [Hybrid API Pattern](#hybrid-api-pattern)
    - [Database Design](#database-design)
    - [AI Integration](#ai-integration)
    - [Key Patterns](#key-patterns)
  - [Documentation](#documentation)
    - [Product Documentation](#product-documentation)
    - [Technical Documentation](#technical-documentation)
  - [Contributing](#contributing)
  - [License](#license)

## Overview

Plan My App is an AI-powered application designed to streamline software project planning by providing structure, guidance, and automation. Built with Next.js 15, React 19, and OpenAI integration, it enables project managers and independent developers to define project assumptions, generate functional blocks, create schedules, and manage tasks through conversational AI assistance.

### The Problem

Software projects often fail to meet deadlines and budgets due to inadequate planning:

- **Lack of structure** - Users don't know where to start or how to organize work
- **Poor decomposition** - Difficulty dividing functionality into logical implementation blocks
- **Estimation challenges** - Problems estimating time and effort for project elements
- **Dependency confusion** - Uncertainty about task sequences and dependencies
- **Limited expertise** - No access to project management best practices

### The Solution

Plan My App provides AI-driven planning assistance:

- **Structured workflows** - Guided project definition through conversational AI
- **Smart validation** - AI checks completeness, consistency, and realism of project assumptions
- **Automated decomposition** - AI-generated division into functional blocks with descriptions
- **Schedule generation** - Simple project schedules with milestones and dependencies
- **Task management** - Detailed task creation with AI-assisted estimation and dependency tracking
- **Continuous improvement** - User feedback collection to enhance AI suggestions

### Target Users

- **Project managers** seeking efficient, AI-assisted planning tools
- **Independent developers** building applications without PM support
- **Small teams** needing standardized project planning workflows

## Features

### Core Capabilities (MVP)

- **Conversational Project Planning**
  - Multi-step AI-guided workflow for defining project assumptions
  - Natural language interaction with context-aware responses
  - Real-time validation and suggestions

- **AI-Powered Analysis**
  - Completeness and consistency checking of project requirements
  - Intelligent division into functional blocks
  - Automatic task generation from functional block descriptions
  - AI-assisted time/effort estimation with justification

- **Project Management**
  - Create, view, edit, and delete projects
  - Export projects to JSON format
  - GDPR-compliant data handling

- **Task Management**
  - Create and organize tasks within functional blocks
  - Define task dependencies (predecessor/successor relationships)
  - Circular dependency detection
  - Estimation in hours or story points (configurable)

- **Schedule Generation**
  - AI-generated project schedules with milestones
  - Dependency tracking between project stages
  - Visual presentation of project timeline

- **Feedback & Improvement**
  - Rate AI suggestions (helpful/not helpful)
  - Report inadequate suggestions with comments
  - Continuous algorithm improvement through user feedback

## Tech Stack

### Frontend

- **Next.js (latest)** - App Router with Server Components, Turbopack for dev builds
- **React 19** - Functional components with modern hooks, Server/Client Component patterns
- **TypeScript 5** - Strict mode, path aliases (`@/*`), incremental compilation
- **Tailwind CSS 4** - Utility-first styling with JIT compilation, CSS variables for theming
- **shadcn/ui** - Accessible component primitives (New York style) built on Radix UI
- **TanStack Query 5** - Server state management with automatic refetching and caching

### Backend

- **Node.js 22.14.0** - ES Modules, managed via nvm
- **Hono 4** - Lightweight web framework for API routes with JWT auth and Zod validation
- **Drizzle ORM 0.44** - Type-safe PostgreSQL ORM with migration management
- **Supabase** - PostgreSQL 15 database, authentication (JWT), and user management
- **Vercel AI SDK 5** - Framework-agnostic AI integration with streaming support
- **OpenAI API** - GPT-4o-mini (default), GPT-4o, GPT-3.5-turbo models

### Development & Quality

- **ESLint 9** - Strict linting (no console.log, inline type imports, import ordering)
- **Prettier 3** - Consistent formatting (120 char width, Tailwind class sorting)
- **Vitest** - Fast unit testing (planned)
- **Playwright** - E2E browser automation (planned)
- **Drizzle Studio** - Visual database management tool

## Getting Started

### Prerequisites

- Node.js version 22.14.0 (use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions)
- [Supabase](https://supabase.com/) account for backend services

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ozrabal/pmapp.git
   cd pmapp
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with required variables:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_jwt_secret_for_api_auth
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Run database migrations:

   ```bash
   npm run db:migrate
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database backup & restore

If you need to create a backup of your local PostgreSQL database or restore from a custom-format dump, use the commands below. These examples assume a local Postgres instance reachable at port 54330 with user `postgres` and password `postgres`.

Create a custom-format dump (pg_dump):

```bash
pg_dump --format=custom --file=./db/pmapp-backup.dump "postgresql://postgres:postgres@127.0.0.1:54330/postgres"
```

Restore from a custom-format dump (pg_restore):

```bash
pg_restore --verbose --clean --if-exists --no-owner --no-acl --dbname="postgresql://postgres:postgres@127.0.0.1:54330/postgres" ./db/pmapp-backup.dump
```

Notes on options used:

- `--format=custom`: creates a compressed, non-text dump that supports parallel restore and selective object restoration.
- `--clean` / `--if-exists`: drop existing database objects before recreating them, but avoid errors if they don't exist.
- `--no-owner` / `--no-acl`: skip restoring ownership and access control lists to avoid permission issues when restoring into a different environment or user.

## Available Scripts

### Development

- `npm run dev` - Start Next.js development server with Turbopack
- `npm run build` - Create production build
- `npm start` - Start production server

### Database Operations

- `npm run db:generate` - Generate Drizzle migrations (includes Supabase auth.users fix)
- `npm run db:migrate` - Apply migrations to database
- `npm run db:push` - Push schema directly (dev only, skips migration generation)
- `npm run db:studio` - Open Drizzle Studio visual database management

### Code Quality

- `npm run lint` - Run ESLint checks
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without changes

## Architecture Highlights

### Hybrid API Pattern

- **Hono** for API routes (`/api/*`) with JWT authentication
- **Next.js App Router** for page rendering with Server Components
- **Dual Supabase clients**: Separate client/server implementations for auth

### Database Design

- **Drizzle ORM** with snake_case naming convention
- **Normalized chat schema**: Sessions table + messages table
- **Soft deletes**: `isDeleted`/`deletedAt` fields for data retention
- **JSONB storage**: Flexible `collectedData` field for project definitions

### AI Integration

- **Singleton AIService**: Centralized OpenAI API management
- **Structured output**: Zod schema validation for AI responses
- **Error handling**: Quota limits, rate limits, and invalid key detection
- **Cost optimization**: GPT-4o-mini as default model

### Key Patterns

- Always use `await createClient()` for server-side Supabase (never global)
- Database migrations via `npm run db:generate` (auto-fixes Supabase auth.users)
- Protected routes wrapped in `<Guard>` component with automatic redirect
- Inline type imports: `import { type User }` per ESLint config

## Documentation

### Product Documentation

- **[Product Requirements Document](docs/prd.md)** - Detailed user stories, acceptance criteria, and functional requirements
- **[Project Scope](docs/project-scope.md)** - MVP scope definition, feature boundaries, and future roadmap
- **[Success Metrics](docs/success-metrics.md)** - KPIs, measurement strategy, and success criteria

### Technical Documentation

- **[Technology Stack](docs/tech-stack.md)** - Comprehensive documentation of all dependencies and architecture decisions
- **[Drizzle-Supabase Integration](docs/drizzle-supabase-integration.md)** - Database setup and migration patterns
- **[AI Coding Agent Instructions](.github/copilot-instructions.md)** - Guidelines for AI-assisted development

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit changes using conventional commits: `feat(scope): description`
4. Push to branch and open a Pull Request
5. Ensure all ESLint checks pass and code is formatted with Prettier

**Branch naming convention**: `feature/`, `fix/`, `chore/`, `docs/`, `refactor/`

## License

This project is licensed under the **GNU Affero General Public License v3.0** (AGPL-3.0). See the LICENSE file for details.

---

**Version**: 0.0.1 (MVP in development)  
**Node.js**: 22.14.0  
**Last Updated**: November 1, 2025
