import { render, screen, waitFor } from '@testing-library/react';
import { LoginRedirect } from './LoginRedirect';
import { vi } from 'vitest';
// Import the mocked useAuth so we can control its return value.
import { useAuth } from 'react-oidc-context';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock the useAuth hook from react-oidc-context.
vi.mock('react-oidc-context', () => ({
  useAuth: vi.fn(),
}));

describe('LoginRedirect', () => {
  beforeEach(() => {
    // Clear previous mock calls and implementations
    (useAuth as any).mockReset();
  });

  test('calls auth.signinRedirect on mount', async () => {
    // Arrange: Create a mock function for signinRedirect.
    const signinRedirectMock = vi.fn();
    (useAuth as any).mockReturnValue({ signinRedirect: signinRedirectMock });

    // Act: Render the component.
    render(<LoginRedirect />);

    // Assert: Wait for useEffect to call signinRedirect.
    await waitFor(() => {
      expect(signinRedirectMock).toHaveBeenCalled();
    });
  });

  test('renders CircularProgress component', () => {
    // Arrange: Provide a dummy signinRedirect function.
    (useAuth as any).mockReturnValue({ signinRedirect: vi.fn() });

    // Act: Render the component.
    render(<LoginRedirect />);

    // Assert: Check that the CircularProgress is rendered.
    // MUI's CircularProgress typically renders an element with role "progressbar".
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
