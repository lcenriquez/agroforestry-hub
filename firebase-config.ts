// Import the needed functions from the SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Import environment variables
import envConfig from "./next-env-config";

// Firebase configuration
const firebaseConfig = {
  ...envConfig.firebase
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const database = getFirestore(app);
export const auth = getAuth(app);