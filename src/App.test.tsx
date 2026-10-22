import { cleanup, fireEvent, render } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { solveBfs } from "./lib/bfs";
import { generateMaze } from "./lib/maze";
import { cellPixelSize } from "./lib/paint";
import { LOG_LIMIT } from "./components/StepView";
import { paceFor } from "./state/pace";

const SLOW = paceFor(30 * 30, "slow");

function maze(): HTMLCanvasElement {
  const element = document.getElementById("maze");
  if (!(element instanceof HTMLCanvasElement)) throw new Error("The maze canvas is missing.");
  return element;
}

function pathCount(): number {
  return Number(maze().getAttribute("data-path-count"));
}

function finishPlayback(cellCount = 900, speed: "slow" | "medium" | "fast" = "slow") {
  const total = Number(document.querySelector("[data-testid='step-progress']")?.getAttribute("data-total"));
  const pace = paceFor(cellCount, speed);
  const ticks = Math.ceil(total / pace.stepsPerTick) + 2;
  vi.advanceTimersByTime(pace.intervalMs * ticks);
}

describe("App", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("shows the maze, the controls, and an empty step view", () => {
    const view = render(() => <App />);
    expect(view.getByRole("button", { name: "Play" })).toBeTruthy();
    expect(view.getByRole("button", { name: "Reset" })).toBeTruthy();
    expect((view.getByRole("button", { name: "Pause" }) as HTMLButtonElement).disabled).toBe(true);
    expect((view.getByRole("button", { name: "Step" }) as HTMLButtonElement).disabled).toBe(true);
    expect((view.getByLabelText("Size") as HTMLSelectElement).value).toBe("30");
    expect((view.getByLabelText("Speed") as HTMLSelectElement).value).toBe("slow");
    expect(view.getByTestId("step-description").textContent).toBe("Press Play to start the search.");
    expect(view.getByTestId("step-log-empty").textContent).toBe("No steps yet.");
    expect(view.getByTestId("status").textContent).toBe("Ready.");
    expect(maze().getAttribute("data-width")).toBe("30");
    expect(maze().getAttribute("data-height")).toBe("30");
    expect(maze().width).toBe(30 * cellPixelSize(30));
    expect(pathCount()).toBe(0);
  });

  it("plays the search and shows the shortest path", () => {
    const view = render(() => <App />);
    const play = view.getByRole("button", { name: "Play" }) as HTMLButtonElement;
    fireEvent.click(play);

    expect(play.disabled).toBe(true);
    expect(view.getByTestId("status").textContent).toBe("Search is running.");
    expect(view.getByTestId("step-description").textContent).toBe(
      "Start at cell (0, 0). Add it to the queue.",
    );
    expect(view.getByTestId("step-description").getAttribute("aria-live")).toBe("polite");
    expect(view.queryByTestId("step-log-empty")).toBeFalsy();
    expect(document.querySelector(".log")?.textContent).toContain(
      "Start at cell (0, 0). Add it to the queue.",
    );
    expect(view.getByTestId("queue").textContent).toContain("(0, 0)");
    expect(view.getByTestId("visited-count").textContent).toBe("Visited cells: 0");
    expect(view.getByTestId("step-progress").textContent).toMatch(/^Step 1 of /);

    vi.advanceTimersByTime(SLOW.intervalMs);
    expect(view.getByTestId("step-description").textContent).toBe(
      "Visit cell (0, 0). Distance from start: 0.",
    );
    expect(view.getByTestId("visited-count").textContent).toBe("Visited cells: 1");
    expect(view.getByTestId("step-progress").textContent).toMatch(/^Step 2 of /);

    const seed = maze().getAttribute("data-seed");
    fireEvent.change(view.getByLabelText("Speed"), { target: { value: "fast" } });
    finishPlayback(900, "fast");

    expect(play.disabled).toBe(false);
    expect(view.getByTestId("status").textContent).toBe("Search is complete.");
    expect(view.getByTestId("step-description").textContent).toMatch(
      /^Done\. The shortest path has \d+ cells\.$/,
    );
    const result = solveBfs(generateMaze(30, 30, Number(seed)), 0, 30 * 30 - 1);
    expect(pathCount()).toBe(result.path.length);
    expect(view.getByTestId("step-description").textContent).toBe(
      `Done. The shortest path has ${result.path.length} cells.`,
    );
    expect(document.querySelectorAll(".log li").length).toBeLessThanOrEqual(LOG_LIMIT);
  });

  it("ignores a second Play while the search is running", () => {
    const view = render(() => <App />);
    const play = view.getByRole("button", { name: "Play" });
    fireEvent.click(play);
    fireEvent.click(play);
    vi.advanceTimersByTime(SLOW.intervalMs);
    expect(view.getByTestId("step-progress").textContent).toMatch(/^Step 2 of /);
    expect(view.getByTestId("status").textContent).toBe("Search is running.");
  });

  it("pauses, steps once, and resumes", () => {
    const view = render(() => <App />);
    fireEvent.click(view.getByRole("button", { name: "Play" }));
    fireEvent.click(view.getByRole("button", { name: "Pause" }));
    expect(view.getByTestId("status").textContent).toBe("Search is paused.");
    const pausedText = view.getByTestId("step-description").textContent;
    vi.advanceTimersByTime(SLOW.intervalMs * 5);
    expect(view.getByTestId("step-description").textContent).toBe(pausedText);
    fireEvent.click(view.getByRole("button", { name: "Step" }));
    expect(view.getByTestId("step-description").textContent).toBe(
      "Visit cell (0, 0). Distance from start: 0.",
    );
    expect(view.getByTestId("status").textContent).toBe("Search is paused.");
    fireEvent.click(view.getByRole("button", { name: "Resume" }));
    expect(view.getByTestId("status").textContent).toBe("Search is running.");
    vi.advanceTimersByTime(SLOW.intervalMs);
    expect(view.getByTestId("step-progress").textContent).toMatch(/^Step 3 of /);
  });

  it("stops playback and builds a new maze on Reset", () => {
    const view = render(() => <App />);
    fireEvent.click(view.getByRole("button", { name: "Play" }));
    vi.advanceTimersByTime(SLOW.intervalMs * 4);
    expect(view.getByTestId("visited-count").textContent).not.toBe("Visited cells: 0");

    const seed = maze().getAttribute("data-seed");
    fireEvent.click(view.getByRole("button", { name: "Reset" }));

    expect(view.getByTestId("status").textContent).toBe("Ready.");
    expect(view.getByTestId("step-description").textContent).toBe("Press Play to start the search.");
    expect(view.getByTestId("queue").textContent).toBe("The queue is empty.");
    expect(view.getByTestId("visited-count").textContent).toBe("Visited cells: 0");
    expect(pathCount()).toBe(0);
    expect(maze().getAttribute("data-seed")).not.toBe(seed);
    expect((view.getByRole("button", { name: "Play" }) as HTMLButtonElement).disabled).toBe(false);

    vi.advanceTimersByTime(SLOW.intervalMs * 10);
    expect(view.getByTestId("step-description").textContent).toBe("Press Play to start the search.");
    expect(pathCount()).toBe(0);
  });

  it("clears the old path when a new round starts (issue #1)", () => {
    const view = render(() => <App />);
    const play = view.getByRole("button", { name: "Play" });
    fireEvent.click(play);
    fireEvent.change(view.getByLabelText("Speed"), { target: { value: "fast" } });
    finishPlayback(900, "fast");
    const firstSeed = maze().getAttribute("data-seed");
    const firstPath = pathCount();
    expect(firstPath).toBeGreaterThan(1);

    fireEvent.click(view.getByRole("button", { name: "Reset" }));
    fireEvent.change(view.getByLabelText("Speed"), { target: { value: "slow" } });
    expect(pathCount()).toBe(0);
    expect(maze().getAttribute("data-seed")).not.toBe(firstSeed);

    fireEvent.click(play);
    expect(pathCount()).toBe(0);
    expect(view.getByTestId("step-description").textContent).toBe(
      "Start at cell (0, 0). Add it to the queue.",
    );
    vi.advanceTimersByTime(SLOW.intervalMs * 5);
    expect(pathCount()).toBe(0);

    const secondSeed = maze().getAttribute("data-seed");
    fireEvent.change(view.getByLabelText("Speed"), { target: { value: "fast" } });
    finishPlayback(900, "fast");
    const result = solveBfs(generateMaze(30, 30, Number(secondSeed)), 0, 30 * 30 - 1);
    expect(pathCount()).toBe(result.path.length);
    expect(view.getByTestId("step-description").textContent).toBe(
      `Done. The shortest path has ${result.path.length} cells.`,
    );
  });

  it("changes speed while the search is running", () => {
    const view = render(() => <App />);
    fireEvent.click(view.getByRole("button", { name: "Play" }));
    fireEvent.change(view.getByLabelText("Speed"), { target: { value: "fast" } });
    const fast = paceFor(900, "fast");
    vi.advanceTimersByTime(fast.intervalMs);
    expect(view.getByTestId("step-progress").textContent).toMatch(/^Step 9 of /);
    expect(view.getByTestId("step-description").getAttribute("aria-live")).toBe("off");
  });

  it("builds a new maze when the size changes", () => {
    const view = render(() => <App />);
    fireEvent.click(view.getByRole("button", { name: "Play" }));
    vi.advanceTimersByTime(SLOW.intervalMs * 3);
    const seed = maze().getAttribute("data-seed");

    fireEvent.change(view.getByLabelText("Size"), { target: { value: "100" } });
    expect(view.getByTestId("status").textContent).toBe("Ready.");
    expect(view.getByTestId("step-description").textContent).toBe("Press Play to start the search.");
    expect(pathCount()).toBe(0);
    expect(maze().getAttribute("data-width")).toBe("100");
    expect(maze().getAttribute("data-height")).toBe("100");
    expect(maze().width).toBe(100 * cellPixelSize(100));
    expect(maze().getAttribute("data-seed")).not.toBe(seed);
    vi.advanceTimersByTime(1_000);
    expect(view.getByTestId("status").textContent).toBe("Ready.");

    fireEvent.change(view.getByLabelText("Size"), { target: { value: "300" } });
    expect(maze().getAttribute("data-width")).toBe("300");
    expect(maze().getAttribute("data-height")).toBe("300");
    expect(maze().width).toBe(300 * cellPixelSize(300));
    expect(view.getByTestId("step-description").textContent).toBe("Press Play to start the search.");
    expect(view.getByTestId("queue").textContent).toBe("The queue is empty.");
    expect(document.querySelectorAll(".log li").length).toBe(0);
  });
});
