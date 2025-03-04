import { useAuth } from 'react-oidc-context';
import { Navigate } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { CircularProgress } from '@mui/material';

export type ProtectedRouteProps = {
  children: ReactNode;
};

export const ProtectedRoute = (props: ProtectedRouteProps) => {
  const auth = useAuth();

  if (auth.isLoading) {
    return <CircularProgress />;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return props.children;
};
