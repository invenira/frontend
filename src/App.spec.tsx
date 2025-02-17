import React from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { vi } from 'vitest';
import axios from 'axios';
import { useAuth } from 'react-oidc-context';
import { App } from '@/App.tsx';

/* eslint-disable @typescript-eslint/no-explicit-any */

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

window.scrollTo = () => null;

// Mock useAuth from react-oidc-context.
vi.mock('react-oidc-context', () => ({
  useAuth: vi.fn(),
}));

// Mock views so that we can identify rendered routes.
vi.mock('@/views', () => ({
  Home: () => <div data-testid="home">Home</div>,
  IAPs: () => <div data-testid="iaps">IAPs</div>,
}));

// Mock components so that we can identify route components.
vi.mock('@/components', () => ({
  LoginCallback: () => <div data-testid="login-callback">Login Callback</div>,
  LoginRedirect: () => <div data-testid="login-redirect">Login Redirect</div>,
  LogoutCallback: () => (
    <div data-testid="logout-callback">Logout Callback</div>
  ),
  LogoutRedirect: () => (
    <div data-testid="logout-redirect">Logout Redirect</div>
  ),
  ProtectedView: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-view">{children}</div>
  ),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
  };
});

describe('App Component', () => {
  // Reset localStorage and mocks before each test.
  beforeEach(() => {
    localStorage.clear();
    (useAuth as any).mockReset();
    // Default auth: user is logged in with a dummy token; events are mocked.
    (useAuth as any).mockReturnValue({
      user: { access_token: 'dummy-token' },
      events: {
        addUserLoaded: vi.fn(),
        removeUserLoaded: vi.fn(),
      },
    });

    //(createRootRoute as any).mockReturnValue({
    //  addChildren: vi.fn(),
    //});
  });

  afterEach(() => {
    cleanup();
  });

  test('sets axios default Authorization header if auth.user is present', async () => {
    render(<App />);
    await waitFor(() => {
      expect(axios.defaults.headers.common['Authorization']).toEqual(
        'Bearer dummy-token',
      );
    });
  });

  test('subscribes to auth.events.addUserLoaded and cleans up on unmount', async () => {
    const addUserLoadedMock = vi.fn();
    const removeUserLoadedMock = vi.fn();

    // Provide our custom events mocks.
    (useAuth as any).mockReturnValue({
      user: { access_token: 'dummy-token' },
      events: {
        addUserLoaded: addUserLoadedMock,
        removeUserLoaded: removeUserLoadedMock,
      },
    });

    const { unmount } = render(<App />);
    // Ensure addUserLoaded is called with a callback.
    expect(addUserLoadedMock).toHaveBeenCalledTimes(1);
    const callback = addUserLoadedMock.mock.calls[0][0];

    // Unmount the component so that cleanup runs.
    unmount();
    expect(removeUserLoadedMock).toHaveBeenCalledWith(callback);
  });

  test('updates axios header on user loaded event', async () => {
    let userLoadedCallback: ((user: any) => void) | undefined;
    const addUserLoadedMock = vi.fn((cb) => {
      userLoadedCallback = cb;
    });
    const removeUserLoadedMock = vi.fn();

    (useAuth as any).mockReturnValue({
      user: { access_token: 'dummy-token' },
      events: {
        addUserLoaded: addUserLoadedMock,
        removeUserLoaded: removeUserLoadedMock,
      },
    });

    render(<App />);
    // Initially, header is set from auth.user.
    await waitFor(() => {
      expect(axios.defaults.headers.common['Authorization']).toEqual(
        'Bearer dummy-token',
      );
    });
    // Simulate a user loaded event with a new token.
    const newUser = { access_token: 'new-token' };
    if (userLoadedCallback) {
      userLoadedCallback(newUser);
    }
    expect(axios.defaults.headers.common['Authorization']).toEqual(
      'Bearer new-token',
    );
  });

  test('reads darkMode from localStorage and toggles dark mode', async () => {
    // Start with darkMode "false" in localStorage.
    localStorage.setItem('darkMode', 'false');
    render(<App />);

    // The Layout renders a dark mode toggle button near the text "TestUser".
    const testUserEl = await screen.findByText('TestUser');
    // Find the toggle button: assume it is the button in the same container.
    let toggleButton = testUserEl.parentElement?.querySelector('button');
    expect(toggleButton).toBeInTheDocument();

    // localStorage initially should be "false".
    expect(localStorage.getItem('darkMode')).toEqual('false');

    // Click to toggle dark mode.
    fireEvent.click(toggleButton!);
    await waitFor(() => {
      expect(localStorage.getItem('darkMode')).toEqual('true');
    });

    toggleButton = screen
      .getByText('TestUser')
      .parentElement?.querySelector('button');

    // Click again to toggle back.
    fireEvent.click(toggleButton!);
    await waitFor(() => {
      expect(localStorage.getItem('darkMode')).toEqual('false');
    });
  });

  test('renders Home route (default route) inside ProtectedView', async () => {
    // Ensure the URL is "/" (the default route).
    window.history.pushState({}, '', '/');
    render(<App />);
    // The Home component is rendered inside ProtectedView.
    const homeEl = await screen.findByTestId('home');
    expect(homeEl).toBeInTheDocument();
    expect(homeEl).toHaveTextContent('Home');
  });

  test('renders IAPs route when path is /iaps', async () => {
    window.history.pushState({}, '', '/iaps');
    render(<App />);
    const iapsEl = await screen.findByTestId('iaps');
    expect(iapsEl).toBeInTheDocument();
    expect(iapsEl).toHaveTextContent('IAPs');
  });

  test('renders LoginRedirect route when path is /login', async () => {
    window.history.pushState({}, '', '/login');
    render(<App />);
    const loginRedirectEl = await screen.findByTestId('login-redirect');
    expect(loginRedirectEl).toBeInTheDocument();
    expect(loginRedirectEl).toHaveTextContent('Login Redirect');
  });

  test('renders LoginCallback route when path is /oauth', async () => {
    window.history.pushState({}, '', '/oauth');
    render(<App />);
    const loginCallbackEl = await screen.findByTestId('login-callback');
    expect(loginCallbackEl).toBeInTheDocument();
    expect(loginCallbackEl).toHaveTextContent('Login Callback');
  });

  test('renders LogoutRedirect route when path is /logout', async () => {
    window.history.pushState({}, '', '/logout');
    render(<App />);
    const logoutRedirectEl = await screen.findByTestId('logout-redirect');
    expect(logoutRedirectEl).toBeInTheDocument();
    expect(logoutRedirectEl).toHaveTextContent('Logout Redirect');
  });

  test('renders LogoutCallback route when path is /oauth/logout', async () => {
    window.history.pushState({}, '', '/oauth/logout');
    render(<App />);
    const logoutCallbackEl = await screen.findByTestId('logout-callback');
    expect(logoutCallbackEl).toBeInTheDocument();
    expect(logoutCallbackEl).toHaveTextContent('Logout Callback');
  });
});
