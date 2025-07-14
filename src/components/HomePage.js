import React, { useState } from 'react';
import './HomePage.css';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      image: '/images/shower-bg.png'
    },
    {
      image: '/images/SensorUnitRender.png'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Build Your Cold Shower Habit.</h1>
          <p className="hero-subtitle">
            Consistent cold exposure is a powerful way to improve your health. Set your goals and track your progress with the Shiver Sensor.
          </p>
          <div className="hero-cta">
            <a href="https://buy.stripe.com/3cs4hC78vd0ib6w7st" className="cta-button secondary" target="_blank" rel="noopener noreferrer">
              Pre-Order
            </a>
          </div>
          <div className="social-links">
            <a href="https://www.instagram.com/ishiverdevice/" className="social-link" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" className="social-icon">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://www.tiktok.com/@ishiverdevice?is_from_webapp=1&sender_device=pc" className="social-link" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" className="social-icon">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSdlpSncLIMbUK1oyUk9rC5f0s9mzD1_d7pdYYyOEO_yXA9Vvg/viewform?usp=dialog" className="social-link" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" className="social-icon">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
            </a>
          </div>
        </div>
        <div className="hero-image-container">
          <div 
            className="hero-image"
            style={{ 
              backgroundImage: `url(${slides[currentSlide].image})`
            }}
          />
          <button className="slide-arrow" onClick={nextSlide}>
            <span>❯</span>
          </button>
        </div>
        <div className="slide-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`slide-indicator ${currentSlide === index ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
        <div className="disclaimer">
          <p>*The image shown is a render. The final product footprint may vary.</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>What Does Shiver Track?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3 className="feature-title">Shower Temperatures</h3>
            <p>A cold shower is typically between 55-65°F. Are you within that range?</p>
            <img 
              src="/images/Temperature Stats.png"
              alt="Temperature Statistics" 
              className="feature-image"
            />
          </div>
          <div className="feature-card">
            <h3>Are your showers a mix of hot and cold water? We got you covered.</h3>
            <p>Dig into the data to ensure that the water temperature was right, at different times of your shower, based on your cold shower goals.</p>
            <img 
              src="/images/Temperature Graph.png"
              alt="Temperature Graph" 
              className="feature-image"
            />
          </div>
          <div className="feature-card">
            <h3>Streaks</h3>
            <p>Set a goal and build a streak. We&apos;ll help you track your progress.</p>
            <img 
              src="/images/WeekyGoals.png"
              alt="Weekly Goals View" 
              className="feature-image"
            />
          </div>
        </div>
        <p className="features-disclaimer">*All plots shown above display real data collected by the Shiver Prototype.</p>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to take healthier showers?</h2>
          <p>Be a part of the healthy shower revolution.</p>
          <a href="https://buy.stripe.com/3cs4hC78vd0ib6w7st" className="cta-button primary" target="_blank" rel="noopener noreferrer">
            Pre-Order
          </a>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 