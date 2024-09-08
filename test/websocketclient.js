// test/websocketClient.js

const io = require('socket.io-client');

const socket = io('http://localhost:3002'); // Replace with your server's URL

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('real-time-updates', (data) => {
  console.log('Received real-time updates:', data);
});

socket.on('error-message', (error) => {
  console.error('Error message received:', error);
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});
