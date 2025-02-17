import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from './ProtectedRoute';
import { vi } from 'vitest';
import { useAuth } from 'react-oidc-context';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock the useAuth hook from react-oidc-context
vi.mock('react-oidc-context', () => ({
  useAuth: vi.fn(),
}));

// Mock the Navigate component from @tanstack/react-router
vi.mock('@tanstack/react-router', () => ({
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate">{to}</div>,
}));

describe('ProtectedRoute', () => {
  // Reset mocks before each test
  beforeEach(() => {
    (useAuth as any).mockReset();
  });

  test('renders children when user is authenticated', () => {
    // Arrange: simulate an authenticated user
    (useAuth as any).mockReturnValue({ isAuthenticated: true });

    // Act: render the ProtectedRoute with a sample child element
    render(
      <ProtectedRoute>
        <div data-testid="child">Protected Content</div>
      </ProtectedRoute>,
    );

    // Assert: the child should be rendered
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  test('redirects to /login when user is not authenticated', () => {
    // Arrange: simulate a non-authenticated user
    (useAuth as any).mockReturnValue({ isAuthenticated: false });

    // Act: render the ProtectedRoute with a sample child element
    render(
      <ProtectedRoute>
        <div data-testid="child">Protected Content</div>
      </ProtectedRoute>,
    );

    // Assert: the Navigate component should be rendered with "/login" as the destination...
    expect(screen.getByTestId('navigate')).toHaveTextContent('/login');

    // ...and the child should not be rendered.
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });
});
