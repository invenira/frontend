import { render, screen } from '@testing-library/react';
import { LoginCallback } from './LoginCallback';
import { vi } from 'vitest';
import { useAuth } from 'react-oidc-context';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock the useAuth hook from react-oidc-context.
vi.mock('react-oidc-context', () => ({
  useAuth: vi.fn(),
}));

// Mock the Navigate component from @tanstack/react-router.
vi.mock('@tanstack/react-router', () => ({
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate">{to}</div>,
}));

describe('LoginCallback', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test.
    (useAuth as any).mockReset();
  });

  test('renders Navigate component when user is authenticated', () => {
    // Arrange: Simulate an authenticated user.
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      error: null,
    });

    // Act: Render the component.
    render(<LoginCallback />);

    // Assert: The Navigate component is rendered with the correct destination.
    const navigateElement = screen.getByTestId('navigate');
    expect(navigateElement).toBeInTheDocument();
    expect(navigateElement).toHaveTextContent('/');
  });

  test('throws error when auth.error exists', () => {
    // Arrange: Simulate an error in the auth state.
    const error = new Error('Test error');
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      error,
    });

    // Act & Assert: Rendering should throw the error.
    expect(() => render(<LoginCallback />)).toThrow('Test error');
  });

  test('renders CircularProgress when not authenticated and no error', () => {
    // Arrange: Simulate a state where the user is not authenticated and no error exists.
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      error: null,
    });

    // Act: Render the component.
    render(<LoginCallback />);

    // Assert: The CircularProgress component should be rendered.
    // MUI's CircularProgress usually renders an element with the role "progressbar".
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
