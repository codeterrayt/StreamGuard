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
const mongoUrl = 'mongodb://localhost:27017/locationDB'; // Replace with your MongoDB URL
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

const locationSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number
});

const Location = mongoose.model('Location', locationSchema);

const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const location = JSON.parse(message.value.toString());
      console.log(`Received message: ${JSON.stringify(location)}`);

      try {
        await Location.create(location);
        console.log('Document inserted into MongoDB');
      } catch (err) {
        console.error('Failed to insert document into MongoDB', err);
      }
    },
  });
};

const disconnectConsumer = async () => {
  await consumer.disconnect();
  await mongoose.disconnect();
};

module.exports = { runConsumer, disconnectConsumer };
