const kafka = require('kafka-node');
const mongoose = require('./db');  // Import shared MongoDB connection
const Inventory = require('./inventoryservice.js'); // Adjusted path

// Kafka Client and Consumer Setup
const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const consumer = new kafka.Consumer(
  client,
  [{ topic: 'trade-transactions', partition: 0 }],
  {
    autoCommit: true,
  }
);

consumer.on('message', async (message) => {
  console.log('Received message:', message);

  try {
    const transaction = JSON.parse(message.value);
    
    // Ensure that the document is fetched or created correctly
    await updateInventory(transaction);
  } catch (error) {
    console.error('Error processing message:', error);
  }
});

consumer.on('error', (err) => {
  console.error('Error with Kafka consumer:', err);
});

// Function to update inventory in MongoDB
const updateInventory = async (transaction) => {
  try {
    // Fetch the inventory document
    let inventory = await Inventory.findOne({ item_id: transaction.item_id });
    
    if (!inventory) {
      // Create a new document if it doesn't exist
      inventory = new Inventory({
        item_id: transaction.item_id,
        quantity: transaction.quantity,
        stationId: transaction.stationId, // Add other necessary fields
        status: transaction.status
      });
    } else {
      // Update existing document
      inventory.quantity += transaction.quantity;
      inventory.status = transaction.status; // Update status if necessary
    }

    // Save the document
    await inventory.save();
    console.log('Inventory updated successfully');
  } catch (error) {
    console.error('Error updating inventory:', error);
  }
};
