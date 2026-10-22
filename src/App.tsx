import { createSignal } from "solid-js";
import { Controls } from "./components/Controls";
import { MazeGrid } from "./components/MazeGrid";
import { StepView } from "./components/StepView";
import { solveBfs, type SearchResult } from "./lib/bfs";
import { generateMaze, type Maze } from "./lib/maze";
import { freshSeed } from "./lib/random";
import { createPlayback } from "./state/createPlayback";
import "./App.css";

export const GRID_WIDTH = 30;
export const GRID_HEIGHT = 30;

function makeMaze(previous?: number): Maze {
  return generateMaze(GRID_WIDTH, GRID_HEIGHT, freshSeed(previous));
}

export function App() {
  const [maze, setMaze] = createSignal(makeMaze());
  const [search, setSearch] = createSignal<SearchResult | null>(null);
  const playback = createPlayback(() => search()?.steps.length ?? 0);

  const play = () => {
    if (playback.status() === "running") return;
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
    setMaze(makeMaze(maze().seed));
  };

  return (
    <div class="app" data-status={playback.status()}>
      <header>
        <h1>Maze</h1>
        <p>
          Breadth-first search finds the shortest path from the green cell to the red cell.
        </p>
      </header>
      <Controls status={playback.status} onPlay={play} onReset={reset} />
      <MazeGrid maze={maze} search={search} stepIndex={playback.stepIndex} />
      <StepView maze={maze} search={search} stepIndex={playback.stepIndex} />
    </div>
  );
}
