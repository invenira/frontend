import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { CircularProgress } from '@mui/material';

export const LoginRedirect = () => {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading && !auth.error) {
      auth.signinRedirect();
    }
  }, [auth]);

  return <CircularProgress />;
};
