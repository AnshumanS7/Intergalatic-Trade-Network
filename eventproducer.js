const kafka = require('kafka-node');

// Kafka Client and Producer Setup
const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const producer = new kafka.Producer(client);

producer.on('ready', () => {
  console.log('Kafka Producer is connected and ready.');
});

// Function to send event to Kafka
const sendEventToKafka = (topic, message) => {
  const payloads = [{ topic, messages: JSON.stringify(message) }];
  producer.send(payloads, (err, data) => {
    if (err) {
      console.error('Failed to send message to Kafka:', err);
    } else {
      console.log('Message sent to Kafka:', data);
    }
  });
};

// Example: Sending a trade transaction event
const tradeEvent = {
  transactionId: 'TX123',
  stationId: 'ST01',
  item_id: 'IT1001',
  quantity: 10,
  status: 'initiated',
};
sendEventToKafka('trade-transactions', tradeEvent);
