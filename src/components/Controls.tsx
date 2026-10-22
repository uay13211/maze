import type { Accessor } from "solid-js";
import { MAZE_SIZES, type MazeSize } from "../lib/sizes";
import { SPEEDS, type Speed } from "../state/pace";
import type { PlaybackStatus } from "../state/createPlayback";
import "./Controls.css";

function statusText(status: PlaybackStatus): string {
  if (status === "running") return "Search is running.";
  if (status === "paused") return "Search is paused.";
  if (status === "done") return "Search is complete.";
  return "Ready.";
}

const SPEED_LABEL: Record<Speed, string> = {
  slow: "Slow",
  medium: "Medium",
  fast: "Fast",
};

export function Controls(props: {
  status: Accessor<PlaybackStatus>;
  size: Accessor<MazeSize>;
  speed: Accessor<Speed>;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStep: () => void;
  onReset: () => void;
  onSize: (size: MazeSize) => void;
  onSpeed: (speed: Speed) => void;
}) {
  const paused = () => props.status() === "paused";
  const running = () => props.status() === "running";

  return (
    <div class="controls">
      <label>
        Size
        <select
          aria-label="Size"
          value={String(props.size())}
          onChange={(event) => props.onSize(Number(event.currentTarget.value) as MazeSize)}
        >
          {MAZE_SIZES.map((size) => (
            <option value={size}>{size}×{size}</option>
          ))}
        </select>
      </label>
      <label>
        Speed
        <select
          aria-label="Speed"
          value={props.speed()}
          onChange={(event) => props.onSpeed(event.currentTarget.value as Speed)}
        >
          {SPEEDS.map((speed) => (
            <option value={speed}>{SPEED_LABEL[speed]}</option>
          ))}
        </select>
      </label>
      <button type="button" onClick={() => props.onPlay()} disabled={running() || paused()}>
        Play
      </button>
      <button
        type="button"
        class="secondary"
        onClick={() => (paused() ? props.onResume() : props.onPause())}
        disabled={!running() && !paused()}
      >
        {paused() ? "Resume" : "Pause"}
      </button>
      <button type="button" class="secondary" onClick={() => props.onStep()} disabled={!paused()}>
        Step
      </button>
      <button type="button" class="secondary reset" onClick={() => props.onReset()}>
        Reset
      </button>
      <p class="status" data-testid="status">
        {statusText(props.status())}
      </p>
    </div>
  );
}
