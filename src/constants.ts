export const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/graphql';
export const authority =
  import.meta.env.VITE_OAUTH_AUTHORITY ||
  'http://localhost:8091/realms/invenira';
export const clientId =
  import.meta.env.VITE_OAUTH_CLIENT_ID || 'invenira_frontend';
export const clientSecret =
  import.meta.env.VITE_OAUTH_CLIENT_SECRET ||
  'DWUrsxgsLXMlXpz7sh5Zt9jJVo9Rogmt';
export const redirectUri =
  import.meta.env.VITE_OAUTH_REDIRECT_URI || 'http://localhost:8080/oauth';
export const redirectUriLogout =
  import.meta.env.VITE_OAUTH_REDIRECT_URI_LOGOUT ||
  'http://localhost:8080/oauth/logout';
export const testAuthProvider = Boolean(
  import.meta.env.VITE_OAUTH_TEST_PROVIDER || false,
);
