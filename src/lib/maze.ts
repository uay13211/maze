import { mulberry32, randomInt, shuffle } from "./random";

export const WALL_N = 1;
export const WALL_E = 2;
export const WALL_S = 4;
export const WALL_W = 8;
export const WALL_ALL = WALL_N | WALL_E | WALL_S | WALL_W;

const DIRECTIONS = [
  { bit: WALL_N, opposite: WALL_S, dx: 0, dy: -1 },
  { bit: WALL_E, opposite: WALL_W, dx: 1, dy: 0 },
  { bit: WALL_S, opposite: WALL_N, dx: 0, dy: 1 },
  { bit: WALL_W, opposite: WALL_E, dx: -1, dy: 0 },
] as const;

export type Maze = {
  width: number;
  height: number;
  /** One byte per cell. Bits: north=1, east=2, south=4, west=8. */
  walls: Uint8Array;
  seed: number;
};

export function cellIndex(x: number, y: number, width: number): number {
  return y * width + x;
}

/**
 * Build a perfect maze with iterative randomized depth-first search.
 * A perfect maze has one path between any two cells.
 * The same seed builds the same walls.
 */
export function generateMaze(width: number, height: number, seed: number): Maze {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    throw new Error("Width and height must be whole numbers greater than 0.");
  }

  const count = width * height;
  const walls = new Uint8Array(count);
  walls.fill(WALL_ALL);
  const visited = new Uint8Array(count);
  const rng = mulberry32(seed >>> 0);
  const stack: number[] = [];
  const start = randomInt(rng, count);

  stack.push(start);
  visited[start] = 1;

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const x = current % width;
    const y = Math.floor(current / width);
    const openDirs = shuffle(DIRECTIONS, rng).filter((direction) => {
      const nx = x + direction.dx;
      const ny = y + direction.dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) return false;
      return visited[ny * width + nx] === 0;
    });

    if (openDirs.length === 0) {
      stack.pop();
      continue;
    }

    const direction = openDirs[0];
    const nx = x + direction.dx;
    const ny = y + direction.dy;
    const next = ny * width + nx;
    walls[current] &= ~direction.bit;
    walls[next] &= ~direction.opposite;
    visited[next] = 1;
    stack.push(next);
  }

  return { width, height, walls, seed: seed >>> 0 };
}

export function cellNeighbors(maze: Maze, cell: number): number[] {
  const x = cell % maze.width;
  const y = Math.floor(cell / maze.width);
  const walls = maze.walls[cell];
  const next: number[] = [];
  if (y > 0 && (walls & WALL_N) === 0) next.push(cell - maze.width);
  if (x + 1 < maze.width && (walls & WALL_E) === 0) next.push(cell + 1);
  if (y + 1 < maze.height && (walls & WALL_S) === 0) next.push(cell + maze.width);
  if (x > 0 && (walls & WALL_W) === 0) next.push(cell - 1);
  return next;
}
