import { describe, expect, it } from "vitest";
import type { SearchResult, Step } from "./bfs";
import { describeStep, distanceAtStep, formatQueue, QUEUE_PREVIEW, queueSnapshot } from "./describe";

const steps: Step[] = [
  { kind: "start", cell: 0 },
  { kind: "visit", cell: 0, distance: 0 },
  { kind: "enqueue", cell: 1, from: 0, distance: 1 },
  { kind: "found", cell: 3, distance: 4 },
  { kind: "trace", cell: 3 },
  { kind: "done", pathLength: 5 },
];

function queuedResult(count: number): SearchResult {
  const enqueuedAt = new Int32Array(count);
  const visitedAt = new Int32Array(count);
  const tracedAt = new Int32Array(count);
  const enqueuedOrder = new Int32Array(count);
  visitedAt.fill(-1);
  tracedAt.fill(-1);
  for (let index = 0; index < count; index += 1) {
    enqueuedOrder[index] = index;
    enqueuedAt[index] = 0;
  }
  return {
    path: [],
    distance: 0,
    steps: [{ kind: "start", cell: 0 }],
    enqueuedOrder,
    enqueuedAt,
    visitedAt,
    tracedAt,
  };
}

describe("describeStep", () => {
  it("describes each step kind", () => {
    expect(describeStep(steps[0], 10)).toBe("Start at cell (0, 0). Add it to the queue.");
    expect(describeStep(steps[1], 10)).toBe("Visit cell (0, 0). Distance from start: 0.");
    expect(describeStep(steps[2], 10)).toBe(
      "Add cell (1, 0) to the queue. It comes from cell (0, 0).",
    );
    expect(describeStep({ kind: "visit", cell: 34, distance: 7 }, 10)).toBe(
      "Visit cell (4, 3). Distance from start: 7.",
    );
    expect(describeStep(steps[3], 10)).toBe("Found the end cell (3, 0). Distance: 4.");
    expect(describeStep(steps[4], 10)).toBe("Trace back: cell (3, 0) is on the shortest path.");
    expect(describeStep(steps[5], 10)).toBe("Done. The shortest path has 5 cells.");
  });
});

describe("queue and distance helpers", () => {
  it("reads the distance from the latest step that has one", () => {
    expect(distanceAtStep(steps, 0)).toBe(0);
    expect(distanceAtStep(steps, 2)).toBe(1);
    expect(distanceAtStep(steps, 5)).toBe(4);
  });

  it("caps the shown queue and keeps the full count", () => {
    const result = queuedResult(15);
    const snapshot = queueSnapshot(result, 0);
    expect(snapshot.total).toBe(15);
    expect(snapshot.cells).toHaveLength(QUEUE_PREVIEW);
    expect(snapshot.cells[0]).toBe(0);
    expect(formatQueue(snapshot.cells, snapshot.total, 15)).toContain("and 5 more.");
    result.visitedAt[0] = 0;
    expect(queueSnapshot(result, 0).total).toBe(14);
  });

  it("formats a short queue and a long queue", () => {
    expect(formatQueue([], 0, 10)).toBe("The queue is empty.");
    expect(formatQueue([0, 1], 2, 10)).toBe("(0, 0), (1, 0).");
    const cells = Array.from({ length: 10 }, (_, index) => index);
    expect(formatQueue(cells, 12, 10)).toBe(
      "(0, 0), (1, 0), (2, 0), (3, 0), (4, 0), (5, 0), (6, 0), (7, 0), (8, 0), (9, 0), and 2 more.",
    );
  });
});
