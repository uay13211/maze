import { createEffect, createSignal } from "solid-js";
import type { Accessor } from "solid-js";
import type { SearchResult } from "../lib/bfs";
import type { Maze } from "../lib/maze";
import { cellPixelSize, paintMaze } from "../lib/paint";
import "./MazeGrid.css";

export function MazeGrid(props: {
  maze: Accessor<Maze>;
  search: Accessor<SearchResult | null>;
  stepIndex: Accessor<number>;
  pathCount: Accessor<number>;
}) {
  const [canvas, setCanvas] = createSignal<HTMLCanvasElement>();
  let pixels: Uint8ClampedArray | undefined;
  let bufferKey = "";
  let canvasSupported = true;

  createEffect(() => {
    const el = canvas();
    if (!el) return;
    const maze = props.maze();
    const search = props.search();
    const stepIndex = props.stepIndex();
    const cell = cellPixelSize(Math.max(maze.width, maze.height));
    const width = maze.width * cell;
    const height = maze.height * cell;
    const key = `${width}x${height}`;
    if (!pixels || bufferKey !== key) {
      pixels = new Uint8ClampedArray(width * height * 4);
      bufferKey = key;
    }
    paintMaze(pixels, maze, search, stepIndex, cell);
    if (el.width !== width) el.width = width;
    if (el.height !== height) el.height = height;
    if (!canvasSupported) return;
    const context = el.getContext("2d", { alpha: false });
    if (!context) {
      canvasSupported = false;
      return;
    }
    const image = context.createImageData(width, height);
    image.data.set(pixels);
    context.putImageData(image, 0, 0);
  });

  return (
    <div class="maze-wrap">
      <canvas
        id="maze"
        ref={setCanvas}
        class="maze-canvas"
        role="img"
        aria-label={`Maze, ${props.maze().width} by ${props.maze().height}. The start cell is the top-left corner. The end cell is the bottom-right corner.`}
        data-seed={props.maze().seed}
        data-width={props.maze().width}
        data-height={props.maze().height}
        data-path-count={props.pathCount()}
      />
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
