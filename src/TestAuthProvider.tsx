import { AuthContext } from 'react-oidc-context';
import { ReactNode } from 'react';

const dummyUser = {
  id_token: 'id_token',
  session_state: 'session_state',
  access_token: 'access_token',
  refresh_token: 'refresh_token',
  token_type: 'Bearer',
  scope: 'openid phone profile email',
  profile: {
    exp: Date.now(),
    iat: Date.now() / 1000 + 3600,
    iss: 'http://localhost:8091/realms/invenira',
    aud: 'invenira_frontend',
    sub: 'sub',
    typ: 'ID',
    sid: 'sid',
    email_verified: true,
    name: 'Invenira Test User',
    preferred_username: 'testUser',
    given_name: 'Invenira',
    family_name: 'Test User',
    email: 'testuser@invenira',
  },
  expires_at: Date.now() / 1000 + 3600,
  state: '',
  expires_in: Date.now() / 1000 + 3600,
  expired: false,
  scopes: ['openid', ' phone ', 'profile', ' email'],
  toStorageString: () => JSON.stringify({}),
};

export type TestAuthProviderProps = {
  children: ReactNode;
};

export const TestAuthProvider = (props: TestAuthProviderProps) => (
  <AuthContext.Provider
    value={{
      isAuthenticated: true,
      user: dummyUser,
      signinRedirect: () => Promise.resolve(),
      signoutRedirect: () => Promise.resolve(),
      // @ts-expect-error ...
      events: {
        addUserLoaded: () => () => {},
        removeUserLoaded: () => () => {},
      },
    }}
  >
    {props.children}
  </AuthContext.Provider>
);
