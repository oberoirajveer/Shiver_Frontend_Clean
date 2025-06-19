import React, { useState } from 'react';
import { testEmailService } from '../services/emailService';
import './EmailTest.css';

const EmailTest = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTestEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Sending test email...');

    try {
      const success = await testEmailService(email);
      if (success) {
        setStatus('Test email sent successfully!');
      } else {
        setStatus('Failed to send test email. Check console for details.');
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-test-container">
      <h2>Test Email Service</h2>
      <form onSubmit={handleTestEmail}>
        <div className="form-group">
          <label htmlFor="email">Email Address:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Test Email'}
        </button>
      </form>
      {status && <div className="status-message">{status}</div>}
    </div>
  );
};

export default EmailTest; 