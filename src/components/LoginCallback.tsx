import { useAuth } from 'react-oidc-context';
import { CircularProgress } from '@mui/material';
import { CustomNavigate } from '@/utils';

export const LoginCallback = () => {
  const auth = useAuth();

  if (auth.isAuthenticated) {
    return <CustomNavigate />;
  }

  if (auth.error) {
    throw auth.error;
  }

  return <CircularProgress />;
};
