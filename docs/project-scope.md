# Project Scope

## In Scope (MVP)

✅ User authentication and profile management  
✅ Conversational AI-guided project definition  
✅ AI validation of project assumptions  
✅ Functional block generation and customization  
✅ Simple schedule creation with dependencies  
✅ Task management with AI-assisted estimation  
✅ Task dependency tracking (predecessor/successor)  
✅ JSON export for projects and tasks  
✅ AI suggestion feedback system  

## Out of Scope (Post-MVP)

❌ Resource allocation and budget estimation  
❌ Detailed schedules with exact dates  
❌ Project sharing and collaboration  
❌ Organization/team management  
❌ Technology recommendation engine  
❌ External tool integrations (Jira, Trello, calendars)  
❌ Advanced task statuses and progress tracking  
❌ Real-time collaboration features  

## MVP Focus Areas

### 1. User Authentication & Profile Management

The MVP includes basic user account functionality:

- Email/password registration and login via Supabase Auth
- User profile creation with default values (timezone: UTC, project limit: 5)
- Password recovery flow
- GDPR-compliant data storage and account deletion
- Session management with JWT tokens

### 2. Conversational AI-Guided Project Planning

The core differentiator - conversational workflow for project definition:

- Multi-step conversation flow defined in `src/api/modules/planning/consts.ts`
- Natural language interaction with OpenAI GPT-4o-mini
- Context-aware responses based on collected data
- Progress tracking through conversation stages
- Real-time data collection into `collectedData` JSONB field

### 3. AI Validation & Suggestions

Intelligence layer for quality assurance:

- Completeness checking: Identifies missing required fields
- Consistency validation: Ensures logical coherence across project data
- Realism assessment: Warns about unrealistic assumptions or estimates
- Smart suggestions: AI-generated recommendations for improvements
- Field-specific feedback: Suggestions linked to specific form fields

### 4. Functional Block Generation

Automated project decomposition:

- AI analyzes project assumptions to generate functional blocks
- Predefined categories (auth, project management, data export, etc.)
- Each block includes name, description, and work scope
- User can edit, add, delete, and reorder blocks
- Blocks stored as structured data for schedule generation

### 5. Schedule Creation

Simple timeline generation:

- AI converts functional blocks into project milestones
- Dependency detection between stages
- High-level timeline without exact dates (MVP limitation)
- Visual presentation (Gantt chart or similar)
- User can modify order and dependencies

### 6. Task Management

Detailed work breakdown within functional blocks:

- CRUD operations for tasks within blocks
- Task fields: name, description, priority (Low/Medium/High)
- Manual or AI-assisted estimation (hours or story points)
- Predecessor/successor dependency relationships
- Circular dependency detection
- Task validation by AI (completeness, realism, consistency)
- Automatic task generation from functional block descriptions

### 7. Data Export

Simple export functionality:

- JSON format export for projects
- Includes all project data: assumptions, blocks, tasks, dependencies
- Hierarchical structure: project → blocks → tasks
- Ready for import into external tools (future feature)

### 8. Feedback Loop

Continuous improvement mechanism:

- "Helpful/Not helpful" rating for AI suggestions
- Ability to report inadequate suggestions with comments
- Feedback stored for algorithm training
- Thank you message to encourage participation

## Technical Boundaries

### Performance Constraints

- **No hard limits** on number of tasks per project (optimize as needed)
- **Single database connection** for serverless deployment
- **30-second timeout** for API routes (configured in Hono)
- **Token usage tracking** to monitor AI costs

### Data Constraints

- **Estimation units** set globally (not per-task or per-project)
- **Soft deletes** - data marked as deleted, not physically removed
- **JSONB storage** for flexible project data (no rigid schema)

### AI Constraints

- **Model availability**: Dependent on OpenAI API uptime
- **Rate limits**: Must handle 429 errors gracefully
- **Cost management**: GPT-4o-mini as default to minimize costs
- **Response quality**: No guarantees on suggestion accuracy

## Future Considerations (Post-MVP)

### Phase 2: Collaboration

- Project sharing with view/edit permissions
- Real-time collaboration on project planning
- Comments and discussions on tasks/blocks
- Team workspaces and organization management

### Phase 3: Advanced Scheduling

- Detailed schedules with exact dates
- Resource allocation (people, time, budget)
- Gantt chart with drag-and-drop
- Calendar integration (Google Calendar, Outlook)
- Critical path analysis

### Phase 4: Integration

- Export to Jira, Trello, Asana, GitHub Projects
- Import from external project management tools
- Calendar sync for milestones
- Slack/Discord notifications
- API for third-party integrations

### Phase 5: Intelligence

- Technology stack recommendation engine
- Risk assessment and mitigation suggestions
- Historical data analysis for better estimates
- Pattern recognition across projects
- Automated project templates based on industry

### Phase 6: Enterprise

- SSO (SAML, OAuth)
- Audit logs and compliance reporting
- Custom roles and permissions
- On-premise deployment option
- SLA guarantees and dedicated support

## Success Criteria

An MVP is considered successful when:

1. **60% of users** create a complete project (assumptions + blocks + schedule + tasks)
2. **70% of AI suggestions** are rated as helpful
3. **40% of users** are active in the first month after registration
4. **30% of users** return to the app one week after initial registration
5. **Minimum 4.5/5** average user satisfaction rating

## Out of Scope: Detailed Breakdown

### Resource & Budget Management

Why not in MVP:

- Requires integration with time tracking systems
- Complex algorithms for resource leveling
- Budget estimation needs historical cost data
- High complexity-to-value ratio for MVP validation

### Advanced Task Features

Why not in MVP:

- Task statuses (in progress, blocked, done) add complexity
- Assigning tasks to team members requires collaboration features
- Progress tracking needs time tracking integration
- Reporting/analytics require data accumulation

### Collaboration Features

Why not in MVP:

- Real-time sync adds technical complexity (WebSockets/SSE)
- Permissions system requires careful design
- Conflict resolution for concurrent edits
- Focus MVP on individual user workflow first

### External Integrations

Why not in MVP:

- Each integration is substantial development effort
- Requires OAuth flows and API management
- Maintenance burden for third-party API changes
- Better to validate core value proposition first

---

**Document Version**: 1.0  
**Last Updated**: November 1, 2025  
**Status**: Active (MVP in development)
