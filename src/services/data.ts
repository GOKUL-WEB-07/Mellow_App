export type IntentionKind = "finish" | "care" | "enjoy";
export type Intention = { text: string; completed: boolean };
export type DailyPlan = {
  id: string;
  userId: string;
  date: string;
  finish: Intention;
  care: Intention;
  enjoy: Intention;
  createdAt: string;
  updatedAt: string;
};
export type JournalEntry = {
  id: string;
  userId: string;
  date: string;
  text: string;
  mood: string;
  kind: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
};
export type FocusSession = {
  id: string;
  userId: string;
  dailyPlanId: string;
  taskText: string;
  plannedDuration: number;
  actualDuration: number;
  tea: string;
  ambientSound: string;
  status: "completed" | "ended-early";
  startedAt: string;
  completedAt: string;
  reflection?: string;
  note?: string;
};
export type ActiveSession = {
  id: string;
  taskText: string;
  planned: number;
  remaining: number;
  elapsed: number;
  deadline: number | null;
  startedAt: string;
  tea: string;
  sound: string;
  date: string;
};
export type Settings = {
  id: string;
  name: string;
  preferredTea: string;
  defaultFocusDuration: number;
  preferredAmbientSound: string;
  themePreference: string;
  reduceMotion: boolean;
  volume: number;
  reminder: string;
  onboarded: boolean;
  createdAt: string;
};
export type RoomState = {
  userId: string;
  unlockedItems: string[];
  selectedItems: string[];
  updatedAt: string;
};
export const teas = [
  "Chamomile",
  "Green tea",
  "Masala chai",
  "Coffee",
  "Hot cocoa",
  "Jasmine tea",
  "Matcha",
];
export const sounds = [
  "Silence",
  "Rain",
  "Cafe",
  "Fireplace",
  "Forest",
  "Ocean",
  "Night",
  "Soft wind",
];
export const moods = [
  "Peaceful",
  "Good",
  "Heavy",
  "Tired",
  "Restless",
  "Happy",
  "Mixed",
];
export const dateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const prettyDate = (date: string) =>
  new Date(date + "T12:00:00").toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
const now = () => new Date().toISOString();
const emptyIntent = (): Intention => ({ text: "", completed: false });
export const newPlan = (date: string): DailyPlan => ({
  id: date,
  userId: "local",
  date,
  finish: emptyIntent(),
  care: emptyIntent(),
  enjoy: emptyIntent(),
  createdAt: now(),
  updatedAt: now(),
});
export const defaults: Settings = {
  id: "local",
  name: "",
  preferredTea: "Chamomile",
  defaultFocusDuration: 25,
  preferredAmbientSound: "Silence",
  themePreference: "Auto",
  reduceMotion: false,
  volume: 35,
  reminder: "",
  onboarded: false,
  createdAt: now(),
};
// All persistence lives behind this adapter; feature services can later use a remote adapter.
export interface StorageAdapter {
  read<T>(key: string, fallback: T): T;
  write<T>(key: string, value: T): void;
}
export const storage: StorageAdapter = {
  read<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem("soft-day:" + key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  write(key, value) {
    try {
      localStorage.setItem("soft-day:" + key, JSON.stringify(value));
    } catch {
      throw new Error(
        "Your browser could not save this change. Free some device storage and try again.",
      );
    }
  },
};
export const dailyPlanService = {
  list: () => storage.read<DailyPlan[]>("plans", []),
  get(date: string) {
    return this.list().find((p) => p.date === date) ?? newPlan(date);
  },
  save(plan: DailyPlan) {
    storage.write("plans", [
      { ...plan, updatedAt: now() },
      ...this.list().filter((p) => p.date !== plan.date),
    ]);
  },
};
export const journalService = {
  list: () => storage.read<JournalEntry[]>("journal", []),
  save(entry: JournalEntry) {
    storage.write("journal", [
      { ...entry, updatedAt: now() },
      ...this.list().filter((e) => e.id !== entry.id),
    ]);
  },
  remove(id: string) {
    storage.write(
      "journal",
      this.list().filter((e) => e.id !== id),
    );
  },
};
export const focusService = {
  list: () => storage.read<FocusSession[]>("sessions", []),
  save(session: FocusSession) {
    storage.write("sessions", [
      session,
      ...this.list().filter((s) => s.id !== session.id),
    ]);
  },
  active: () => storage.read<ActiveSession | null>("active", null),
  setActive: (session: ActiveSession | null) =>
    storage.write("active", session),
};
export const settingsService = {
  get: () => ({
    ...defaults,
    ...storage.read<Partial<Settings>>("settings", {}),
  }),
  save: (settings: Settings) => storage.write("settings", settings),
};
export const roomService = {
  get: () =>
    storage.read<RoomState>("room", {
      userId: "local",
      unlockedItems: [],
      selectedItems: [],
      updatedAt: now(),
    }),
  save: (room: RoomState) =>
    storage.write("room", { ...room, updatedAt: now() }),
};
export const decorations = [
  {
    id: "cup",
    name: "A favorite cup",
    description: "Settle into three focus sessions.",
    icon: "cup",
  },
  {
    id: "plant",
    name: "A little green",
    description: "Leave three journal entries.",
    icon: "plant",
  },
  {
    id: "candle",
    name: "A warm glow",
    description: "Make room for care on two days.",
    icon: "candle",
  },
  {
    id: "art",
    name: "Something lovely",
    description: "Enjoy a little something on two days.",
    icon: "art",
  },
];
export function earnedItems(
  plans: DailyPlan[],
  sessions: FocusSession[],
  entries: JournalEntry[],
) {
  return decorations
    .filter((d) =>
      d.id === "cup"
        ? sessions.filter((s) => s.actualDuration >= 60).length >= 3
        : d.id === "plant"
          ? entries.length >= 3
          : d.id === "candle"
            ? plans.filter((p) => p.care.completed).length >= 2
            : plans.filter((p) => p.enjoy.completed).length >= 2,
    )
    .map((d) => d.id);
}
export function timerSnapshot(s: ActiveSession, time = Date.now()) {
  const remaining =
    s.deadline === null
      ? s.remaining
      : Math.max(0, Math.ceil((s.deadline - time) / 1000));
  return {
    ...s,
    remaining,
    elapsed: s.elapsed + Math.max(0, s.remaining - remaining),
  };
}
