import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { CreateIAP } from './CreateIAP';
import { useActivityProvidersQuery } from '@/queries';
import {
  useCreateActivityMutation,
  useCreateActivityProviderMutation,
  useCreateGoalMutation,
  useCreateIAPMutation,
} from '@/mutations';

// Disable explicit-any lint for tests
/* eslint-disable @typescript-eslint/no-explicit-any */

vi.mock('@/mutations', () => ({
  useCreateActivityMutation: vi.fn(),
  useCreateActivityProviderMutation: vi.fn(),
  useCreateGoalMutation: vi.fn(),
  useCreateIAPMutation: vi.fn(),
}));

vi.mock('@/queries', () => ({
  useActivityProvidersQuery: vi.fn(),
  // The useIAPsQuery is no longer used in the updated component.
  IAPS_QUERY: 'iaps',
  ACTIVITY_PROVIDERS_QUERY: 'aps',
}));

vi.mock('@/components/CustomIFrame.tsx', () => ({
  CustomIFrame: () => <div data-testid="custom-iframe">Mocked IFrame</div>,
}));

vi.mock('@/services', () => ({
  graphQLService: {
    getConfigurationInterfaceUrl: vi.fn(() =>
      Promise.resolve('http://config-url.com'),
    ),
    getActivityProviderRequiredFields: vi.fn(() => Promise.resolve([])),
  },
}));

// Helper function to create a QueryClient for testing.
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: () => Promise.resolve({}),
      },
    },
  });

// Wrap the UI in a QueryClientProvider.
const renderWithClient = (ui: React.ReactNode) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
};

describe('CreateIAP', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for activity providers.
    (useActivityProvidersQuery as any).mockReturnValue({
      data: [
        {
          _id: 'provider-1',
          name: 'Provider One',
          description: 'Desc',
          url: 'http://provider-one.com',
        },
      ],
      isLoading: false,
    });
    // Default mocks for mutation hooks.
    (useCreateIAPMutation as any).mockReturnValue({ mutate: vi.fn() });
    (useCreateActivityMutation as any).mockReturnValue({ mutate: vi.fn() });
    (useCreateGoalMutation as any).mockReturnValue({ mutate: vi.fn() });
    (useCreateActivityProviderMutation as any).mockReturnValue({
      mutate: vi.fn(),
    });
  });

  it('renders the initial IAP Details step using a heading query', () => {
    renderWithClient(<CreateIAP />);
    expect(
      screen.getByRole('heading', { name: 'IAP Details', level: 6 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('shows a validation error if IAP details are invalid on Next', async () => {
    renderWithClient(<CreateIAP />);
    const nextButton = await screen.findByRole('button', { name: /next/i });
    await userEvent.click(nextButton);
    await waitFor(() => {
      expect(
        screen.getByText(
          /IAP Details: Name and Description must have at least 3 characters/i,
        ),
      ).toBeInTheDocument();
    });
  });

  it('shows error if IAP mutation returns no _id', async () => {
    const mutateMock = vi.fn((_, { onSuccess }) => onSuccess({}));
    (useCreateIAPMutation as any).mockReturnValue({ mutate: mutateMock });
    renderWithClient(<CreateIAP />);
    const nameInput = screen.getByLabelText('Name');
    const descriptionInput = screen.getByLabelText('Description');
    await userEvent.type(nameInput, 'Valid IAP Name');
    await userEvent.type(descriptionInput, 'Valid IAP Description');
    const nextButton = await screen.findByRole('button', { name: /next/i });
    await userEvent.click(nextButton);
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(
        screen.getByText(
          /No IAP ID returned. Please review IAP details and try again./i,
        ),
      ).toBeInTheDocument();
    });
  });

  it('proceeds to Activities step when IAP creation succeeds', async () => {
    const mutateMock = vi.fn((_, { onSuccess }) =>
      onSuccess({ _id: 'iap-123' }),
    );
    (useCreateIAPMutation as any).mockReturnValue({ mutate: mutateMock });
    renderWithClient(<CreateIAP />);
    const nameInput = screen.getByLabelText('Name');
    const descriptionInput = screen.getByLabelText('Description');
    await userEvent.type(nameInput, 'Valid IAP Name');
    await userEvent.type(descriptionInput, 'Valid IAP Description');
    const nextButton = await screen.findByRole('button', { name: /next/i });
    await userEvent.click(nextButton);
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Add Activities', level: 6 }),
      ).toBeInTheDocument();
    });
  });

  it('shows an error alert when IAP creation fails', async () => {
    const mutateMock = vi.fn((_, { onError }) =>
      onError(new Error('Creation Failed')),
    );
    (useCreateIAPMutation as any).mockReturnValue({ mutate: mutateMock });
    renderWithClient(<CreateIAP />);
    const nameInput = screen.getByLabelText('Name');
    const descriptionInput = screen.getByLabelText('Description');
    await userEvent.type(nameInput, 'Valid IAP Name');
    await userEvent.type(descriptionInput, 'Valid IAP Description');
    const nextButton = await screen.findByRole('button', { name: /next/i });
    await userEvent.click(nextButton);
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(
        screen.getByText(
          /Failed to create IAP\. Please review IAP details and try again/i,
        ),
      ).toBeInTheDocument();
    });
  });

  it('navigates back from Activities step to IAP Details step', async () => {
    const mutateMock = vi.fn((_, { onSuccess }) =>
      onSuccess({ _id: 'iap-123' }),
    );
    (useCreateIAPMutation as any).mockReturnValue({ mutate: mutateMock });
    renderWithClient(<CreateIAP />);
    const nameInput = screen.getByLabelText('Name');
    const descriptionInput = screen.getByLabelText('Description');
    await userEvent.type(nameInput, 'Valid IAP Name');
    await userEvent.type(descriptionInput, 'Valid IAP Description');
    const nextButton = await screen.findByRole('button', { name: /next/i });
    await userEvent.click(nextButton);
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Add Activities', level: 6 }),
      ).toBeInTheDocument();
    });
    const backButton = screen.getByRole('button', { name: /back/i });
    await userEvent.click(backButton);
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'IAP Details', level: 6 }),
      ).toBeInTheDocument();
    });
  });

  it('does not increment activeStep beyond the last step', async () => {
    const mutateMock = vi.fn((_, { onSuccess }) =>
      onSuccess({ _id: 'iap-123' }),
    );
    (useCreateIAPMutation as any).mockReturnValue({ mutate: mutateMock });
    renderWithClient(<CreateIAP />);
    const nameInput = screen.getByLabelText('Name');
    const descriptionInput = screen.getByLabelText('Description');
    await userEvent.type(nameInput, 'Valid IAP Name');
    await userEvent.type(descriptionInput, 'Valid IAP Description');
    const nextButton = await screen.findByRole('button', { name: /next/i });
    // Click Next to go from IAP Details (step 0) to Activities (step 1)
    await userEvent.click(nextButton);
    // Then click Next again to go to Goals (step 2)
    const nextButtonStep1 = await screen.findByRole('button', {
      name: /next/i,
    });
    await userEvent.click(nextButtonStep1);
    expect(
      screen.queryByRole('button', { name: /next/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /complete/i }),
    ).toBeInTheDocument();
  });

  describe('Activity Dialog and Addition', () => {
    beforeEach(async () => {
      const mutateMock = vi.fn((_, { onSuccess }) =>
        onSuccess({ _id: 'iap-123' }),
      );
      (useCreateIAPMutation as any).mockReturnValue({ mutate: mutateMock });
      renderWithClient(<CreateIAP />);
      await userEvent.type(screen.getByLabelText('Name'), 'Valid IAP Name');
      await userEvent.type(
        screen.getByLabelText('Description'),
        'Valid IAP Description',
      );
      const nextButton = await screen.findByRole('button', { name: /next/i });
      await userEvent.click(nextButton);
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Add Activities', level: 6 }),
        ).toBeInTheDocument();
      });
    });

    it('resets Activity Dialog fields on open', async () => {
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
      await userEvent.click(within(listbox).getByText('Provider One'));
      await userEvent.click(screen.getByRole('button', { name: /^add$/i }));
      await waitFor(() =>
        expect(screen.getByTestId('iframe-dialog')).toBeInTheDocument(),
      );
    });

    it('submits the IFrame configuration and adds the activity', async () => {
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
      await userEvent.click(within(listbox).getByText('Provider One'));
      await userEvent.click(screen.getByRole('button', { name: /^add$/i }));
      await waitFor(() =>
        expect(screen.getByTestId('iframe-dialog')).toBeInTheDocument(),
      );
      await userEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(screen.queryByTestId('iframe-dialog')).not.toBeInTheDocument();
        expect(
          screen.getByText(/Activity 1: Valid Activity/i),
        ).toBeInTheDocument();
      });
    });

    it('shows error if new provider creation did not return an ID', async () => {
      const newProviderMutateMock = vi.fn((_, { onSuccess }) => onSuccess({}));
      (useCreateActivityProviderMutation as any).mockReturnValue({
        mutate: newProviderMutateMock,
      });
      const mutateMock = vi.fn((_, { onSuccess }) =>
        onSuccess({ _id: 'iap-123' }),
      );
      (useCreateIAPMutation as any).mockReturnValue({ mutate: mutateMock });
      renderWithClient(<CreateIAP />);
      const nameInput = screen.getByLabelText('Name');
      const descriptionInput = screen.getByLabelText('Description');
      await userEvent.type(nameInput, 'Valid IAP Name');
      await userEvent.type(descriptionInput, 'Valid IAP Description');
      // Click Next to create IAP
      const nextButtons = screen.getAllByRole('button', { name: /next/i });
      await userEvent.click(nextButtons[1]);
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

  describe('IFrame Dialog Cancel', () => {
    it('closes the IFrame dialog when Cancel is clicked', async () => {
      const mutateMock = vi.fn((_, { onSuccess }) =>
        onSuccess({ _id: 'iap-123' }),
      );
      (useCreateIAPMutation as any).mockReturnValue({ mutate: mutateMock });
      renderWithClient(<CreateIAP />);
      const nameInput = screen.getByLabelText('Name');
      const descriptionInput = screen.getByLabelText('Description');
      await userEvent.type(nameInput, 'Valid IAP Name');
      await userEvent.type(descriptionInput, 'Valid IAP Description');
      const nextButton = await screen.findByRole('button', { name: /next/i });
      await userEvent.click(nextButton);
      // Open Activity Dialog and fill required fields to trigger IFrame dialog.
      const addActivityButton = screen.getByRole('button', {
        name: /add activity/i,
      });
      await userEvent.click(addActivityButton);
      const activityNameInput = screen.getByLabelText('Activity Name');
      const activityDescriptionInput = screen.getByLabelText(
        'Activity Description',
      );
      await userEvent.type(activityNameInput, 'Test Activity');
      await userEvent.type(activityDescriptionInput, 'Test Desc');
      const providerSelect = screen.getByLabelText('Select Activity Provider');
      await userEvent.click(providerSelect);
      const listbox = await screen.findByRole('listbox');
      await userEvent.click(within(listbox).getByText('Provider One'));
      const addButton = screen.getByRole('button', { name: /^add$/i });
      await userEvent.click(addButton);
      await waitFor(() =>
        expect(screen.getByTestId('iframe-dialog')).toBeInTheDocument(),
      );
      // Click Cancel in IFrame dialog
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);
      await waitFor(() => {
        expect(screen.queryByTestId('iframe-dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Goal Dialog and Addition', () => {
    beforeEach(async () => {
      const mutateMock = vi.fn((_, { onSuccess }) =>
        onSuccess({ _id: 'iap-123' }),
      );
      (useCreateIAPMutation as any).mockReturnValue({ mutate: mutateMock });
      renderWithClient(<CreateIAP />);
      const nameInput = screen.getByLabelText('Name');
      const descriptionInput = screen.getByLabelText('Description');
      await userEvent.type(nameInput, 'Valid IAP Name');
      await userEvent.type(descriptionInput, 'Valid IAP Description');
      const nextButton = await screen.findByRole('button', { name: /next/i });
      await userEvent.click(nextButton);
      // Advance to Goals step by clicking Next on Activities step.
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Add Activities', level: 6 }),
        ).toBeInTheDocument();
      });
      await userEvent.click(nextButton);
      await waitFor(() => {
        const headings = screen.getAllByRole('heading', {
          name: 'Add Goals',
          level: 6,
        });
        expect(headings[headings.length - 1]).toBeInTheDocument();
      });
    });

    it('opens the Goal Dialog when clicking "Add Goal"', async () => {
      const addGoalButton = screen.getByRole('button', { name: /add goal/i });
      await userEvent.click(addGoalButton);
      await waitFor(() => {
        expect(screen.getByTestId('goal-dialog')).toBeInTheDocument();
      });
      expect(screen.getByLabelText('Goal Name')).toBeInTheDocument();
    });

    it('shows a validation error in the Goal Dialog if fields are missing', async () => {
      const addGoalButton = screen.getByRole('button', { name: /add goal/i });
      await userEvent.click(addGoalButton);
      const dialogAddButton = screen.getByRole('button', { name: /^add$/i });
      await userEvent.click(dialogAddButton);
      await waitFor(() => {
        expect(
          screen.getByText(/All goal fields are required/i),
        ).toBeInTheDocument();
      });
    });

    it('adds a goal successfully when valid fields are provided', async () => {
      const addGoalButton = screen.getByRole('button', { name: /add goal/i });
      await userEvent.click(addGoalButton);
      const goalNameInput = screen.getByLabelText('Goal Name');
      const goalDescriptionInput = screen.getByLabelText('Goal Description');
      const formulaInput = screen.getByLabelText('Formula');
      const targetValueInput = screen.getByLabelText('Target Value');
      await userEvent.clear(goalNameInput);
      await userEvent.type(goalNameInput, 'Goal 1');
      await userEvent.clear(goalDescriptionInput);
      await userEvent.type(goalDescriptionInput, 'Goal Desc');
      await userEvent.clear(formulaInput);
      await userEvent.type(formulaInput, 'SUM(A)');
      await userEvent.clear(targetValueInput);
      await userEvent.type(targetValueInput, '100');
      const dialogAddButton = screen.getByRole('button', { name: /^add$/i });
      await userEvent.click(dialogAddButton);
      await waitFor(() => {
        const headings = screen.getAllByRole('heading', {
          name: 'Add Goals',
          level: 6,
        });
        expect(headings[headings.length - 1]).toBeInTheDocument();
        expect(
          screen.getByText(/Goal 1: Goal 1 – SUM\(A\)/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Complete Handler', () => {
    beforeEach(async () => {
      // Simulate navigation and adding one activity and one goal.
      const mutateIAPMock = vi.fn((_, { onSuccess }) =>
        onSuccess({ _id: 'iap-123' }),
      );
      (useCreateIAPMutation as any).mockReturnValue({ mutate: mutateIAPMock });
      renderWithClient(<CreateIAP />);
      const nameInput = screen.getByLabelText('Name');
      const descriptionInput = screen.getByLabelText('Description');
      await userEvent.type(nameInput, 'Valid IAP Name');
      await userEvent.type(descriptionInput, 'Valid IAP Description');
      const nextButton = await screen.findByRole('button', { name: /next/i });
      await userEvent.click(nextButton);
      // Add an activity.
      const addActivityButton = screen.getByRole('button', {
        name: /add activity/i,
      });
      await userEvent.click(addActivityButton);
      const activityNameInput = screen.getByLabelText('Activity Name');
      const activityDescriptionInput = screen.getByLabelText(
        'Activity Description',
      );
      await userEvent.clear(activityNameInput);
      await userEvent.type(activityNameInput, 'Test Activity');
      await userEvent.clear(activityDescriptionInput);
      await userEvent.type(activityDescriptionInput, 'Test Desc');
      const providerSelect = screen.getByLabelText('Select Activity Provider');
      await userEvent.click(providerSelect);
      const listbox = await screen.findByRole('listbox');
      await userEvent.click(within(listbox).getByText('Provider One'));
      const addButton = screen.getByRole('button', { name: /^add$/i });
      await userEvent.click(addButton);
      // Wait for IFrame dialog and then save it.
      await waitFor(() =>
        expect(screen.getByTestId('iframe-dialog')).toBeInTheDocument(),
      );
      const saveButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(saveButton);
      // Move to Goals step.
      await userEvent.click(nextButton);
      await waitFor(() => {
        const headings = screen.getAllByRole('heading', {
          name: 'Add Goals',
          level: 6,
        });
        expect(headings[headings.length - 1]).toBeInTheDocument();
      });
      // Add a goal.
      const addGoalButton = screen.getByRole('button', { name: /add goal/i });
      await userEvent.click(addGoalButton);
      const goalNameInput = screen.getByLabelText('Goal Name');
      const goalDescriptionInput = screen.getByLabelText('Goal Description');
      const formulaInput = screen.getByLabelText('Formula');
      const targetValueInput = screen.getByLabelText('Target Value');
      await userEvent.clear(goalNameInput);
      await userEvent.type(goalNameInput, 'Goal 1');
      await userEvent.clear(goalDescriptionInput);
      await userEvent.type(goalDescriptionInput, 'Goal Desc');
      await userEvent.clear(formulaInput);
      await userEvent.type(formulaInput, 'SUM(A)');
      await userEvent.clear(targetValueInput);
      await userEvent.type(targetValueInput, '100');
      const goalAddButton = screen.getByRole('button', { name: /^add$/i });
      await userEvent.click(goalAddButton);
      // Wait until the goal dialog is closed.
      await waitFor(() => {
        expect(screen.queryByTestId('goal-dialog')).not.toBeInTheDocument();
      });
    });

    it('shows an error if no activities are added on complete', async () => {
      // Re-render component so that no activity is added.
      renderWithClient(<CreateIAP />);
      const nameInput = screen.getByLabelText('Name');
      const descriptionInput = screen.getByLabelText('Description');
      await userEvent.type(nameInput, 'Valid IAP Name');
      await userEvent.type(descriptionInput, 'Valid IAP Description');
      // Move from IAP Details (step 0) to Activities (step 1)
      const nextBtn0 = await screen.findByRole('button', { name: /next/i });
      await userEvent.click(nextBtn0);
      // Without adding any activity, click Next to move to Goals (step 2)
      const nextBtn1 = await screen.findByRole('button', { name: /next/i });
      await userEvent.click(nextBtn1);
      await waitFor(() => {
        const headings = screen.getAllByRole('heading', {
          name: 'Add Goals',
          level: 6,
        });
        expect(headings[headings.length - 1]).toBeInTheDocument();
      });
      const completeBtn = await screen.findAllByRole('button', {
        name: /complete/i,
      });
      await userEvent.click(completeBtn[1]);
      await waitFor(() => {
        expect(
          screen.getByText(/Please add at least one activity/i),
        ).toBeInTheDocument();
      });
    });

    it('shows an error if no goals are added on complete', async () => {
      renderWithClient(<CreateIAP />);
      const nameInput = screen.getByLabelText('Name');
      const descriptionInput = screen.getByLabelText('Description');
      await userEvent.type(nameInput, 'Valid IAP Name');
      await userEvent.type(descriptionInput, 'Valid IAP Description');
      // Move from IAP Details (step 0) to Activities (step 1)
      const nextBtn0 = await screen.findByRole('button', { name: /next/i });
      await userEvent.click(nextBtn0);
      // Add an activity.
      const addActivityButton = screen.getByRole('button', {
        name: /add activity/i,
      });
      await userEvent.click(addActivityButton);
      const activityNameInput = screen.getByLabelText('Activity Name');
      const activityDescriptionInput = screen.getByLabelText(
        'Activity Description',
      );
      await userEvent.clear(activityNameInput);
      await userEvent.type(activityNameInput, 'Test Activity');
      await userEvent.clear(activityDescriptionInput);
      await userEvent.type(activityDescriptionInput, 'Test Desc');
      const providerSelect = screen.getByLabelText('Select Activity Provider');
      await userEvent.click(providerSelect);
      const listbox = await screen.findByRole('listbox');
      await userEvent.click(within(listbox).getByText('Provider One'));
      const addButton = screen.getByRole('button', { name: /^add$/i });
      await userEvent.click(addButton);
      await waitFor(() => {
        expect(screen.getByTestId('iframe-dialog')).toBeInTheDocument();
      });
      const saveButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(saveButton);
      // Now move to Goals step.
      const nextBtn1 = await screen.findByRole('button', { name: /next/i });
      await userEvent.click(nextBtn1);
      await waitFor(() => {
        const headings = screen.getAllByRole('heading', {
          name: 'Add Goals',
          level: 6,
        });
        expect(headings[headings.length - 1]).toBeInTheDocument();
      });
      // Do not add any goal and click Complete.
      const completeBtn = await screen.findAllByRole('button', {
        name: /complete/i,
      });
      await userEvent.click(completeBtn[1]);
      await waitFor(() => {
        expect(
          screen.getByText(/Please add at least one goal/i),
        ).toBeInTheDocument();
      });
    });

    describe('Additional Tests for Complete Handler - Success Flow', () => {
      it('completes the IAP creation successfully', async () => {
        const iapMutateMock = vi.fn((_, { onSuccess }) =>
          onSuccess({ _id: 'iap-123' }),
        );
        (useCreateIAPMutation as any).mockReturnValue({
          mutate: iapMutateMock,
        });
        const activityMutateMock = vi.fn((_, { onSuccess }) => onSuccess());
        (useCreateActivityMutation as any).mockReturnValue({
          mutate: activityMutateMock,
        });
        const goalMutateMock = vi.fn((_, { onSuccess }) => onSuccess());
        (useCreateGoalMutation as any).mockReturnValue({
          mutate: goalMutateMock,
        });

        const onSuccessCallback = vi.fn();
        renderWithClient(<CreateIAP onSuccess={onSuccessCallback} />);

        // Fill IAP Details.
        const nameInput = screen.getByLabelText('Name');
        const descriptionInput = screen.getByLabelText('Description');
        await userEvent.type(nameInput, 'Valid IAP Name');
        await userEvent.type(descriptionInput, 'Valid IAP Description');
        const nextButton = await screen.findByRole('button', { name: /next/i });
        await userEvent.click(nextButton);
        await waitFor(() => {
          expect(
            screen.getByRole('heading', { name: 'Add Activities', level: 6 }),
          ).toBeInTheDocument();
        });

        // Add an activity (using existing provider).
        const addActivityButton = screen.getByRole('button', {
          name: /add activity/i,
        });
        await userEvent.click(addActivityButton);
        const activityNameInput = screen.getByLabelText('Activity Name');
        const activityDescriptionInput = screen.getByLabelText(
          'Activity Description',
        );
        await userEvent.type(activityNameInput, 'Test Activity');
        await userEvent.type(activityDescriptionInput, 'Test Desc');
        const providerSelect = screen.getByLabelText(
          'Select Activity Provider',
        );
        await userEvent.click(providerSelect);
        const listbox = await screen.findByRole('listbox');
        await userEvent.click(within(listbox).getByText('Provider One'));
        const addButton = screen.getByRole('button', { name: /^add$/i });
        await userEvent.click(addButton);
        await waitFor(() =>
          expect(screen.getByTestId('iframe-dialog')).toBeInTheDocument(),
        );
        const saveButton = screen.getByRole('button', { name: /save/i });
        await userEvent.click(saveButton);

        // Navigate to Goals step.
        await userEvent.click(nextButton);
        await waitFor(() => {
          const headings = screen.getAllByRole('heading', {
            name: 'Add Goals',
            level: 6,
          });
          expect(headings[headings.length - 1]).toBeInTheDocument();
        });

        // Add a goal.
        const addGoalButtons = screen.getAllByRole('button', {
          name: /add goal/i,
        });
        // Use the second "Add Goal" button if more than one is rendered.
        await userEvent.click(addGoalButtons[addGoalButtons.length - 1]);
        const goalNameInput = screen.getByLabelText('Goal Name');
        const goalDescriptionInput = screen.getByLabelText('Goal Description');
        const formulaInput = screen.getByLabelText('Formula');
        const targetValueInput = screen.getByLabelText('Target Value');
        await userEvent.type(goalNameInput, 'Goal Success');
        await userEvent.type(goalDescriptionInput, 'Goal Desc');
        await userEvent.type(formulaInput, 'SUM(A)');
        await userEvent.type(targetValueInput, '100');
        const goalAddButton = screen.getByRole('button', { name: /^add$/i });
        await userEvent.click(goalAddButton);
        await waitFor(() => {
          expect(screen.queryByTestId('goal-dialog')).not.toBeInTheDocument();
        });

        // Now the "Complete" button should be rendered.
        const completeButtons = screen.getAllByRole('button', {
          name: /complete/i,
        });
        await userEvent.click(completeButtons[completeButtons.length - 1]);
        await waitFor(() => {
          expect(
            screen.getByText(/IAP created successfully!/i),
          ).toBeInTheDocument();
        });
        expect(onSuccessCallback).toHaveBeenCalled();
      });
    });

    describe('Additional Tests for Complete Handler - Error Flows', () => {
      it('handles error when activity creation fails during complete', async () => {
        const iapMutateMock = vi.fn((_, { onSuccess }) =>
          onSuccess({ _id: 'iap-123' }),
        );
        (useCreateIAPMutation as any).mockReturnValue({
          mutate: iapMutateMock,
        });
        // Simulate activity mutation failure.
        const activityMutateMock = vi.fn((_, { onError }) =>
          onError(new Error('Activity creation failed')),
        );
        (useCreateActivityMutation as any).mockReturnValue({
          mutate: activityMutateMock,
        });
        // For goal mutation, provide a success mock (won't be reached).
        const goalMutateMock = vi.fn((_, { onSuccess }) => onSuccess());
        (useCreateGoalMutation as any).mockReturnValue({
          mutate: goalMutateMock,
        });

        renderWithClient(<CreateIAP />);

        // Fill IAP Details.
        const nameInput = screen.getByLabelText('Name');
        const descriptionInput = screen.getByLabelText('Description');
        await userEvent.type(nameInput, 'Valid IAP Name');
        await userEvent.type(descriptionInput, 'Valid IAP Description');
        const nextButton = await screen.findByRole('button', { name: /next/i });
        await userEvent.click(nextButton);
        await waitFor(() => {
          expect(
            screen.getByRole('heading', { name: 'Add Activities', level: 6 }),
          ).toBeInTheDocument();
        });

        // Add an activity.
        const addActivityButton = screen.getByRole('button', {
          name: /add activity/i,
        });
        await userEvent.click(addActivityButton);
        const activityNameInput = screen.getByLabelText('Activity Name');
        const activityDescriptionInput = screen.getByLabelText(
          'Activity Description',
        );
        await userEvent.type(activityNameInput, 'Test Activity Fail');
        await userEvent.type(activityDescriptionInput, 'Test Desc');
        const providerSelect = screen.getByLabelText(
          'Select Activity Provider',
        );
        await userEvent.click(providerSelect);
        const listbox = await screen.findByRole('listbox');
        await userEvent.click(within(listbox).getByText('Provider One'));
        const addButton = screen.getByRole('button', { name: /^add$/i });
        await userEvent.click(addButton);
        await waitFor(() =>
          expect(screen.getByTestId('iframe-dialog')).toBeInTheDocument(),
        );
        const saveButton = screen.getByRole('button', { name: /save/i });
        await userEvent.click(saveButton);

        // Navigate to Goals step.
        await userEvent.click(nextButton);
        await waitFor(() => {
          const headings = screen.getAllByRole('heading', {
            name: 'Add Goals',
            level: 6,
          });
          expect(headings[headings.length - 1]).toBeInTheDocument();
        });

        // Add a goal.
        const addGoalButtons = screen.getAllByRole('button', {
          name: /add goal/i,
        });
        await userEvent.click(addGoalButtons[addGoalButtons.length - 1]);
        const goalNameInput = screen.getByLabelText('Goal Name');
        const goalDescriptionInput = screen.getByLabelText('Goal Description');
        const formulaInput = screen.getByLabelText('Formula');
        const targetValueInput = screen.getByLabelText('Target Value');
        await userEvent.type(goalNameInput, 'Goal Fail');
        await userEvent.type(goalDescriptionInput, 'Goal Desc');
        await userEvent.type(formulaInput, 'SUM(A)');
        await userEvent.type(targetValueInput, '100');
        const goalAddButton = screen.getByRole('button', { name: /^add$/i });
        await userEvent.click(goalAddButton);
        await waitFor(() => {
          expect(screen.queryByTestId('goal-dialog')).not.toBeInTheDocument();
        });

        // Attempt to complete the process.
        const completeButtons = screen.getAllByRole('button', {
          name: /complete/i,
        });
        await userEvent.click(completeButtons[completeButtons.length - 1]);
        await waitFor(() => {
          expect(
            screen.getByRole('heading', { name: 'Add Activities', level: 6 }),
          ).toBeInTheDocument();
        });
      });

      it('handles error when goal creation fails during complete', async () => {
        const iapMutateMock = vi.fn((_, { onSuccess }) =>
          onSuccess({ _id: 'iap-123' }),
        );
        (useCreateIAPMutation as any).mockReturnValue({
          mutate: iapMutateMock,
        });
        const activityMutateMock = vi.fn((_, { onSuccess }) => onSuccess());
        (useCreateActivityMutation as any).mockReturnValue({
          mutate: activityMutateMock,
        });
        // Simulate goal mutation failure.
        const goalMutateMock = vi.fn((_, { onError }) =>
          onError(new Error('Goal creation failed')),
        );
        (useCreateGoalMutation as any).mockReturnValue({
          mutate: goalMutateMock,
        });

        renderWithClient(<CreateIAP />);

        // Fill IAP Details.
        const nameInput = screen.getByLabelText('Name');
        const descriptionInput = screen.getByLabelText('Description');
        await userEvent.type(nameInput, 'Valid IAP Name');
        await userEvent.type(descriptionInput, 'Valid IAP Description');
        const nextButton = await screen.findByRole('button', { name: /next/i });
        await userEvent.click(nextButton);
        await waitFor(() => {
          expect(
            screen.getByRole('heading', { name: 'Add Activities', level: 6 }),
          ).toBeInTheDocument();
        });

        // Add an activity.
        const addActivityButton = screen.getByRole('button', {
          name: /add activity/i,
        });
        await userEvent.click(addActivityButton);
        const activityNameInput = screen.getByLabelText('Activity Name');
        const activityDescriptionInput = screen.getByLabelText(
          'Activity Description',
        );
        await userEvent.type(activityNameInput, 'Test Activity');
        await userEvent.type(activityDescriptionInput, 'Test Desc');
        const providerSelect = screen.getByLabelText(
          'Select Activity Provider',
        );
        await userEvent.click(providerSelect);
        const listbox = await screen.findByRole('listbox');
        await userEvent.click(within(listbox).getByText('Provider One'));
        const addButton = screen.getByRole('button', { name: /^add$/i });
        await userEvent.click(addButton);
        await waitFor(() =>
          expect(screen.getByTestId('iframe-dialog')).toBeInTheDocument(),
        );
        const saveButton = screen.getByRole('button', { name: /save/i });
        await userEvent.click(saveButton);

        // Navigate to Goals step.
        await userEvent.click(nextButton);
        await waitFor(() => {
          const headings = screen.getAllByRole('heading', {
            name: 'Add Goals',
            level: 6,
          });
          expect(headings[headings.length - 1]).toBeInTheDocument();
        });

        // Add a goal.
        const addGoalButtons = screen.getAllByRole('button', {
          name: /add goal/i,
        });
        await userEvent.click(addGoalButtons[addGoalButtons.length - 1]);
        const goalNameInput = screen.getByLabelText('Goal Name');
        const goalDescriptionInput = screen.getByLabelText('Goal Description');
        const formulaInput = screen.getByLabelText('Formula');
        const targetValueInput = screen.getByLabelText('Target Value');
        await userEvent.type(goalNameInput, 'Goal Test');
        await userEvent.type(goalDescriptionInput, 'Goal Desc');
        await userEvent.type(formulaInput, 'SUM(A)');
        await userEvent.type(targetValueInput, '100');
        const goalAddButton = screen.getByRole('button', { name: /^add$/i });
        await userEvent.click(goalAddButton);
        await waitFor(() => {
          expect(screen.queryByTestId('goal-dialog')).not.toBeInTheDocument();
        });

        // Attempt to complete the process.
        const completeButtons = screen.getAllByRole('button', {
          name: /complete/i,
        });
        await userEvent.click(completeButtons[completeButtons.length - 1]);
        await waitFor(() => {
          const headings = screen.getAllByRole('heading', {
            name: 'Add Goals',
            level: 6,
          });
          expect(headings[headings.length - 1]).toBeInTheDocument();
        });
      });
    });
  });
});
