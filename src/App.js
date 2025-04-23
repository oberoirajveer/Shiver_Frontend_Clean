import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchShowers, fetchShowerData } from "./services/api";
import { getUserProfile } from "./services/userService";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Profile from "./components/Profile";
import "./App.css";
import { track } from '@vercel/analytics/react';

const App = () => {
  const [currentTemp, setCurrentTemp] = useState(null);
  const [showers, setShowers] = useState([]);
  const [selectedShower, setSelectedShower] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const getTemperatureClass = (temp) => {
    if (!temp) return 'temp-unknown';
    if (temp < 50) return 'temp-very-cold';  // Very cold: deep blue
    if (temp < 60) return 'temp-cold';       // Cold: medium blue
    if (temp < 70) return 'temp-cool';       // Cool: light blue
    return 'temp-warm';                       // Warm: red/orange
  };

  const getTemperatureColor = (temp) => {
    if (!temp) return '#90caf9';  // Unknown: light blue
    if (temp < 50) return '#2196f3';  // Very cold: deep blue
    if (temp < 60) return '#4fc3f7';  // Cold: medium blue
    if (temp < 70) return '#81d4fa';  // Cool: light blue
    return '#ff7043';  // Warm: red/orange
  };

  // Fetch all showers
  useEffect(() => {
    const loadShowers = async () => {
      try {
        setLoading(true);
        setError(null);
        const showerData = await fetchShowers();
        if (!showerData || showerData.length === 0) {
          setError('No shower data available');
          return;
        }
        // Sort showers by startTime in descending order (most recent first)
        const sortedShowers = showerData.sort((a, b) => {
          if (a.startTime === 'Unknown' || b.startTime === 'Unknown') return 0;
          return new Date(b.startTime) - new Date(a.startTime);
        });
        
        // Fetch detailed data for each shower
        const showersWithDetails = await Promise.all(
          sortedShowers.map(async (shower) => {
            try {
              const details = await fetchShowerData(shower.id);
              return {
                ...shower,
                temperatureReadings: details.temperatureReadings
              };
            } catch (err) {
              console.error(`Error loading details for shower ${shower.id}:`, err);
              return shower;
            }
          })
        );
        
        setShowers(showersWithDetails);
        
        // Load user profiles for all showers
        const profiles = {};
        for (const shower of showersWithDetails) {
          console.log('Processing shower:', shower.id, 'with userID:', shower.userID);
          if (shower.userID && !profiles[shower.userID]) {
            try {
              const profile = await getUserProfile(shower.userID);
              console.log('Loaded profile for userID:', shower.userID, profile);
              profiles[shower.userID] = profile;
            } catch (err) {
              console.error(`Error loading profile for user ${shower.userID}:`, err);
              profiles[shower.userID] = { profilePicture: '/profilePictures/default.png' };
            }
          }
        }
        console.log('Final profiles object:', profiles);
        
        // Only set selectedShower if it's null and we have showers
        if (!selectedShower && showersWithDetails.length > 0) {
          setSelectedShower(String(showersWithDetails[0].id));
        }
      } catch (err) {
        setError('Failed to load showers');
        console.error('Error loading showers:', err);
      } finally {
        setLoading(false);
      }
    };

    loadShowers();
  }, [selectedShower]);

  // Fetch selected shower data
  useEffect(() => {
    const loadShowerData = async () => {
      if (!selectedShower) return;

      try {
        setLoading(true);
        setError(null);
        const showerData = await fetchShowerData(selectedShower);
        
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
        setError('Failed to load shower data');
        console.error('Error loading shower data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadShowerData();
  }, [selectedShower]);

  const getTemperatureMessage = (temp) => {
    if (!temp) return "Waiting for temperature data...";
    if (temp < 50) return "BRRR! That's cold enough to freeze your thoughts!";
    if (temp < 60) return "Chilly! But that's what makes you stronger! 💪";
    if (temp < 70) return "Getting warmer! Keep pushing!";
    return "Hot stuff! You're crushing it! 🔥";
  };

  const formatChartTime = (timestamp) => {
    const seconds = parseInt(timestamp);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatChartTooltip = (timestamp) => {
    const seconds = parseInt(timestamp);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatStartTime = (startTime) => {
    if (!startTime || startTime === 'Unknown') return 'Unknown';
    return startTime; // The startTime is already in a readable format from NTP
  };

  const shareToTwitter = () => {
    const message = `🚿 Just took a cold shower at ${currentTemp}°F! ${getTemperatureMessage(currentTemp)} Check out my cold shower journey!`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareToInstagram = () => {
    // Instagram doesn't have a direct share URL, so we'll copy to clipboard
    const message = `🚿 Cold shower at ${currentTemp}°F! ${getTemperatureMessage(currentTemp)}`;
    navigator.clipboard.writeText(message);
    alert('Share text copied to clipboard! You can now paste it in your Instagram story or post.');
  };

  const shareViaEmail = () => {
    const subject = 'My Cold Shower Journey';
    const body = `I just took a cold shower at ${currentTemp}°F! ${getTemperatureMessage(currentTemp)}\n\nCheck out my cold shower journey: ${window.location.href}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const shareToWhatsApp = () => {
    const message = `🚿 Just took a cold shower at ${currentTemp}°F! ${getTemperatureMessage(currentTemp)} Check out my cold shower journey: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareToTelegram = () => {
    const message = `🚿 Just took a cold shower at ${currentTemp}°F! ${getTemperatureMessage(currentTemp)} Check out my cold shower journey: ${window.location.href}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(message)}`, '_blank');
  };

  const formatShowerButton = (shower) => {
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
  };

  const closeModal = () => {
    setShowModal(false);
    setModalData(null);
  };

  const formatModalTime = (startTime) => {
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
  };

  const formatModalDuration = (seconds) => {
    if (!seconds) return 'Unknown';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={
              <>
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                <div className="shower-selector">
                  <h3>Select Shower Session</h3>
                  <div className="shower-list">
                    {loading ? (
                      <div className="loading">Loading showers...</div>
                    ) : (
                      showers.map(shower => formatShowerButton(shower))
                    )}
                  </div>
                </div>

                {/* Modal for detailed shower data */}
                {showModal && (
                  <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                      <button className="modal-close" onClick={closeModal}>×</button>
                      
                      {modalLoading ? (
                        <div className="modal-loading">Loading detailed data...</div>
                      ) : modalData ? (
                        <>
                          <div className="modal-header">
                            <h2>Shower Details</h2>
                            <p className="modal-date">{formatModalTime(modalData.startTime)}</p>
                          </div>
                          
                          <div className="modal-sections">
                            <div className={`modal-section stats-section ${getTemperatureClass(modalData.avgTemp)}`}>
                              <h3>Statistics</h3>
                              <div className="modal-stats">
                                <div className="modal-stat">
                                  <span className="modal-stat-label">Duration</span>
                                  <span className="modal-stat-value">{formatModalDuration(modalData.duration)}</span>
                                </div>
                                <div className="modal-stat">
                                  <span className="modal-stat-label">Min Temperature</span>
                                  <span className="modal-stat-value">{modalData.minTemp ? `${modalData.minTemp.toFixed(1)}°F` : '--'}</span>
                                </div>
                                <div className="modal-stat">
                                  <span className="modal-stat-label">Max Temperature</span>
                                  <span className="modal-stat-value">{modalData.maxTemp ? `${modalData.maxTemp.toFixed(1)}°F` : '--'}</span>
                                </div>
                                <div className="modal-stat">
                                  <span className="modal-stat-label">Avg Temperature</span>
                                  <span className="modal-stat-value">{modalData.avgTemp ? `${modalData.avgTemp.toFixed(1)}°F` : '--'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="modal-section chart-section">
                              <h3>Temperature Journey</h3>
                              {modalData.temperatureReadings ? (
                                <ResponsiveContainer width="100%" height={300}>
                                  <LineChart data={Object.entries(modalData.temperatureReadings)
                                    .map(([time, temp]) => ({
                                      time: parseInt(time),
                                      temperature: temp
                                    }))
                                    .sort((a, b) => a.time - b.time)
                                  }>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis 
                                      dataKey="time" 
                                      stroke="#333"
                                      tickFormatter={formatChartTime}
                                      axisLine={{ stroke: '#333', strokeWidth: 2 }}
                                      tick={{ fill: '#666', fontSize: 12 }}
                                    />
                                    <YAxis 
                                      domain={["auto", "auto"]} 
                                      stroke="#333"
                                      tickFormatter={(value) => `${value}°F`}
                                      axisLine={{ stroke: '#333', strokeWidth: 2 }}
                                      tick={{ fill: '#666', fontSize: 12 }}
                                    />
                                    <Tooltip 
                                      contentStyle={{ 
                                        backgroundColor: '#2a2a2a', 
                                        border: 'none', 
                                        borderRadius: '8px',
                                        color: '#fff'
                                      }}
                                      labelFormatter={formatChartTooltip}
                                      formatter={(value) => [`${value}°F`, 'Temperature']}
                                    />
                                    <Line 
                                      type="monotone" 
                                      dataKey="temperature" 
                                      stroke={getTemperatureColor(modalData.avgTemp)}
                                      strokeWidth={7}
                                      dot={false}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="no-data">No temperature data available</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="share-buttons">
                            <button 
                              className={`share-button twitter ${getTemperatureClass(modalData.avgTemp)}`}
                              onClick={shareToTwitter}
                            >
                              🐦 Share on Twitter
                            </button>
                            <button 
                              className={`share-button instagram ${getTemperatureClass(modalData.avgTemp)}`}
                              onClick={shareToInstagram}
                            >
                              📸 Share on Instagram
                            </button>
                            <button 
                              className={`share-button email ${getTemperatureClass(modalData.avgTemp)}`}
                              onClick={shareViaEmail}
                            >
                              📧 Share via Email
                            </button>
                            <button 
                              className={`share-button whatsapp ${getTemperatureClass(modalData.avgTemp)}`}
                              onClick={shareToWhatsApp}
                            >
                              💬 Share on WhatsApp
                            </button>
                            <button 
                              className={`share-button telegram ${getTemperatureClass(modalData.avgTemp)}`}
                              onClick={shareToTelegram}
                            >
                              ✈️ Share on Telegram
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="modal-error">Failed to load shower data</div>
                      )}
                    </div>
                  </div>
                )}
              </>
            } />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
