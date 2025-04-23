const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const fetchShowers = async (userId = null) => {
  try {
    console.log('Environment:', process.env.NODE_ENV);
    console.log('API_BASE_URL:', API_BASE_URL);
    
    // Build query string if userId is provided
    const queryString = userId ? `?userId=${userId}` : '';
    const url = `${API_BASE_URL}/data${queryString}`;
    console.log('Full request URL:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch showers: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Received data:', data);
    // Return an array of objects containing id, startTime, duration, userID, and avgTemp
    return data.map(shower => ({
      id: String(shower.id), // Ensure ID is always a string
      startTime: shower.startTime || 'Unknown',
      duration: shower.duration || 0,
      userID: shower.userID || '-1',  // Include userID, default to '-1' if not present
      avgTemp: shower.avgTemp || null,  // Include average temperature
      minTemp: shower.minTemp || null,  // Include minimum temperature
      maxTemp: shower.maxTemp || null   // Include maximum temperature
    }));
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      type: error.name
    });
    throw error;
  }
};

export const fetchShowerData = async (showerId) => {
  try {
    console.log('Fetching shower data for ID:', showerId);
    const url = `${API_BASE_URL}/data?userId=${showerId}`;
    console.log('Full request URL:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    if (!response.ok) {
      throw new Error(`Failed to fetch shower data: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Received data:', data);
    if (!data || data.length === 0) {
      throw new Error('No shower data found');
    }
    
    // Find the specific shower by ID - convert both to strings for comparison
    const shower = data.find(s => String(s.id) === String(showerId));
    if (!shower) {
      throw new Error('Shower not found');
    }
    
    // Include startTime in the returned data
    return {
      ...shower,
      id: String(shower.id), // Ensure ID is always a string
      startTime: shower.startTime || 'Unknown'
    };
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      type: error.name
    });
    throw error;
  }
}; 