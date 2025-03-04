import { useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { useIAPQuery } from '@/queries';
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
  TextField,
  Typography,
} from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { useCreateGoalMutation, useDeployIAPMutation } from '@/mutations';

export const IAP = () => {
  // Error Dialog
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [alertDialogTitle, setAlertDialogTitle] = useState('');
  const [alertDialogMessage, setAlertDialogMessage] = useState('');

  const deployIAPMutation = useDeployIAPMutation(undefined, (e) => {
    setAlertDialogTitle('Deploy Error');
    setAlertDialogMessage(e.message);
    setAlertDialogOpen(true);
  });

  // Goal Dialog
  const [openGoalDialog, setOpenGoalDialog] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalFormula, setGoalFormula] = useState('');
  const [goalTargetValue, setGoalTargetValue] = useState('');
  const goalsMutation = useCreateGoalMutation();

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

  const handleAddActivity = () => {};

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
      .catch((e) => {
        setAlertDialogTitle('Create Goal Error');
        setAlertDialogMessage(e.message);
        setAlertDialogOpen(true);
      });
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

  const {
    name,
    description,
    isDeployed,
    createdAt,
    updatedAt,
    createdBy,
    updatedBy,
    activityProviders,
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
                    onClick={handleAddActivity}
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
        {(activityProviders?.map((ap) => ap.activities).flat() || []).length >
          0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Activities
            </Typography>
            <Grid2 container spacing={2}>
              {activityProviders?.map((ap) =>
                ap.activities.map((activity, index) => (
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
    </>
  );
};
