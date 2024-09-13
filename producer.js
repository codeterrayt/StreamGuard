
require('dotenv').config();
// producer.js
const { Kafka, Partitioners  } = require('kafkajs');

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers:[process.env.KAFKA_BROKER]
});

console.log({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers:[process.env.KAFKA_BROKER]
})

const producer = kafka.producer();

// const producer = kafka.producer({
//     createPartitioner: Partitioners.LegacyPartitioner
//   });
  

const connectProducer = async () => {
  await producer.connect();
};

const sendMessage = async (topic, message) => {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
};

const disconnectProducer = async () => {
  await producer.disconnect();
};

module.exports = { connectProducer, sendMessage, disconnectProducer };
