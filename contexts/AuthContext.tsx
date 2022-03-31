import { createContext, useContext } from 'react'
import useFirebaseAuth from '../adapters/auth';

const authUserContext = createContext({
  authUser: null,
  loading: true,
  signIn: (email: string, password: string) => {},
  signUp: (email: string, password: string) => {},
  signOut: () => {}
});

export function AuthUserProvider({ children }: { children: any }) {
  const auth = useFirebaseAuth();
  return <authUserContext.Provider value={auth}>{children}</authUserContext.Provider>;
}
// custom hook to use the authUserContext and access authUser and loading
export const useAuth = () => useContext(authUserContext);