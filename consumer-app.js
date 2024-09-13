// consumer-app.js
const { runConsumer, disconnectConsumer } = require('./consumer');

(async () => {
  await runConsumer();
})();

process.on('SIGINT', async () => {
  await disconnectConsumer();
  process.exit();
});
