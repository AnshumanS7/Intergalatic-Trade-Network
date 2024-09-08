// api-gateway/index.js

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Apply security best practices
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000', // Only allow requests from the client application
  methods: ['GET', 'POST'],
}));

// Proxy configuration for Trade Service
app.use('/api/trades', createProxyMiddleware({
  target: 'http://localhost:3001', // Trade service URL
  changeOrigin: true,
  pathRewrite: { '^/api/trades': '/trades' }, // Rewrite paths to match the Trade Service
}));

// Proxy configuration for Cargo Service
app.use('/api/cargo', createProxyMiddleware({
  target: 'http://localhost:3002', // Cargo service URL
  changeOrigin: true,
  pathRewrite: { '^/api/cargo': '/cargo' }, // Rewrite paths to match the Cargo Service
}));

// Proxy configuration for Inventory Service
app.use('/api/inventory', createProxyMiddleware({
  target: 'http://localhost:3003', // Inventory service URL
  changeOrigin: true,
  pathRewrite: { '^/api/inventory': '/inventory' }, // Rewrite paths to match the Inventory Service
}));

app.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
});
