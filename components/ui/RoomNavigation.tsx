'use client';

import { RoomType } from '@/types';
import { useGameStore } from '@/hooks/useGameStore';
import { getRoomDisplayName, getRoomEmoji } from '@/lib/categoryMapper';

const roomOrder: RoomType[] = [
  'entree',
  'woonkamer',
  'keuken',
  'slaapkamer',
  'badkamer',
  'home_office',
  'garage',
  'tuin',
];

export default function RoomNavigation() {
  const { currentRoom, teleportToRoom, placedProducts } = useGameStore();

  // Count products per room
  const productCounts: Record<RoomType, number> = {
    entree: 0,
    woonkamer: 0,
    keuken: 0,
    slaapkamer: 0,
    badkamer: 0,
    home_office: 0,
    garage: 0,
    tuin: 0,
  };

  placedProducts.forEach((p) => {
    productCounts[p.room]++;
  });

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="flex justify-center p-4">
        <div className="flex gap-2 p-2 bg-slate-900/90 backdrop-blur-lg rounded-2xl border border-slate-700 pointer-events-auto shadow-xl">
          {roomOrder.map((room) => (
            <button
              key={room}
              onClick={() => teleportToRoom(room)}
              className={`
                relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all
                ${currentRoom === room
                  ? 'bg-ibood-orange text-white shadow-lg shadow-orange-500/30 scale-105'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }
              `}
            >
              <span className="text-xl">{getRoomEmoji(room)}</span>
              <span className="text-xs font-medium whitespace-nowrap">
                {getRoomDisplayName(room)}
              </span>

              {/* Product count badge */}
              {productCounts[room] > 0 && (
                <span
                  className={`
                    absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center
                    text-xs font-bold rounded-full
                    ${currentRoom === room
                      ? 'bg-white text-ibood-orange'
                      : 'bg-ibood-orange text-white'
                    }
                  `}
                >
                  {productCounts[room]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
