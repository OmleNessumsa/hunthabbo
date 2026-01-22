// Shared types for WebSocket communication

export interface RemotePlayer {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  room: string;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
}

// Client -> Server messages
export type ClientMessage =
  | { type: 'join'; name: string }
  | { type: 'move'; x: number; y: number }
  | { type: 'chat'; text: string }
  | { type: 'room_change'; room: string };

// Server -> Client messages
export type ServerMessage =
  | { type: 'welcome'; player: RemotePlayer; players: RemotePlayer[]; recentChat: ChatMessage[] }
  | { type: 'player_joined'; player: RemotePlayer }
  | { type: 'player_left'; playerId: string }
  | { type: 'player_moved'; playerId: string; x: number; y: number }
  | { type: 'player_room_changed'; playerId: string; room: string }
  | { type: 'chat'; message: ChatMessage }
  | { type: 'error'; message: string };
