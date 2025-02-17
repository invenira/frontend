import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import Layout from '@/Layout.tsx';
import { useEffect, useMemo, useState } from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import {
  LoginCallback,
  LoginRedirect,
  LogoutCallback,
  LogoutRedirect,
  ProtectedView,
} from '@/components';
import { Home, IAPs } from '@/views';

export const App = () => {
  const auth = useAuth();

  useEffect(() => {
    if (auth.user) {
      axios.defaults.headers.common['Authorization'] =
        `Bearer ${auth.user.access_token}`;
    }
  }, [auth.user]);

  useEffect(() => {
    const handleUserLoaded = (user: unknown) => {
      axios.defaults.headers.common['Authorization'] =
        // @ts-expect-error missing type
        `Bearer ${user.access_token}`;
    };

    auth.events.addUserLoaded(handleUserLoaded);

    // Clean up the subscription when the component unmounts
    return () => {
      auth.events.removeUserLoaded(handleUserLoaded);
    };
  }, [auth.events]);

  const [darkMode, setDarkMode] = useState(
    JSON.parse(localStorage.getItem('darkMode') || 'false'),
  );

  const toggleDarkMode = () => {
    setDarkMode((prev: boolean) => {
      localStorage.setItem('darkMode', JSON.stringify(!prev));
      return !prev;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
        },
      }),
    [darkMode],
  );

  const rootRoute = createRootRoute({
    component: () => (
      <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <Outlet />
      </Layout>
    ),
  });

  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => (
      <ProtectedView>
        <Home />
      </ProtectedView>
    ),
  });

  const iapsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/iaps',
    component: () => (
      <ProtectedView>
        <IAPs />
      </ProtectedView>
    ),
  });

  const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: () => <LoginRedirect />,
  });

  const loginCallbackRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/oauth',
    component: () => <LoginCallback />,
  });

  const logoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/logout',
    component: () => <LogoutRedirect />,
  });

  const logoutCallbackRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/oauth/logout',
    component: () => <LogoutCallback />,
  });

  const routeTree = rootRoute.addChildren([
    homeRoute,
    iapsRoute,
    loginRoute,
    loginCallbackRoute,
    logoutRoute,
    logoutCallbackRoute,
  ]);

  const router = createRouter({ routeTree });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};
