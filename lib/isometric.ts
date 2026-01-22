import { Point, ScreenPoint } from '@/types';

// Isometric tile dimensions
export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

// Convert cartesian (grid) coordinates to isometric screen coordinates
export function cartesianToIsometric(x: number, y: number): ScreenPoint {
  return {
    screenX: (x - y) * (TILE_WIDTH / 2),
    screenY: (x + y) * (TILE_HEIGHT / 2),
  };
}

// Convert isometric screen coordinates to cartesian (grid) coordinates
export function isometricToCartesian(screenX: number, screenY: number): Point {
  return {
    x: (screenX / (TILE_WIDTH / 2) + screenY / (TILE_HEIGHT / 2)) / 2,
    y: (screenY / (TILE_HEIGHT / 2) - screenX / (TILE_WIDTH / 2)) / 2,
  };
}

// Get tile position from mouse/click position (accounting for camera offset)
export function screenToTile(
  screenX: number,
  screenY: number,
  cameraX: number,
  cameraY: number,
  canvasWidth: number,
  canvasHeight: number
): Point {
  // Adjust for camera and canvas center
  const adjustedX = screenX - canvasWidth / 2 + cameraX;
  const adjustedY = screenY - canvasHeight / 2 + cameraY;

  const tile = isometricToCartesian(adjustedX, adjustedY);
  return {
    x: Math.floor(tile.x),
    y: Math.floor(tile.y),
  };
}

// Get screen position of a tile (for rendering)
export function tileToScreen(
  tileX: number,
  tileY: number,
  cameraX: number,
  cameraY: number,
  canvasWidth: number,
  canvasHeight: number
): ScreenPoint {
  const iso = cartesianToIsometric(tileX, tileY);
  return {
    screenX: iso.screenX - cameraX + canvasWidth / 2,
    screenY: iso.screenY - cameraY + canvasHeight / 2,
  };
}

// Calculate distance between two points
export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Get direction from one point to another
export function getDirection(from: Point, to: Point): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (dx === 0 && dy === 0) return 'S';

  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  if (angle >= -22.5 && angle < 22.5) return 'E';
  if (angle >= 22.5 && angle < 67.5) return 'SE';
  if (angle >= 67.5 && angle < 112.5) return 'S';
  if (angle >= 112.5 && angle < 157.5) return 'SW';
  if (angle >= 157.5 || angle < -157.5) return 'W';
  if (angle >= -157.5 && angle < -112.5) return 'NW';
  if (angle >= -112.5 && angle < -67.5) return 'N';
  if (angle >= -67.5 && angle < -22.5) return 'NE';

  return 'S';
}

// Linear interpolation
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}
