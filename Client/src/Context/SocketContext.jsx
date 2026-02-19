import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Create the context
const SocketContext = createContext();

// Create the socket connection to the server
const socket = io('http://localhost:4000');

export function SocketProvider({ children }) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

// Custom hook so any component can access the socket easily
export function useSocket() {
  return useContext(SocketContext);
}