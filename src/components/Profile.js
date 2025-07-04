import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchShowers } from '../services/api';
import { LineChart, Line, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import './Profile.css';

const Calendar = React.memo(({ showers }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const getDaysInMonth = useCallback((date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }, []);

  const getFirstDayOfMonth = useCallback((date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  }, []);

  const getShowerForDate = useCallback((day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return showers.find(shower => {
      const showerDate = new Date(shower.startTime);
      return showerDate.getDate() === date.getDate() &&
             showerDate.getMonth() === date.getMonth() &&
             showerDate.getFullYear() === date.getFullYear();
    });
  }, [currentDate, showers]);

  const formatTooltipDate = useCallback((day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [currentDate]);

  const getDotColor = (shower) => {
    if (!shower) return null;
    
    // Check if there are temperature readings
    if (shower.temperatureReadings) {
      const readings = Object.entries(shower.temperatureReadings)
        .map(([time, temp]) => ({
          time: parseInt(time),
          temperature: parseFloat(temp)
        }))
        .sort((a, b) => a.time - b.time);

      // Check for continuous periods of cold temperature
      let coldStartTime = null;
      for (let i = 0; i < readings.length; i++) {
        const reading = readings[i];
        if (reading.temperature < 70) {
          if (coldStartTime === null) {
            coldStartTime = reading.time;
          }
          // If we have a cold period of at least 2 minutes (120 seconds)
          if (reading.time - coldStartTime >= 120) {
            return '#2196f3';  // Cold: deep blue
          }
        } else {
          coldStartTime = null;
        }
      }
    }

    // If no cold period found, use average temperature for coloring
    const temp = shower.avgTemp;
    if (temp < 70) return '#4fc3f7';  // Cool: medium blue
    if (temp < 80) return '#81d4fa';  // Warm: light blue
    return '#ff7043';                  // Hot: orange/red
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const shower = getShowerForDate(day);
      const dotColor = getShowerForDate(day) ? getDotColor(shower) : '#e0e0e0';
      
      days.push(
        <div key={day} className="calendar-day">
          <div 
            className="shower-dot" 
            style={{ backgroundColor: dotColor }}
            data-tooltip={formatTooltipDate(day)}
          ></div>
        </div>
      );
    }
    
    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  return (
    <div className="calendar">
      <div className="calendar-header">
        <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
      </div>
      <div className="calendar-grid">
        <div className="calendar-weekdays">
          <div>S</div>
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
        </div>
        <div className="calendar-days">
          {renderCalendar()}
        </div>
      </div>
    </div>
  );
});

Calendar.displayName = 'Calendar';

const ColdShowerStreak = ({ showers }) => {
  const calculateStreak = () => {
    let streak = 0;
    let currentDate = new Date();
    let shouldContinue = true;

    while (shouldContinue) {
      const showersForDay = showers.filter(shower => {
        const showerDate = new Date(shower.startTime);
        return showerDate.getDate() === currentDate.getDate() &&
               showerDate.getMonth() === currentDate.getMonth() &&
               showerDate.getFullYear() === currentDate.getFullYear();
      });

      if (showersForDay.length === 0) {
        shouldContinue = false;
        continue;
      }

      const wasCold = showersForDay.some(shower => {
        // Early exit if no temperature data
        if (!shower.temperatureReadings) {
          console.log('[Debug] Shower has no temperature readings');
          return false;
        }
        
        console.log('[Debug] Raw temperature readings:', shower.temperatureReadings);
        
        // Parse and clean the temperature readings
        const readings = Object.entries(shower.temperatureReadings)
          .map(([time, temp]) => {
            const parsedTemp = parseFloat(temp);
            const parsedTime = parseInt(time);
            console.log('[Debug] Parsing reading:', { time, temp, parsedTime, parsedTemp });
            return {
              time: parsedTime,
              temperature: parsedTemp
            };
          })
          // Filter out invalid readings (NaN values)
          .filter(reading => !isNaN(reading.temperature) && !isNaN(reading.time))
          // Sort by time to ensure chronological order
          .sort((a, b) => a.time - b.time);

        console.log('[Debug] Processed readings:', readings.length, 'valid readings');
        console.log('[Debug] Sample readings:', readings.slice(0, 5));
        
        // Need at least 2 readings to calculate duration
        if (readings.length < 2) {
          console.log('[Debug] Not enough valid readings (need at least 2)');
          return false;
        }

        // METHOD 1: Check if we have 120+ cold data points
        const coldDataPoints = readings.filter(reading => reading.temperature < 65).length;
        console.log('[Debug] Cold data points:', coldDataPoints, 'out of', readings.length);
        
        // If we have 120+ cold readings, it's automatically a cold shower
        if (coldDataPoints >= 120) {
          console.log('[Debug] Cold shower: 120+ cold data points');
          return true;
        }

        // METHOD 2: Check if 50%+ of duration was cold
        // Calculate total shower duration
        const startTime = readings[0].time;
        const endTime = readings[readings.length - 1].time;
        const totalDuration = endTime - startTime;
        
        console.log('[Debug] Shower duration:', totalDuration, 'seconds (from', startTime, 'to', endTime, ')');
        
        // Duration must be positive and reasonable (at least 30 seconds)
        if (totalDuration <= 30) {
          console.log('[Debug] Duration too short or invalid, skipping shower');
          return false;
        }
        
        // Calculate cold duration using interpolation between readings
        let coldDuration = 0;
        
        for (let i = 0; i < readings.length - 1; i++) {
          const currentReading = readings[i];
          const nextReading = readings[i + 1];
          const segmentDuration = nextReading.time - currentReading.time;
          
          // If current reading is cold, count the time until next reading
          if (currentReading.temperature < 67) {
            coldDuration += segmentDuration;
            console.log('[Debug] Cold segment:', {
              start: currentReading.time,
              end: nextReading.time,
              duration: segmentDuration,
              temperature: currentReading.temperature
            });
          }
        }
        
        // Handle the last reading - estimate it represents the average time between readings
        const avgTimeBetweenReadings = totalDuration / (readings.length - 1);
        if (readings[readings.length - 1].temperature < 65) {
          coldDuration += avgTimeBetweenReadings;
          console.log('[Debug] Last reading was cold, adding', avgTimeBetweenReadings, 'seconds');
        }

        // Calculate percentage of cold time
        const coldPercentage = (coldDuration / totalDuration) * 100;
        console.log('[Debug] Cold duration:', coldDuration, 'seconds out of', totalDuration);
        console.log('[Debug] Cold percentage:', coldPercentage.toFixed(1) + '%');

        // Check if it meets the 50% threshold
        const isColdByDuration = coldPercentage >= 50;
        
        // Final determination: either 120+ data points OR 50%+ duration
        const isCold = coldDataPoints >= 120 || isColdByDuration;
        
        console.log('[Debug] Is this shower cold?', {
          coldDataPoints: coldDataPoints >= 120,
          coldDuration: isColdByDuration,
          finalResult: isCold
        });
        
        return isCold;
      });

      if (!wasCold) {
        console.log('[Debug] No cold showers found for this day, breaking streak');
        shouldContinue = false;
        continue;
      }

      console.log('[Debug] Found cold shower, incrementing streak');
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  const streak = calculateStreak();

  return (
    <div className="streak-container">
      <h3>Cold Shower Streak</h3>
      <div className="streak-count">{streak}</div>
      <div className="streak-label">days</div>
    </div>
  );
};

const Profile = () => {
  const { currentUser } = useAuth();
  const [showers, setShowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedShower, setSelectedShower] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const showersPerPage = 7;

  const getTemperatureColor = useCallback((temp) => {
    if (!temp) return '#90caf9';
    if (temp < 50) return '#2196f3';
    if (temp < 60) return '#4fc3f7';
    if (temp < 70) return '#81d4fa';
    return '#ff7043';
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadShowers = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[Debug] Profile: Starting to fetch showers');
        const showerData = await fetchShowers();
        console.log('[Debug] Profile: Received shower data:', showerData);
        
        if (!isMounted) return;
        
        if (!showerData || showerData.length === 0) {
          console.log('[Debug] Profile: No shower data available');
          setError('No shower data available');
          return;
        }
        
        // Sort showers by startTime in descending order (most recent first), handling both ISO and non-ISO formats
        const sortedShowers = showerData
          .filter(shower => shower.startTime && shower.startTime !== 'Unknown')
          .sort((a, b) => {
            const dateA = new Date(a.startTime.includes('T') ? a.startTime : a.startTime + 'Z');
            const dateB = new Date(b.startTime.includes('T') ? b.startTime : b.startTime + 'Z');
            return dateB.getTime() - dateA.getTime();
          });
        
        console.log('[Debug] Profile: Sorted showers:', sortedShowers);
        setShowers(sortedShowers);
      } catch (err) {
        if (isMounted) {
          console.error('[Debug] Profile: Error loading showers:', err);
          setError('Failed to load showers');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadShowers();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatDate = useCallback((startTime) => {
    if (!startTime || startTime === 'Unknown') return 'Unknown';
    const date = new Date(startTime);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
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

  const handleShowerClick = (shower) => {
    setSelectedShower(shower);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedShower(null);
  };

  const getPageNumbers = () => {
    const totalPages = Math.ceil(showers.length / showersPerPage);
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Show current page and one before/after if they exist
    if (currentPage > 2) {
      pageNumbers.push(currentPage - 1);
    }
    if (currentPage !== 1 && currentPage !== totalPages) {
      pageNumbers.push(currentPage);
    }
    if (currentPage < totalPages - 1) {
      pageNumbers.push(currentPage + 1);
    }
    
    // Always show last page if it's different from the last number
    if (totalPages > 1 && !pageNumbers.includes(totalPages)) {
      pageNumbers.push(totalPages);
    }
    
    // Sort and remove duplicates
    return [...new Set(pageNumbers)].sort((a, b) => a - b);
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(showers.length / showersPerPage);
    const pageNumbers = getPageNumbers();
    
    return (
      <div className="pagination">
        {pageNumbers.map((number, index) => {
          // Add ellipsis between non-consecutive numbers
          const showEllipsis = index > 0 && pageNumbers[index] - pageNumbers[index - 1] > 1;
          
          return (
            <React.Fragment key={number}>
              {showEllipsis && (
                <span className="pagination-ellipsis">...</span>
              )}
              <button
                className={`page-button ${currentPage === number ? 'active' : ''}`}
                onClick={() => setCurrentPage(number)}
              >
                {number}
              </button>
            </React.Fragment>
          );
        })}
        {currentPage < totalPages && (
          <button
            className="page-button next-button"
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        )}
      </div>
    );
  };

  const getCurrentShowers = () => {
    const startIndex = (currentPage - 1) * showersPerPage;
    const endIndex = startIndex + showersPerPage;
    return showers.slice(startIndex, endIndex);
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-content">
          <div className="profile-section">
            <h2 className="profile-title">Rajveer&apos;s Showers</h2>
            <div className="demo-notice">
              <p>Welcome to the iShiver Demo Dashboard! This preview updates with real data from Shiver Sensors in the wild.</p>
            </div>
            <h3>Recent Showers</h3>
            <div className="recent-showers-list">
              {loading ? (
                <div className="shower-entry">
                  <p>Loading showers...</p>
                </div>
              ) : error ? (
                <div className="shower-entry">
                  <p>{error}</p>
                </div>
              ) : (
                getCurrentShowers().map((shower) => {
                  const plotData = shower.temperatureReadings ? 
                    Object.entries(shower.temperatureReadings)
                      .map(([time, temp]) => ({
                        time: parseInt(time),
                        temperature: parseFloat(temp)
                      }))
                      .sort((a, b) => a.time - b.time) : [];

                  return (
                    <div 
                      key={shower.id} 
                      className="shower-entry"
                      onClick={() => handleShowerClick(shower)}
                    >
                      <div className="shower-date">{formatDate(shower.startTime)}</div>
                      <div className="shower-details">
                        <span>Duration: {formatDuration(shower.duration)}</span>
                        <span>Avg: {shower.avgTemp ? `${shower.avgTemp.toFixed(1)}°F` : '--'}</span>
                        {shower.temperatureReadings && (
                          <>
                            <span>Min: {(() => {
                              const temps = Object.values(shower.temperatureReadings)
                                .map(temp => parseFloat(temp))
                                .filter(temp => !isNaN(temp));
                              return temps.length > 0 ? Math.min(...temps).toFixed(1) : '--';
                            })()}°F</span>
                            <span>Max: {(() => {
                              const temps = Object.values(shower.temperatureReadings)
                                .map(temp => parseFloat(temp))
                                .filter(temp => !isNaN(temp));
                              return temps.length > 0 ? Math.max(...temps).toFixed(1) : '--';
                            })()}°F</span>
                          </>
                        )}
                      </div>
                      {plotData.length > 0 && (
                        <div className="shower-graph">
                          <ResponsiveContainer width="100%" height={60}>
                            <LineChart data={plotData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                              <Line 
                                type="monotone" 
                                dataKey="temperature" 
                                stroke={getTemperatureColor(shower.avgTemp)}
                                strokeWidth={2}
                                dot={false}
                                isAnimationActive={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            
            {!loading && showers.length > 0 && renderPagination()}
          </div>
        </div>
      </div>
      <div className="right-container">
        <div className="profile-header">
          <img src="/images/pfp.jpeg" alt="Profile" className="profile-picture" />
        </div>
        <ColdShowerStreak showers={showers} />
        <Calendar showers={showers} />
      </div>

      {/* Modal for expanded graph view */}
      {showModal && selectedShower && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            {selectedShower.temperatureReadings ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={Object.entries(selectedShower.temperatureReadings)
                  .map(([time, temp]) => ({
                    time: parseInt(time),
                    temperature: parseFloat(temp)
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
                    stroke={getTemperatureColor(selectedShower.avgTemp)}
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No temperature data available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 