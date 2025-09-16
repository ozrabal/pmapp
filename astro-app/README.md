# Plan My App

![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)
![License](https://img.shields.io/badge/license-GNU_AFFERO_GPL-green.svg)

> AI-powered application planning tool that simplifies project organization and management

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Overview

Plan My App is an AI-assisted application that streamlines the process of planning software projects by providing structure, guidance, and automation of planning elements. The application helps project managers and independent developers overcome the challenges of project planning through AI-powered suggestions and structured workflows.

### The Problem

Many software projects fail to meet deadlines and budgets due to poor planning. Common challenges include:

- Lack of structure in project planning
- Difficulties dividing functionality into logical implementation blocks
- Problems estimating time required for various elements
- Uncertainty about task sequences and dependencies
- Limited access to project management expertise

### How Plan My App Helps

Plan My App addresses these challenges by providing:

- Structured project definition templates
- AI-assisted validation of project requirements
- Automated division of projects into functional blocks
- Simple schedule generation based on functional blocks
- Feedback collection to continuously improve AI suggestions

### Target Users

- Project managers looking for efficient planning tools
- Independent developers building applications on their own
- Teams seeking to standardize their project planning process

## Features

### MVP Features

- **User Account System**
  - Registration and login
  - User profile management
  - GDPR-compliant personal data storage

- **Project Management**
  - Create new projects
  - View, edit and delete existing projects
  - Basic project information management

- **Project Requirements Definition**
  - Structured forms for entering project assumptions
  - AI validation of entered data
  - AI-powered suggestions for project definition

- **Functional Block Division**
  - AI-generated division into functional blocks
  - Customizable predefined categories
  - Modification capabilities for user adjustments

- **Simple Schedule Creation**
  - AI-generated simple project schedule
  - Definition of key project stages
  - Establishing dependencies between stages

- **AI Suggestion Rating**
  - "Useful/Not useful" rating system for AI suggestions
  - User feedback collection for algorithm improvement

## Tech Stack

### Frontend
- **Astro 5**: For creating fast, efficient pages with minimal JavaScript
- **React 19**: For interactive components
- **TypeScript 5**: For static typing and improved IDE support
- **Tailwind 4**: For styling
- **Shadcn/ui**: For accessible React components

### Backend
- **Supabase**: As a comprehensive backend solution
  - PostgreSQL database
  - Built-in authentication
  - Open-source BaaS (Backend-as-a-Service)

### Testing
- **Unit Testing**: 
  - Vitest: Fast Vite-native test runner
  - React Testing Library: For testing React components
- **End-to-End Testing**:
  - Playwright: For browser automation and E2E testing

### AI Integration
- **Vercel AI SDK**: For communication with AI models
  - Access to various models (OpenAI, Anthropic, Google, etc.)
  - Support for local AI models
  - Framework-agnostic integration

### CI/CD and Hosting
- **GitHub Actions**: For CI/CD pipelines
- **DigitalOcean**: For hosting via Docker

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
   Create a `.env` file in the root directory with the following variables:
   ```
   PUBLIC_SUPABASE_URL=your_supabase_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   AI_API_KEY=your_ai_service_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:4321](http://localhost:4321) in your browser to see the application.

## Available Scripts

- `npm run dev`: Starts the development server
- `npm run build`: Builds the project for production
- `npm run preview`: Previews the production build locally
- `npm run astro`: Runs Astro CLI commands
- `npm run lint`: Lints the codebase
- `npm run lint:fix`: Fixes linting issues automatically
- `npm run format`: Formats code using Prettier

## Project Scope

### MVP Scope

The initial release focuses on core functionality:
- Basic user authentication and project management
- AI-assisted project definition and functional block division
- Simple schedule generation
- User feedback collection for AI improvement

### Out of MVP Scope

The following features are planned for future releases:
- Resource allocation for project implementation
- Budget estimation
- Detailed schedule creation with precise dates
- Detailed time estimation for functional blocks
- Project sharing with other users
- Organization creation and project assignment
- Technology selection guidance
- Integration with project management tools and calendars

## Project Status

The project is currently in early development (MVP phase). Key success metrics for the MVP include:
- User adoption rate (target: 10% monthly growth)
- Active user percentage (target: 40% in the first month)
- AI suggestion usefulness (target: 70% rated as useful)
- User satisfaction (target: minimum 4.5/5 rating)

## License

This project is licensed under the GNU AFFERO GPL License - see the LICENSE file for details.