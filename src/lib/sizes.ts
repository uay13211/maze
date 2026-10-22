export const MAZE_SIZES = [30, 50, 100] as const;

export type MazeSize = (typeof MAZE_SIZES)[number];

export const DEFAULT_MAZE_SIZE: MazeSize = 30;

export function isMazeSize(value: number): value is MazeSize {
  return (MAZE_SIZES as readonly number[]).includes(value);
}
