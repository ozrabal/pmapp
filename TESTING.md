# Testing Guide for pmapp

This document outlines the testing approach and tools used in the pmapp project.

## Testing Setup

The project uses the following testing tools:

- **Vitest**: For unit and integration testing
- **Playwright**: For end-to-end (E2E) testing

## Unit Testing with Vitest

Unit tests verify that individual components and functions work as expected in isolation.

### Running Unit Tests

```bash
# Run all unit tests once
npm run test

# Run unit tests in watch mode (for development)
npm run test:watch

# Run unit tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Test File Structure

- Place test files in `__tests__` directories adjacent to the code being tested
- Name test files with `.test.ts` or `.test.tsx` extensions
- Example: For a component at `src/components/Button.tsx`, create `src/components/__tests__/Button.test.tsx`

### Best Practices

- Follow the Arrange-Act-Assert (AAA) pattern
- Use descriptive test names that explain what is being tested
- Leverage Vitest's mocking capabilities for external dependencies
- Aim for a test coverage of at least 80% for critical code paths
- Use `test.each` for testing multiple inputs and expected outputs
- Use the `vi.useFakeTimers()` and `vi.useRealTimers()` appropriately for time-dependent tests

## E2E Testing with Playwright

E2E tests verify that the application works as a whole, simulating real user interactions.

### Running E2E Tests

```bash
# Run all E2E tests
npm run e2e

# Run E2E tests with UI interface (useful for debugging)
npm run e2e:ui

# Generate tests using Playwright's codegen tool
npm run e2e:codegen
```

### Test Structure

- E2E tests are located in the `e2e` directory at the project root
- Use the Page Object Model (POM) pattern for better test organization
- Page objects are in the `e2e/models` directory
- Test fixtures are in the `e2e/fixtures` directory
- Utility functions are in the `e2e/utils` directory

### Best Practices

- Focus on critical user flows
- Use proper selectors (prefer role-based selectors)
- Avoid using selectors that are likely to change (such as CSS classes used for styling)
- Add appropriate wait statements instead of arbitrary delays
- Use test fixtures for common setup (like authentication)
- Leverage Playwright's built-in assertions for more reliable tests
- Use visual comparisons sparingly and only for critical UI components

## Test Environment Configuration

### Vitest Configuration

The Vitest configuration is in `vitest.config.ts` and includes:

- JSDOM environment for DOM testing
- Coverage thresholds
- Alias configuration
- Global setup and teardown in `vitest.setup.ts`

### Playwright Configuration

The Playwright configuration is in `playwright.config.ts` and includes:

- Browser setup (currently Chromium only)
- Viewport settings
- Screenshot, video, and trace settings
- Web server setup for test runs

## Writing Good Tests

### Unit Tests

```tsx
// Example of a good unit test
describe('ValidateAssumptionsButton', () => {
  it('should render the button with correct text when not loading', () => {
    const onValidate = vi.fn();
    render(<ValidateAssumptionsButton onValidate={onValidate} isLoading={false} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Validate Assumptions with AI');
    expect(button).not.toBeDisabled();
  });
});
```

### E2E Tests

```typescript
// Example of a good E2E test using Page Object Model
test('should show error with invalid credentials', async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.login('invalid@example.com', 'wrongpassword');
  await loginPage.expectErrorMessage('Invalid email or password');
});
```

## Continuous Integration

Tests are run automatically on GitHub Actions:

- Unit tests run on every push and pull request
- E2E tests run on pull requests to main branch
- Test coverage reports are generated and uploaded as artifacts

## Further Resources

- [Vitest Documentation](https://vitest.dev/guide/)
- [Testing Library Documentation](https://testing-library.com/docs/)
- [Playwright Documentation](https://playwright.dev/docs/intro)