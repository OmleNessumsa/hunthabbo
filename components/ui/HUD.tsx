'use client';

import { RoomType } from '@/types';
import { getRoomDisplayName, getRoomEmoji } from '@/lib/categoryMapper';

interface HUDProps {
  activeDeals: number;
  currentRoom: RoomType;
}

export default function HUD({ activeDeals, currentRoom }: HUDProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-40 pointer-events-none">
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
        {/* Logo & Title */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-12 h-12 bg-ibood-orange rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">iB</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight">
              iBOOD Mansion
            </h1>
            <p className="text-slate-400 text-xs">
              Virtual Shopping Experience
            </p>
          </div>
        </div>

        {/* Active Deals Counter */}
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 backdrop-blur rounded-full border border-slate-700">
            <span className="text-2xl">🔥</span>
            <span className="text-white font-semibold">
              {activeDeals} Deals Actief
            </span>
          </div>

          {/* Current Room */}
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 backdrop-blur rounded-full border border-slate-700">
            <span className="text-xl">{getRoomEmoji(currentRoom)}</span>
            <span className="text-white font-medium">
              {getRoomDisplayName(currentRoom)}
            </span>
          </div>
        </div>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-slate-400 text-sm pointer-events-auto">
        <div className="px-3 py-1.5 bg-slate-800/80 backdrop-blur rounded-lg border border-slate-700">
          <span className="text-white font-mono">Click</span> of{' '}
          <span className="text-white font-mono">WASD</span> om te bewegen
        </div>
        <div className="px-3 py-1.5 bg-slate-800/80 backdrop-blur rounded-lg border border-slate-700">
          Klik op <span className="text-ibood-orange">oranje producten</span> voor deals
        </div>
      </div>
    </div>
  );
}
