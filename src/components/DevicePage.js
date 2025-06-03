import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { fetchData } from '../firebase';
import { LineChart, Line, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import './DevicePage.css';
import declanPfp from '../assets/images/declanpfp.jpg';
import rajveerPfp from '../assets/images/pfp.jpeg';

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
    
    if (shower.temperatureReadings) {
      const readings = Object.entries(shower.temperatureReadings)
        .map(([time, temp]) => ({
          time: parseInt(time),
          temperature: parseFloat(temp)
        }))
        .sort((a, b) => a.time - b.time);

      let coldStartTime = null;
      for (let i = 0; i < readings.length; i++) {
        const reading = readings[i];
        if (reading.temperature < 65) {
          if (coldStartTime === null) {
            coldStartTime = reading.time;
          }
          if (reading.time - coldStartTime >= 120) {
            return '#2196f3';
          }
        } else {
          coldStartTime = null;
        }
      }
    }

    const temp = shower.avgTemp;
    if (temp < 70) return '#4fc3f7';
    if (temp < 80) return '#81d4fa';
    return '#ff7043';
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
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
        if (!shower.temperatureReadings) {
          return false;
        }
        
        const readings = Object.entries(shower.temperatureReadings)
          .map(([time, temp]) => ({
            time: parseInt(time),
            temperature: parseFloat(temp)
          }))
          .filter(reading => !isNaN(reading.temperature) && !isNaN(reading.time))
          .sort((a, b) => a.time - b.time);

        if (readings.length < 2) {
          return false;
        }

        const coldDataPoints = readings.filter(reading => reading.temperature < 65).length;
        
        if (coldDataPoints >= 120) {
          return true;
        }

        const startTime = readings[0].time;
        const endTime = readings[readings.length - 1].time;
        const totalDuration = endTime - startTime;
        
        if (totalDuration <= 30) {
          return false;
        }
        
        let coldDuration = 0;
        
        for (let i = 0; i < readings.length - 1; i++) {
          const currentReading = readings[i];
          const nextReading = readings[i + 1];
          const segmentDuration = nextReading.time - currentReading.time;
          
          if (currentReading.temperature < 67) {
            coldDuration += segmentDuration;
          }
        }
        
        const avgTimeBetweenReadings = totalDuration / (readings.length - 1);
        if (readings[readings.length - 1].temperature < 65) {
          coldDuration += avgTimeBetweenReadings;
        }

        const coldPercentage = (coldDuration / totalDuration) * 100;
        const isColdByDuration = coldPercentage >= 50;
        
        return coldDataPoints >= 120 || isColdByDuration;
      });

      if (!wasCold) {
        shouldContinue = false;
        continue;
      }

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

const DevicePage = () => {
  const { deviceId } = useParams();
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
        const data = await fetchData(`/${deviceId}/showers`);
        if (!isMounted) return;
        
        if (!data) {
          setError('No shower data available');
          return;
        }
        
        const showerArray = Object.entries(data)
          .map(([id, shower]) => ({
            id,
            ...shower
          }))
          .filter(shower => shower.startTime && shower.startTime !== 'Unknown')
          .sort((a, b) => {
            const dateA = new Date(a.startTime.includes('T') ? a.startTime : a.startTime + 'Z');
            const dateB = new Date(b.startTime.includes('T') ? b.startTime : b.startTime + 'Z');
            return dateB.getTime() - dateA.getTime();
          });
        
        setShowers(showerArray);
      } catch (err) {
        if (isMounted) {
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
  }, [deviceId]);

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
    
    pageNumbers.push(1);
    
    if (currentPage > 2) {
      pageNumbers.push(currentPage - 1);
    }
    if (currentPage !== 1 && currentPage !== totalPages) {
      pageNumbers.push(currentPage);
    }
    if (currentPage < totalPages - 1) {
      pageNumbers.push(currentPage + 1);
    }
    
    if (totalPages > 1 && !pageNumbers.includes(totalPages)) {
      pageNumbers.push(totalPages);
    }
    
    return [...new Set(pageNumbers)].sort((a, b) => a - b);
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(showers.length / showersPerPage);
    const pageNumbers = getPageNumbers();
    
    return (
      <div className="pagination">
        {pageNumbers.map((number, index) => {
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
            <h2 className="profile-title">Declan&apos;s Showers</h2>
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
          <img 
            src={deviceId === '15681139' ? declanPfp : rajveerPfp} 
            alt={deviceId === '15681139' ? "Declan" : "Rajveer"} 
            className="profile-picture" 
          />
        </div>
        <ColdShowerStreak showers={showers} />
        <Calendar showers={showers} />
      </div>

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

export default DevicePage; 