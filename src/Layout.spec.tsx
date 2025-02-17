import { fireEvent, render, screen } from '@testing-library/react';
import Layout, { LayoutProps } from './Layout';
import { vi } from 'vitest';

// Mock useRouter so that everything else is imported normally
const navigateMock = vi.fn();
vi.mock('@tanstack/react-router', () => {
  const actual = vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useRouter: () => ({
      navigate: navigateMock,
    }),
  };
});

describe('Layout Component', () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  const defaultProps: LayoutProps = {
    darkMode: false,
    toggleDarkMode: vi.fn(),
    children: <div data-testid="child">Child Content</div>,
  };

  test('renders children content', () => {
    render(<Layout {...defaultProps} />);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  test('clicking "Home" calls router.navigate with { to: "/" }', () => {
    render(<Layout {...defaultProps} />);
    const menuButton = screen.getAllByRole('button')[0];
    fireEvent.click(menuButton);
    const homeLink = screen.getByText('Home');
    fireEvent.click(homeLink);
    expect(navigateMock).toHaveBeenCalledWith({ to: '/' });
  });

  test('clicking "IAPs" calls router.navigate with { to: "/iaps" }', () => {
    render(<Layout {...defaultProps} />);
    const menuButton = screen.getAllByRole('button')[0];
    fireEvent.click(menuButton);
    const iapsLink = screen.getByText('IAPs');
    fireEvent.click(iapsLink);
    expect(navigateMock).toHaveBeenCalledWith({ to: '/iaps' });
  });

  test('clicking "Log Off" button calls router.navigate with { to: "/logout" }', () => {
    render(<Layout {...defaultProps} />);
    const menuButton = screen.getAllByRole('button')[0];
    fireEvent.click(menuButton);
    const logOffButton = screen.getByText('Log Off');
    fireEvent.click(logOffButton);
    expect(navigateMock).toHaveBeenCalledWith({ to: '/logout' });
  });

  test('dark mode toggle button calls toggleDarkMode prop', () => {
    const toggleMock = vi.fn();
    render(<Layout {...defaultProps} toggleDarkMode={toggleMock} />);
    const menuButton = screen.getAllByRole('button')[0];
    fireEvent.click(menuButton);
    // The dark mode toggle button is rendered next to the text "TestUser"
    const testUserText = screen.getByText('TestUser');
    // Assuming the button is a child of the same parent as "TestUser"
    const toggleButton = testUserText.parentElement?.querySelector('button');
    expect(toggleButton).toBeInTheDocument();
    if (toggleButton) {
      fireEvent.click(toggleButton);
      expect(toggleMock).toHaveBeenCalled();
    }
  });

  test('renders AppBar with hamburger menu', () => {
    render(<Layout {...defaultProps} />);
    // In mobile mode, an AppBar is rendered containing a Typography with id "logo"
    // (Note: In our component, the AppBar does not have a test id, so we locate by its content.)
    const logo = screen.getByText('Inven!RA');
    expect(logo).toBeInTheDocument();
    // Also, the hamburger menu IconButton is rendered (assumed to be the first button)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('hamburger menu toggles temporary drawer', () => {
    render(<Layout {...defaultProps} />);
    // In mobile mode, the Drawer is rendered with keepMounted,
    // so its content is present in the DOM but hidden.
    const homeElement = screen.getByText('Home');
    // Check that the element is in the document but not visible.
    expect(homeElement).not.toBeVisible();

    // Click the hamburger menu (assumed to be the first IconButton rendered)
    const menuButton = screen.getAllByRole('button')[0];
    fireEvent.click(menuButton);

    // After clicking, the drawer should be open, so the navigation items become visible.
    expect(screen.getByText('Home')).toBeVisible();
    expect(screen.getByText('IAPs')).toBeVisible();
    expect(screen.getByText('Log Off')).toBeVisible();
  });
});
