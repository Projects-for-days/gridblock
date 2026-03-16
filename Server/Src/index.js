const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const roomHandler = require('./roomHandler');

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://tangerine-travesseiro-8d8fa9.netlify.app'
    ],
    methods: ['GET', 'POST']
  }
});
app.get('/', (req, res) => {
  res.send('GridBlock server is running!');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);
  
  // Pass io and socket to roomHandler to handle all room events
  roomHandler(io, socket);

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🎮 GridBlock server running on http://localhost:${PORT}`);
});
