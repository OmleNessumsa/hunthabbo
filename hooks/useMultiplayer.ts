'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { RemotePlayer, ChatMessage, ClientMessage, ServerMessage } from '@/types/multiplayer';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
const RECONNECT_DELAY = 3000;
const POSITION_THROTTLE = 50; // ms between position updates

interface UseMultiplayerOptions {
  onPlayersUpdate?: (players: RemotePlayer[]) => void;
  onChatMessage?: (message: ChatMessage) => void;
}

export function useMultiplayer(options: UseMultiplayerOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPositionSentRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [localPlayer, setLocalPlayer] = useState<RemotePlayer | null>(null);
  const [remotePlayers, setRemotePlayers] = useState<RemotePlayer[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [playerName, setPlayerName] = useState<string | null>(null);

  const connect = useCallback((name: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setPlayerName(name);
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);

      // Send join message
      const joinMsg: ClientMessage = { type: 'join', name };
      ws.send(JSON.stringify(joinMsg));
    };

    ws.onmessage = (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'welcome':
            setLocalPlayer(message.player);
            setRemotePlayers(message.players);
            setChatMessages(message.recentChat);
            break;

          case 'player_joined':
            setRemotePlayers(prev => [...prev, message.player]);
            break;

          case 'player_left':
            setRemotePlayers(prev => prev.filter(p => p.id !== message.playerId));
            break;

          case 'player_moved':
            setRemotePlayers(prev => prev.map(p =>
              p.id === message.playerId
                ? { ...p, x: message.x, y: message.y }
                : p
            ));
            break;

          case 'player_room_changed':
            setRemotePlayers(prev => prev.map(p =>
              p.id === message.playerId
                ? { ...p, room: message.room }
                : p
            ));
            break;

          case 'chat':
            setChatMessages(prev => [...prev.slice(-49), message.message]);
            options.onChatMessage?.(message.message);
            break;

          case 'error':
            console.error('Server error:', message.message);
            break;
        }
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      wsRef.current = null;

      // Auto-reconnect if we had a player name
      if (playerName) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting reconnect...');
          connect(playerName);
        }, RECONNECT_DELAY);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  }, [playerName, options]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setPlayerName(null);
    wsRef.current?.close();
  }, []);

  const sendPosition = useCallback((x: number, y: number) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const now = Date.now();
    const last = lastPositionSentRef.current;

    // Throttle position updates
    if (last && now - last.time < POSITION_THROTTLE) {
      // Skip if position hasn't changed significantly
      if (Math.abs(x - last.x) < 0.1 && Math.abs(y - last.y) < 0.1) {
        return;
      }
    }

    lastPositionSentRef.current = { x, y, time: now };

    const msg: ClientMessage = { type: 'move', x, y };
    wsRef.current.send(JSON.stringify(msg));
  }, []);

  const sendRoomChange = useCallback((room: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const msg: ClientMessage = { type: 'room_change', room };
    wsRef.current.send(JSON.stringify(msg));
  }, []);

  const sendChat = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (!text.trim()) return;

    const msg: ClientMessage = { type: 'chat', text: text.trim() };
    wsRef.current.send(JSON.stringify(msg));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    localPlayer,
    remotePlayers,
    chatMessages,
    connect,
    disconnect,
    sendPosition,
    sendRoomChange,
    sendChat,
  };
}
