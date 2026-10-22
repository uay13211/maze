import { createRoot, createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createPlayback } from "./createPlayback";
import type { Pace } from "./pace";

function mount(stepCount: number, initial: Pace = { intervalMs: 100, stepsPerTick: 1 }) {
  const pace = createSignal(initial);
  let playback!: ReturnType<typeof createPlayback>;
  let dispose!: () => void;
  createRoot((done) => {
    playback = createPlayback(() => stepCount, pace[0]);
    dispose = done;
  });
  return { playback, setPace: pace[1], dispose };
}

describe("createPlayback", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("ignores a second Play while the timer is running", () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    const { playback, dispose } = mount(8);
    playback.play();
    expect(playback.status()).toBe("running");
    playback.play();
    expect(playback.status()).toBe("running");
    expect(playback.stepIndex()).toBe(0);
    vi.advanceTimersByTime(100);
    expect(playback.stepIndex()).toBe(1);
    dispose();
  });

  it("pauses, steps one cell, and resumes", () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    const { playback, dispose } = mount(8);
    playback.play();
    vi.advanceTimersByTime(100);
    expect(playback.stepIndex()).toBe(1);
    playback.pause();
    expect(playback.status()).toBe("paused");
    vi.advanceTimersByTime(500);
    expect(playback.stepIndex()).toBe(1);
    playback.step();
    expect(playback.stepIndex()).toBe(2);
    expect(playback.status()).toBe("paused");
    playback.play();
    expect(playback.status()).toBe("paused");
    expect(playback.stepIndex()).toBe(2);
    playback.resume();
    expect(playback.status()).toBe("running");
    vi.advanceTimersByTime(100);
    expect(playback.stepIndex()).toBe(3);
    dispose();
  });

  it("does not step while the search is running", () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    const { playback, dispose } = mount(8);
    playback.play();
    playback.step();
    expect(playback.stepIndex()).toBe(0);
    vi.advanceTimersByTime(100);
    expect(playback.stepIndex()).toBe(1);
    dispose();
  });

  it("finishes a one-step run without a timer", () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    const { playback, dispose } = mount(1);
    playback.play();
    expect(playback.status()).toBe("done");
    expect(playback.stepIndex()).toBe(0);
    vi.advanceTimersByTime(1_000);
    expect(playback.status()).toBe("done");
    expect(playback.stepIndex()).toBe(0);
    dispose();
  });

  it("stops the timer on Reset", () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    const { playback, dispose } = mount(8);
    playback.play();
    vi.advanceTimersByTime(100);
    playback.reset();
    expect(playback.status()).toBe("idle");
    expect(playback.stepIndex()).toBe(0);
    vi.advanceTimersByTime(1_000);
    expect(playback.status()).toBe("idle");
    expect(playback.stepIndex()).toBe(0);
    dispose();
  });

  it("stops the timer on unmount", () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    const { playback, dispose } = mount(8);
    playback.play();
    vi.advanceTimersByTime(100);
    expect(playback.stepIndex()).toBe(1);
    dispose();
    vi.advanceTimersByTime(1_000);
    expect(playback.stepIndex()).toBe(1);
    expect(playback.status()).toBe("running");
  });

  it("uses the new speed while the search is running", () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    const { playback, setPace, dispose } = mount(30, { intervalMs: 100, stepsPerTick: 1 });
    playback.play();
    vi.advanceTimersByTime(100);
    expect(playback.stepIndex()).toBe(1);
    setPace({ intervalMs: 50, stepsPerTick: 4 });
    vi.advanceTimersByTime(50);
    expect(playback.stepIndex()).toBe(5);
    dispose();
  });
});
