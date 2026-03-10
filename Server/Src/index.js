const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const roomHandler = require('./roomHandler');
const gameHandler = require('./gameHandler');

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.get('/', (req, res) => {
  res.send('GridBlock server is running!');
});

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);
  // Pass io and socket to roomHandler to handle all room events
  roomHandler(io, socket);
  gameHandler(io, socket);
});

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});