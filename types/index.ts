// Deal types from CSV feed
export interface Deal {
  id: string;
  title: string;
  short_title: string;
  description: string;
  brand: string;
  price: string;
  sale_price: string;
  price_now_clean: string;
  price_old: string;
  image_link: string;
  link: string;
  google_product_category: string;
  shortspecs: string;
  availability: string;
  enddatetime: string;
}

// Game types
export interface Point {
  x: number;
  y: number;
}

export interface ScreenPoint {
  screenX: number;
  screenY: number;
}

export type TileType = 'floor' | 'wall' | 'door' | 'furniture' | 'product' | 'empty';

export interface Tile {
  type: TileType;
  walkable: boolean;
  sprite: string;
  productId?: string;
  room: RoomType;
  elevation?: number;
}

export type RoomType =
  | 'entree'
  | 'woonkamer'
  | 'keuken'
  | 'slaapkamer'
  | 'badkamer'
  | 'home_office'
  | 'garage'
  | 'tuin';

export interface Room {
  id: RoomType;
  name: string;
  bounds: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  };
  color: string;
  floorColor: string;
}

export interface GameMap {
  width: number;
  height: number;
  tiles: Tile[][];
  rooms: Room[];
}

export type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export type AvatarState = 'idle' | 'walking';

export interface Avatar {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  direction: Direction;
  state: AvatarState;
  speed: number;
  path: Point[];
}

export interface PlacedProduct {
  dealId: string;
  x: number;
  y: number;
  room: RoomType;
  sprite: string;
}

export interface GameState {
  avatar: Avatar;
  camera: Point;
  zoom: number;
  selectedProduct: Deal | null;
  currentRoom: RoomType;
  deals: Deal[];
  placedProducts: PlacedProduct[];
}
