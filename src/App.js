import React, { useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { fetchShowers, fetchShowerData } from "./services/api";
import { getUserProfile } from "./services/userService";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import Profile from "./components/Profile";
import DevicePage from "./components/DevicePage";
import EmailTest from "./components/EmailTest";
import "./App.css";

const App = () => {
  const [currentTemp, setCurrentTemp] = useState(null);
  const [selectedShower, setSelectedShower] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [showers, setShowers] = useState([]);
  const [profiles, setProfiles] = useState({});

  const getTemperatureClass = useCallback((temp) => {
    if (!temp) return 'temp-unknown';
    if (temp < 50) return 'temp-very-cold';  // Very cold: deep blue
    if (temp < 60) return 'temp-cold';       // Cold: medium blue
    if (temp < 70) return 'temp-cool';       // Cool: light blue
    return 'temp-warm';                       // Warm: red/orange
  }, []);

  // Fetch all showers
  useEffect(() => {
    let isMounted = true;
    const loadShowers = async () => {
      try {
        setError(null);
        const showerData = await fetchShowers();
        if (!isMounted) return;
        
        if (!showerData || showerData.length === 0) {
          setError('No shower data available');
          return;
        }
        
        // Sort showers by startTime in descending order (most recent first)
        const sortedShowers = showerData.sort((a, b) => {
          if (a.startTime === 'Unknown' || b.startTime === 'Unknown') return 0;
          return new Date(b.startTime) - new Date(a.startTime);
        });
        
        setShowers(sortedShowers);
        
        // Load user profiles for all showers
        const newProfiles = {};
        for (const shower of sortedShowers) {
          if (shower.userID && !newProfiles[shower.userID]) {
            try {
              const profile = await getUserProfile(shower.userID);
              if (isMounted) {
                newProfiles[shower.userID] = profile;
              }
            } catch (err) {
              console.error(`Error loading profile for user ${shower.userID}:`, err);
              if (isMounted) {
                newProfiles[shower.userID] = { profilePicture: '/profilePictures/default.png' };
              }
            }
          }
        }
        
        if (isMounted) {
          setProfiles(newProfiles);
          // Only set selectedShower if it's null and we have showers
          if (!selectedShower && sortedShowers.length > 0) {
            setSelectedShower(String(sortedShowers[0].id));
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load showers');
          console.error('Error loading showers:', err);
        }
      }
    };

    loadShowers();
    return () => {
      isMounted = false;
    };
  }, []); // Remove selectedShower from dependencies

  // Fetch selected shower data
  useEffect(() => {
    let isMounted = true;
    const loadShowerData = async () => {
      if (!selectedShower) return;

      try {
        setError(null);
        const showerData = await fetchShowerData(selectedShower);
        
        if (!isMounted) return;
        
        if (showerData) {
          // Get the most recent temperature reading
          const temperatureReadings = showerData.temperatureReadings || {};
          const timestamps = Object.keys(temperatureReadings).map(Number);
          const mostRecentTimestamp = Math.max(...timestamps);
          const currentTemperature = temperatureReadings[mostRecentTimestamp] || showerData.temperature;
          
          setCurrentTemp(currentTemperature);
        } else {
          setError('Invalid shower data format');
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load shower data');
          console.error('Error loading shower data:', err);
        }
      }
    };

    loadShowerData();
    return () => {
      isMounted = false;
    };
  }, [selectedShower]);

  const getTemperatureMessage = useCallback((temp) => {
    if (!temp) return "Waiting for temperature data...";
    if (temp < 50) return "BRRR! That's cold enough to freeze your thoughts!";
    if (temp < 60) return "Chilly! But that's what makes you stronger! 💪";
    if (temp < 70) return "Getting warmer! Keep pushing!";
    return "Hot stuff! You're crushing it! 🔥";
  }, []);

  const formatChartTooltip = useCallback((timestamp) => {
    const seconds = parseInt(timestamp);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }, []);

  const shareToTwitter = useCallback(() => {
    const message = `🚿 Just took a cold shower at ${currentTemp}°F! ${getTemperatureMessage(currentTemp)} Check out my cold shower journey!`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`, '_blank');
  }, [currentTemp, getTemperatureMessage]);

  const shareToInstagram = useCallback(() => {
    const message = `🚿 Cold shower at ${currentTemp}°F! ${getTemperatureMessage(currentTemp)}`;
    navigator.clipboard.writeText(message);
    alert('Share text copied to clipboard! You can now paste it in your Instagram story or post.');
  }, [currentTemp, getTemperatureMessage]);

  const shareViaEmail = useCallback(() => {
    const subject = 'My Cold Shower Journey';
    const body = `I just took a cold shower at ${currentTemp}°F! ${getTemperatureMessage(currentTemp)}\n\nCheck out my cold shower journey: ${window.location.href}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  }, [currentTemp, getTemperatureMessage]);

  const shareToWhatsApp = useCallback(() => {
    const message = `🚿 Just took a cold shower at ${currentTemp}°F! ${getTemperatureMessage(currentTemp)} Check out my cold shower journey: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  }, [currentTemp, getTemperatureMessage]);

  const shareToTelegram = useCallback(() => {
    const message = `🚿 Just took a cold shower at ${currentTemp}°F! ${getTemperatureMessage(currentTemp)} Check out my cold shower journey: ${window.location.href}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(message)}`, '_blank');
  }, [currentTemp, getTemperatureMessage]);

  const formatShowerButton = useCallback((shower) => {
    let formattedDate = 'Unknown time';
    if (shower.startTime !== 'Unknown') {
      const date = new Date(shower.startTime);
      const options = { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };
      formattedDate = date.toLocaleDateString('en-US', options);
    }
    
    // Format duration
    const formatDuration = (seconds) => {
      if (!seconds) return 'Unknown';
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    };
    
    const handleShowerClick = async () => {
      setSelectedShower(String(shower.id));
      setModalLoading(true);
      setShowModal(true);
      
      try {
        const showerData = await fetchShowerData(shower.id);
        setModalData(showerData);
      } catch (err) {
        console.error('Error loading shower data for modal:', err);
      } finally {
        setModalLoading(false);
      }
    };

    // Prepare data for background plot
    const plotData = shower.temperatureReadings ? 
      Object.entries(shower.temperatureReadings)
        .map(([time, temp]) => ({
          time: parseInt(time),
          temperature: temp
        }))
        .sort((a, b) => a.time - b.time) : [];
    
    return (
      <button
        key={shower.id}
        className={`shower-button ${String(selectedShower) === String(shower.id) ? 'active' : ''} ${getTemperatureClass(shower.avgTemp)}`}
        onClick={handleShowerClick}
      >
        <div className="shower-button-background">
          {plotData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={plotData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="rgba(255, 255, 255, 0.3)" 
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="shower-button-content">
          <div className="shower-button-date">{formattedDate}</div>
          <div className="shower-button-stats">
            <div className="shower-stat">
              <span className="stat-label">Avg Temp</span>
              <span className="stat-value">{shower.avgTemp ? `${shower.avgTemp.toFixed(1)}°F` : '--'}</span>
            </div>
            <div className="shower-stat">
              <span className="stat-label">Duration</span>
              <span className="stat-value">{formatDuration(shower.duration)}</span>
            </div>
          </div>
        </div>
      </button>
    );
  }, [selectedShower, getTemperatureClass]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setModalData(null);
  }, []);

  const formatModalTime = useCallback((startTime) => {
    if (!startTime || startTime === 'Unknown') return 'Unknown';
    const date = new Date(startTime);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }, []);

  const formatModalDuration = useCallback((seconds) => {
    if (!seconds) return 'Unknown';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/device/:deviceId" element={<DevicePage />} />
            <Route path="/email-test" element={<EmailTest />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
