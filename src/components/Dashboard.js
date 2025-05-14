import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchShowers, fetchShowerData } from '../services/api';
import { getUserProfile } from '../services/userService';
import profilePicture from '../assets/profilePictures/pfp.jpeg';
import './Dashboard.css';

const Dashboard = () => {
  const [currentTemp, setCurrentTemp] = useState(null);
  const [showers, setShowers] = useState([]);
  const [selectedShower, setSelectedShower] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const showersPerPage = 12;

  const getTemperatureClass = (temp) => {
    if (!temp) return 'temp-unknown';
    if (temp < 50) return 'temp-very-cold';
    if (temp < 60) return 'temp-cold';
    if (temp < 70) return 'temp-cool';
    return 'temp-warm';
  };

  const getTemperatureColor = (temp) => {
    if (!temp) return '#90caf9';
    if (temp < 50) return '#2196f3';
    if (temp < 60) return '#4fc3f7';
    if (temp < 70) return '#81d4fa';
    return '#ff7043';
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
        
        const sortedShowers = showerData.sort((a, b) => {
          if (a.startTime === 'Unknown' || b.startTime === 'Unknown') return 0;
          return new Date(b.startTime) - new Date(a.startTime);
        });
        
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

  const getPageNumbers = () => {
    const totalPages = Math.ceil(showers.length / showersPerPage);
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const getCurrentShowers = () => {
    const startIndex = (currentPage - 1) * showersPerPage;
    const endIndex = startIndex + showersPerPage;
    return showers.slice(startIndex, endIndex);
  };

  return (
    <div className="dashboard">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="personal-header">
        <div className="profile-section">
          <div className="profile-picture-container">
            <img 
              src={profilePicture} 
              alt="Rajveer's Profile" 
              className="profile-picture"
            />
          </div>
          <h1>Rajveer's Showers</h1>
        </div>
      </div>

      <div className="shower-selector">
        <h3>Select Shower Session</h3>
        <div className="shower-list">
          {loading ? (
            <div className="loading">Loading showers...</div>
          ) : (
            getCurrentShowers().map(shower => formatShowerButton(shower))
          )}
        </div>
        
        {!loading && showers.length > 0 && (
          <div className="pagination">
            {getPageNumbers().map(number => (
              <button
                key={number}
                className={`page-button ${currentPage === number ? 'active' : ''}`}
                onClick={() => setCurrentPage(number)}
              >
                {number}
              </button>
            ))}
          </div>
        )}
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
                            tickFormatter={(value) => `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, '0')}`}
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
                            labelFormatter={(value) => `${Math.floor(value / 60)}m ${value % 60}s`}
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
              </>
            ) : (
              <div className="modal-error">Failed to load shower data</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 