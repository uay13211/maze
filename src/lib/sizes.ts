export const MAZE_SIZES = [30, 100, 300] as const;

export type MazeSize = (typeof MAZE_SIZES)[number];

export const DEFAULT_MAZE_SIZE: MazeSize = 30;

export function isMazeSize(value: number): value is MazeSize {
  return value === 30 || value === 100 || value === 300;
}
