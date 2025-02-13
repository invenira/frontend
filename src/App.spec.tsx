import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

/**
 * Helper to simulate media queries.
 * When matches is true, it simulates a desktop view (min-width:600px).
 * When false, it simulates mobile.
 */
export function setMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe('App Component', () => {
  beforeEach(() => {
    // Simulate a desktop view so that the permanent drawer (and its dark mode toggle) is always visible.
    setMatchMedia(true);
    localStorage.clear();
  });

  test('renders Layout with child content', () => {
    render(<App />);
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('TestUser')).toBeInTheDocument();
  });

  test('initializes with darkMode false when localStorage is not set', () => {
    render(<App />);
    // Because localStorage is empty, darkMode is parsed as false.
    // Since the dark mode toggle button is rendered next to "TestUser", we locate it:
    const testUser = screen.getByText('TestUser');
    const toggleButton = testUser.parentElement?.querySelector('button');
    expect(toggleButton).toBeInTheDocument();

    // localStorage should not yet have a "darkMode" key.
    expect(localStorage.getItem('darkMode')).toBeNull();

    // Toggle dark mode; clicking should update localStorage to "true".
    fireEvent.click(toggleButton!);
    expect(localStorage.getItem('darkMode')).toEqual('true');
  });

  test('initializes with darkMode true when localStorage is preset to "true"', () => {
    localStorage.setItem('darkMode', 'true');
    render(<App />);
    // Locate the dark mode toggle button (next to "TestUser").
    const testUser = screen.getByText('TestUser');
    const toggleButton = testUser.parentElement?.querySelector('button');
    expect(toggleButton).toBeInTheDocument();

    // Verify that localStorage is "true" on initialization.
    expect(localStorage.getItem('darkMode')).toEqual('true');

    // Toggle dark mode; clicking should update localStorage to "false".
    fireEvent.click(toggleButton!);
    expect(localStorage.getItem('darkMode')).toEqual('false');
  });

  test('toggles dark mode and updates localStorage on button click', () => {
    // Start with darkMode set to false in localStorage.
    localStorage.setItem('darkMode', 'false');
    render(<App />);
    const testUser = screen.getByText('TestUser');
    const toggleButton = testUser.parentElement?.querySelector('button');
    expect(toggleButton).toBeInTheDocument();

    // First click should switch darkMode from false to true.
    fireEvent.click(toggleButton!);
    expect(localStorage.getItem('darkMode')).toEqual('true');

    // Second click should switch darkMode back to false.
    fireEvent.click(toggleButton!);
    expect(localStorage.getItem('darkMode')).toEqual('false');
  });
});
