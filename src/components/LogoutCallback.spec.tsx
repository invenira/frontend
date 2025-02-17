import { render, screen } from '@testing-library/react';
import { LogoutCallback } from './LogoutCallback';
import { vi } from 'vitest';

// Mock the Navigate component from @tanstack/react-router
vi.mock('@tanstack/react-router', () => ({
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate">{to}</div>,
}));

describe('LogoutCallback', () => {
  test('navigates to "/"', () => {
    render(<LogoutCallback />);

    // Assert that our mocked Navigate component is rendered with the correct destination.
    const navigateElement = screen.getByTestId('navigate');
    expect(navigateElement).toBeInTheDocument();
    expect(navigateElement).toHaveTextContent('/');
  });
});
