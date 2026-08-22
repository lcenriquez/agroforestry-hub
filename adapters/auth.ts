import { useEffect, useState } from 'react';

import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, database } from '../firebase-config';

const formatAuthUser = (user: { uid: string; email: string; accessToken: string; emailVerified: boolean }) => ({
	uid: user.uid,
	email: user.email,
	accessToken: user.accessToken,
	isEmailVerified: user.emailVerified
});

// Un usuario es admin si existe un documento con su uid en la colección
// `admins` (se crea a mano desde la consola de Firebase, no hay UI para
// gestionarla). Ver docs/features/admin-y-sugerencias.md.
async function checkIsAdmin(uid: string): Promise<boolean> {
	try {
		const snapshot = await getDoc(doc(database, 'admins', uid));
		return snapshot.exists();
	} catch (error) {
		console.log(error);
		return false;
	}
}

export default function useFirebaseAuth() {
	const [authUser, setAuthUser] = useState(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<null | { message: string }>(null);

	const authStateChanged = async (authState: any) => {
		if (!authState) {
			setAuthUser(null);
			setIsAdmin(false);
			setLoading(false);
			return;
		}

		const formattedUser = formatAuthUser(authState);
		setAuthUser(formattedUser as any);
		setIsAdmin(await checkIsAdmin(formattedUser.uid));
		setLoading(false);
	};

	const clear = () => {
		setAuthUser(null);
		setIsAdmin(false);
		setLoading(false);
		setError(null);
	};

	const signIn = (email: string, password: string) => {
		setLoading(true);
		signInWithEmailAndPassword(auth, email, password)
			.then(() => {
				setLoading(false);
				setError(null);
			})
			.catch(error => {
				setLoading(false);
				console.log(`Error ${error.code}: ${error.message}`);
				setError({
					message:
						error.code == 'auth/user-not-found' || error.code == 'auth/wrong-password'
							? 'Usuario o contraseña incorrecta'
							: 'Verifica la información ingresada'
				});
			});
	};

	const signUp = (email: string, password: string, displayName: string) => {
		setLoading(true);
		createUserWithEmailAndPassword(auth, email, password)
			.then(userCredential => {
				// Documentation: https://firebase.google.com/docs/auth/web/manage-users#update_a_users_profile
				updateProfile(userCredential.user, {
					displayName
				});
				// Documentation: https://firebase.google.com/docs/auth/web/manage-users#send_a_user_a_verification_email
				sendEmailVerification(userCredential.user);
				setLoading(false);
				setError(null);
			})
			.catch(error => {
				setLoading(false);
				console.log(`Error ${error.code}: ${error.message}`);
				setError({
					message:
						error.code == 'auth/email-already-in-use'
							? 'El usuario ingresado ya existe'
							: error.code == 'auth/weak-password'
								? 'La contraseña ingresada es demasiado insegura'
								: 'Verifica la información ingresada'
				});
			});
	};

	const signOut = () => {
		setLoading(true);
		auth.signOut().then(clear);
	};

	// Listen for Firebase state change
	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged(authStateChanged);
		return () => unsubscribe();
	}, []);

	return {
		authUser,
		isAdmin,
		loading,
		error,
		signIn,
		signUp,
		signOut
	};
}
