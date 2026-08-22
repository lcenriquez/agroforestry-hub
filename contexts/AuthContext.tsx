import { createContext, useContext } from 'react';

import useFirebaseAuth from '../adapters/auth';

const authUserContext = createContext<AuthUserContext>({
	authUser: null,
	isAdmin: false,
	loading: true,
	error: null,
	signIn: () => {},
	signUp: () => {},
	signOut: () => {}
});

interface AuthUserContext {
	authUser: null | {
		uid: string;
		email: string;
		accessToken: string;
		isEmailVerified: boolean;
	};
	// Solo válido una vez que `authUser` está resuelto (ver `loading`); se
	// consulta de forma asíncrona contra la colección `admins` de Firestore.
	isAdmin: boolean;
	loading: boolean;
	error: null | { message: string };
	signIn: (email: string, password: string) => void;
	signUp: (email: string, password: string, displayName: string) => void;
	signOut: () => void;
}

export function AuthUserProvider({ children }: { children: any }) {
	const auth = useFirebaseAuth();
	return <authUserContext.Provider value={auth}>{children}</authUserContext.Provider>;
}
// Custom hook to use the authUserContext value
export const useAuth = () => useContext(authUserContext);
