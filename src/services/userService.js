import { database, ref } from '../firebase';
import { get, set } from 'firebase/database';

// Default profile picture path
const DEFAULT_PROFILE_PIC = '/profilePictures/0.jpeg';

// Map of user IDs to their profile picture paths
const userProfilePictures = {
  '-1': '/profilePictures/-1.png',
  '1': '/profilePictures/1.jpg',
  '2': '/profilePictures/2.jpeg'
};

export const getUserProfile = async (userId) => {
  try {
    console.log('Getting profile for userId:', userId);
    console.log('Available profile pictures:', userProfilePictures);
    
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      console.log('Found user data:', userData);
      return {
        ...userData,
        profilePicture: userProfilePictures[userId] || DEFAULT_PROFILE_PIC
      };
    } else {
      console.log('No user data found, using default profile');
      // If user doesn't exist, create a default profile
      const defaultProfile = {
        profilePicture: userProfilePictures[userId] || DEFAULT_PROFILE_PIC,
        name: userId
      };
      await set(userRef, defaultProfile);
      return defaultProfile;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return {
      profilePicture: DEFAULT_PROFILE_PIC,
      name: userId
    };
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    await set(userRef, { ...profileData });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}; 