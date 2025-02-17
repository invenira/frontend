import { Navigate } from '@tanstack/react-router';
import { useAuth } from 'react-oidc-context';
import { CircularProgress } from '@mui/material';

export const LoginCallback = () => {
  const auth = useAuth();

  if (auth.isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (auth.error) {
    throw auth.error;
  }

  return <CircularProgress />;
};
