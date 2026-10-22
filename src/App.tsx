import { createMemo, createSignal } from "solid-js";
import { Controls } from "./components/Controls";
import { MazeGrid } from "./components/MazeGrid";
import { StepView } from "./components/StepView";
import { solveBfs, type SearchResult } from "./lib/bfs";
import { generateMaze, type Maze } from "./lib/maze";
import { freshSeed } from "./lib/random";
import { DEFAULT_MAZE_SIZE, isMazeSize, type MazeSize } from "./lib/sizes";
import { createPlayback } from "./state/createPlayback";
import { DEFAULT_SPEED, paceFor, type Speed } from "./state/pace";
import "./App.css";

export const GRID_WIDTH = DEFAULT_MAZE_SIZE;
export const GRID_HEIGHT = DEFAULT_MAZE_SIZE;

function makeMaze(size: MazeSize, previous?: number): Maze {
  return generateMaze(size, size, freshSeed(previous));
}

export function pathCellCount(result: SearchResult | null, stepIndex: number): number {
  if (!result || stepIndex < 0) return 0;
  let count = 0;
  const traced = result.tracedAt;
  for (let index = 0; index < traced.length; index += 1) {
    const at = traced[index];
    if (at !== -1 && at <= stepIndex) count += 1;
  }
  return count;
}

export function App() {
  const [size, setSize] = createSignal<MazeSize>(DEFAULT_MAZE_SIZE);
  const [speed, setSpeed] = createSignal<Speed>(DEFAULT_SPEED);
  const [maze, setMaze] = createSignal(makeMaze(DEFAULT_MAZE_SIZE));
  const [search, setSearch] = createSignal<SearchResult | null>(null);
  const playback = createPlayback(
    () => search()?.steps.length ?? 0,
    () => paceFor(maze().width * maze().height, speed()),
  );
  const pathCount = createMemo(() => pathCellCount(search(), playback.stepIndex()));

  const play = () => {
    if (playback.status() === "running" || playback.status() === "paused") return;
    const current = maze();
    if (!search()) {
      const start = 0;
      const end = current.width * current.height - 1;
      setSearch(solveBfs(current, start, end));
    }
    playback.play();
  };

  const reset = () => {
    playback.reset();
    setSearch(null);
    setMaze(makeMaze(size(), maze().seed));
  };

  const chooseSize = (next: MazeSize) => {
    if (!isMazeSize(next) || next === size()) return;
    playback.reset();
    setSearch(null);
    setSize(next);
    setMaze(makeMaze(next, maze().seed));
  };

  return (
    <div class="app" data-status={playback.status()} data-size={size()} data-speed={speed()}>
      <header>
        <h1>Maze</h1>
        <p>Breadth-first search finds the shortest path from the green cell to the red cell.</p>
      </header>
      <Controls
        status={playback.status}
        size={size}
        speed={speed}
        onPlay={play}
        onPause={playback.pause}
        onResume={playback.resume}
        onStep={playback.step}
        onReset={reset}
        onSize={chooseSize}
        onSpeed={setSpeed}
      />
      <MazeGrid maze={maze} search={search} stepIndex={playback.stepIndex} pathCount={pathCount} />
      <StepView
        maze={maze}
        search={search}
        stepIndex={playback.stepIndex}
        announce={() => paceFor(maze().width * maze().height, speed()).stepsPerTick === 1}
      />
    </div>
  );
}
