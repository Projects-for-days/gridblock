const {
  getRoom, markNumberOnAllBoards,
  advanceTurn, getCurrentPlayer
} = require('./gameManager');

function gameHandler(io, socket) {

  // When a player starts the game from the lobby
  socket.on('start_game', (roomCode) => {
    const room = getRoom(roomCode);
    if (!room) return;
    if (room.players.length < 2) {
      socket.emit('game_error', 'Need at least 2 players to start');
      return;
    }

    room.gameStarted = true;
    const currentPlayer = getCurrentPlayer(roomCode);

    // Send each player their own board privately
    room.players.forEach(player => {
      io.to(player.id).emit('game_started', {
        board: player.board,
        markedNumbers: player.markedNumbers,
        currentTurn: currentPlayer.id,
        currentTurnName: currentPlayer.name,
        calledNumbers: room.calledNumbers,
        calledNumbersWithCaller: room.calledNumbersWithCaller || [],
        players: room.players.map(p => ({ id: p.id, name: p.name }))
      });
    });

    console.log(`Game started in room ${roomCode}`);
  });

  // When a player calls a number on their turn
  socket.on('call_number', ({ roomCode, number }) => {
    const room = getRoom(roomCode);
    if (!room) return;

    const currentPlayer = getCurrentPlayer(roomCode);

    // Make sure it's actually this player's turn
    if (currentPlayer.id !== socket.id) {
      socket.emit('game_error', 'It is not your turn');
      return;
    }

    // Make sure the number hasn't been called already
    if (room.calledNumbers.includes(number)) {
      socket.emit('game_error', 'That number has already been called');
      return;
    }

    // Mark the number on all boards (currentPlayer is the caller)
    markNumberOnAllBoards(roomCode, number, currentPlayer.id);

    // Advance to the next player's turn
    const nextPlayer = advanceTurn(roomCode);

    // Broadcast the update to everyone in the room
    io.to(roomCode).emit('number_called', {
      number,
      calledBy: currentPlayer.id,
      calledNumbers: room.calledNumbers,
      calledNumbersWithCaller: room.calledNumbersWithCaller,
      currentTurn: nextPlayer.id,
      currentTurnName: nextPlayer.name,
      // Send each player their updated marked numbers
      playerUpdates: room.players.map(p => ({
        id: p.id,
        markedNumbers: p.markedNumbers
      }))
    });

    console.log(`Number ${number} called in room ${roomCode}`);
  });

  // When a player's timer runs out — skip their turn
  socket.on('turn_timeout', (roomCode) => {
    const room = getRoom(roomCode);
    if (!room) return;

    const currentPlayer = getCurrentPlayer(roomCode);

    // Only process timeout for the actual current player
    if (currentPlayer.id !== socket.id) return;

    const nextPlayer = advanceTurn(roomCode);

    // Tell everyone the turn was skipped
    io.to(roomCode).emit('turn_skipped', {
      skippedPlayerName: currentPlayer.name,
      currentTurn: nextPlayer.id,
      currentTurnName: nextPlayer.name
    });

    console.log(`${currentPlayer.name} timed out in room ${roomCode}`);
  });
  // When a player wins
  socket.on('player_won', ({ roomCode, playerName }) => {
    io.to(roomCode).emit('game_over', { winnerName: playerName });
    console.log(`${playerName} won in room ${roomCode}`);
  });
}

module.exports = gameHandler;