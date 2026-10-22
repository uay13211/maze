import type { SearchResult } from "./bfs";
import { cellPhase } from "./cellPhase";
import { WALL_E, WALL_N, WALL_S, WALL_W, type Maze } from "./maze";

type Rgb = readonly [number, number, number];

const PHASE_COLOR = {
  empty: [255, 255, 255],
  queued: [243, 220, 138],
  visited: [185, 215, 242],
  current: [239, 143, 47],
  path: [21, 101, 192],
} as const satisfies Record<string, Rgb>;

const WALL: Rgb = [36, 30, 24];
const START: Rgb = [27, 122, 56];
const END: Rgb = [198, 40, 40];

/** Pixel size of one cell. Large mazes use small cells so the canvas stays near 600 px. */
export function cellPixelSize(span: number): number {
  if (span <= 30) return 18;
  if (span <= 100) return 6;
  return 2;
}

function write(pixels: Uint8ClampedArray, offset: number, color: Rgb) {
  pixels[offset] = color[0];
  pixels[offset + 1] = color[1];
  pixels[offset + 2] = color[2];
  pixels[offset + 3] = 255;
}

function fillRect(
  pixels: Uint8ClampedArray,
  stride: number,
  x: number,
  y: number,
  width: number,
  height: number,
  color: Rgb,
) {
  for (let row = 0; row < height; row += 1) {
    let offset = ((y + row) * stride + x) * 4;
    for (let col = 0; col < width; col += 1) {
      write(pixels, offset, color);
      offset += 4;
    }
  }
}

/**
 * Draw the maze into a pixel buffer.
 * One buffer update paints every cell. The page does not create a node per cell.
 */
export function paintMaze(
  pixels: Uint8ClampedArray,
  maze: Maze,
  search: SearchResult | null,
  stepIndex: number,
  cellSize: number,
) {
  const stride = maze.width * cellSize;
  const heightPx = maze.height * cellSize;
  if (pixels.length !== stride * heightPx * 4) {
    throw new Error("The pixel buffer does not match the maze size.");
  }

  for (let y = 0; y < maze.height; y += 1) {
    for (let x = 0; x < maze.width; x += 1) {
      const index = y * maze.width + x;
      const ox = x * cellSize;
      const oy = y * cellSize;
      fillRect(pixels, stride, ox, oy, cellSize, cellSize, PHASE_COLOR[cellPhase(index, stepIndex, search)]);
      const walls = maze.walls[index];
      if ((walls & WALL_N) !== 0) fillRect(pixels, stride, ox, oy, cellSize, 1, WALL);
      if ((walls & WALL_W) !== 0) fillRect(pixels, stride, ox, oy, 1, cellSize, WALL);
      if (x === maze.width - 1 && (walls & WALL_E) !== 0) {
        fillRect(pixels, stride, ox + cellSize - 1, oy, 1, cellSize, WALL);
      }
      if (y === maze.height - 1 && (walls & WALL_S) !== 0) {
        fillRect(pixels, stride, ox, oy + cellSize - 1, cellSize, 1, WALL);
      }
    }
  }

  const marker = Math.max(1, Math.floor(cellSize / 3));
  const placeMarker = (index: number, color: Rgb) => {
    const x = index % maze.width;
    const y = Math.floor(index / maze.width);
    const ox = x * cellSize + Math.floor((cellSize - marker) / 2);
    const oy = y * cellSize + Math.floor((cellSize - marker) / 2);
    fillRect(pixels, stride, ox, oy, marker, marker, color);
  };
  placeMarker(0, START);
  placeMarker(maze.width * maze.height - 1, END);
}
