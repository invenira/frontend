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
  Grid2,
  Typography,
} from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';

export const IAP = () => {
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

  const handleDeploy = () => {};

  const handleAddActivity = () => {};

  const handleAddGoal = () => {};

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
                    onClick={handleAddGoal}
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
    </>
  );
};
