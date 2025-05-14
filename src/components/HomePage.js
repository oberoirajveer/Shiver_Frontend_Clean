import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>A better shower starts with the Shiver Sensor</h1>
          <p className="hero-subtitle">
            The Shiver Sensor is the only device that seemlessly tracks your showers— allowing you to unlock better skin, hair, and all round health. Whether you're ready to build a cold shower habit or reduce excess hot water exposure, the Shiver Sensor is for you.
          </p>
          <div className="hero-cta">
            <a href="https://buy.stripe.com/3cs4hC78vd0ib6w7st" className="cta-button secondary" target="_blank" rel="noopener noreferrer">
              Pre-Order
            </a>
          </div>
        </div>
        <div 
          className="hero-image"
          style={{ 
            backgroundImage: `url('/images/shower-bg.png')`
          }}
        />
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
            <p>Dermatologists recommend shower temperatures to be below 105°F. Are you staying within that range?</p>
            <img 
              src="/images/Temperature Stats.png" 
              alt="Temperature Statistics" 
              className="feature-image"
            />
          </div>
          <div className="feature-card">
            <h3>How hot was the water when I washed my hair? What about my face?</h3>
            <p>Dig into the data to ensure that the water temperature was right, at different times of your shower, based on your specific needs</p>
            <img 
              src="/images/Temperature Graph.png" 
              alt="Temperature Graph" 
              className="feature-image"
            />
          </div>
          <div className="feature-card">
            <h3>Birds Eye View of Your Temperature Goals</h3>
            <p>Building a cold shower habit? Trying to reduce your heat exposure? We've got you covered.</p>
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