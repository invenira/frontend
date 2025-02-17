import { render, screen } from '@testing-library/react';
import { ProtectedView } from './ProtectedView';
import { vi } from 'vitest';
import { ProtectedRouteProps } from '@/components/ProtectedRoute.tsx';
import { AnimateTransitionProps } from '@/components/AnimateTransition.tsx';

// Create mock implementations as mock functions
const FakeProtectedRoute = vi.fn((props: ProtectedRouteProps) => (
  <div data-testid="protected-route">{props.children}</div>
));
const FakeAnimateTransition = vi.fn((props: AnimateTransitionProps) => (
  <div data-testid="animate-transition">{props.children}</div>
));

// Mock the module where ProtectedRoute and AnimateTransition are exported from.
vi.mock('@/components', () => ({
  // For ProtectedRoute, we delegate to our fake implementation.
  ProtectedRoute: (props: ProtectedRouteProps) => FakeProtectedRoute(props),
  // For AnimateTransition, we delegate to our fake implementation.
  AnimateTransition: (props: AnimateTransitionProps) =>
    FakeAnimateTransition(props),
}));

describe('ProtectedView', () => {
  // Clear mocks before each test
  beforeEach(() => {
    FakeProtectedRoute.mockClear();
    FakeAnimateTransition.mockClear();
  });

  test('renders children when ProtectedRoute renders its children', () => {
    // Arrange: simulate a case where ProtectedRoute allows access
    FakeProtectedRoute.mockImplementation(
      ({ children }: ProtectedRouteProps) => (
        <div data-testid="protected-route">{children}</div>
      ),
    );
    FakeAnimateTransition.mockImplementation(
      ({ children }: AnimateTransitionProps) => (
        <div data-testid="animate-transition">{children}</div>
      ),
    );

    // Act: render ProtectedView with some child content.
    render(
      <ProtectedView>
        <div data-testid="child">Protected Content</div>
      </ProtectedView>,
    );

    // Assert: verify that the tree is composed as expected.
    // ProtectedRoute should have been called.
    expect(FakeProtectedRoute).toHaveBeenCalled();

    // AnimateTransition should have been rendered.
    expect(FakeAnimateTransition).toHaveBeenCalled();

    // The child content should be rendered inside AnimateTransition.
    const childEl = screen.getByTestId('child');
    expect(childEl).toBeInTheDocument();

    // Ensure the structure: child inside AnimateTransition, which is inside ProtectedRoute.
    const animateEl = screen.getByTestId('animate-transition');
    expect(animateEl).toContainElement(childEl);

    const protectedEl = screen.getByTestId('protected-route');
    expect(protectedEl).toContainElement(animateEl);
  });

  test('renders redirect message when ProtectedRoute blocks access', () => {
    // Arrange: simulate a case where ProtectedRoute blocks access (e.g., not authenticated)
    FakeProtectedRoute.mockImplementation(() => (
      <div data-testid="redirect">Redirecting</div>
    ));
    // Even if AnimateTransition is defined, it won’t be rendered if ProtectedRoute doesn’t render its children.
    FakeAnimateTransition.mockImplementation(
      ({ children }: AnimateTransitionProps) => (
        <div data-testid="animate-transition">{children}</div>
      ),
    );

    // Act: render ProtectedView with some child content.
    render(
      <ProtectedView>
        <div data-testid="child">Protected Content</div>
      </ProtectedView>,
    );

    // Assert: verify that the redirect is rendered instead of the children.
    const redirectEl = screen.getByTestId('redirect');
    expect(redirectEl).toBeInTheDocument();
    expect(redirectEl).toHaveTextContent('Redirecting');

    // The AnimateTransition and child content should not be rendered.
    expect(screen.queryByTestId('animate-transition')).not.toBeInTheDocument();
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });
});
