import { cleanup, fireEvent, render } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App, GRID_HEIGHT, GRID_WIDTH } from "./App";
import { solveBfs } from "./lib/bfs";
import { generateMaze } from "./lib/maze";
import { PLAYBACK_MS } from "./state/createPlayback";

function pathIndexes(): number[] {
  return [...document.querySelectorAll(".cell.path")].map((element) =>
    Number(element.getAttribute("data-index")),
  );
}

function phaseCount(phase: string): number {
  return document.querySelectorAll(`[data-phase='${phase}']`).length;
}

function mazeSeed(): string {
  const seed = document.getElementById("maze")?.getAttribute("data-seed");
  if (!seed) throw new Error("The maze has no seed.");
  return seed;
}

function finishPlayback() {
  const total = Number(document.querySelector("[data-testid='step-progress']")?.getAttribute("data-total"));
  vi.advanceTimersByTime(PLAYBACK_MS * (total + 2));
}

describe("App", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("shows the maze, Play, Reset, and an empty step view", () => {
    const view = render(() => <App />);
    expect(view.getByRole("button", { name: "Play" })).toBeTruthy();
    expect(view.getByRole("button", { name: "Reset" })).toBeTruthy();
    expect(view.getByTestId("step-description").textContent).toBe("Press Play to start the search.");
    expect(view.getByTestId("step-log-empty").textContent).toBe("No steps yet.");
    expect(view.getByTestId("status").textContent).toBe("Ready.");
    expect(document.querySelectorAll(".cell")).toHaveLength(GRID_WIDTH * GRID_HEIGHT);
    expect(document.querySelector(".cell.start")?.getAttribute("data-index")).toBe("0");
    expect(document.querySelector(".cell.end")?.getAttribute("data-index")).toBe(
      String(GRID_WIDTH * GRID_HEIGHT - 1),
    );
    expect(document.querySelector(".cell.start")?.classList.contains("wall-n")).toBe(true);
    expect(document.querySelector(".cell.start")?.classList.contains("wall-w")).toBe(true);
    expect(phaseCount("path")).toBe(0);
    expect(phaseCount("visited")).toBe(0);
    expect(phaseCount("queued")).toBe(0);
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
    expect(view.queryByTestId("step-log-empty")).toBeFalsy();
    expect(document.querySelector(".log")?.textContent).toContain(
      "Start at cell (0, 0). Add it to the queue.",
    );
    expect(view.getByTestId("queue").textContent).toContain("(0, 0)");
    expect(view.getByTestId("visited-count").textContent).toBe("Visited cells: 0");
    expect(view.getByTestId("step-progress").textContent).toMatch(/^Step 1 of /);

    vi.advanceTimersByTime(PLAYBACK_MS);
    expect(view.getByTestId("step-description").textContent).toBe(
      "Visit cell (0, 0). Distance from start: 0.",
    );
    expect(view.getByTestId("visited-count").textContent).toBe("Visited cells: 1");
    expect(view.getByTestId("step-progress").textContent).toMatch(/^Step 2 of /);

    const seed = mazeSeed();
    finishPlayback();

    expect(play.disabled).toBe(false);
    expect(view.getByTestId("status").textContent).toBe("Search is complete.");
    expect(view.getByTestId("step-description").textContent).toMatch(
      /^Done\. The shortest path has \d+ cells\.$/,
    );
    const maze = generateMaze(GRID_WIDTH, GRID_HEIGHT, Number(seed));
    const result = solveBfs(maze, 0, GRID_WIDTH * GRID_HEIGHT - 1);
    expect(pathIndexes()).toEqual(expect.arrayContaining(result.path));
    expect(pathIndexes()).toHaveLength(result.path.length);
    expect(new Set(pathIndexes())).toEqual(new Set(result.path));
  });

  it("stops playback and builds a new maze on Reset", () => {
    const view = render(() => <App />);
    fireEvent.click(view.getByRole("button", { name: "Play" }));
    vi.advanceTimersByTime(PLAYBACK_MS * 8);
    expect(phaseCount("visited") + phaseCount("current") + phaseCount("queued")).toBeGreaterThan(0);

    const seed = mazeSeed();
    fireEvent.click(view.getByRole("button", { name: "Reset" }));

    expect(view.getByTestId("status").textContent).toBe("Ready.");
    expect(view.getByTestId("step-description").textContent).toBe("Press Play to start the search.");
    expect(view.getByTestId("queue").textContent).toBe("The queue is empty.");
    expect(view.getByTestId("visited-count").textContent).toBe("Visited cells: 0");
    expect(phaseCount("path")).toBe(0);
    expect(phaseCount("visited")).toBe(0);
    expect(phaseCount("queued")).toBe(0);
    expect(phaseCount("current")).toBe(0);
    expect(mazeSeed()).not.toBe(seed);
    expect((view.getByRole("button", { name: "Play" }) as HTMLButtonElement).disabled).toBe(false);

    vi.advanceTimersByTime(PLAYBACK_MS * 50);
    expect(view.getByTestId("step-description").textContent).toBe("Press Play to start the search.");
    expect(phaseCount("visited")).toBe(0);
    expect(phaseCount("path")).toBe(0);
  });

  it("clears the old path when a new round starts (issue #1)", () => {
    const view = render(() => <App />);
    const play = view.getByRole("button", { name: "Play" });
    fireEvent.click(play);
    finishPlayback();
    const firstSeed = mazeSeed();
    const firstPath = pathIndexes();
    expect(firstPath.length).toBeGreaterThan(1);

    fireEvent.click(view.getByRole("button", { name: "Reset" }));
    expect(pathIndexes()).toEqual([]);
    expect(phaseCount("visited")).toBe(0);
    expect(mazeSeed()).not.toBe(firstSeed);

    fireEvent.click(play);
    expect(pathIndexes()).toEqual([]);
    expect(view.getByTestId("step-description").textContent).toBe(
      "Start at cell (0, 0). Add it to the queue.",
    );
    vi.advanceTimersByTime(PLAYBACK_MS * 5);
    expect(pathIndexes()).toEqual([]);

    const secondSeed = mazeSeed();
    finishPlayback();
    const maze = generateMaze(GRID_WIDTH, GRID_HEIGHT, Number(secondSeed));
    const result = solveBfs(maze, 0, GRID_WIDTH * GRID_HEIGHT - 1);
    expect(new Set(pathIndexes())).toEqual(new Set(result.path));
    expect(pathIndexes()).toHaveLength(result.path.length);
    expect(view.getByTestId("step-description").textContent).toBe(
      `Done. The shortest path has ${result.path.length} cells.`,
    );
  });

  it("plays the same search again from the first step", () => {
    const view = render(() => <App />);
    const play = view.getByRole("button", { name: "Play" }) as HTMLButtonElement;
    fireEvent.click(play);
    finishPlayback();
    expect(pathIndexes().length).toBeGreaterThan(1);

    const seed = mazeSeed();
    fireEvent.click(play);
    expect(play.disabled).toBe(true);
    expect(mazeSeed()).toBe(seed);
    expect(pathIndexes()).toEqual([]);
    expect(view.getByTestId("step-description").textContent).toBe(
      "Start at cell (0, 0). Add it to the queue.",
    );
  });
});
