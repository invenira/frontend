import { useAuth } from 'react-oidc-context';
import { CircularProgress } from '@mui/material';
import { Navigate } from '@tanstack/react-router';

export const LoginCallback = () => {
  const auth = useAuth();

  if (auth.isAuthenticated) {
    return <Navigate to={'/'} />;
  }

  if (auth.error) {
    throw auth.error;
  }

  return <CircularProgress />;
};
