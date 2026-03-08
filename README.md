# 🎮 GridBlock - Multiplayer Number Grid Game

A real-time multiplayer web game where players take turns marking numbers on a shared 5x5 grid. The first player to complete 5 lines (rows, columns, or diagonals) wins!

## 🌟 Features

- **Real-time Multiplayer**: Play with 2-4 players simultaneously
- **WebSocket Communication**: Instant game state synchronization using Socket.IO
- **Turn-based Gameplay**: 30-second turns with automatic timer
- **Live Chat**: Communicate with other players during the game
- **Ready System**: All players must ready up before the game starts
- **Score Tracking**: Keep track of wins across multiple rounds
- **Responsive Design**: Works on desktop and mobile devices
- **Room System**: Create private rooms with unique 6-character codes

## 🛠️ Tech Stack

### Server
- **Node.js** - Runtime environment
- **Express** - Web server framework
- **Socket.IO** - WebSocket communication
- **CORS** - Cross-origin resource sharing

### Client
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Socket.IO Client** - WebSocket client
- **CSS3** - Styling with gradients and animations

## 📋 Prerequisites

- **Node.js** 16+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Quick Start

### 1. Clone/Extract the Project

```bash
cd gridblock-multiplayer
```

### 2. Install Server Dependencies

```bash
cd server
npm install
```

### 3. Install Client Dependencies

```bash
cd ../client
npm install
```

### 4. Start the Server

```bash
cd ../server
npm start
```

The server will start on `http://localhost:4000`

### 5. Start the Client (in a new terminal)

```bash
cd ../client
npm run dev
```

The client will start on `http://localhost:3000`

### 6. Open Multiple Browser Windows

- Open `http://localhost:3000` in 2-4 browser windows/tabs
- Each window represents a different player
- Create a room in one window and join with the room code in others

## 🎯 How to Play

### Creating a Game

1. **Enter Your Name**: Type your player name in the lobby
2. **Create Room**: Click "Create Room" to generate a unique room code
3. **Share Code**: Share the 6-character room code with friends
4. **Wait for Players**: Wait for 2-4 players to join

### Joining a Game

1. **Enter Your Name**: Type your player name
2. **Enter Room Code**: Type the 6-character room code
3. **Join Room**: Click "Join Room"

### Playing

1. **Ready Up**: Click "Mark as Ready" when you're ready to start
2. **Game Starts**: When all players are ready, the game begins automatically
3. **Your Turn**: When it's your turn, click any unmarked cell to mark it
4. **Timer**: You have 30 seconds per turn
5. **Win Condition**: Complete 5 lines (rows, columns, or diagonals) to win
6. **Rematch**: After a game ends, click "Play Again" to reset

## 📁 Project Structure

```
gridblock-multiplayer/
├── server/
│   ├── src/
│   │   ├── index.js           # Server entry point
│   │   ├── gameManager.js     # Game state management
│   │   └── roomHandler.js     # WebSocket event handlers
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── Components/
│   │   │   ├── Lobby.jsx      # Room creation/joining
│   │   │   ├── GameRoom.jsx   # Main game interface
│   │   │   ├── Board.jsx      # Game board component
│   │   │   ├── Lobby.css
│   │   │   ├── GameRoom.css
│   │   │   └── Board.css
│   │   ├── Context/
│   │   │   └── SocketContext.jsx  # WebSocket context
│   │   ├── App.jsx            # Main app component
│   │   ├── App.css
│   │   └── main.jsx           # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## 🔧 Configuration

### Server Port

Edit `server/src/index.js`:
```javascript
const PORT = process.env.PORT || 4000;
```

### Client Socket URL

Create `client/.env`:
```
VITE_SOCKET_URL=http://localhost:4000
```

For production, change to your server URL:
```
VITE_SOCKET_URL=https://your-server.com
```

## 🎮 WebSocket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `create_room` | `playerName` | Create a new game room |
| `join_room` | `{roomCode, playerName}` | Join an existing room |
| `toggle_ready` | `roomCode` | Toggle ready status |
| `make_move` | `{roomCode, cellIndex}` | Mark a cell on the board |
| `reset_game` | `roomCode` | Reset game for rematch |
| `send_message` | `{roomCode, message}` | Send chat message |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `room_created` | `room` | Room successfully created |
| `room_joined` | `room` | Successfully joined room |
| `room_updated` | `room` | Room state updated |
| `game_started` | `room` | Game has started |
| `move_made` | `{room, cellIndex, playerId}` | Player made a move |
| `turn_timer_update` | `timeLeft` | Turn timer update |
| `game_over` | `{winner, room}` | Game finished |
| `game_reset` | `room` | Game reset for rematch |
| `player_left` | `room` | Player disconnected |
| `chat_message` | `{playerName, message}` | Chat message received |

## 🐛 Development

### Run Server in Development Mode

```bash
cd server
npm run dev
```

Uses `nodemon` for auto-restart on file changes.

### Run Client in Development Mode

```bash
cd client
npm run dev
```

Vite provides hot module replacement (HMR).

## 🏗️ Building for Production

### Build Client

```bash
cd client
npm run build
```

Creates optimized production build in `client/dist/`

### Serve Static Files

You can serve the built client files from the Express server:

```javascript
// In server/src/index.js
app.use(express.static(path.join(__dirname, '../../client/dist')));
```

## 🚢 Deployment

### Deploy to Render/Railway/Heroku

1. Set `PORT` environment variable
2. Update `VITE_SOCKET_URL` to production server URL
3. Build client: `npm run build`
4. Start server: `npm start`

### CORS Configuration

Update `server/src/index.js` with your production URL:

```javascript
const io = new Server(httpServer, {
  cors: {
    origin: ['https://your-frontend-domain.com'],
    methods: ['GET', 'POST']
  }
});
```

## 🎨 Customization

### Change Board Size

Edit `server/src/gameManager.js`:
```javascript
const boardSize = 5; // Change to 4, 6, 7, etc.
```

### Change Turn Time

Edit `server/src/gameManager.js`:
```javascript
settings: {
  maxPlayers: 4,
  turnTime: 30  // Change to desired seconds
}
```

### Change Win Condition

Edit `makeMove()` function in `server/src/gameManager.js`:
```javascript
if (lines >= 5) {  // Change win condition
  room.gameState.winner = socketId;
}
```

## 📝 Game Rules

1. Players take turns marking cells on a 5x5 grid
2. Each cell contains a number from 0-24 (randomized each game)
3. On your turn, click any unmarked cell to mark it with an "X"
4. You have 30 seconds to make your move
5. Complete 5 lines to win:
   - 5 horizontal rows
   - 5 vertical columns
   - 2 diagonals
6. If timer runs out, turn automatically passes to next player

## 🤝 Contributing

Feel free to fork, improve, and submit pull requests!

## 📄 License

MIT License - Feel free to use this project for learning or commercial purposes.

## 🆘 Troubleshooting

### Connection Issues

- Ensure server is running on port 4000
- Check firewall settings
- Verify `VITE_SOCKET_URL` is correct

### Players Can't Join

- Verify room code is exactly 6 characters
- Ensure game hasn't started yet
- Check if room is full (max 4 players)

### Game Not Starting

- All players must click "Mark as Ready"
- Need at least 2 players to start

## 🎉 Enjoy Playing GridBlock!

Have fun competing with friends in this fast-paced number grid game!
