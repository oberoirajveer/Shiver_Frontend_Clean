// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, onValue } from "firebase/database";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { sendShowerNotification } from './services/emailService';

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

// Listen for shower updates and send notifications
const listenForShowerUpdates = (deviceId) => {
  try {
    console.log(`[Debug] Setting up listener for device: ${deviceId}`);
    // First listen to the current shower ID
    const currentShowerRef = ref(database, `${deviceId}/currentshower`);
    
    // Set up the listener
    const unsubscribe = onValue(currentShowerRef, async (snapshot) => {
      console.log(`[Debug] Current shower ID changed for device ${deviceId}:`, snapshot.val());
      const currentShowerId = snapshot.val();
      if (!currentShowerId) {
        console.log(`[Debug] No current shower ID found for device ${deviceId}`);
        return;
      }

      // Then get the actual shower data from the showers tree
      const showerDataRef = ref(database, `${deviceId}/showers/${currentShowerId}`);
      console.log(`[Debug] Fetching shower data from path: ${deviceId}/showers/${currentShowerId}`);
      const showerSnapshot = await get(showerDataRef);
      const showerData = showerSnapshot.val();
      
      if (!showerData) {
        console.log(`[Debug] No shower data found for shower ID ${currentShowerId}`);
        return;
      }

      console.log(`[Debug] Shower data retrieved:`, {
        hasDuration: !!showerData.duration,
        hasTemperatureReadings: !!showerData.temperatureReadings,
        duration: showerData.duration,
        startTime: showerData.startTime
      });

      // Check if this shower is completed (has duration and temperature readings)
      if (showerData.duration && showerData.temperatureReadings) {
        console.log(`[Debug] Shower appears to be completed, sending notification...`);
        // Send notification
        const success = await sendShowerNotification(showerData, deviceId);
        console.log(`[Debug] Notification send result:`, success);
      } else {
        console.log(`[Debug] Shower not yet completed - missing duration or temperature readings`);
      }
    }, (error) => {
      console.error("[Debug] Error in Firebase listener:", error);
    });

    console.log(`[Debug] Listener setup complete for device: ${deviceId}`);
    return unsubscribe;
  } catch (error) {
    console.error("[Debug] Error in listenForShowerUpdates:", error);
    return () => {}; // Return empty cleanup function in case of error
  }
};

export { database, ref, get, auth, signInWithGoogle, signOutUser, fetchData, listenForShowerUpdates };
