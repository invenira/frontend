import { useIAPsQuery } from '@/queries';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useRouter } from '@tanstack/react-router';
import Grid from '@mui/material/Grid2';
import { userCustomRouter } from '@/utils';

export const IAPsList = () => {
  const router = userCustomRouter(useRouter());

  const {
    data: iaps,
    isLoading: isIapsLoading,
    error: iapError,
  } = useIAPsQuery();

  if (iapError) {
    throw iapError;
  }

  if (isIapsLoading) {
    return <CircularProgress />;
  }

  return (
    <Grid
      container
      spacing={{ xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
      columns={{ xs: 4, sm: 8, md: 12, lg: 16, xl: 20 }}
    >
      {iaps?.map((iap) => (
        <Grid key={`Grid${iap?._id}`} size={{ xs: 2, sm: 4, md: 4 }}>
          <Card
            key={`Card_${iap?._id}`}
            sx={{
              width: '100%',
              aspectRatio: '1 / 1',
              maxWidth: 200,
              minHeight: 200,
            }}
          >
            <CardContent key={`CardContent_${iap?._id}`}>
              <Typography
                key={`Typography_title_${iap?._id}`}
                variant="h5"
                component="div"
              >
                {iap?.name}
              </Typography>
              <Typography
                key={`Typography_description_${iap?._id}`}
                variant="body2"
              >
                {iap?.description}
              </Typography>
            </CardContent>
            <CardActions key={`CardActions_${iap?._id}`}>
              <Button
                key={`CardActions_Button_${iap?._id}_01`}
                size="small"
                onClick={() =>
                  router.navigate({ to: '/iap', search: { id: iap?._id } })
                }
              >
                View
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
