import { useAuth } from 'react-oidc-context';
import { useEffect } from 'react';
import { CircularProgress } from '@mui/material';

export const LogoutRedirect = () => {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading && !auth.error) {
      auth.signoutRedirect();
    }
  }, [auth]);

  return <CircularProgress />;
};
