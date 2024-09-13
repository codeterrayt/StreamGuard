// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { connectProducer, sendMessage, disconnectProducer } = require('./producer');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Initialize Kafka producer
(async () => {
  await connectProducer();
})();

app.post('/push/location', async (req, res) => {
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).send('Latitude and longitude are required');
  }

  // Push data to Kafka
  await sendMessage(process.env.KAFKA_TOPIC, { latitude, longitude });

  res.send('Location data received');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Clean up on exit
process.on('SIGINT', async () => {
  await disconnectProducer();
  process.exit();
});
