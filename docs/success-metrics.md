# Success Metrics

## Overview

This document defines the key performance indicators (KPIs) and success metrics for Plan My App. Metrics are organized into four categories: Adoption & Engagement, AI Quality, Efficiency, and Satisfaction.

---

## Adoption & Engagement

### User Growth

- **Metric**: Monthly increase in new registrations
- **Target**: 10% month-over-month growth
- **Measurement**: Count of new user accounts created per month
- **Why it matters**: Indicates market demand and effectiveness of marketing/distribution

### Active Users

- **Metric**: Percentage of registered users active in first month
- **Target**: 40% of new registrations
- **Measurement**: Users who log in and perform at least one action (create project, chat session, etc.) within 30 days of registration
- **Why it matters**: Indicates product-market fit and initial value delivery

### Session Duration

- **Metric**: Average time spent per session
- **Target**: Minimum 15 minutes average
- **Measurement**: Time between login and last action in a session
- **Why it matters**: Indicates engagement depth and value extracted from the tool

### Project Creation

- **Metric**: Projects created per user
- **Target**: Minimum 2 projects per user
- **Measurement**: Average number of projects created by active users
- **Why it matters**: Shows willingness to invest time and see value in multiple use cases

### Retention

- **Metric**: Week-1 retention rate
- **Target**: 30% of users return after one week
- **Measurement**: Percentage of users who log in again 7 days after initial registration
- **Why it matters**: Indicates sustained value and habit formation

### Complete Project Rate

- **Metric**: Users who create complete projects
- **Target**: 60% of active users
- **Definition**: Complete project = assumptions + functional blocks + schedule + at least 5 tasks
- **Why it matters**: Core workflow completion indicates the tool delivers end-to-end value

---

## AI Quality

### Suggestion Usefulness

- **Metric**: AI suggestions rated as helpful
- **Target**: 70% positive rating
- **Measurement**: Ratio of "helpful" votes to total votes (helpful + not helpful)
- **Why it matters**: Direct feedback on AI value - core differentiator of the product

### Modification Rate

- **Metric**: AI suggestions modified by users
- **Target**: Below 30%
- **Measurement**: Percentage of AI-generated content (blocks, tasks, estimates) that users edit before accepting
- **Why it matters**: Low modification rate indicates high AI accuracy and relevance

### AI Adoption

- **Metric**: Users actively using AI features
- **Target**: 80% of active users
- **Measurement**: Percentage of users who trigger at least one AI generation (blocks, tasks, validation) per project
- **Why it matters**: Validates that AI features are discoverable and valuable

### Task Estimation Coverage

- **Metric**: Tasks with time/effort estimates
- **Target**: 80% of all tasks
- **Measurement**: Percentage of tasks that have estimation value (hours or story points)
- **Why it matters**: Indicates users find estimation valuable for planning

### AI-Generated Tasks

- **Metric**: Average tasks created by AI per functional block
- **Target**: Track baseline (no specific target for MVP)
- **Measurement**: Mean number of tasks auto-generated when users request AI task generation
- **Why it matters**: Measures AI productivity boost and generation quality

---

## Efficiency

### Project Definition Time

- **Metric**: Time to define project assumptions
- **Target**: Under 30 minutes
- **Measurement**: Time from starting conversation to completing all assumption fields
- **Why it matters**: Shows tool reduces planning overhead compared to starting from scratch

### Functional Block Generation Time

- **Metric**: Time to generate and customize functional blocks
- **Target**: Under 20 minutes
- **Measurement**: Time from requesting AI generation to finalizing blocks (edits, reordering, etc.)
- **Why it matters**: Demonstrates AI acceleration of project decomposition

### Schedule Creation Time

- **Metric**: Time to generate simple schedule
- **Target**: Under 15 minutes
- **Measurement**: Time from initiating schedule generation to completion
- **Why it matters**: Quick schedule generation shows tool reduces planning friction

### Task Creation Time

- **Metric**: Average time per task creation
- **Target**: Under 3 minutes
- **Measurement**: Mean time from clicking "create task" to saving
- **Why it matters**: Task creation should be fast to encourage detailed planning

### End-to-End Planning Time

- **Metric**: Time to create complete project
- **Target**: Track baseline (no specific target for MVP)
- **Measurement**: Total time from project creation to export
- **Why it matters**: Overall efficiency gain is the ultimate value proposition

---

## Satisfaction

### Overall Rating

- **Metric**: User satisfaction score
- **Target**: Minimum 4.5/5
- **Measurement**: In-app rating prompt or post-session survey
- **Why it matters**: Direct measure of user satisfaction and likelihood to continue using

### Net Promoter Score (NPS)

- **Metric**: Willingness to recommend
- **Target**: Above 40
- **Measurement**: "How likely are you to recommend Plan My App to a colleague?" (0-10 scale)
  - Promoters (9-10) - Detractors (0-6) = NPS
- **Why it matters**: Industry-standard metric for product-market fit and growth potential

### Issue Rate

- **Metric**: Users reporting bugs or problems
- **Target**: Below 5%
- **Measurement**: Percentage of users who submit bug reports or support tickets
- **Why it matters**: High issue rate indicates quality problems that hurt satisfaction

### Completion Rate

- **Metric**: Projects with all major components
- **Target**: 60% of projects
- **Definition**: Project has assumptions, functional blocks, schedule, and tasks
- **Why it matters**: Measures whether users see enough value to complete the full workflow

### Feature Usage Distribution

- **Metric**: Percentage of users using each major feature
- **Target**: Track baseline (no specific targets)
- **Measurement**:
  - AI validation: % using
  - Functional blocks: % using
  - Schedule generation: % using
  - Task management: % using
  - Export: % using
- **Why it matters**: Identifies underutilized features that may need UX improvements

---

## Measurement Implementation

### Data Collection

1. **Analytics Events**: Track key user actions (project created, AI suggestion accepted, etc.)
2. **Database Queries**: Count projects, tasks, users, etc. from PostgreSQL
3. **Feedback Forms**: In-app surveys and rating prompts
4. **Session Tracking**: Time-based metrics from user activity logs

### Tools & Infrastructure

- **Supabase**: Database queries for user/project counts
- **Analytics Service** (planned): Posthog, Mixpanel, or similar for event tracking
- **Feedback Collection**: In-app forms stored in database
- **Dashboard** (planned): Internal admin panel for metric visualization

### Reporting Cadence

- **Weekly**: High-level dashboard review (registrations, active users, NPS)
- **Monthly**: Detailed analysis of all metrics with trends
- **Quarterly**: Strategic review with goals adjustment

---

## Success Thresholds

### MVP Launch Readiness

Before public launch, ensure:

- ✅ Core workflow tested with at least 10 beta users
- ✅ No critical bugs in issue tracker
- ✅ AI suggestion accuracy validated manually on 20+ projects
- ✅ Performance tested (page load < 2s, API response < 1s)

### MVP Success (3 Months Post-Launch)

Consider MVP successful if:

1. **100+ registered users**
2. **40+ active users** (40% activation rate)
3. **24+ complete projects** (60% of active users)
4. **70%+ AI suggestion rating**
5. **4.0+ overall satisfaction score** (aspirational 4.5)

### Scale-Up Readiness (6 Months Post-Launch)

Ready to scale when:

1. **500+ registered users** with 10% monthly growth
2. **200+ active users** maintaining 40% activation
3. **NPS > 30** indicating product-market fit
4. **Week-1 retention > 25%** showing habit formation
5. **Technical infrastructure** stable (uptime > 99%)

---

## Metric Ownership

| Metric Category | Owner | Review Frequency |
|----------------|--------|------------------|
| Adoption & Engagement | Product Lead | Weekly |
| AI Quality | AI/ML Lead | Weekly |
| Efficiency | Product Lead | Monthly |
| Satisfaction | Product Lead | Monthly |

---

## Alert Thresholds

Set up automated alerts when:

- **Active user rate drops below 30%** (from 40% target)
- **AI helpful rating falls below 60%** (from 70% target)
- **Issue rate exceeds 10%** (from 5% target)
- **Week-1 retention drops below 20%** (from 30% target)

---

## Learning & Iteration

### Hypothesis-Driven Development

For each metric below target:

1. **Hypothesize** root causes through user interviews
2. **Design** experiments to test solutions
3. **Implement** smallest viable change
4. **Measure** impact on metric
5. **Iterate** or pivot based on results

### Example: Improving AI Suggestion Usefulness

If AI helpful rating is 60% (below 70% target):

1. **Hypothesis**: Suggestions lack context or are too generic
2. **Experiment**: Improve prompt engineering with more project context
3. **Implementation**: Update AI prompts in `src/api/modules/planning/consts.ts`
4. **Measurement**: Track rating for next 50 suggestions
5. **Decision**: Keep if rating improves to 68%+, otherwise try different approach

---

## Related Documentation

- **[Product Requirements Document](prd.md)** - Feature requirements tied to these metrics
- **[Project Scope](project-scope.md)** - MVP boundaries and success criteria
- **[Technology Stack](tech-stack.md)** - Infrastructure supporting metric collection

---

**Document Version**: 1.0  
**Last Updated**: November 1, 2025  
**Status**: Active (MVP in development)  
**Next Review**: December 1, 2025 (post-beta launch)
