const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/intergalactic_trade', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Cargo Schema
const cargoSchema = new mongoose.Schema({
  source: String,
  destination: String,
  items: [
    {
      item_id: String,
      quantity: Number,
    },
  ],
  status: { type: String, default: 'in transit' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Create Cargo Model
const Cargo = mongoose.model('Cargo', cargoSchema);

// API to create a new cargo shipment
app.post('/api/cargo', async (req, res) => {
  const { source, destination, items } = req.body;

  // Create a new cargo shipment
  const newCargo = new Cargo({
    source,
    destination,
    items,
    status: 'in transit',
  });

  try {
    const savedCargo = await newCargo.save();
    res.status(201).json(savedCargo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create cargo shipment.' });
  }
});

// API to get cargo shipment details by ID
app.get('/api/cargo/:shipmentId', async (req, res) => {
  try {
    const cargo = await Cargo.findById(req.params.shipmentId);
    if (!cargo) {
      return res.status(404).json({ error: 'Cargo shipment not found.' });
    }
    res.json(cargo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cargo shipment details.' });
  }
});

// API to update cargo status
app.put('/api/cargo/:shipmentId', async (req, res) => {
  const { status } = req.body;

  try {
    const cargo = await Cargo.findById(req.params.shipmentId);
    if (!cargo) {
      return res.status(404).json({ error: 'Cargo shipment not found.' });
    }

    // Update status
    cargo.status = status;
    cargo.updated_at = Date.now();

    const updatedCargo = await cargo.save();
    res.json(updatedCargo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cargo status.' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Cargo Management Service running on port ${PORT}`);
});
