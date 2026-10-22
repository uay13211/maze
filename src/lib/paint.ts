import type { SearchResult, Step } from "./bfs";
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

/** CSS pixel size of one cell. Each size uses a whole number of pixels. */
export function cellPixelSize(span: number): number {
  if (span <= 30) return 18;
  if (span <= 50) return 12;
  return 6;
}

/** Whole device pixels per CSS pixel. Walls stay the same width at every scale. */
export function deviceScale(devicePixelRatio: number): number {
  if (!Number.isFinite(devicePixelRatio) || devicePixelRatio <= 0) return 1;
  return Math.max(1, Math.round(devicePixelRatio));
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

function paintCell(
  pixels: Uint8ClampedArray,
  maze: Maze,
  search: SearchResult | null,
  stepIndex: number,
  cellSize: number,
  wall: number,
  index: number,
) {
  const stride = maze.width * cellSize;
  const x = index % maze.width;
  const y = Math.floor(index / maze.width);
  const ox = x * cellSize;
  const oy = y * cellSize;
  fillRect(pixels, stride, ox, oy, cellSize, cellSize, PHASE_COLOR[cellPhase(index, stepIndex, search)]);
  const walls = maze.walls[index];
  if ((walls & WALL_N) !== 0) fillRect(pixels, stride, ox, oy, cellSize, wall, WALL);
  if ((walls & WALL_W) !== 0) fillRect(pixels, stride, ox, oy, wall, cellSize, WALL);
  if (x === maze.width - 1 && (walls & WALL_E) !== 0) {
    fillRect(pixels, stride, ox + cellSize - wall, oy, wall, cellSize, WALL);
  }
  if (y === maze.height - 1 && (walls & WALL_S) !== 0) {
    fillRect(pixels, stride, ox, oy + cellSize - wall, cellSize, wall, WALL);
  }
  if (index === 0 || index === maze.width * maze.height - 1) {
    const marker = Math.max(wall, Math.floor(cellSize / 3));
    const mx = ox + Math.floor((cellSize - marker) / 2);
    const my = oy + Math.floor((cellSize - marker) / 2);
    const color = index === 0 ? START : END;
    fillRect(pixels, stride, mx, my, marker, marker, color);
  }
}

export type DirtyRect = { x: number; y: number; width: number; height: number };

/**
 * Draw the maze into a pixel buffer.
 * `wall` is the wall thickness in buffer pixels. It matches the integer device scale.
 */
export function paintMaze(
  pixels: Uint8ClampedArray,
  maze: Maze,
  search: SearchResult | null,
  stepIndex: number,
  cellSize: number,
  wall = 1,
) {
  const stride = maze.width * cellSize;
  const heightPx = maze.height * cellSize;
  if (pixels.length !== stride * heightPx * 4) {
    throw new Error("The pixel buffer does not match the maze size.");
  }
  const count = maze.width * maze.height;
  for (let index = 0; index < count; index += 1) {
    paintCell(pixels, maze, search, stepIndex, cellSize, wall, index);
  }
}

/** Cells whose color can change between two playback steps. */
export function changedCells(result: SearchResult, fromStep: number, toStep: number): number[] {
  const cells: number[] = [];
  const seen = new Uint8Array(result.visitedAt.length);
  const add = (step: Step) => {
    if (step.kind === "done") return;
    if (seen[step.cell] === 1) return;
    seen[step.cell] = 1;
    cells.push(step.cell);
  };
  const previous = result.steps[fromStep];
  if (previous && previous.kind !== "done" && previous.kind !== "trace") add(previous);
  for (let index = fromStep + 1; index <= toStep; index += 1) add(result.steps[index]);
  return cells;
}

/** Paint the listed cells and return the bounding box, in buffer pixels. */
export function paintCells(
  pixels: Uint8ClampedArray,
  maze: Maze,
  search: SearchResult | null,
  stepIndex: number,
  cellSize: number,
  indices: readonly number[],
  wall = 1,
): DirtyRect | null {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = -1;
  let maxY = -1;
  for (const index of indices) {
    paintCell(pixels, maze, search, stepIndex, cellSize, wall, index);
    const x = (index % maze.width) * cellSize;
    const y = Math.floor(index / maze.width) * cellSize;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + cellSize > maxX) maxX = x + cellSize;
    if (y + cellSize > maxY) maxY = y + cellSize;
  }
  if (maxX < 0) return null;
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
