const kafka = require('kafka-node');
const winston = require('winston');

// Configure Winston Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'producer.log' }) // Log file for persistent logs
  ],
});

// Kafka Client and Producer Setup
const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const producer = new kafka.Producer(client);

producer.on('ready', () => {
  logger.info('Kafka Producer is connected and ready.');
});

// Function to send event to Kafka
const sendEventToKafka = (topic, message) => {
  const payloads = [{ topic, messages: JSON.stringify(message) }];
  producer.send(payloads, (err, data) => {
    if (err) {
      logger.error('Failed to send message to Kafka', { error: err });
    } else {
      logger.info('Message sent to Kafka', { topic, data });
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

// New Event: Cargo Status Update
const cargoStatusEvent = {
  shipment_id: 'SH123',
  origin_station_id: 'ST01',
  destination_station_id: 'ST02',
  status: 'arrived',
  arrival_time: new Date(),
};
sendEventToKafka('cargo-updates', cargoStatusEvent);

// New Event: Shipment Delay Notification
const shipmentDelayEvent = {
  shipment_id: 'SH123',
  reason: 'meteor storm',
  delayed_by: '2 hours',
};
sendEventToKafka('shipment-delays', shipmentDelayEvent);

// New Event: Inventory Adjustment
const inventoryAdjustmentEvent = {
  item_id: 'IT1002',
  stationId: 'ST01',
  adjustment: -5, // e.g., 5 units sold or damaged
  reason: 'sold',
};
sendEventToKafka('inventory-adjustments', inventoryAdjustmentEvent);
