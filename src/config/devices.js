// Device configuration for the application
export const DEVICES = {
  '15681139': {
    id: '15681139',
    name: 'Declan',
    displayName: "Declan's Showers",
    profilePicture: '/images/declanpfp.jpeg',
    email: 'oberoirajveer9@gmail.com'
  },
  // Add more devices here as you scale
  '87458506': {
    id: '87458506',
    name: 'Sofia',
    displayName: "Sofia's Showers",
    profilePicture: '/images/sofiapfp.png',
    email: 'sarah@example.com'
  },
  '63689946': {
    id: '63689946',
    name: 'Daniel',
    displayName: "Daniel's Showers",
    profilePicture: '/images/danielpfp.jpg',
    email: 'daniel@example.com'
  },
};

// Helper function to get device info
export const getDeviceInfo = (deviceId) => {
  return DEVICES[deviceId] || {
    id: deviceId,
    name: 'Unknown Device',
    displayName: 'Unknown Device',
    profilePicture: '/images/pfp.jpeg',
    email: null
  };
};

// Get all available devices
export const getAllDevices = () => {
  return Object.values(DEVICES);
}; 