import { GameMap, Tile, Room, RoomType, Deal, PlacedProduct } from '@/types';
import { mapDealToRoom } from './categoryMapper';

// Room definitions
export const rooms: Room[] = [
  {
    id: 'garage',
    name: 'Garage',
    bounds: { startX: 0, startY: 0, endX: 7, endY: 5 },
    color: '#4a5568',
    floorColor: '#718096',
  },
  {
    id: 'keuken',
    name: 'Keuken',
    bounds: { startX: 0, startY: 6, endX: 5, endY: 11 },
    color: '#f6e05e',
    floorColor: '#faf089',
  },
  {
    id: 'woonkamer',
    name: 'Woonkamer',
    bounds: { startX: 6, startY: 0, endX: 13, endY: 7 },
    color: '#9f7aea',
    floorColor: '#b794f4',
  },
  {
    id: 'home_office',
    name: 'Home Office',
    bounds: { startX: 14, startY: 0, endX: 19, endY: 5 },
    color: '#4299e1',
    floorColor: '#63b3ed',
  },
  {
    id: 'badkamer',
    name: 'Badkamer',
    bounds: { startX: 0, startY: 12, endX: 5, endY: 17 },
    color: '#38b2ac',
    floorColor: '#4fd1c5',
  },
  {
    id: 'entree',
    name: 'Entree',
    bounds: { startX: 6, startY: 8, endX: 13, endY: 13 },
    color: '#ed8936',
    floorColor: '#f6ad55',
  },
  {
    id: 'slaapkamer',
    name: 'Slaapkamer',
    bounds: { startX: 14, startY: 6, endX: 19, endY: 13 },
    color: '#fc8181',
    floorColor: '#feb2b2',
  },
  {
    id: 'tuin',
    name: 'Tuin',
    bounds: { startX: 6, startY: 14, endX: 19, endY: 19 },
    color: '#48bb78',
    floorColor: '#68d391',
  },
];

// Create the mansion map
export function createMansionMap(): GameMap {
  const width = 20;
  const height = 20;
  const tiles: Tile[][] = [];

  // Initialize all tiles as empty
  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      tiles[y][x] = {
        type: 'empty',
        walkable: false,
        sprite: 'empty',
        room: 'entree',
      };
    }
  }

  // Fill rooms with floor tiles
  for (const room of rooms) {
    for (let y = room.bounds.startY; y <= room.bounds.endY; y++) {
      for (let x = room.bounds.startX; x <= room.bounds.endX; x++) {
        if (y >= 0 && y < height && x >= 0 && x < width) {
          // Check if it's a wall (edge of room)
          const isTopEdge = y === room.bounds.startY;
          const isBottomEdge = y === room.bounds.endY;
          const isLeftEdge = x === room.bounds.startX;
          const isRightEdge = x === room.bounds.endX;

          if (isTopEdge || isLeftEdge) {
            tiles[y][x] = {
              type: 'wall',
              walkable: false,
              sprite: `wall_${room.id}`,
              room: room.id,
            };
          } else {
            tiles[y][x] = {
              type: 'floor',
              walkable: true,
              sprite: `floor_${room.id}`,
              room: room.id,
            };
          }
        }
      }
    }
  }

  // Add doors between rooms (make walls walkable at connection points)
  const doors = [
    { x: 6, y: 4 },   // Garage to Woonkamer
    { x: 3, y: 6 },   // Keuken top entrance
    { x: 6, y: 9 },   // Entree to Woonkamer
    { x: 14, y: 3 },  // Woonkamer to Home Office
    { x: 14, y: 9 },  // Entree to Slaapkamer
    { x: 3, y: 12 },  // Keuken to Badkamer
    { x: 10, y: 14 }, // Entree to Tuin
  ];

  for (const door of doors) {
    if (tiles[door.y] && tiles[door.y][door.x]) {
      tiles[door.y][door.x] = {
        type: 'door',
        walkable: true,
        sprite: 'door',
        room: tiles[door.y][door.x].room,
      };
    }
  }

  return {
    width,
    height,
    tiles,
    rooms,
  };
}

// Product placement positions for each room
const productPositions: Record<RoomType, Array<{ x: number; y: number }>> = {
  garage: [
    { x: 2, y: 2 },
    { x: 4, y: 2 },
    { x: 2, y: 4 },
    { x: 5, y: 3 },
  ],
  keuken: [
    { x: 2, y: 8 },
    { x: 4, y: 8 },
    { x: 2, y: 10 },
    { x: 4, y: 10 },
  ],
  woonkamer: [
    { x: 8, y: 2 },
    { x: 10, y: 2 },
    { x: 12, y: 2 },
    { x: 8, y: 5 },
    { x: 10, y: 5 },
    { x: 12, y: 5 },
  ],
  home_office: [
    { x: 16, y: 2 },
    { x: 18, y: 2 },
    { x: 16, y: 4 },
    { x: 18, y: 4 },
  ],
  badkamer: [
    { x: 2, y: 14 },
    { x: 4, y: 14 },
    { x: 2, y: 16 },
  ],
  entree: [
    { x: 8, y: 10 },
    { x: 10, y: 10 },
    { x: 12, y: 10 },
  ],
  slaapkamer: [
    { x: 16, y: 8 },
    { x: 18, y: 8 },
    { x: 16, y: 11 },
    { x: 18, y: 11 },
  ],
  tuin: [
    { x: 8, y: 16 },
    { x: 10, y: 16 },
    { x: 12, y: 16 },
    { x: 14, y: 16 },
    { x: 16, y: 16 },
    { x: 18, y: 16 },
  ],
};

// Place deals on the map
export function placeDealsOnMap(deals: Deal[]): PlacedProduct[] {
  const placedProducts: PlacedProduct[] = [];
  const usedPositions: Set<string> = new Set();
  const positionIndexes: Record<RoomType, number> = {
    entree: 0,
    woonkamer: 0,
    keuken: 0,
    slaapkamer: 0,
    badkamer: 0,
    home_office: 0,
    garage: 0,
    tuin: 0,
  };

  for (const deal of deals) {
    const room = mapDealToRoom(deal);
    const positions = productPositions[room];
    const index = positionIndexes[room];

    if (index < positions.length) {
      const pos = positions[index];
      const key = `${pos.x},${pos.y}`;

      if (!usedPositions.has(key)) {
        usedPositions.add(key);
        positionIndexes[room]++;

        placedProducts.push({
          dealId: deal.id,
          x: pos.x,
          y: pos.y,
          room,
          sprite: 'product',
        });
      }
    }
  }

  return placedProducts;
}

// Get room at position
export function getRoomAtPosition(x: number, y: number): RoomType | null {
  for (const room of rooms) {
    if (
      x >= room.bounds.startX &&
      x <= room.bounds.endX &&
      y >= room.bounds.startY &&
      y <= room.bounds.endY
    ) {
      return room.id;
    }
  }
  return null;
}

// Get room center position (offset from walls)
export function getRoomCenter(roomId: RoomType): { x: number; y: number } {
  const room = rooms.find((r) => r.id === roomId);
  if (!room) return { x: 10, y: 10 };

  // Add +1 to avoid walls (top and left edges are walls)
  return {
    x: Math.floor((room.bounds.startX + 1 + room.bounds.endX) / 2),
    y: Math.floor((room.bounds.startY + 1 + room.bounds.endY) / 2),
  };
}
