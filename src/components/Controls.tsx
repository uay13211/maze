import type { Accessor } from "solid-js";
import type { PlaybackStatus } from "../state/createPlayback";
import "./Controls.css";

function statusText(status: PlaybackStatus): string {
  if (status === "running") return "Search is running.";
  if (status === "done") return "Search is complete.";
  return "Ready.";
}

export function Controls(props: {
  status: Accessor<PlaybackStatus>;
  onPlay: () => void;
  onReset: () => void;
}) {
  return (
    <div class="controls">
      <button type="button" onClick={() => props.onPlay()} disabled={props.status() === "running"}>
        Play
      </button>
      <button type="button" class="reset" onClick={() => props.onReset()}>
        Reset
      </button>
      <p class="status" data-testid="status">
        {statusText(props.status())}
      </p>
    </div>
  );
}
