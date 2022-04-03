import { createContext, useContext } from 'react'
import useFirebaseAuth from '../adapters/auth';

const authUserContext = createContext({
  authUser: null,
  loading: false,
  signIn: (email: string, password: string) => {},
  signUp: (email: string, password: string) => {},
  signOut: () => {}
});

export function AuthUserProvider({ children }: { children: any }) {
  const auth = useFirebaseAuth();
  return <authUserContext.Provider value={auth}>{children}</authUserContext.Provider>;
}
// Custom hook to use the authUserContext value
export const useAuth = () => useContext(authUserContext);