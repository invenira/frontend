import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from '@/App.tsx';
import {
  apiBaseUrl,
  authority,
  clientId,
  clientSecret,
  redirectUri,
  redirectUriLogout,
  testAuthProvider,
} from '@/constants.ts';
import axios from 'axios';
import { AuthProvider } from 'react-oidc-context';
import { TestAuthProvider } from '@/TestAuthProvider.tsx';

const queryClient = new QueryClient();

axios.defaults.baseURL = apiBaseUrl;

const oAuthConfig = {
  authority: authority,
  client_id: clientId,
  client_secret: clientSecret,
  redirect_uri: redirectUri,
  post_logout_redirect_uri: redirectUriLogout,
  response_type: 'code',
  scope: 'email openid phone profile roles',
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {testAuthProvider ? (
      <TestAuthProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </TestAuthProvider>
    ) : (
      <AuthProvider {...oAuthConfig}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </AuthProvider>
    )}
  </StrictMode>,
);
