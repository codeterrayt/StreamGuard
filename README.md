# StreamGuard

**StreamGuard** is a powerful data management NodeJS Application designed to efficiently handle high-velocity data streams and reduce the load on MongoDB. It leverages Kafka to streamline the processing of real-time data, making it ideal for scenarios such as live GPS tracking and other applications requiring rapid data handling.

## Features

- **Real-Time Data Processing**: Handles fast-moving data streams efficiently.
- **Reduced MongoDB Overload**: Uses Kafka to alleviate pressure on MongoDB.
- **Bulk Insertion**: Performs bulk data operations to optimize performance.

## Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/codeterrayt/StreamGuard.git
cd StreamGuard
npm install
```

## Running the Application

1. **Start the Required Services**:

   - MongoDB:
     ```bash
     docker run -p 27017:27017 mongo
     ```
   - Zookeeper:
     ```bash
     docker run -p 2181:2181 zookeeper
     ```
   - Kafka:
     ```bash
     docker run -p 9092:9092 -e KAFKA_ZOOKEEPER_CONNECT=<IPv4-Address>:2181 -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://<IPv4-Address>:9092 -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 confluentinc/cp-kafka
     ```

2. **Run the Server and Consumer Applications**:

   ```bash
   node server.js
   node consumer-app.js
   ```

## Environment Variables

- **`MAX_DATA_LENGTH_BUFFER`**: Defines the maximum number of data entries to buffer before performing a bulk insertion. Set this to `10` to trigger bulk operations after accumulating 10 data entries.

   Example configuration in `.env` file:

   ```env
   MAX_DATA_LENGTH_BUFFER=100
   ```

## Usage

- **Server**: Manages data flow and interacts with Kafka.
- **Consumer**: Processes incoming data and performs bulk insertions based on the configured buffer length.

## Testing

To test the data ingestion and processing, you can use the provided test script:

1. **Run the Test Script**:

   ```bash
   node test/test.js
   ```

   This script sends 3 requests per second with incrementing latitude and longitude values to simulate data streaming.


## Contributing

Feel free to contribute by submitting issues or pull requests. For any questions or feedback, open an issue on the [GitHub repository](https://github.com/codeterrayt/StreamGuard).
