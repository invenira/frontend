import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  MenuItem,
  Paper,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import {
  ACTIVITY_PROVIDERS_QUERY,
  IAPS_QUERY,
  useActivityProvidersQuery,
} from '@/queries';
import {
  useCreateActivityMutation,
  useCreateActivityProviderMutation,
  useCreateGoalMutation,
  useCreateIAPMutation,
} from '@/mutations';
import {
  ActivityProviderGqlSchema,
  CreateActivityInput,
  CreateGoalInput,
  IapgqlSchema,
} from '@/graphql/graphql.ts';
import { useQueryClient } from '@tanstack/react-query';
import { CustomIFrame } from '@/components';
import { graphQLService } from '@/services';

interface Activity {
  createActivityInput: CreateActivityInput;
}

export type CreateIAPProps = {
  onSuccess?: () => void;
};

export const CreateIAP = (props: CreateIAPProps) => {
  const queryClient = useQueryClient();
  const steps = ['IAP Details', 'Add Activities', 'Add Goals'];
  const [activeStep, setActiveStep] = useState(0);
  const [errorSteps, setErrorSteps] = useState<boolean[]>([
    false,
    false,
    false,
  ]);

  // Alert dialog state
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [alertDialogTitle, setAlertDialogTitle] = useState('');
  const [alertDialogMessage, setAlertDialogMessage] = useState('');
  const showAlert = (title: string, message: string) => {
    setAlertDialogTitle(title);
    setAlertDialogMessage(message);
    setAlertDialogOpen(true);
  };

  // Step 1: IAP Details
  const [iapName, setIapName] = useState('');
  const [iapDescription, setIapDescription] = useState('');
  const [iapId, setIapId] = useState<string>('');

  // Step 2: Activities
  const [activities, setActivities] = useState<Activity[]>([]);
  const { data: activityProviders, isLoading: loadingProviders } =
    useActivityProvidersQuery();

  // Fields for the Activity itself
  const [activityName, setActivityName] = useState('');
  const [activityDescription, setActivityDescription] = useState('');

  // Dialog state for adding an activity
  const [openActivityDialog, setOpenActivityDialog] = useState(false);
  const [activityProviderType, setActivityProviderType] = useState<
    'existing' | 'new'
  >('existing');
  const [selectedProviderId, setSelectedProviderId] = useState('');
  // Fields for a new provider (if providerType === 'new')
  const [newProviderName, setNewProviderName] = useState('');
  const [newProviderDescription, setNewProviderDescription] = useState('');
  const [newProviderUrl, setNewProviderUrl] = useState('');

  const [apConfigUrl, setApConfigUrl] = useState('');

  useEffect(() => {
    graphQLService
      .getConfigurationInterfaceUrl(selectedProviderId)
      .then((url) => setApConfigUrl(url));
  }, [selectedProviderId]);

  // Step 3: Goals
  const [goals, setGoals] = useState<CreateGoalInput[]>([]);
  const [openGoalDialog, setOpenGoalDialog] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalFormula, setGoalFormula] = useState('');
  const [goalTargetValue, setGoalTargetValue] = useState('');

  // Mutation hooks
  const iapMutation = useCreateIAPMutation();
  const activityMutation = useCreateActivityMutation();
  const goalsMutation = useCreateGoalMutation();
  const activityProviderMutation = useCreateActivityProviderMutation();

  // Creation progress state
  const [creationProgress, setCreationProgress] = useState(0);
  const [isCreating, setIsCreating] = useState(false);

  // For the Fullscreen IFrame Config Interface
  const [openIFrameDialog, setOpenIFrameDialog] = useState(false);
  const [pendingActivity, setPendingActivity] = useState<Activity | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Navigation Handler for Next
  const handleNext = async () => {
    if (activeStep === 0) {
      if (iapName.trim().length < 3 || iapDescription.trim().length < 3) {
        showAlert(
          'Validation Error',
          'IAP Details: Name and Description must have at least 3 characters.',
        );
        return;
      }
      if (!iapId) {
        try {
          setIsCreating(true);
          setCreationProgress(33);
          const iapResponse = await new Promise<Partial<IapgqlSchema>>(
            (resolve, reject) => {
              iapMutation.mutate(
                { name: iapName, description: iapDescription },
                {
                  onSuccess: (data) => {
                    queryClient
                      .invalidateQueries({ queryKey: [IAPS_QUERY] })
                      .then(() => resolve(data));
                  },
                  onError: (error) => reject(error),
                },
              );
            },
          );
          if (!iapResponse._id) {
            const newErrorSteps = [...errorSteps];
            newErrorSteps[0] = true;
            setErrorSteps(newErrorSteps);
            showAlert(
              'Error',
              'No IAP ID returned. Please review IAP details and try again.',
            );
            setIsCreating(false);
            setCreationProgress(0);
            return;
          }
          setIapId(iapResponse._id);
          setCreationProgress(100);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          const newErrorSteps = [...errorSteps];
          newErrorSteps[0] = true;
          setErrorSteps(newErrorSteps);
          showAlert(
            'Error',
            'Failed to create IAP. Please review IAP details and try again.',
          );
          setIsCreating(false);
          setCreationProgress(0);
          return;
        } finally {
          setIsCreating(false);
          setCreationProgress(0);
        }
      }
      // If IAP creation succeeded, clear any error and move to Step 2.
      const newErrorSteps = [...errorSteps];
      newErrorSteps[0] = false;
      setErrorSteps(newErrorSteps);
      setActiveStep(1);
    } else {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  // Activity Dialog Handlers
  const handleOpenActivityDialog = () => {
    // Reset all fields
    setActivityProviderType('existing');
    setSelectedProviderId('');
    setNewProviderName('');
    setNewProviderDescription('');
    setNewProviderUrl('');
    setActivityName('');
    setActivityDescription('');
    setOpenActivityDialog(true);
  };

  const handleCloseActivityDialog = () => {
    setOpenActivityDialog(false);
  };

  const handleAddActivity = async () => {
    if (
      activityName.trim().length < 3 ||
      activityDescription.trim().length < 3
    ) {
      showAlert(
        'Validation Error',
        'Activity Name and Description must have at least 3 characters.',
      );
      return;
    }
    if (activityProviderType === 'existing') {
      // Set pending activity for existing provider
      setPendingActivity({
        createActivityInput: {
          name: activityName.trim(),
          description: activityDescription.trim(),
          activityProviderId: selectedProviderId,
          parameters: { test: 'test' },
        },
      });
      setOpenIFrameDialog(true);
    } else if (activityProviderType === 'new') {
      if (
        newProviderName.trim().length < 3 ||
        newProviderDescription.trim().length < 3 ||
        newProviderUrl.trim().length === 0
      ) {
        showAlert(
          'Validation Error',
          'Please fill in the required fields for new provider (min 3 characters for name and description, and URL is required).',
        );
        return;
      }
      try {
        const newProviderResponse = await new Promise<
          Partial<ActivityProviderGqlSchema>
        >((resolve, reject) => {
          activityProviderMutation.mutate(
            {
              createActivityProviderInput: {
                name: newProviderName.trim(),
                description: newProviderDescription.trim(),
                url: newProviderUrl.trim(),
              },
            },
            {
              onSuccess: (data) => {
                queryClient
                  .invalidateQueries({
                    queryKey: [ACTIVITY_PROVIDERS_QUERY, IAPS_QUERY],
                  })
                  .then(() => resolve(data));
              },
              onError: (error) => reject(error),
            },
          );
        });
        if (!newProviderResponse._id) {
          showAlert('Error', 'New provider creation did not return an ID.');
          return;
        }
        setSelectedProviderId(newProviderResponse._id);
        setTimeout(() => {
          setPendingActivity({
            createActivityInput: {
              name: activityName.trim(),
              description: activityDescription.trim(),
              activityProviderId: newProviderResponse._id,
              parameters: { test: 'test' },
            },
          });
          setOpenIFrameDialog(true);
        }, 200);
      } catch (error) {
        console.log(error);
        showAlert(
          'Error',
          'Failed to create new activity provider. Please review the details and try again.',
        );
        return;
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const findFieldValue = (name: string, parent: any): string | undefined => {
    //if (parent?.tagName && parent?.tagName?.toLowerCase() === 'input') {
    //  return parent.value;
    //}

    if (parent?.name === name) {
      return parent.value;
    }

    // Recursively iterate over the element's children.
    for (let i = 0; i < parent?.children?.length; i++) {
      const found = findFieldValue(name, parent.children[i]);
      if (found) {
        return found;
      }
    }

    return undefined;
  };

  // Callback from CustomIFrame – receives the scraped values.
  const handleIFrameSubmit = () => {
    graphQLService
      .getActivityProviderRequiredFields(selectedProviderId)
      .then((fields) => {
        const params = new Map<string, string>();
        let value;
        for (const field of fields) {
          const els = dialogRef?.current?.children || [];
          for (const el of els) {
            value = findFieldValue(field, el);
            if (value) {
              break;
            }
          }

          if (!value || value.trim().length === 0) {
            showAlert(
              'Configuration Error',
              `Unable to read required field "${field}" or its empty. Activity not added.`,
            );
            setOpenIFrameDialog(false);
            return;
          }

          params.set(field, value);
        }
        // If scraping succeeds, add the pending activity.
        if (pendingActivity) {
          const act = {
            ...pendingActivity,
            createActivityInput: {
              ...pendingActivity.createActivityInput,
              parameters: Object.fromEntries(params),
            },
          };

          setActivities([...activities, act]);
        }
        setPendingActivity(null);
        setOpenIFrameDialog(false);
        setOpenActivityDialog(false);
      });
  };

  const handleIFrameCancel = () => {
    setPendingActivity(null);
    setOpenIFrameDialog(false);
  };

  // Goal Dialog Handlers
  const handleOpenGoalDialog = () => {
    setGoalName('');
    setGoalDescription('');
    setGoalFormula('');
    setGoalTargetValue('');
    setOpenGoalDialog(true);
  };

  const handleCloseGoalDialog = () => {
    setOpenGoalDialog(false);
  };

  const handleAddGoal = () => {
    if (goalName && goalDescription && goalFormula && goalTargetValue) {
      setGoals([
        ...goals,
        {
          name: goalName,
          description: goalDescription,
          formula: goalFormula,
          targetValue: Number(goalTargetValue),
        },
      ]);
      setOpenGoalDialog(false);
    } else {
      showAlert('Validation Error', 'All goal fields are required.');
    }
  };

  // Complete Handler
  const handleComplete = async () => {
    if (!iapId) {
      showAlert('Error', 'IAP ID is missing. Please complete IAP Details.');
      return;
    }
    if (activities.length === 0) {
      showAlert('Validation Error', 'Please add at least one activity.');
      return;
    }
    if (goals.length === 0) {
      showAlert('Validation Error', 'Please add at least one goal.');
      return;
    }
    setIsCreating(true);
    setCreationProgress(0);
    const newErrorSteps = [false, false, false];

    // Create each activity.
    try {
      for (const activity of activities) {
        await new Promise<void>((resolve, reject) => {
          activityMutation.mutate(
            {
              iapId,
              createActivityInput: activity.createActivityInput,
            },
            { onSuccess: () => resolve(), onError: (error) => reject(error) },
          );
        });
      }
    } catch (error) {
      console.log(error);
      newErrorSteps[1] = true;
      setErrorSteps(newErrorSteps);
      setActiveStep(1);
      setIsCreating(false);
      return;
    }

    // Create goals.
    try {
      for (const goal of goals) {
        await new Promise<void>((res, rej) => {
          goalsMutation.mutate(
            { iapId, createGoalInput: goal },
            { onSuccess: () => res(), onError: (error) => rej(error) },
          );
        });
      }
      setCreationProgress(100);
      showAlert('Success', 'IAP created successfully!');
      if (props.onSuccess) {
        props.onSuccess();
      }
    } catch (error) {
      console.log(error);
      newErrorSteps[2] = true;
      setErrorSteps(newErrorSteps);
      setActiveStep(2);
      setIsCreating(false);
      return;
    }
    setIsCreating(false);
    setCreationProgress(0);
  };

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel error={errorSteps[index]}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ my: 4 }}>
        {activeStep === 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              IAP Details
            </Typography>
            <TextField
              label="Name"
              value={iapName}
              onChange={(e) => setIapName(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Description"
              value={iapDescription}
              onChange={(e) => setIapDescription(e.target.value)}
              fullWidth
              margin="normal"
            />
          </Paper>
        )}

        {activeStep === 1 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Add Activities
            </Typography>
            <Button
              variant="contained"
              onClick={handleOpenActivityDialog}
              sx={{ my: 2 }}
            >
              Add Activity
            </Button>
            {activities.map((activity, index) => (
              <Box key={index} sx={{ border: '1px solid #ccc', p: 1, my: 1 }}>
                <Typography variant="body1">
                  Activity {index + 1}: {activity.createActivityInput.name} –
                  (Provider:{' '}
                  {
                    activityProviders?.find(
                      (ap) =>
                        ap._id ===
                        activity.createActivityInput.activityProviderId,
                    )?.name
                  }
                  )
                </Typography>
              </Box>
            ))}
          </Paper>
        )}

        {activeStep === 2 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Add Goals
            </Typography>
            <Button
              variant="contained"
              onClick={handleOpenGoalDialog}
              sx={{ my: 2 }}
            >
              Add Goal
            </Button>
            {goals.map((goal, index) => (
              <Box key={index} sx={{ border: '1px solid #ccc', p: 1, my: 1 }}>
                <Typography variant="body1">
                  Goal {index + 1}: {goal.name} – {goal.formula}
                </Typography>
              </Box>
            ))}
          </Paper>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={handleBack} disabled={activeStep === 0 || isCreating}>
          Back
        </Button>
        {activeStep < steps.length - 1 && (
          <Button onClick={handleNext} disabled={isCreating}>
            Next
          </Button>
        )}
        {activeStep === steps.length - 1 && (
          <Button
            onClick={handleComplete}
            variant="contained"
            disabled={isCreating}
          >
            Complete
          </Button>
        )}
      </Box>

      {isCreating && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">Creating IAP...</Typography>
          <LinearProgress variant="determinate" value={creationProgress} />
        </Box>
      )}

      {/* Activity Dialog */}
      <Dialog
        open={openActivityDialog}
        onClose={handleCloseActivityDialog}
        data-testid="activity-dialog"
      >
        <DialogTitle>Add Activity</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Activity Provider Type"
            value={activityProviderType}
            onChange={(e) =>
              setActivityProviderType(e.target.value as 'existing' | 'new')
            }
            fullWidth
            margin="normal"
          >
            <MenuItem value="existing">Existing Activity Provider</MenuItem>
            <MenuItem value="new">Create New Activity Provider</MenuItem>
          </TextField>
          {activityProviderType === 'existing' && (
            <TextField
              select
              label="Select Activity Provider"
              value={selectedProviderId}
              onChange={(e) => setSelectedProviderId(e.target.value)}
              fullWidth
              margin="normal"
            >
              {loadingProviders ? (
                <MenuItem disabled>Loading Activity Providers...</MenuItem>
              ) : (
                activityProviders
                  ?.filter(
                    (item, index, self) =>
                      index === self.findIndex((obj) => obj.name === item.name),
                  )
                  .map((provider: Partial<ActivityProviderGqlSchema>) => (
                    <MenuItem key={provider?._id} value={provider?._id}>
                      {provider?.name}
                    </MenuItem>
                  ))
              )}
            </TextField>
          )}
          {activityProviderType === 'new' && (
            <>
              <TextField
                label="New Activity Provider Name"
                value={newProviderName}
                onChange={(e) => setNewProviderName(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="New Activity Provider Description"
                value={newProviderDescription}
                onChange={(e) => setNewProviderDescription(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="New Activity Provider URL"
                value={newProviderUrl}
                onChange={(e) => setNewProviderUrl(e.target.value)}
                fullWidth
                margin="normal"
              />
            </>
          )}
          {/* Fields for the Activity itself */}
          <TextField
            label="Activity Name"
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Activity Description"
            value={activityDescription}
            onChange={(e) => setActivityDescription(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseActivityDialog}>Cancel</Button>
          <Button onClick={handleAddActivity} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fullscreen IFrame Dialog for Scraping */}
      <Dialog
        ref={dialogRef}
        fullScreen
        open={openIFrameDialog}
        onClose={handleIFrameCancel}
        data-testid="iframe-dialog"
      >
        <DialogTitle>Activity Configuration Interface</DialogTitle>
        <DialogContent>
          <CustomIFrame url={apConfigUrl} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleIFrameCancel} autoFocus>
            Cancel
          </Button>
          <Button autoFocus onClick={handleIFrameSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Goal Dialog */}
      <Dialog
        open={openGoalDialog}
        onClose={handleCloseGoalDialog}
        data-testid="goal-dialog"
      >
        <DialogTitle>Add Goal</DialogTitle>
        <DialogContent>
          <TextField
            label="Goal Name"
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Goal Description"
            value={goalDescription}
            onChange={(e) => setGoalDescription(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Formula"
            value={goalFormula}
            onChange={(e) => setGoalFormula(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Target Value"
            value={goalTargetValue}
            onChange={(e) => setGoalTargetValue(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGoalDialog}>Cancel</Button>
          <Button onClick={handleAddGoal} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Dialog */}
      <Dialog open={alertDialogOpen} onClose={() => setAlertDialogOpen(false)}>
        <DialogTitle>{alertDialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{alertDialogMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertDialogOpen(false)} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
