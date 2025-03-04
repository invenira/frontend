import { useSearch } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useActivityProvidersQuery, useIAPQuery } from '@/queries';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid2,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import {
  useCreateActivityMutation,
  useCreateActivityProviderMutation,
  useCreateGoalMutation,
  useDeployIAPMutation,
} from '@/mutations';
import {
  ActivityProviderGqlSchema,
  CreateActivityInput,
} from '@/graphql/graphql.ts';
import { CustomIFrame } from '@/components';
import { graphQLService } from '@/services';
import { useQueryClient } from '@tanstack/react-query';

interface Activity {
  createActivityInput: CreateActivityInput;
}

export const IAP = () => {
  const queryClient = useQueryClient();
  // Error Dialog
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [alertDialogTitle, setAlertDialogTitle] = useState('');
  const [alertDialogMessage, setAlertDialogMessage] = useState('');

  const showAlert = (title: string, message: string) => {
    setAlertDialogTitle(title);
    setAlertDialogMessage(message);
    setAlertDialogOpen(true);
  };

  const deployIAPMutation = useDeployIAPMutation(undefined, (e) =>
    showAlert('Deploy Error', e.message),
  );

  // Goal Dialog
  const [openGoalDialog, setOpenGoalDialog] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalFormula, setGoalFormula] = useState('');
  const [goalTargetValue, setGoalTargetValue] = useState('');
  const goalsMutation = useCreateGoalMutation();

  // Activity Dialog
  const { data: activityProviders, isLoading: loadingProviders } =
    useActivityProvidersQuery();
  const [openActivityDialog, setOpenActivityDialog] = useState(false);
  const [activityProviderType, setActivityProviderType] = useState<
    'existing' | 'new'
  >('existing');
  const [selectedProviderId, setSelectedProviderId] = useState('');
  // Fields for a new provider (if providerType === 'new')
  const [newProviderName, setNewProviderName] = useState('');
  const [newProviderDescription, setNewProviderDescription] = useState('');
  const [newProviderUrl, setNewProviderUrl] = useState('');
  const [activityName, setActivityName] = useState('');
  const [activityDescription, setActivityDescription] = useState('');

  const [openIFrameDialog, setOpenIFrameDialog] = useState(false);
  const [pendingActivity, setPendingActivity] = useState<Activity | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [apConfigUrl, setApConfigUrl] = useState('');
  const activityProviderMutation = useCreateActivityProviderMutation();
  const activityMutation = useCreateActivityMutation();

  useEffect(() => {
    graphQLService
      .getConfigurationInterfaceUrl(selectedProviderId)
      .then((url) => setApConfigUrl(url));
  }, [selectedProviderId]);

  const search = useSearch({ from: '/iap' });
  const [iapId] = useState<string>(search?.id?.toString() || '');

  if (!iapId.trim()) {
    throw new Error('IAP ID is required');
  }

  const {
    data: iap,
    isLoading: isIapLoading,
    error: iapError,
  } = useIAPQuery(iapId);

  if (iapError) {
    throw iapError;
  }

  if (isIapLoading) {
    return <CircularProgress />;
  }

  if (!iap) {
    throw new Error('IAP not found');
  }

  const handleDeploy = () => deployIAPMutation.mutate({ id: iap?._id });

  const handleAddGoal = () => {
    new Promise<void>((res, rej) => {
      goalsMutation.mutate(
        {
          iapId,
          createGoalInput: {
            name: goalName,
            description: goalDescription,
            formula: goalFormula,
            targetValue: Number(goalTargetValue),
          },
        },
        { onSuccess: () => res(), onError: (e) => rej(e) },
      );
    })
      .then(() => setOpenGoalDialog(false))
      .catch((e) => showAlert('Create Goal Error', e.message));
  };

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
                    queryKey: [`iap-${iap._id}`],
                  })
                  .then(() => resolve(data));
              },
              onError: (e: Error) => reject(e),
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

          new Promise<void>((resolve, reject) => {
            activityMutation.mutate(
              {
                iapId,
                createActivityInput: act.createActivityInput,
              },
              {
                onSuccess: () =>
                  queryClient
                    .invalidateQueries({ queryKey: [`iap-${iap._id}`] })
                    .then(() => resolve()),
                onError: (e: Error) => reject(e),
              },
            );
          })
            .then(() => handleCloseActivityDialog())
            .catch((e: Error) => showAlert('Create Activity Error', e.message));
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

  const {
    name,
    description,
    isDeployed,
    createdAt,
    updatedAt,
    createdBy,
    updatedBy,
    goals,
  } = iap;

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* IAP Header Card */}
        <Card sx={{ mb: 3 }}>
          <CardHeader title={name} subheader={description} />
          <CardContent>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Created At: {new Date(createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Created By: {createdBy}
                </Typography>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Updated At: {new Date(updatedAt).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Updated By: {updatedBy}
                </Typography>
              </Grid2>
            </Grid2>
            <Box mt={2}>
              {!isDeployed ? (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleDeploy}
                  >
                    Deploy IAP
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenActivityDialog}
                    sx={{ ml: 2 }}
                  >
                    Add Activity
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenGoalDialog}
                    sx={{ ml: 2 }}
                  >
                    Add Goal
                  </Button>
                </>
              ) : (
                <Typography variant="subtitle1" color="primary">
                  IAP is Deployed
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Activities Section */}
        {(iap.activityProviders?.map((ap) => ap.activities).flat() || [])
          .length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Activities
            </Typography>
            <Grid2 container spacing={2}>
              {iap.activityProviders?.map((ap) =>
                ap.activities?.map((activity, index) => (
                  <Grid2 size={{ xs: 12, sm: 6 }} key={index}>
                    <Card variant="outlined">
                      <CardHeader
                        title={activity.name}
                        subheader={activity.description}
                      />
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Activity Provider: {ap.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid2>
                )),
              )}
            </Grid2>
          </Box>
        )}

        {/* Goals Section */}
        {(goals || []).length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Goals
            </Typography>
            <Grid2 container spacing={2}>
              {goals?.map((goal, index) => {
                const progress = Math.min(
                  (goal.targetValue / 2 / goal.targetValue) * 100,
                  100,
                );
                return (
                  <Grid2 size={{ xs: 12, sm: 6 }} key={index}>
                    <Card variant="outlined">
                      <CardHeader
                        title={goal.name}
                        subheader={goal.description}
                      />
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Formula: {goal.formula}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Progress:{' '}
                            {`${(goal.targetValue / 2 / goal.targetValue) * 100}%`}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{ height: 10, borderRadius: 5, mt: 1 }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid2>
                );
              })}
            </Grid2>
          </Box>
        )}
      </Container>
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
    </>
  );
};
