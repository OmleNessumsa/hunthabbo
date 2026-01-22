'use client';

import { create } from 'zustand';
import { Avatar, Deal, PlacedProduct, RoomType, Point } from '@/types';
import { findPath } from '@/lib/pathfinding';
import { createMansionMap, placeDealsOnMap, getRoomAtPosition, getRoomCenter } from '@/lib/mansionMap';
import { getDirection } from '@/lib/isometric';

interface GameStore {
  // Game state
  avatar: Avatar;
  camera: Point;
  zoom: number;
  selectedProduct: Deal | null;
  currentRoom: RoomType;
  deals: Deal[];
  placedProducts: PlacedProduct[];
  isLoading: boolean;
  showProductModal: boolean;
  isGameReady: boolean;

  // Map
  map: ReturnType<typeof createMansionMap>;

  // Actions
  setDeals: (deals: Deal[]) => void;
  setAvatar: (avatar: Partial<Avatar>) => void;
  setCamera: (camera: Point) => void;
  setZoom: (zoom: number) => void;
  selectProduct: (product: Deal | null) => void;
  setShowProductModal: (show: boolean) => void;
  moveAvatarTo: (x: number, y: number) => void;
  updateAvatar: (deltaTime: number) => void;
  teleportToRoom: (room: RoomType) => void;
  initializeGame: (deals: Deal[]) => void;
  setGameReady: (ready: boolean) => void;
}

// Entree room center: startX: 6, startY: 8, endX: 13, endY: 13
// Walls are at top and left edges, so walkable area starts at (7, 9)
// Center would be around (10, 10) which should be walkable
const initialAvatar: Avatar = {
  x: 10,
  y: 10,
  targetX: 10,
  targetY: 10,
  direction: 'S',
  state: 'idle',
  speed: 5,
  path: [],
};

export const useGameStore = create<GameStore>((set, get) => ({
  avatar: initialAvatar,
  camera: { x: 0, y: 0 },
  zoom: 1,
  selectedProduct: null,
  currentRoom: 'entree',
  deals: [],
  placedProducts: [],
  isLoading: true,
  showProductModal: false,
  isGameReady: false,
  map: createMansionMap(),

  setDeals: (deals) => {
    const placedProducts = placeDealsOnMap(deals);
    set({ deals, placedProducts, isLoading: false });
  },

  setAvatar: (avatarUpdate) =>
    set((state) => ({ avatar: { ...state.avatar, ...avatarUpdate } })),

  setCamera: (camera) => set({ camera }),

  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(2, zoom)) }),

  selectProduct: (product) => set({ selectedProduct: product, showProductModal: !!product }),

  setShowProductModal: (show) => set({ showProductModal: show }),

  setGameReady: (ready) => set({ isGameReady: ready }),

  moveAvatarTo: (x, y) => {
    const { avatar, map } = get();
    const start = { x: Math.round(avatar.x), y: Math.round(avatar.y) };
    const end = { x, y };

    console.log('moveAvatarTo called:', { start, end });
    const path = findPath(start, end, map);
    console.log('Path found:', path);

    if (path.length > 0) {
      set({
        avatar: {
          ...avatar,
          path,
          state: 'walking',
        },
      });
    } else {
      console.log('No valid path found');
    }
  },

  updateAvatar: (deltaTime) => {
    const { avatar } = get();

    if (avatar.state !== 'walking' || avatar.path.length === 0) {
      return;
    }

    const target = avatar.path[0];
    const dx = target.x - avatar.x;
    const dy = target.y - avatar.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const moveAmount = avatar.speed * deltaTime;

    if (dist <= moveAmount) {
      const newPath = avatar.path.slice(1);
      const newRoom = getRoomAtPosition(target.x, target.y);

      set({
        avatar: {
          ...avatar,
          x: target.x,
          y: target.y,
          path: newPath,
          state: newPath.length > 0 ? 'walking' : 'idle',
          direction: getDirection({ x: avatar.x, y: avatar.y }, target) as Avatar['direction'],
        },
        currentRoom: newRoom || get().currentRoom,
      });
    } else {
      const ratio = moveAmount / dist;
      const newX = avatar.x + dx * ratio;
      const newY = avatar.y + dy * ratio;

      set({
        avatar: {
          ...avatar,
          x: newX,
          y: newY,
          direction: getDirection({ x: avatar.x, y: avatar.y }, target) as Avatar['direction'],
        },
      });
    }
  },

  teleportToRoom: (room) => {
    const center = getRoomCenter(room);
    console.log('Teleporting to room:', room, 'center:', center);

    set({
      avatar: {
        ...get().avatar,
        x: center.x,
        y: center.y,
        targetX: center.x,
        targetY: center.y,
        path: [],
        state: 'idle',
      },
      currentRoom: room,
    });

    console.log('After teleport, avatar position:', get().avatar.x, get().avatar.y);
  },

  initializeGame: (deals) => {
    console.log('initializeGame called with', deals.length, 'deals');
    const placedProducts = placeDealsOnMap(deals);
    console.log('Placed', placedProducts.length, 'products on map:', placedProducts);

    set({
      deals,
      placedProducts,
      isLoading: false,
      avatar: initialAvatar,
      currentRoom: 'entree',
    });
  },
}));
