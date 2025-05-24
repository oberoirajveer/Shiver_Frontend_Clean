import React, { useState } from 'react';
import './HomePage.css';
import showerBg from '../assets/images/shower-bg.png';
import sensorUnitRender from '../assets/images/SensorUnitRender.png';
import temperatureStats from '../assets/images/Temperature Stats.png';
import temperatureGraph from '../assets/images/Temperature Graph.png';
import weeklyGoals from '../assets/images/WeekyGoals.png';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      image: showerBg
    },
    {
      image: sensorUnitRender
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
              src={temperatureStats}
              alt="Temperature Statistics" 
              className="feature-image"
            />
          </div>
          <div className="feature-card">
            <h3>Are your showers a mix of hot and cold water? We got you covered.</h3>
            <p>Dig into the data to ensure that the water temperature was right, at different times of your shower, based on your cold shower goals.</p>
            <img 
              src={temperatureGraph}
              alt="Temperature Graph" 
              className="feature-image"
            />
          </div>
          <div className="feature-card">
            <h3>Streaks</h3>
            <p>Set a goal and build a streak. We&apos;ll help you track your progress.</p>
            <img 
              src={weeklyGoals}
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