const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Add cache for shower data
const showerCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const fetchShowers = async () => {
  const startTime = performance.now();
  try {
    // Comment out or remove the cache check for debugging:
    // const cachedData = showerCache.get('all');
    // if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    //   const endTime = performance.now();
    //   console.log(`[Performance] Cache hit! Data loaded in ${(endTime - startTime).toFixed(2)}ms`);
    //   return cachedData.data;
    // }

    console.log('[Debug] Cache miss, fetching from API...');
    console.log('[Debug] Environment:', process.env.NODE_ENV);
    console.log('[Debug] API_BASE_URL:', API_BASE_URL);
    
    const url = `${API_BASE_URL}/data`;
    console.log('[Debug] Full request URL:', url);
    
    const response = await fetch(url);
    console.log('[Debug] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Debug] Error response:', errorText);
      throw new Error(`Failed to fetch showers: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('[Debug] Raw data received:', data);
    console.log('[Debug] Number of showers received:', data.length);
    
    const endTime = performance.now();
    console.log(`[Performance] API request completed in ${(endTime - startTime).toFixed(2)}ms`);
    
    // Process and cache the data
    const processedData = data.map(shower => ({
      id: String(shower.id),
      startTime: shower.startTime || 'Unknown',
      duration: shower.duration || 0,
      userID: shower.userID || '-1',
      avgTemp: shower.avgTemp || null,
      minTemp: shower.minTemp || null,
      maxTemp: shower.maxTemp || null,
      temperatureReadings: shower.temperatureReadings || {}
    }));

    console.log('[Debug] Processed data:', processedData);
    console.log('[Debug] Number of processed showers:', processedData.length);

    // Cache the processed data
    showerCache.set('all', {
      data: processedData,
      timestamp: Date.now()
    });

    return processedData;
  } catch (error) {
    const endTime = performance.now();
    console.error(`[Performance] Error occurred after ${(endTime - startTime).toFixed(2)}ms`);
    console.error('[Debug] Error details:', {
      message: error.message,
      stack: error.stack,
      type: error.name
    });
    throw error;
  }
};

// Remove the separate fetchShowerData function since we now include all data in the main fetch
export const fetchShowerData = async (showerId) => {
  try {
    const allShowers = await fetchShowers();
    const shower = allShowers.find(s => String(s.id) === String(showerId));
    if (!shower) {
      throw new Error('Shower not found');
    }
    return shower;
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      type: error.name
    });
    throw error;
  }
}; 