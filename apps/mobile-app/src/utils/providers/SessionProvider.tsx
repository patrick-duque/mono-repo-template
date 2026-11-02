import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  clearAuthTokens,
  getAccessToken,
  saveAuthTokens,
  type AuthTokens,
} from 'utils/helpers';
import queryClient from 'utils/hooks/queryClient';

type SessionState = {
  isLoading: boolean;
  isSignedIn: boolean;
  signIn: (tokens: AuthTokens) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionState | null>(null);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    getAccessToken()
      .then((token) => setIsSignedIn(Boolean(token)))
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = useCallback(async (tokens: AuthTokens) => {
    await saveAuthTokens(tokens);
    setIsSignedIn(true);
  }, []);

  const signOut = useCallback(async () => {
    await clearAuthTokens();
    queryClient.clear();
    setIsSignedIn(false);
  }, []);

  const value = useMemo(
    () => ({ isLoading, isSignedIn, signIn, signOut }),
    [isLoading, isSignedIn, signIn, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSession = () => {
  const session = useContext(SessionContext);

  if (!session) {
    throw new Error('useSession must be used inside SessionProvider.');
  }

  return session;
};
