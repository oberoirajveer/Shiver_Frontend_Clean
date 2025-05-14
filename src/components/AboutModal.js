import React from 'react';
import './AboutModal.css';

const AboutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="about-modal-overlay" onClick={onClose}>
      <div className="about-modal-content" onClick={e => e.stopPropagation()}>
        <button className="about-modal-close" onClick={onClose}>×</button>
        
        <div className="about-modal-header">
          <h2>About Shiver</h2>
        </div>

        <div className="about-modal-body">
          <section className="about-section">
            <h3>Our North Star</h3>
            <p className="about-paragraph">Do hard stuff, voluntarily. </p>
          </section>

          <section className="about-section">
            <h3>Founder</h3>
            <p className="about-paragraph">
              Shiver was created in 2025 by <a href="https://rajveeroberoi.com" target="_blank" rel="noopener noreferrer">Rajveer Oberoi</a>.
            </p>
            <p className="about-paragraph">
              He likes to take cold showers. He thinks others might as well.
            </p>

            <p className="about-paragraph">
              The Showers shown on the &quot;Dashboard&quot; page are Rajveer&apos;s; they update in real time. Do you think you can take colder ones?
            </p>
          </section>

          <section className="about-section">
            <h3>How do I Use This?</h3>
            <p className="about-paragraph">
              Shiver requires the install of a device onto your shower head. You can preorder one <a href="https://buy.stripe.com/3cs4hC78vd0ib6w7st" target="_blank" rel="noopener noreferrer">here</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutModal; 