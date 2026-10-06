import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  dailyPlanService,
  dateKey,
  defaults,
  earnedItems,
  focusService,
  journalService,
  newPlan,
  roomService,
  settingsService,
  storage,
  timerSnapshot,
  type ActiveSession,
  type FocusSession,
  type JournalEntry,
} from "./data";
beforeEach(() => {
  const values = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => values.set(k, v),
  });
});
describe("private local persistence", () => {
  it("creates, edits and completes exactly three daily intentions", () => {
    const p = newPlan("2026-10-04");
    for (const kind of ["finish", "care", "enjoy"] as const) {
      p[kind] = { text: kind + " something", completed: false };
    }
    dailyPlanService.save(p);
    const saved = dailyPlanService.get(p.date);
    expect(saved.finish.text).toBe("finish something");
    saved.finish = { text: "Updated intention", completed: true };
    dailyPlanService.save(saved);
    expect(dailyPlanService.list()).toHaveLength(1);
    expect(dailyPlanService.get(p.date).finish).toEqual({
      text: "Updated intention",
      completed: true,
    });
    expect(dailyPlanService.get("2026-10-05").finish.text).toBe("");
  });
  it("keeps journal edits, moods and photos without duplicating entries", () => {
    const entry = {
      id: "one",
      userId: "local",
      date: "2026-10-04",
      text: "A quiet walk.",
      mood: "Peaceful",
      kind: "Memory",
      photos: ["data:image/jpeg;base64,test"],
      createdAt: "now",
      updatedAt: "now",
    };
    journalService.save(entry);
    journalService.save({ ...entry, text: "A quiet walk at sunset." });
    expect(journalService.list()).toHaveLength(1);
    expect(journalService.list()[0]).toMatchObject({
      text: "A quiet walk at sunset.",
      mood: "Peaceful",
      photos: entry.photos,
    });
    journalService.remove("one");
    expect(journalService.list()).toEqual([]);
  });
  it("persists settings and room choices", () => {
    settingsService.save({
      ...defaults,
      name: "River",
      preferredTea: "Matcha",
      reduceMotion: true,
    });
    expect(settingsService.get().name).toBe("River");
    roomService.save({
      userId: "local",
      unlockedItems: ["plant"],
      selectedItems: ["plant"],
      updatedAt: "now",
    });
    expect(roomService.get().selectedItems).toEqual(["plant"]);
  });
  it("uses defaults for malformed saved JSON and reports quota failure", () => {
    localStorage.setItem("soft-day:settings", "{");
    expect(settingsService.get()).toEqual(defaults);
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(() => storage.write("test", {})).toThrow("could not save");
  });
  it("uses local calendar dates", () => {
    expect(dateKey(new Date(2026, 9, 4, 23, 59))).toBe("2026-10-04");
  });
});
describe("wall-clock focus timer", () => {
  const active: ActiveSession = {
    id: "s",
    taskText: "Sketch",
    planned: 1500,
    remaining: 1500,
    elapsed: 0,
    deadline: 1600000,
    startedAt: "now",
    tea: "Chai",
    sound: "Rain",
    date: "2026-10-04",
  };
  it("accounts for elapsed time after tab sleep or reload", () => {
    const snapshot = timerSnapshot(active, 1100000);
    expect(snapshot.remaining).toBe(500);
    expect(snapshot.elapsed).toBe(1000);
    focusService.setActive(active);
    expect(focusService.active()).toEqual(active);
  });
  it("freezes when paused and resumes from the remaining duration", () => {
    const paused = { ...timerSnapshot(active, 1100000), deadline: null };
    expect(timerSnapshot(paused, 2000000).remaining).toBe(500);
    const resumed = { ...paused, deadline: 2500000 };
    expect(timerSnapshot(resumed, 2100000)).toMatchObject({
      remaining: 400,
      elapsed: 1100,
    });
  });
  it("caps completion at zero and does not count sleep beyond the deadline", () => {
    expect(timerSnapshot(active, 2000000)).toMatchObject({
      remaining: 0,
      elapsed: 1500,
    });
  });
  it("does not count added or removed minutes as focused time", () => {
    const s = timerSnapshot(active, 1100000);
    const added = {
      ...s,
      planned: s.planned + 300,
      remaining: s.remaining + 300,
      deadline: 1900000,
    };
    expect(timerSnapshot(added, 1100000).elapsed).toBe(1000);
  });
  it("upserts sessions so completion is idempotent", () => {
    const session = { id: "s", actualDuration: 120 } as FocusSession;
    focusService.save(session);
    focusService.save(session);
    expect(focusService.list()).toHaveLength(1);
    focusService.setActive(null);
    expect(focusService.active()).toBeNull();
  });
});
describe("gentle room unlocks", () => {
  it("unlocks from meaningful moments, without rewarding zero-length sessions", () => {
    const plans = ["2026-10-03", "2026-10-04"].map((d) => ({
      ...newPlan(d),
      care: { text: "Walk", completed: true },
      enjoy: { text: "Read", completed: true },
    }));
    const sessions = [1, 2, 3].map(
      (id) => ({ id: String(id), actualDuration: 60 }) as FocusSession,
    );
    const entries = [1, 2, 3].map((id) => ({ id: String(id) }) as JournalEntry);
    expect(earnedItems(plans, sessions, entries)).toEqual([
      "cup",
      "plant",
      "candle",
      "art",
    ]);
    expect(
      earnedItems(
        [],
        sessions.map((s) => ({ ...s, actualDuration: 0 })),
        [],
      ),
    ).toEqual([]);
  });
});
