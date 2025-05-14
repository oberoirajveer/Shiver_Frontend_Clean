import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchShowers } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Profile.css';

const Profile = () => {
  const { currentUser } = useAuth();
  const [userShowers, setUserShowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalShowers: 0,
    avgDuration: 0,
    avgTemp: 0,
    coldestTemp: 0,
    totalDuration: 0
  });

  useEffect(() => {
    const loadUserShowers = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        setError(null);
        const allShowers = await fetchShowers();
        
        // Filter showers for the current user
        const userShowers = allShowers.filter(shower => 
          shower.userID === currentUser.uid
        );
        
        setUserShowers(userShowers);
        
        // Calculate stats
        if (userShowers.length > 0) {
          const totalShowers = userShowers.length;
          const totalDuration = userShowers.reduce((sum, shower) => sum + (shower.duration || 0), 0);
          const avgDuration = totalDuration / totalShowers;
          
          const allTemps = userShowers.flatMap(shower => {
            if (shower.temperatureReadings) {
              return Object.values(shower.temperatureReadings);
            }
            return [shower.temperature];
          }).filter(temp => temp !== undefined && temp !== null);
          
          const avgTemp = allTemps.length > 0 
            ? allTemps.reduce((sum, temp) => sum + temp, 0) / allTemps.length 
            : 0;
          
          const coldestTemp = allTemps.length > 0 
            ? Math.min(...allTemps) 
            : 0;
          
          setStats({
            totalShowers,
            avgDuration,
            avgTemp,
            coldestTemp,
            totalDuration
          });
        }
      } catch (err) {
        setError('Failed to load user showers');
        console.error('Error loading user showers:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserShowers();
  }, [currentUser]);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (!currentUser) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          Please sign in to view your profile.
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img 
          src={currentUser.photoURL || '/profilePictures/default.png'} 
          alt={currentUser.displayName || 'User'} 
          className="profile-avatar"
        />
        <div className="profile-info">
          <h1>{currentUser.displayName || 'User'}</h1>
          <p className="profile-email">{currentUser.email}</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="profile-stats">
        <div className="stat-card">
          <span className="stat-value">{stats.totalShowers}</span>
          <span className="stat-label">Total Showers</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatDuration(stats.avgDuration)}</span>
          <span className="stat-label">Avg Duration</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.avgTemp.toFixed(1)}°F</span>
          <span className="stat-label">Avg Temperature</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.coldestTemp.toFixed(1)}°F</span>
          <span className="stat-label">Coldest Shower</span>
        </div>
      </div>

      <div className="profile-showers">
        <h2>Your Shower History</h2>
        {loading ? (
          <div className="loading">Loading your showers...</div>
        ) : userShowers.length > 0 ? (
          <div className="shower-list">
            {userShowers.map(shower => (
              <div key={shower.id} className="shower-card">
                <div className="shower-card-header">
                  <span className="shower-date">
                    {new Date(shower.startTime).toLocaleString()}
                  </span>
                  <span className="shower-duration">
                    {formatDuration(shower.duration)}
                  </span>
                </div>
                <div className="shower-card-stats">
                  <div className="shower-stat">
                    <span className="shower-stat-label">Min Temp</span>
                    <span className="shower-stat-value">{shower.minTemp}°F</span>
                  </div>
                  <div className="shower-stat">
                    <span className="shower-stat-label">Max Temp</span>
                    <span className="shower-stat-value">{shower.maxTemp}°F</span>
                  </div>
                  <div className="shower-stat">
                    <span className="shower-stat-label">Avg Temp</span>
                    <span className="shower-stat-value">{shower.avgTemp}°F</span>
                  </div>
                </div>
                {shower.temperatureReadings && (
                  <div className="shower-chart">
                    <ResponsiveContainer width="100%" height={100}>
                      <LineChart data={Object.entries(shower.temperatureReadings)
                        .map(([time, temp]) => ({
                          time: parseInt(time),
                          temperature: temp
                        }))
                        .sort((a, b) => a.time - b.time)
                      }>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis 
                          dataKey="time" 
                          stroke="#888"
                          tickFormatter={(value) => `${Math.floor(value / 60)}m`}
                        />
                        <YAxis 
                          domain={["auto", "auto"]} 
                          stroke="#888"
                          tickFormatter={(value) => `${value}°F`}
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
                          stroke="#00b4d8" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-showers">
            You haven&apos;t taken any showers yet. Start your cold shower journey today!
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 