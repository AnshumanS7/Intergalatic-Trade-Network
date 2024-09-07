const kafka = require('kafka-node');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/intergalactic_trade', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define Trade Transaction Schema
const tradeSchema = new mongoose.Schema({
  transaction_id: String,
  from_station: String,
  to_station: String,
  item_id: String,
  quantity: Number,
  timestamp: { type: Date, default: Date.now },
});

const Trade = mongoose.model('Trade', tradeSchema);

// Kafka Client and Producer Setup
const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const producer = new kafka.Producer(client);

producer.on('ready', () => {
  console.log('Kafka Producer is ready');
});

producer.on('error', (err) => {
  console.error('Kafka Producer error:', err);
});

const sendTradeTransaction = (trade) => {
  const payloads = [
    { topic: 'trade-transactions', messages: JSON.stringify(trade) }
  ];

  producer.send(payloads, (err, data) => {
    if (err) console.error('Error sending trade transaction:', err);
    else console.log('Trade transaction sent:', data);
  });
};

// Example usage
const newTrade = {
  transaction_id: '12345',
  from_station: 'StationA',
  to_station: 'StationB',
  item_id: 'item001',
  quantity: 10
};

sendTradeTransaction(newTrade);
