import { database, ref, get } from '../firebase';
import { getUserProfile } from './userService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Email configuration
const DEVICE_EMAILS = {
  '15681139': 'oberoirajveer9@gmail.com'
};

/**
 * Sends a shower notification email to the user associated with the device
 * @param {Object} showerData - The shower data object
 * @param {string} deviceId - The device ID
 * @returns {Promise<boolean>} - Whether the email was sent successfully
 */
export const sendShowerNotification = async (showerData, deviceId) => {
  try {
    console.log(`[Debug] Attempting to send notification for device ${deviceId}`);
    console.log(`[Debug] Shower data:`, {
      duration: showerData.duration,
      startTime: showerData.startTime,
      hasTemperatureReadings: !!showerData.temperatureReadings,
      avgTemp: showerData.avgTemp,
      minTemp: showerData.minTemp,
      maxTemp: showerData.maxTemp
    });

    // Only send email if this device is configured to receive notifications
    const emailAddress = DEVICE_EMAILS[deviceId];
    if (!emailAddress) {
      console.log(`[Debug] No email configured for device ${deviceId}`);
      return false;
    }
    console.log(`[Debug] Sending email to: ${emailAddress}`);

    // Generate email content
    const emailContent = generateEmailTemplate(showerData);
    console.log(`[Debug] Generated email content:`, emailContent);

    // Send email through our backend API
    console.log(`[Debug] Sending request to: ${API_BASE_URL}/send-email`);
    const response = await fetch(`${API_BASE_URL}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: emailAddress,
        subject: 'Your Shower Statistics',
        html: emailContent,
        showerData: {
          ...showerData,
          formattedDuration: formatDuration(showerData.duration)
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Debug] Email API error: ${response.status} ${response.statusText}`);
      console.error(`[Debug] Error details:`, errorText);
      throw new Error('Failed to send email');
    }

    console.log(`[Debug] Email sent successfully`);
    return true;
  } catch (error) {
    console.error('[Debug] Error sending shower notification:', error);
    return false;
  }
};

/**
 * Generates the HTML email template for shower statistics
 * @param {Object} showerData - The shower data object
 * @returns {string} - The HTML email template
 */
const generateEmailTemplate = (showerData) => {
  const duration = formatDuration(showerData.duration);
  const avgTemp = showerData.avgTemp ? `${showerData.avgTemp}°F` : 'Unknown';
  const minTemp = showerData.minTemp ? `${showerData.minTemp}°F` : 'Unknown';
  const maxTemp = showerData.maxTemp ? `${showerData.maxTemp}°F` : 'Unknown';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2196f3; text-align: center;">Your Shower Statistics</h2>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 10px 0;"><strong>Duration:</strong> ${duration}</p>
        <p style="margin: 10px 0;"><strong>Average Temperature:</strong> ${avgTemp}</p>
        <p style="margin: 10px 0;"><strong>Min Temperature:</strong> ${minTemp}</p>
        <p style="margin: 10px 0;"><strong>Max Temperature:</strong> ${maxTemp}</p>
        <p style="margin: 10px 0;"><strong>Time:</strong> ${new Date(showerData.startTime).toLocaleString()}</p>
      </div>
      <div style="text-align: center; margin-top: 20px;">
        <p style="color: #666;">Keep up the great work with your cold showers!</p>
      </div>
    </div>
  `;
};

/**
 * Formats duration in seconds to a human-readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration string
 */
const formatDuration = (seconds) => {
  if (!seconds) return 'Unknown';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

/**
 * Test function to verify email service setup
 * @param {string} email - Email address to send test to
 * @returns {Promise<boolean>} - Whether the test email was sent successfully
 */
export const testEmailService = async (email) => {
  try {
    const testData = {
      startTime: new Date().toISOString(),
      duration: 300, // 5 minutes
      avgTemp: 65,
      minTemp: 60,
      maxTemp: 70,
      temperatureReadings: {
        "0": 70,
        "60": 68,
        "120": 65,
        "180": 63,
        "240": 62,
        "300": 60
      }
    };

    // Send test email through our backend API
    const response = await fetch(`${API_BASE_URL}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: email,
        subject: 'Test Email - Shower Statistics',
        showerData: testData
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send test email');
    }

    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    return false;
  }
}; 