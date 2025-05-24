// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgSU3HPO3MN75k2L10YkQmlPJ73eWjU9s",
  authDomain: "shiver-app-cb77b.firebaseapp.com",
  databaseURL: "https://shiver-app-cb77b-default-rtdb.firebaseio.com",
  projectId: "shiver-app-cb77b",
  storageBucket: "shiver-app-cb77b.firebasestorage.app",
  messagingSenderId: "860434595766",
  appId: "1:860434595766:web:99902c68f31705989d0b17",
  measurementId: "G-0DWVNEY0EF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Authentication functions
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Database functions
const fetchData = async (path) => {
  try {
    const dataRef = ref(database, path);
    const snapshot = await get(dataRef);
    return snapshot.val();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export { database, ref, get, auth, signInWithGoogle, signOutUser, fetchData };
