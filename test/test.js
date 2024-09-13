const axios = require('axios');

// Initialize starting values for latitude and longitude
let latitude = 0.0;
let longitude = 0.0;

// Function to send a POST request with latitude and longitude
const sendRequest = async () => {
  try {
    const response = await axios.post('http://localhost:3000/push/location', {
      latitude: latitude,
      longitude: longitude,
    });
    console.log(`Request sent: Latitude ${latitude}, Longitude ${longitude}`);
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error sending request:', error);
  }
};

// Function to increase latitude and longitude values
const updateCoordinates = () => {
  latitude += 0.01; // Increment latitude
  longitude += 0.01; // Increment longitude
};

// Schedule to send 3 requests per second
const interval = 1000 / 3; // Interval in milliseconds

setInterval(() => {
  sendRequest();
  updateCoordinates();
}, interval);

console.log('Sending requests every', interval, 'milliseconds');
