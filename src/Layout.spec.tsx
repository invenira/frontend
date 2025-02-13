import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Layout from './Layout';
import { setMatchMedia } from '@/App.spec.tsx';

const TestChild = () => <div>Test Child Content</div>;

describe('<Layout/>', () => {
  test('renders children content', () => {
    // Simulate desktop for simplicity.
    setMatchMedia(true);
    const toggleDarkMode = vi.fn();

    render(
      <Layout darkMode={false} toggleDarkMode={toggleDarkMode}>
        <TestChild />
      </Layout>,
    );

    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  });

  describe('Desktop layout', () => {
    beforeEach(() => {
      setMatchMedia(true); // desktop: matches "(min-width:600px)"
    });

    test('renders permanent drawer with title and navigation links', () => {
      const toggleDarkMode = vi.fn();

      render(
        <Layout darkMode={false} toggleDarkMode={toggleDarkMode}>
          <TestChild />
        </Layout>,
      );

      expect(screen.getByText('Inven!RA')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('IAPs')).toBeInTheDocument();
    });

    test('does not render mobile AppBar', () => {
      const toggleDarkMode = vi.fn();

      render(
        <Layout darkMode={false} toggleDarkMode={toggleDarkMode}>
          <TestChild />
        </Layout>,
      );

      // In desktop mode the mobile-specific AppBar is not rendered.
      // (Because the AppBar is rendered only when !isDesktop.)
      // We can check that there is no element with the id "logo" (used in the mobile AppBar).
      expect(screen.queryByText('Inven!RA', { selector: '#logo' })).toBeNull();
    });

    test('dark mode toggle in drawer calls toggleDarkMode', () => {
      const toggleDarkMode = vi.fn();

      render(
        <Layout darkMode={false} toggleDarkMode={toggleDarkMode}>
          <TestChild />
        </Layout>,
      );

      // In the bottom section of the drawer, the text "TestUser" is rendered
      // alongside the dark mode toggle IconButton.
      const testUser = screen.getByText('TestUser');
      // Locate the parent container so we can find the sibling button.
      const parent = testUser.parentElement;
      expect(parent).toBeDefined();

      // Get the first button inside that container.
      const darkModeButton = parent?.querySelector('button');
      expect(darkModeButton).toBeInTheDocument();

      if (darkModeButton) {
        fireEvent.click(darkModeButton);
        expect(toggleDarkMode).toHaveBeenCalledTimes(1);
      }
    });

    test('renders Log Off button', () => {
      const toggleDarkMode = vi.fn();

      render(
        <Layout darkMode={false} toggleDarkMode={toggleDarkMode}>
          <TestChild />
        </Layout>,
      );

      const logOffButton = screen.getByRole('button', { name: /log off/i });
      expect(logOffButton).toBeInTheDocument();
    });
  });

  describe('Mobile layout', () => {
    beforeEach(() => {
      setMatchMedia(false); // mobile: does NOT match "(min-width:600px)"
    });

    test('renders AppBar with hamburger menu', () => {
      const toggleDarkMode = vi.fn();
      const { container } = render(
        <Layout darkMode={false} toggleDarkMode={toggleDarkMode}>
          <TestChild />
        </Layout>,
      );

      // In mobile mode, the AppBar is rendered.
      // The mobile AppBar renders a Typography with id="logo".
      const logo = container.querySelector('#logo');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveTextContent('Inven!RA');

      // The hamburger menu IconButton is rendered in the AppBar.
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      const hamburgerButton = buttons[0];
      expect(hamburgerButton).toBeInTheDocument();
    });

    test('opens temporary drawer on hamburger menu click', () => {
      const toggleDarkMode = vi.fn();
      const { container } = render(
        <Layout darkMode={false} toggleDarkMode={toggleDarkMode}>
          <TestChild />
        </Layout>,
      );

      const hamburgerButton = container.querySelector('button');
      expect(hamburgerButton).toBeInTheDocument();
      fireEvent.click(hamburgerButton!);

      // After clicking, the temporary Drawer should open.
      // We expect to see the navigation links.
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('IAPs')).toBeInTheDocument();
    });

    test('dark mode toggle in mobile drawer calls toggleDarkMode', () => {
      const toggleDarkMode = vi.fn();
      const { container } = render(
        <Layout darkMode={true} toggleDarkMode={toggleDarkMode}>
          <TestChild />
        </Layout>,
      );

      const hamburgerButton = container.querySelector('button');
      expect(hamburgerButton).toBeInTheDocument();
      fireEvent.click(hamburgerButton!);

      const testUser = screen.getByText('TestUser');
      const parent = testUser.parentElement;
      expect(parent).toBeDefined();

      const darkModeButton = parent?.querySelector('button');
      expect(darkModeButton).toBeInTheDocument();

      if (darkModeButton) {
        fireEvent.click(darkModeButton);
        expect(toggleDarkMode).toHaveBeenCalledTimes(1);
      }
    });

    test('renders Log Off button in drawer', () => {
      const toggleDarkMode = vi.fn();
      const { container } = render(
        <Layout darkMode={false} toggleDarkMode={toggleDarkMode}>
          <TestChild />
        </Layout>,
      );

      // Open the drawer.
      const hamburgerButton = container.querySelector('button');
      expect(hamburgerButton).toBeInTheDocument();
      fireEvent.click(hamburgerButton!);

      const logOffButton = screen.getByRole('button', { name: /log off/i });
      expect(logOffButton).toBeInTheDocument();
    });

    test('main content has top margin offset for mobile', () => {
      const toggleDarkMode = vi.fn();
      const { container } = render(
        <Layout darkMode={false} toggleDarkMode={toggleDarkMode}>
          <TestChild />
        </Layout>,
      );

      // The main content is rendered in a <main> element.
      const mainContent = container.querySelector('main');
      expect(mainContent).toBeInTheDocument();
      // In mobile mode, the component applies mt: 7 which equals 7 * 8 = 56px.
      expect(mainContent).toHaveStyle('margin-top: 56px');
    });
  });
});
