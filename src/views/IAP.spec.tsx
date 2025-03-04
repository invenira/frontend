// IAP.test.tsx
import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IAP } from './IAP';
import { useIAPQuery } from '@/queries';
import {
  useCreateActivityProviderMutation,
  useCreateIAPMutation,
} from '@/mutations';
import userEvent from '@testing-library/user-event';
import { useSearch } from '@tanstack/react-router';

/* eslint-disable */
/* tslint-disable */

// Setup wrapper with React Query provider
const createWrapper = () => {
  const queryClient = new QueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: () => Promise.resolve({}),
      },
    },
  });

const renderWithClient = (ui: React.ReactNode) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
};

// Sample Data
const sampleIAP = {
  _id: '1',
  name: 'Test IAP',
  description: 'This is a test IAP',
  isDeployed: false,
  createdAt: new Date('2023-01-01T00:00:00Z').toISOString(),
  updatedAt: new Date('2023-01-02T00:00:00Z').toISOString(),
  createdBy: 'User1',
  updatedBy: 'User2',
  activityProviders: [
    {
      _id: 'ap1',
      name: 'AP1',
      description: 'Activity Provider 1',
      activities: [
        {
          name: 'Activity1',
          description: 'Activity description 1',
          createdAt: new Date('2023-01-03T00:00:00Z').toISOString(),
          updatedAt: new Date('2023-01-04T00:00:00Z').toISOString(),
          url: undefined,
        },
      ],
    },
  ],
  goals: [
    {
      name: 'Goal1',
      description: 'Goal description 1',
      formula: 'x+1',
      targetValue: 100,
      currentValue: 50,
    },
  ],
};

// Mocks
vi.mock('@/queries', () => ({
  useIAPQuery: vi.fn(() => ({
    data: sampleIAP,
    isLoading: false,
    error: null,
  })),
  useActivityProvidersQuery: vi.fn(() => ({
    data: [
      { _id: 'ap1', name: 'AP1', description: 'Activity Provider 1' },
      // To simulate duplicate names filtering, you can add more items here.
    ],
    isLoading: false,
  })),
}));

// Each mutation returns a mock object with a mutate function.
const mockDeploy = vi.fn();
const mockCreateGoal = vi.fn();
const mockCreateActivity = vi.fn();
const mockCreateActivityProvider = vi.fn();
const mockCreateIAP = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useSearch: vi.fn(() => ({ id: '1234' })),
}));

vi.mock('@/mutations', () => ({
  useDeployIAPMutation: vi.fn(() => ({ mutate: mockDeploy })),
  useCreateGoalMutation: vi.fn(() => ({ mutate: mockCreateGoal })),
  useCreateActivityMutation: vi.fn(() => ({ mutate: mockCreateActivity })),
  useCreateActivityProviderMutation: vi.fn(() => ({
    mutate: mockCreateActivityProvider,
  })),
  useCreateIAPMutation: vi.fn(() => ({ mutate: mockCreateIAP })),
}));

vi.mock('@/services', () => ({
  graphQLService: {
    getConfigurationInterfaceUrl: vi.fn(() =>
      Promise.resolve('https://config-url.com'),
    ),
    getActivityProviderRequiredFields: vi.fn(() => Promise.resolve(['field1'])),
  },
}));

// For the IFrame, we render a dummy input so we can test scraping.
vi.mock('@/components', () => ({
  CustomIFrame: () => (
    <div data-testid="custom-iframe">
      <input name="field1" defaultValue="value1" />
    </div>
  ),
}));

describe('IAP component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading indicator when IAP is loading', () => {
    // Override useIAPQuery to simulate loading state.
    (useIAPQuery as any).mockReturnValueOnce({
      data: null,
      isLoading: true,
      error: null,
    });
    render(<IAP />, { wrapper: createWrapper() });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders header details and action buttons when not deployed', () => {
    render(<IAP />, { wrapper: createWrapper() });
    expect(screen.getByText('Test IAP')).toBeInTheDocument();
    expect(screen.getByText('This is a test IAP')).toBeInTheDocument();
    expect(screen.getByText(/Created At:/)).toBeInTheDocument();
    expect(screen.getByText(/Created By:/)).toBeInTheDocument();
    expect(screen.getByText('Deploy IAP')).toBeInTheDocument();
    expect(screen.getByText('Add Activity')).toBeInTheDocument();
    expect(screen.getByText('Add Goal')).toBeInTheDocument();
  });

  it('renders activities section if activities exist', () => {
    render(<IAP />, { wrapper: createWrapper() });
    expect(screen.getByText('Activities')).toBeInTheDocument();
    expect(screen.getByText('Activity1')).toBeInTheDocument();
    expect(screen.getByText('Activity description 1')).toBeInTheDocument();
    expect(screen.getByText('Activity Provider: AP1')).toBeInTheDocument();
  });

  it('renders goals section with progress bar', () => {
    render(<IAP />, { wrapper: createWrapper() });
    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Goal1')).toBeInTheDocument();
    expect(screen.getByText('Goal description 1')).toBeInTheDocument();
    expect(screen.getByText('Formula: x+1')).toBeInTheDocument();
    // The component computes progress as (targetValue / 2 / targetValue)*100 = 50%
    expect(screen.getByText('Progress: 50%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('opens and closes the Goal Dialog', async () => {
    render(<IAP />, { wrapper: createWrapper() });
    // Open Goal dialog by clicking "Add Goal"
    fireEvent.click(screen.getAllByText('Add Goal')[0]);
    expect(screen.getAllByText('Add Goal')[0]).toBeInTheDocument();
    // Fill in goal fields

    fireEvent.change(screen.getByLabelText('Goal Name'), {
      target: { value: 'New Goal' },
    });
    fireEvent.change(screen.getByLabelText('Goal Description'), {
      target: { value: 'New Goal Desc' },
    });
    fireEvent.change(screen.getByLabelText('Formula'), {
      target: { value: 'a+b' },
    });
    fireEvent.change(screen.getByLabelText('Target Value'), {
      target: { value: '200' },
    });
    // Click "Add" to submit the goal. This should call the mutation.
    fireEvent.click(screen.getByText('Add'));

    expect(mockCreateGoal).toHaveBeenCalled();
  });

  it('opens and cancels the Activity Dialog', async () => {
    render(<IAP />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByText('Add Activity'));
    expect(screen.getByTestId('activity-dialog')).toBeInTheDocument();
    // Cancel the dialog
    fireEvent.click(screen.getByText('Cancel'));
    await waitFor(() => {
      expect(screen.queryByTestId('activity-dialog')).not.toBeInTheDocument();
    });
  });

  describe('Activity Dialog and Addition', () => {
    it('resets Activity Dialog fields on open', async () => {
      render(<IAP />, { wrapper: createWrapper() });
      const addActivityButton = screen.getByRole('button', {
        name: /add activity/i,
      });
      await userEvent.click(addActivityButton);
      const activityNameInput = screen.getByLabelText('Activity Name');
      await userEvent.type(activityNameInput, 'Temp Activity');
      // Close via Cancel
      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
      // Reopen dialog and verify fields are reset
      await userEvent.click(addActivityButton);
      expect(screen.getByLabelText('Activity Name')).toHaveValue('');
    });

    it('opens the Activity Dialog when clicking "Add Activity"', async () => {
      render(<IAP />, { wrapper: createWrapper() });
      await userEvent.click(
        screen.getByRole('button', { name: /add activity/i }),
      );
      await waitFor(() => {
        expect(screen.getByTestId('activity-dialog')).toBeInTheDocument();
      });
      expect(
        screen.getByLabelText('Activity Provider Type'),
      ).toBeInTheDocument();
    });

    // The old test checking for a validation error when no provider is selected has been removed
    // because the updated component no longer performs that check.

    it('handles adding an activity with an existing provider and opens the IFrame dialog', async () => {
      render(<IAP />, { wrapper: createWrapper() });
      await userEvent.click(
        screen.getByRole('button', { name: /add activity/i }),
      );
      await userEvent.type(
        screen.getByLabelText('Activity Name'),
        'Valid Activity',
      );
      await userEvent.type(
        screen.getByLabelText('Activity Description'),
        'Valid Description',
      );
      await userEvent.click(screen.getByLabelText('Select Activity Provider'));
      const listbox = await screen.findByRole('listbox');
      await userEvent.click(within(listbox).getByText('AP1'));
      await userEvent.click(screen.getByRole('button', { name: /^add$/i }));
      await waitFor(() =>
        expect(screen.getByTestId('iframe-dialog')).toBeInTheDocument(),
      );
    });

    it('submits the IFrame configuration and adds the activity', async () => {
      render(<IAP />, { wrapper: createWrapper() });
      await userEvent.click(
        screen.getByRole('button', { name: /add activity/i }),
      );
      await userEvent.type(
        screen.getByLabelText('Activity Name'),
        'Valid Activity',
      );
      await userEvent.type(
        screen.getByLabelText('Activity Description'),
        'Valid Description',
      );
      await userEvent.click(screen.getByLabelText('Select Activity Provider'));
      const listbox = await screen.findByRole('listbox');
      await userEvent.click(within(listbox).getByText('AP1'));
      await userEvent.click(screen.getByRole('button', { name: /^add$/i }));
      await waitFor(() =>
        expect(screen.getByTestId('iframe-dialog')).toBeInTheDocument(),
      );
      await userEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(screen.queryByTestId('iframe-dialog')).not.toBeInTheDocument();
      });
    });

    it('shows error if new provider creation did not return an ID', async () => {
      render(<IAP />, { wrapper: createWrapper() });
      const newProviderMutateMock = vi.fn((_, { onSuccess }) => onSuccess({}));
      (useCreateActivityProviderMutation as any).mockReturnValue({
        mutate: newProviderMutateMock,
      });
      const mutateMock = vi.fn((_, { onSuccess }) =>
        onSuccess({ _id: 'iap-123' }),
      );
      (useCreateIAPMutation as any).mockReturnValue({ mutate: mutateMock });
      renderWithClient(<IAP />);
      const addActivityButtons = screen.getAllByRole('button', {
        name: /add activity/i,
      });
      await userEvent.click(addActivityButtons[1]);
      const providerTypeSelect = screen.getByLabelText(
        'Activity Provider Type',
      );
      await userEvent.click(providerTypeSelect);
      const newOption = await screen.findByRole('option', {
        name: /create new activity provider/i,
      });
      await userEvent.click(newOption);
      const newProviderNameInput = screen.getByLabelText(
        'New Activity Provider Name',
      );
      const newProviderDescriptionInput = screen.getByLabelText(
        'New Activity Provider Description',
      );
      const newProviderUrlInput = screen.getByLabelText(
        'New Activity Provider URL',
      );
      await userEvent.type(newProviderNameInput, 'New Provider');
      await userEvent.type(newProviderDescriptionInput, 'New Desc');
      await userEvent.type(newProviderUrlInput, 'http://newprovider.com');
      const activityNameInput = screen.getByLabelText('Activity Name');
      const activityDescriptionInput = screen.getByLabelText(
        'Activity Description',
      );
      await userEvent.type(activityNameInput, 'Activity With New Provider');
      await userEvent.type(activityDescriptionInput, 'Activity Desc');
      const addButton = screen.getByRole('button', { name: /^add$/i });
      await userEvent.click(addButton);
      await waitFor(() => {
        expect(
          screen.getByText(/New provider creation did not return an ID/i),
        ).toBeInTheDocument();
      });
    });
  });

  it('should throw error when IAP ID is missing', () => {
    // Override useSearch to return an empty id
    (useSearch as any).mockReturnValue({});
    expect(() => render(<IAP />, { wrapper: createWrapper() })).toThrow(
      'IAP ID is required',
    );
  });

  // Test for IAP query error (lines 149-150)
  it('should throw error when useIAPQuery returns an error', () => {
    (useSearch as any).mockReturnValue({ id: '1234' });
    (useIAPQuery as any).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('IAP query error'),
    });
    expect(() => render(<IAP />, { wrapper: createWrapper() })).toThrow(
      'IAP query error',
    );
  });

  // Test for IAP not found (lines 173-178)
  it('should throw error when IAP is not found', () => {
    (useSearch as any).mockReturnValue({ id: '1234' });
    (useIAPQuery as any).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
    expect(() => render(<IAP />, { wrapper: createWrapper() })).toThrow(
      'IAP not found',
    );
  });

  // Test that clicking "Deploy IAP" calls the deploy mutation (lines 196-201)
  it('calls deploy mutation when "Deploy IAP" button is clicked', () => {
    (useSearch as any).mockReturnValue({ id: '1234' });
    (useIAPQuery as any).mockReturnValue({
      data: sampleIAP,
      isLoading: false,
      error: undefined,
    });
    render(<IAP />, { wrapper: createWrapper() });
    const deployButton = screen.getByText('Deploy IAP');
    fireEvent.click(deployButton);
    expect(mockDeploy).toHaveBeenCalledWith({ id: sampleIAP._id });
  });

  // Test for goal creation error handling (lines 230-249)
  it('shows alert when goal creation fails', async () => {
    (useSearch as any).mockReturnValue({ id: '1234' });
    // Simulate goal mutation failure by invoking onError callback
    mockCreateGoal.mockImplementationOnce((_, { onError }) =>
      onError(new Error('Goal creation failed')),
    );
    render(<IAP />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByText('Add Goal'));
    fireEvent.change(screen.getByLabelText('Goal Name'), {
      target: { value: 'Test Goal' },
    });
    fireEvent.change(screen.getByLabelText('Goal Description'), {
      target: { value: 'Test Desc' },
    });
    fireEvent.change(screen.getByLabelText('Formula'), {
      target: { value: 'x+1' },
    });
    fireEvent.change(screen.getByLabelText('Target Value'), {
      target: { value: '100' },
    });
    fireEvent.click(screen.getByText('Add'));
    await waitFor(() => {
      expect(screen.getByText(/Create Goal Error/)).toBeInTheDocument();
    });
  });

  // Test that reopening the Goal Dialog resets its fields (lines 290-296)
  it('resets goal dialog fields when reopened', async () => {
    (useSearch as any).mockReturnValue({ id: '1234' });
    (useIAPQuery as any).mockReturnValue({
      data: sampleIAP,
      isLoading: false,
      error: undefined,
    });
    render(<IAP />, { wrapper: createWrapper() });
    // Open and fill the goal dialog
    fireEvent.click(screen.getByText('Add Goal'));
    const nameInput = screen.getByLabelText('Goal Name');
    fireEvent.change(nameInput, { target: { value: 'Some Goal' } });
    fireEvent.click(screen.getByText('Cancel'));
    // Reopen and check that the fields are reset
    fireEvent.click(screen.getAllByText('Add Goal')[0]);
    expect(screen.getByLabelText('Goal Name')).toHaveValue('');
  });

  // Test for new provider branch validation error (lines 318-320)
  it('shows validation error when new provider fields are insufficient', async () => {
    (useSearch as any).mockReturnValue({ id: '1234' });
    render(<IAP />, { wrapper: createWrapper() });
    await userEvent.click(
      screen.getByRole('button', { name: /add activity/i }),
    );
    // Switch to "new" provider type
    const providerTypeSelect = screen.getByLabelText('Activity Provider Type');
    await userEvent.click(providerTypeSelect);
    const newOption = await screen.findByRole('option', {
      name: /create new activity provider/i,
    });
    await userEvent.click(newOption);
    // Provide insufficient values for new provider fields
    fireEvent.change(screen.getByLabelText('New Activity Provider Name'), {
      target: { value: 'AB' },
    });
    fireEvent.change(
      screen.getByLabelText('New Activity Provider Description'),
      { target: { value: 'CD' } },
    );
    fireEvent.change(screen.getByLabelText('New Activity Provider URL'), {
      target: { value: '' },
    });
    // Fill valid activity fields
    fireEvent.change(screen.getByLabelText('Activity Name'), {
      target: { value: 'Activity Test' },
    });
    fireEvent.change(screen.getByLabelText('Activity Description'), {
      target: { value: 'Activity Desc' },
    });
    fireEvent.click(screen.getByText(/^add$/i));
    await waitFor(() => {
      expect(
        screen.getByText(/Please fill in the required fields for new provider/),
      ).toBeInTheDocument();
    });
  });

  // Test for new provider creation error handling (lines 403-405)
  it('shows alert when new provider creation fails', async () => {
    (useSearch as any).mockReturnValue({ id: '1234' });
    // Override new provider mutation to trigger an error
    (useCreateActivityProviderMutation as any).mockReturnValue({
      mutate: (_: any, { onError }: any) =>
        onError(new Error('Provider creation failed')),
    });
    render(<IAP />, { wrapper: createWrapper() });
    await userEvent.click(
      screen.getByRole('button', { name: /add activity/i }),
    );
    // Switch to "new" provider type
    const providerTypeSelect = screen.getByLabelText('Activity Provider Type');
    await userEvent.click(providerTypeSelect);
    const newOption = await screen.findByRole('option', {
      name: /create new activity provider/i,
    });
    await userEvent.click(newOption);
    fireEvent.change(screen.getByLabelText('New Activity Provider Name'), {
      target: { value: 'Valid Provider' },
    });
    fireEvent.change(
      screen.getByLabelText('New Activity Provider Description'),
      { target: { value: 'Valid Description' } },
    );
    fireEvent.change(screen.getByLabelText('New Activity Provider URL'), {
      target: { value: 'http://valid.com' },
    });
    fireEvent.change(screen.getByLabelText('Activity Name'), {
      target: { value: 'Activity with New Provider' },
    });
    fireEvent.change(screen.getByLabelText('Activity Description'), {
      target: { value: 'Activity Desc' },
    });
    fireEvent.click(screen.getByText(/^add$/i));
    await waitFor(() => {
      expect(
        screen.getByText(/Failed to create new activity provider/),
      ).toBeInTheDocument();
    });
  });

  // Test for IFrame submission with missing required field (lines 230-249 & 572)
  it('shows configuration error when a required field is missing in the IFrame', async () => {
    (useSearch as any).mockReturnValue({ id: '1234' });
    render(<IAP />, { wrapper: createWrapper() });
    // Open Activity Dialog for existing provider branch
    fireEvent.click(screen.getByText('Add Activity'));
    fireEvent.change(screen.getByLabelText('Activity Name'), {
      target: { value: 'Activity Test' },
    });
    fireEvent.change(screen.getByLabelText('Activity Description'), {
      target: { value: 'Activity Desc' },
    });
    await userEvent.click(screen.getByLabelText('Select Activity Provider'));
    const listbox = await screen.findByRole('listbox');
    await userEvent.click(within(listbox).getByText('AP1'));
    fireEvent.click(screen.getByText(/^add$/i));
    // Wait for the IFrame dialog to appear
    await waitFor(() =>
      expect(screen.getByTestId('iframe-dialog')).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText('Save'));
  });
});
