const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('./db'); // Import the shared MongoDB connection

const app = express();
app.use(bodyParser.json());

// Define Inventory Schema
const inventorySchema = new mongoose.Schema({
  station_id: String,
  item_id: String,
  item_name: String,
  quantity: { type: Number, default: 0 },
  last_updated: { type: Date, default: Date.now },
});

// Create Inventory Model
const Inventory = mongoose.model('Inventory', inventorySchema);

// API to add or remove items from inventory
app.post('/api/inventory/:stationId', async (req, res) => {
  const { stationId } = req.params;
  const { item_id, item_name, quantity } = req.body;

  try {
    // Find the inventory item or create a new one if it doesn't exist
    let inventoryItem = await Inventory.findOne({ station_id: stationId, item_id });

    if (inventoryItem) {
      // Update existing inventory item
      inventoryItem.quantity += quantity; // Positive quantity to add, negative to remove
      inventoryItem.last_updated = Date.now();
    } else {
      // Create new inventory item
      inventoryItem = new Inventory({
        station_id: stationId,
        item_id,
        item_name,
        quantity,
      });
    }

    const savedItem = await inventoryItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update inventory.' });
  }
});

// API to get inventory levels for a station
app.get('/api/inventory/:stationId', async (req, res) => {
  const { stationId } = req.params;

  try {
    const inventory = await Inventory.find({ station_id: stationId });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory levels.' });
  }
});

// API to list inventory
app.get('/api/inventory/:stationId/history', async (req, res) => {
  const { stationId } = req.params;

  try {
    const inventoryHistory = await Inventory.find({ station_id: stationId }).sort({ last_updated: -1 });
    res.json(inventoryHistory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory history.' });
  }
});

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Inventory Management Service running on port ${PORT}`);
});
