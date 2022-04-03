import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useState, useEffect } from "react";
import { auth } from "../firebase-config";

const formatAuthUser = (user: any) => ({
  uid: user.uid,
  email: user.email,
  accessToken: user.accessToken
});

export default function useFirebaseAuth() {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const authStateChanged = async (authState: any) => {
    if (!authState) {
      setAuthUser(null);
      return;
    }

    var formattedUser = formatAuthUser(authState);
    setAuthUser(formattedUser as any);
  };

  const clear = () => {
    setAuthUser(null);
    setLoading(false);
  };

  const signIn = (email: string, password: string) => {
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        setLoading(false);
        // const user = userCredential.user;
        // user.getIdToken();
        // console.log("User object:", user);
      })
      .catch((error) => {
        setLoading(false);
        console.log(`Error ${error.code}: ${error.message}`);
      });
  };

  const signUp = (email: string, password: string) => {
    createUserWithEmailAndPassword(auth, email, password);
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
    loading,
    signIn,
    signUp,
    signOut,
  };
}
