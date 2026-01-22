import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { Player, ChatMessage, ClientMessage, ServerMessage } from './types.js';

const PORT = parseInt(process.env.PORT || '3001', 10);
const MAX_CHAT_HISTORY = 50;

// In-memory state
const players = new Map<string, Player>();
const connections = new Map<string, WebSocket>();
const chatHistory: ChatMessage[] = [];

// Generate random player color
function randomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// Broadcast to all players except sender
function broadcast(message: ServerMessage, excludeId?: string) {
  const data = JSON.stringify(message);
  connections.forEach((ws, id) => {
    if (id !== excludeId && ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
}

// Send to specific player
function send(playerId: string, message: ServerMessage) {
  const ws = connections.get(playerId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

// Create HTTP server for health checks
const server = createServer((req, res) => {
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', players: players.size }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Attach WebSocket server to HTTP server
const wss = new WebSocketServer({ server });

server.listen(PORT, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});

wss.on('connection', (ws: WebSocket) => {
  let playerId: string | null = null;

  ws.on('message', (data: Buffer) => {
    try {
      const message: ClientMessage = JSON.parse(data.toString());

      switch (message.type) {
        case 'join': {
          // Create new player
          playerId = generateId();
          const player: Player = {
            id: playerId,
            name: message.name.slice(0, 20), // Limit name length
            x: 10,
            y: 10,
            color: randomColor(),
            room: 'entree'
          };

          players.set(playerId, player);
          connections.set(playerId, ws);

          // Send welcome with current state
          send(playerId, {
            type: 'welcome',
            player,
            players: Array.from(players.values()).filter(p => p.id !== playerId),
            recentChat: chatHistory.slice(-20)
          });

          // Notify others
          broadcast({ type: 'player_joined', player }, playerId);

          console.log(`Player joined: ${player.name} (${playerId})`);
          break;
        }

        case 'move': {
          if (!playerId) return;
          const player = players.get(playerId);
          if (!player) return;

          player.x = message.x;
          player.y = message.y;

          broadcast({ type: 'player_moved', playerId, x: message.x, y: message.y }, playerId);
          break;
        }

        case 'room_change': {
          if (!playerId) return;
          const player = players.get(playerId);
          if (!player) return;

          player.room = message.room;

          broadcast({ type: 'player_room_changed', playerId, room: message.room }, playerId);
          break;
        }

        case 'chat': {
          if (!playerId) return;
          const player = players.get(playerId);
          if (!player) return;

          const text = message.text.trim().slice(0, 200); // Limit message length
          if (!text) return;

          const chatMessage: ChatMessage = {
            id: generateId(),
            playerId,
            playerName: player.name,
            text,
            timestamp: Date.now()
          };

          chatHistory.push(chatMessage);
          if (chatHistory.length > MAX_CHAT_HISTORY) {
            chatHistory.shift();
          }

          // Broadcast to everyone including sender
          const serverMsg: ServerMessage = { type: 'chat', message: chatMessage };
          connections.forEach((conn) => {
            if (conn.readyState === WebSocket.OPEN) {
              conn.send(JSON.stringify(serverMsg));
            }
          });

          console.log(`Chat from ${player.name}: ${text}`);
          break;
        }
      }
    } catch (err) {
      console.error('Error processing message:', err);
    }
  });

  ws.on('close', () => {
    if (playerId) {
      const player = players.get(playerId);
      console.log(`Player left: ${player?.name || playerId}`);

      players.delete(playerId);
      connections.delete(playerId);

      broadcast({ type: 'player_left', playerId });
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  wss.close(() => {
    process.exit(0);
  });
});
