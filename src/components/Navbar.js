import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import AboutModal from './AboutModal';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, signInWithGoogle, signOutUser } = useAuth();
  const location = useLocation();
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Show the About modal when the component mounts
  useEffect(() => {
    // Check if the user has seen the modal before
    const hasSeenModal = localStorage.getItem('hasSeenAboutModal');
    
    if (!hasSeenModal) {
      // Show the modal
      setIsAboutModalOpen(true);
      
      // Mark that the user has seen the modal
      localStorage.setItem('hasSeenAboutModal', 'true');
    }
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo">
            🚿 Shiver
          </Link>
        </div>
        
        <div className="navbar-links">
          <Link 
            to="/" 
            className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Shower Feed
          </Link>
          {currentUser && (
            <Link 
              to="/profile" 
              className={`navbar-link ${location.pathname === '/profile' ? 'active' : ''}`}
            >
              Profile
            </Link>
          )}
          <button 
            className="navbar-link about-button"
            onClick={() => setIsAboutModalOpen(true)}
          >
            About
          </button>
        </div>
        
        <div className="navbar-auth">
          {currentUser && (
            <div className="user-profile">
              <img 
                src={currentUser.photoURL || '/profilePictures/default.png'} 
                alt={currentUser.displayName || 'User'} 
                className="user-avatar"
              />
              <span className="user-name">{currentUser.displayName || 'User'}</span>
              <button onClick={handleSignOut} className="sign-out-button">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      <AboutModal 
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </>
  );
};

export default Navbar; 