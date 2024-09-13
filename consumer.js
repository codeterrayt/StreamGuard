// consumer.js
const { Kafka } = require('kafkajs');
const mongoose = require('mongoose');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'] // Replace with your Kafka broker addresses
});

const consumer = kafka.consumer({ groupId: 'location-group' });
const topic = 'location';

// Mongoose setup
const mongoUrl = process.env.MONGO_URL; // Replace with your MongoDB URL
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

const locationSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number
});

const Location = mongoose.model('Location', locationSchema);

// Buffer to store messages
const buffer = [];
const bufferSize = 10;

const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const location = JSON.parse(message.value.toString());
      console.log(`Received message: ${JSON.stringify(location)}`);

      buffer.push(location);

      // Check if the buffer has reached the desired size
      if (buffer.length >= bufferSize) {
        try {
          await Location.insertMany(buffer);
          console.log('Documents inserted into MongoDB');
          // Clear the buffer after successful insert
          buffer.length = 0;
        } catch (err) {
          console.error('Failed to insert documents into MongoDB', err);
        }
      }
    },
  });
};

const disconnectConsumer = async () => {
  // Insert any remaining messages in the buffer before disconnecting
  if (buffer.length > 0) {
    try {
      await Location.insertMany(buffer);
      console.log('Documents inserted into MongoDB');
    } catch (err) {
      console.error('Failed to insert remaining documents into MongoDB', err);
    }
  }
  
  await consumer.disconnect();
  await mongoose.disconnect();
};

module.exports = { runConsumer, disconnectConsumer };
