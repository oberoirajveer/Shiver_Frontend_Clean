import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import AboutModal from './AboutModal';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, signOutUser } = useAuth();
  const location = useLocation();
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-brand">
            <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
              Shiver
            </Link>
          </div>
          
          <button className="mobile-menu-button" onClick={toggleMobileMenu}>
            <span className={`menu-icon ${isMobileMenuOpen ? 'open' : ''}`}></span>
          </button>

          <div className={`navbar-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <Link to="/" className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`} onClick={closeMobileMenu}>
              Home
            </Link>
            <Link to="/profile" className={`navbar-link ${location.pathname === '/profile' ? 'active' : ''}`} onClick={closeMobileMenu}>
              Demo
            </Link>
            <Link to="/device/15681139" className={`navbar-link ${location.pathname === '/device/15681139' ? 'active' : ''}`} onClick={closeMobileMenu}>
              Device
            </Link>
            <button 
              className="navbar-link" 
              onClick={() => {
                setIsAboutModalOpen(true);
                closeMobileMenu();
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              About
            </button>
          </div>
          
          <div className={`navbar-auth ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            {currentUser ? (
              <div className="user-profile">
                <img 
                  src={currentUser.photoURL || '/profilePictures/default.png'} 
                  alt={currentUser.displayName || 'User'} 
                  className="user-avatar"
                />
                <button onClick={handleSignOut} className="sign-out-button">
                  Sign Out
                </button>
              </div>
            ) : (
              <a href="https://buy.stripe.com/3cs4hC78vd0ib6w7st" className="login-button" target="_blank" rel="noopener noreferrer" onClick={closeMobileMenu}>
                Pre-Order
              </a>
            )}
          </div>
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