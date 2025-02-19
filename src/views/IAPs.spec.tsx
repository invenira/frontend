import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { IAPs } from '@/views';

// Mock the IAPsList component
vi.mock('@/components/IAPsList', () => ({
  IAPsList: () => <div data-testid="iap-list">IAPs List</div>,
}));

// Mock the CreateIAP component
vi.mock('@/components/CreateIAP.tsx', () => ({
  CreateIAP: (props: { onSuccess: () => void }) => (
    <div data-testid="create-iap">
      Create IAP Component
      {/* Button to simulate a successful creation */}
      <button onClick={props.onSuccess}>Mock Success</button>
    </div>
  ),
}));

describe('IAPs Component', () => {
  it('renders the New IAP button and the IAPsList', () => {
    render(<IAPs />);
    // Check for the New IAP button
    expect(
      screen.getByRole('button', { name: /New IAP/i }),
    ).toBeInTheDocument();
    // Check for the IAPsList (mocked)
    expect(screen.getByTestId('iap-list')).toBeInTheDocument();
  });

  it('opens the Create IAP dialog when clicking "New IAP"', async () => {
    render(<IAPs />);
    const newIapButton = screen.getByRole('button', { name: /New IAP/i });
    await userEvent.click(newIapButton);
    // Wait for the dialog title to appear
    expect(await screen.findByText(/Create new IAP/i)).toBeInTheDocument();
    // Check that the CreateIAP component is rendered inside the dialog
    expect(screen.getByTestId('create-iap')).toBeInTheDocument();
  });

  it('closes the dialog when clicking "Cancel"', async () => {
    render(<IAPs />);
    const newIapButton = screen.getByRole('button', { name: /New IAP/i });
    await userEvent.click(newIapButton);
    // Ensure the dialog is open
    expect(await screen.findByText(/Create new IAP/i)).toBeInTheDocument();

    // Click the Cancel button in the DialogActions
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await userEvent.click(cancelButton);

    // Wait for the dialog to be removed
    await waitFor(() => {
      expect(screen.queryByText(/Create new IAP/i)).not.toBeInTheDocument();
    });
  });

  it('closes the dialog when CreateIAP calls onSuccess', async () => {
    render(<IAPs />);
    const newIapButton = screen.getByRole('button', { name: /New IAP/i });
    await userEvent.click(newIapButton);
    // Ensure the dialog opens
    expect(await screen.findByText(/Create new IAP/i)).toBeInTheDocument();
    // Simulate the CreateIAP component calling the onSuccess callback
    const successButton = screen.getByRole('button', { name: /Mock Success/i });
    await userEvent.click(successButton);
    // Wait for the dialog to close
    await waitFor(() => {
      expect(screen.queryByText(/Create new IAP/i)).not.toBeInTheDocument();
    });
  });
});
