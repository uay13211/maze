import { Index, createMemo } from "solid-js";
import type { Accessor } from "solid-js";
import { cellPhase } from "../lib/cellPhase";
import { WALL_E, WALL_N, WALL_S, WALL_W, type Maze } from "../lib/maze";
import type { SearchResult } from "../lib/bfs";
import "./MazeGrid.css";

export function MazeGrid(props: {
  maze: Accessor<Maze>;
  search: Accessor<SearchResult | null>;
  stepIndex: Accessor<number>;
}) {
  const indexes = createMemo(() => {
    const maze = props.maze();
    return Array.from({ length: maze.width * maze.height }, (_, index) => index);
  });

  return (
    <div class="maze-wrap">
      <div
        id="maze"
        class="maze"
        role="img"
        aria-label="Maze. The start cell is the top-left corner. The end cell is the bottom-right corner."
        data-seed={props.maze().seed}
        style={{ "--cols": String(props.maze().width) }}
      >
        <Index each={indexes()}>
          {(cell) => {
            const phase = createMemo(() =>
              cellPhase(cell(), props.stepIndex(), props.search()),
            );
            return (
              <div
                class="cell"
                classList={{
                  "wall-n": (props.maze().walls[cell()] & WALL_N) !== 0,
                  "wall-w": (props.maze().walls[cell()] & WALL_W) !== 0,
                  "wall-e":
                    cell() % props.maze().width === props.maze().width - 1 &&
                    (props.maze().walls[cell()] & WALL_E) !== 0,
                  "wall-s":
                    Math.floor(cell() / props.maze().width) === props.maze().height - 1 &&
                    (props.maze().walls[cell()] & WALL_S) !== 0,
                  start: cell() === 0,
                  end: cell() === props.maze().width * props.maze().height - 1,
                  empty: phase() === "empty",
                  queued: phase() === "queued",
                  visited: phase() === "visited",
                  current: phase() === "current",
                  path: phase() === "path",
                }}
                data-index={cell()}
                data-phase={phase()}
              />
            );
          }}
        </Index>
      </div>
      <ul class="legend">
        <li><span class="swatch start" /> Start</li>
        <li><span class="swatch end" /> End</li>
        <li><span class="swatch current" /> Current cell</li>
        <li><span class="swatch queued" /> Queue</li>
        <li><span class="swatch visited" /> Visited</li>
        <li><span class="swatch path" /> Shortest path</li>
      </ul>
    </div>
  );
}
