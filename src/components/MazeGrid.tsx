import { createEffect, createSignal } from "solid-js";
import type { Accessor } from "solid-js";
import type { SearchResult } from "../lib/bfs";
import type { Maze } from "../lib/maze";
import { cellPixelSize, changedCells, deviceScale, paintCells, paintMaze } from "../lib/paint";
import "./MazeGrid.css";

function context2d(element: HTMLCanvasElement): CanvasRenderingContext2D | null {
  if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) return null;
  return element.getContext("2d", { alpha: false });
}

export function MazeGrid(props: {
  maze: Accessor<Maze>;
  search: Accessor<SearchResult | null>;
  stepIndex: Accessor<number>;
  pathCount: Accessor<number>;
}) {
  const [canvas, setCanvas] = createSignal<HTMLCanvasElement>();
  let image: ImageData | undefined;
  let paintedMaze: Maze | undefined;
  let paintedSearch: SearchResult | null = null;
  let paintedStep = -1;
  let canvasSupported = true;

  createEffect(() => {
    const element = canvas();
    if (!element) return;
    const maze = props.maze();
    const search = props.search();
    const stepIndex = props.stepIndex();
    const cssCell = cellPixelSize(Math.max(maze.width, maze.height));
    const scale = deviceScale(window.devicePixelRatio);
    const cell = cssCell * scale;
    const width = maze.width * cell;
    const height = maze.height * cell;
    element.style.setProperty("--maze-css-width", `${maze.width * cssCell}px`);
    if (element.width !== width) element.width = width;
    if (element.height !== height) element.height = height;
    if (!canvasSupported) return;
    const context = context2d(element);
    if (!context) {
      canvasSupported = false;
      return;
    }

    if (!image || image.width !== width || image.height !== height) {
      image = context.createImageData(width, height);
      paintedMaze = undefined;
      paintedSearch = null;
      paintedStep = -1;
    }

    const index = search ? Math.min(Math.max(stepIndex, 0), search.steps.length - 1) : -1;
    const pixels = image.data;
    const forward =
      search !== null &&
      paintedMaze === maze &&
      paintedSearch === search &&
      paintedStep >= 0 &&
      index > paintedStep;

    if (forward) {
      const dirty = paintCells(
        pixels,
        maze,
        search,
        index,
        cell,
        changedCells(search, paintedStep, index),
        scale,
      );
      if (dirty) context.putImageData(image, 0, 0, dirty.x, dirty.y, dirty.width, dirty.height);
    } else {
      paintMaze(pixels, maze, search, Math.max(index, 0), cell, scale);
      context.putImageData(image, 0, 0);
    }

    paintedMaze = maze;
    paintedSearch = search;
    paintedStep = index;
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
