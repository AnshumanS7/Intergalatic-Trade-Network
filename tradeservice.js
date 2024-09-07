const helmet = require('helmet');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');

const app = express(); // Initialize express app

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'blob:'],
      objectSrc: ["'none'"],
      connectSrc: ["'self'", 'ws://localhost:3002'],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));


app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/intergalactic_trade', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Trade Schema
const tradeSchema = new mongoose.Schema({
  buyer_id: String,
  seller_id: String,
  item_id: String,
  quantity: Number,
  price: Number,
  status: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Define Cargo Schema
const cargoSchema = new mongoose.Schema({
  shipment_id: String,
  origin_station_id: String,
  destination_station_id: String,
  items: [{ item_id: String, quantity: Number }],
  departure_time: Date,
  arrival_time: Date,
  status: { type: String, default: 'in-transit' },
  last_updated: { type: Date, default: Date.now },
});

// Create Trade and Cargo Models
const Trade = mongoose.model('Trade', tradeSchema);
const Cargo = mongoose.model('Cargo', cargoSchema);

// API to initiate a new trade
app.post('/api/trades', async (req, res) => {
  const { buyer_id, seller_id, item_id, quantity, price } = req.body;
  const newTrade = new Trade({ buyer_id, seller_id, item_id, quantity, price });

  try {
    const savedTrade = await newTrade.save();
    res.status(201).json(savedTrade);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create trade.' });
  }
});

// API to get trade details by ID
app.get('/api/trades/:transactionId', async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.transactionId);
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found.' });
    }
    res.json(trade);
  } catch (error) {
    console.error('Error fetching trade details:', error);
    res.status(500).json({ error: 'Failed to fetch trade details.' });
  }
});

// POST /api/cargo - Create a new cargo shipment
app.post('/api/cargo', async (req, res) => {
  const { shipment_id, origin_station_id, destination_station_id, items, departure_time, arrival_time } = req.body;
  const newCargo = new Cargo({ shipment_id, origin_station_id, destination_station_id, items, departure_time, arrival_time });

  try {
    const savedCargo = await newCargo.save();
    res.status(201).json(savedCargo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create cargo shipment.' });
  }
});

// GET /api/cargo/{shipmentId} - Retrieve cargo shipment details
app.get('/api/cargo/:shipmentId', async (req, res) => {
  const { shipmentId } = req.params;

  try {
    const cargo = await Cargo.findOne({ shipment_id: shipmentId });
    if (cargo) {
      res.json(cargo);
    } else {
      res.status(404).json({ error: 'Cargo shipment not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cargo shipment details.' });
  }
});

// GET /api/updates/real-time - Retrieve real-time updates on trade and cargo status
app.get('/api/updates/real-time', async (req, res) => {
  try {
    const trades = await Trade.find({}).sort({ created_at: -1 }).limit(10);
    const cargos = await Cargo.find({}).sort({ last_updated: -1 }).limit(10);
    res.json({ trades, cargos });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch real-time updates.' });
  }
});

// Create HTTP server and attach socket.io
const server = http.createServer(app);
const io = socketIo(server);

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('New client connected');

  // Emit updates to connected clients
  setInterval(async () => {
    try {
      const trades = await Trade.find({}).sort({ created_at: -1 }).limit(10);
      const cargos = await Cargo.find({}).sort({ last_updated: -1 }).limit(10);
      socket.emit('real-time-updates', { trades, cargos });
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    }
  }, 5000); // Send updates every 5 seconds

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the server with socket.io
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Inventory Management Service with WebSocket running on port ${PORT}`);
});
