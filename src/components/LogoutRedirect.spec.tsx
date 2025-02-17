import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
// Import the mocked useAuth so we can control its return value.
import { useAuth } from 'react-oidc-context';
import { LogoutRedirect } from '@/components/LogoutRedirect.tsx';

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

  test('calls auth.signoutRedirect on mount', async () => {
    // Arrange: Create a mock function for signinRedirect.
    const signoutRedirect = vi.fn();
    (useAuth as any).mockReturnValue({ signoutRedirect: signoutRedirect });

    // Act: Render the component.
    render(<LogoutRedirect />);

    // Assert: Wait for useEffect to call signinRedirect.
    await waitFor(() => {
      expect(signoutRedirect).toHaveBeenCalled();
    });
  });

  test('renders CircularProgress component', () => {
    // Arrange: Provide a dummy signinRedirect function.
    (useAuth as any).mockReturnValue({ signoutRedirect: vi.fn() });

    // Act: Render the component.
    render(<LogoutRedirect />);

    // Assert: Check that the CircularProgress is rendered.
    // MUI's CircularProgress typically renders an element with role "progressbar".
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
