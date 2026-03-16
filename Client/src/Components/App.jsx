import React, { useState, useEffect } from 'react';
import { SocketProvider } from './Context/SocketContext';
import Lobby from './Components/Lobby';
import GameRoom from './Components/Gameroom';
import './App.css';

function App() {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [colorTheme, setColorTheme] = useState(() => {
    return localStorage.getItem('gridblock-theme') || 'green';
  });
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('gridblock-darkmode') !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('gridblock-theme', colorTheme);
    localStorage.setItem('gridblock-darkmode', darkMode);
    applyTheme(colorTheme, darkMode);
  }, [colorTheme, darkMode]);

  const handleRoomReady = (room, name) => {
    setCurrentRoom(room);
    setPlayerName(name);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    setPlayerName('');
  };

  return (
    <SocketProvider>
      <div className='App' data-theme={colorTheme} data-mode={darkMode ? 'dark' : 'light'}>
        {!currentRoom ? (
          <Lobby 
            onRoomReady={handleRoomReady}
            colorTheme={colorTheme}
            onThemeChange={setColorTheme}
            darkMode={darkMode}
            onDarkModeChange={setDarkMode}
          />
        ) : (
          <GameRoom 
            room={currentRoom} 
            playerName={playerName}
            onLeave={handleLeaveRoom}
            colorTheme={colorTheme}
            darkMode={darkMode}
          />
        )}
      </div>
    </SocketProvider>
  );
}

function applyTheme(theme, isDark) {
  // Preset themes
  const presetThemes = {
    green: {
      primary: '#00ff88',
      primaryDark: '#00cc6f',
      primaryLight: '#7dd3ae',
      primaryGlow: 'rgba(0, 255, 136, 0.4)',
    },
    blue: {
      primary: '#00d4ff',
      primaryDark: '#00a8cc',
      primaryLight: '#7de4ff',
      primaryGlow: 'rgba(0, 212, 255, 0.4)',
    },
    purple: {
      primary: '#b84dff',
      primaryDark: '#9333ea',
      primaryLight: '#d8b3ff',
      primaryGlow: 'rgba(184, 77, 255, 0.4)',
    },
    pink: {
      primary: '#ff4d9e',
      primaryDark: '#e91e63',
      primaryLight: '#ffb3d9',
      primaryGlow: 'rgba(255, 77, 158, 0.4)',
    },
  };

  const root = document.documentElement;
  
  // Check if it's a preset or custom color
  let themeColors;
  if (presetThemes[theme]) {
    // It's a preset theme
    themeColors = presetThemes[theme];
  } else if (theme.startsWith('#')) {
    // It's a custom hex color
    themeColors = generateThemeFromColor(theme);
  } else {
    // Fallback to green
    themeColors = presetThemes.green;
  }
  
  // Apply color theme
  root.style.setProperty('--primary-color', themeColors.primary);
  root.style.setProperty('--primary-dark', themeColors.primaryDark);
  root.style.setProperty('--primary-light', themeColors.primaryLight);
  root.style.setProperty('--primary-glow', themeColors.primaryGlow);
  
  // Apply light/dark mode colors
  if (isDark) {
    root.style.setProperty('--bg-primary', '#0a0f0d');
    root.style.setProperty('--bg-secondary', '#1a1f1c');
    root.style.setProperty('--bg-card', 'rgba(26, 31, 28, 0.95)');
    root.style.setProperty('--bg-input', 'rgba(0, 0, 0, 0.3)');
    root.style.setProperty('--bg-board', 'rgba(26, 31, 28, 0.8)');
    root.style.setProperty('--text-primary', '#ffffff');
    root.style.setProperty('--text-secondary', '#b0b0b0');
    root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
  } else {
    root.style.setProperty('--bg-primary', '#f0f4f8');
    root.style.setProperty('--bg-secondary', '#ffffff');
    root.style.setProperty('--bg-card', 'rgba(255, 255, 255, 0.95)');
    root.style.setProperty('--bg-input', 'rgba(0, 0, 0, 0.05)');
    root.style.setProperty('--bg-board', 'rgba(255, 255, 255, 0.9)');
    root.style.setProperty('--text-primary', '#1a1a1a');
    root.style.setProperty('--text-secondary', '#666666');
    root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.1)');
  }
}

// Generate theme variations from a custom color
function generateThemeFromColor(hexColor) {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Create darker version (80% brightness)
  const darkerR = Math.floor(r * 0.8);
  const darkerG = Math.floor(g * 0.8);
  const darkerB = Math.floor(b * 0.8);
  
  // Create lighter version (blend with white)
  const lighterR = Math.floor(r + (255 - r) * 0.5);
  const lighterG = Math.floor(g + (255 - g) * 0.5);
  const lighterB = Math.floor(b + (255 - b) * 0.5);
  
  return {
    primary: hexColor,
    primaryDark: gb(, , ),
    primaryLight: gb(, , ),
    primaryGlow: gba(, , , 0.4),
  };
}

export default App;
