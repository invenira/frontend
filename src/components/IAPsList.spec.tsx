import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { IAPsList } from './IAPsList';
// Import the mocked hook for use in tests.
import { useIAPsQuery } from '@/queries';

/* eslint-disable @typescript-eslint/no-explicit-any */

const dummyIAPs = [
  { _id: '1', name: 'IAP 1', description: 'Description 1' },
  { _id: '2', name: 'IAP 2', description: 'Description 2' },
];

const navigateMock = vi.fn();
// Mock everything from @tanstack/react-router except useRouter, which we override.
vi.mock('@tanstack/react-router', () => {
  const actual = vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useRouter: () => ({
      navigate: navigateMock,
    }),
  };
});

// Mock useIAPsQuery from '@/queries'
vi.mock('@/queries', () => ({
  useIAPsQuery: vi.fn(),
}));

describe('IAPsList Component', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    (useIAPsQuery as any).mockReset();
  });

  test('renders CircularProgress when isIapsLoading is true', () => {
    (useIAPsQuery as any).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    render(<IAPsList />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('throws error when iapError is present', () => {
    const error = new Error('IAP error');
    (useIAPsQuery as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      error,
    });
    expect(() => render(<IAPsList />)).toThrow('IAP error');
  });

  test('renders grid items when data is loaded', () => {
    (useIAPsQuery as any).mockReturnValue({
      data: dummyIAPs,
      isLoading: false,
      error: null,
    });
    render(<IAPsList />);
    // Verify that each IAP's name and description is rendered.
    expect(screen.getByText('IAP 1')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('IAP 2')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
    // Verify that there is one "View" button per IAP.
    const viewButtons = screen.getAllByRole('button', { name: /view/i });
    expect(viewButtons.length).toEqual(dummyIAPs.length);
  });

  test('clicking "View" button calls router.navigate with correct search parameter', () => {
    (useIAPsQuery as any).mockReturnValue({
      data: dummyIAPs,
      isLoading: false,
      error: null,
    });
    render(<IAPsList />);
    // Find the "View" buttons (one per IAP) and click the first one.
    const viewButtons = screen.getAllByRole('button', { name: /view/i });
    expect(viewButtons.length).toBeGreaterThan(0);
    fireEvent.click(viewButtons[0]);
    // Expect navigate to be called with the first IAP's _id.
    expect(navigateMock).toHaveBeenCalledWith({
      to: '/iap',
      search: { id: '1' },
    });
  });
});
