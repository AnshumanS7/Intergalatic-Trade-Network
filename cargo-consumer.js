const kafka = require('kafka-node');
const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/intergalactic_trade'); 

const Cargo = require('./cargo-service.js'); // Implement this service similarly to Inventory

// Kafka Client and Consumer Setup
const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const consumer = new kafka.Consumer(
  client,
  [{ topic: 'cargo-updates', partition: 0 }],
  {
    autoCommit: true,
  }
);

consumer.on('message', async (message) => {
  console.log('Received cargo update:', message);

  try {
    const cargoUpdate = JSON.parse(message.value);
    
    // Process cargo updates
    await updateCargo(cargoUpdate);
  } catch (error) {
    console.error('Error processing cargo update:', error);
  }
});

consumer.on('error', (err) => {
  console.error('Error with Kafka consumer:', err);
});

// Function to update cargo status
const updateCargo = async (update) => {
  try {
    // Fetch or update cargo document
    let cargo = await Cargo.findOne({ cargo_id: update.cargo_id });
    
    if (!cargo) {
      cargo = new Cargo({
        cargo_id: update.cargo_id,
        status: update.status,
        last_updated: Date.now(),
        // Additional fields as needed
      });
    } else {
      cargo.status = update.status;
      cargo.last_updated = Date.now();
    }

    await cargo.save();
    console.log('Cargo updated successfully');
  } catch (error) {
    console.error('Error updating cargo:', error);
  }
};
