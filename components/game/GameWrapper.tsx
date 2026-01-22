'use client';

import { useState, useEffect } from 'react';
import Game from './Game';
import JoinScreen from './JoinScreen';
import { Deal } from '@/types';

interface GameWrapperProps {
  initialDeals: Deal[];
}

export default function GameWrapper({ initialDeals }: GameWrapperProps) {
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved name on mount
  useEffect(() => {
    const savedName = localStorage.getItem('ibood-mansion-name');
    if (savedName) {
      setPlayerName(savedName);
    }
    setIsLoading(false);
  }, []);

  const handleJoin = (name: string) => {
    setPlayerName(name);
  };

  // Show loading while checking localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-ibood-dark flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-ibood-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show join screen if no name
  if (!playerName) {
    return <JoinScreen onJoin={handleJoin} />;
  }

  // Show game
  return <Game initialDeals={initialDeals} playerName={playerName} />;
}
