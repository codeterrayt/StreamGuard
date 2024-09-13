// consumer.js
const { Kafka } = require('kafkajs');
const mongoose = require('mongoose');


require('dotenv').config();

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: [process.env.KAFKA_BROKER]
});

const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID });
const topic = 'location';

// Mongoose setup
const mongoUrl = process.env.MONGO_URL; 
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
const bufferSize = process.env.MAX_DATA_LENGTH_BUFFER;

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

           buffer.length = 0;
           // Manually commit offsets
           await consumer.commitOffsets([
             { topic, partition, offset: (parseInt(message.offset, 10) + 1).toString() }
           ]);
           console.log('Offsets committed');

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
