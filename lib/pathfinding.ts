import { Point, GameMap } from '@/types';

interface Node {
  x: number;
  y: number;
  g: number; // Cost from start
  h: number; // Heuristic (estimated cost to end)
  f: number; // Total cost (g + h)
  parent: Node | null;
}

// A* pathfinding algorithm
export function findPath(
  start: Point,
  end: Point,
  map: GameMap
): Point[] {
  // Check if end is walkable
  if (
    end.x < 0 ||
    end.x >= map.width ||
    end.y < 0 ||
    end.y >= map.height ||
    !map.tiles[end.y]?.[end.x]?.walkable
  ) {
    return [];
  }

  const openList: Node[] = [];
  const closedList: Set<string> = new Set();

  const startNode: Node = {
    x: start.x,
    y: start.y,
    g: 0,
    h: heuristic(start, end),
    f: 0,
    parent: null,
  };
  startNode.f = startNode.g + startNode.h;

  openList.push(startNode);

  while (openList.length > 0) {
    // Find node with lowest f cost
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift()!;

    // Check if we reached the goal
    if (current.x === end.x && current.y === end.y) {
      return reconstructPath(current);
    }

    closedList.add(`${current.x},${current.y}`);

    // Get neighbors (8 directions)
    const neighbors = getNeighbors(current, map);

    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;

      if (closedList.has(key)) continue;

      const g = current.g + (isDiagonal(current, neighbor) ? 1.414 : 1);
      const existingNode = openList.find(
        (n) => n.x === neighbor.x && n.y === neighbor.y
      );

      if (!existingNode) {
        const h = heuristic(neighbor, end);
        const newNode: Node = {
          x: neighbor.x,
          y: neighbor.y,
          g,
          h,
          f: g + h,
          parent: current,
        };
        openList.push(newNode);
      } else if (g < existingNode.g) {
        existingNode.g = g;
        existingNode.f = g + existingNode.h;
        existingNode.parent = current;
      }
    }
  }

  // No path found
  return [];
}

function heuristic(a: Point, b: Point): number {
  // Chebyshev distance (allows diagonal movement)
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

function isDiagonal(a: Point, b: Point): boolean {
  return a.x !== b.x && a.y !== b.y;
}

function getNeighbors(node: Node, map: GameMap): Point[] {
  const neighbors: Point[] = [];
  const directions = [
    { dx: 0, dy: -1 },  // N
    { dx: 1, dy: -1 },  // NE
    { dx: 1, dy: 0 },   // E
    { dx: 1, dy: 1 },   // SE
    { dx: 0, dy: 1 },   // S
    { dx: -1, dy: 1 },  // SW
    { dx: -1, dy: 0 },  // W
    { dx: -1, dy: -1 }, // NW
  ];

  for (const dir of directions) {
    const x = node.x + dir.dx;
    const y = node.y + dir.dy;

    if (
      x >= 0 &&
      x < map.width &&
      y >= 0 &&
      y < map.height &&
      map.tiles[y]?.[x]?.walkable
    ) {
      // For diagonal movement, check if both adjacent tiles are walkable
      if (dir.dx !== 0 && dir.dy !== 0) {
        const adj1 = map.tiles[node.y]?.[x]?.walkable;
        const adj2 = map.tiles[y]?.[node.x]?.walkable;
        if (adj1 && adj2) {
          neighbors.push({ x, y });
        }
      } else {
        neighbors.push({ x, y });
      }
    }
  }

  return neighbors;
}

function reconstructPath(endNode: Node): Point[] {
  const path: Point[] = [];
  let current: Node | null = endNode;

  while (current) {
    path.unshift({ x: current.x, y: current.y });
    current = current.parent;
  }

  // Remove the starting position
  path.shift();

  return path;
}
