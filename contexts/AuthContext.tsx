import { createContext, useContext } from 'react';
import useFirebaseAuth from '../adapters/auth';

const authUserContext = createContext<AuthUserContext>({
  authUser: null,
  loading: true,
  error: null,
  signIn: () => {},
  signUp: () => {},
  signOut: () => {},
});

interface AuthUserContext {
  authUser: null | {
    uid: string;
    email: string;
    accessToken: string;
    isEmailVerified: string;
  };
  loading: boolean;
  error: null | { message: string };
  signIn: (email: string, password: string) => void;
  signUp: (email: string, password: string, displayName: string) => void;
  signOut: () => void;
}

export function AuthUserProvider({ children }: { children: any }) {
  const auth = useFirebaseAuth();
  return (
    <authUserContext.Provider value={auth}>{children}</authUserContext.Provider>
  );
}
// Custom hook to use the authUserContext value
export const useAuth = () => useContext(authUserContext);
