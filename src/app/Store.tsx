import { createContext, useContext, useState, type ReactNode } from "react";
import {
  dailyPlanService,
  focusService,
  journalService,
  roomService,
  settingsService,
  earnedItems,
  type DailyPlan,
  type FocusSession,
  type JournalEntry,
  type Settings,
  type RoomState,
} from "../services/data";
function useStoreValue() {
  const [plans, setPlans] = useState(dailyPlanService.list);
  const [entries, setEntries] = useState(journalService.list);
  const [sessions, setSessions] = useState(focusService.list);
  const [settings, setSettings] = useState(settingsService.get);
  const [room, setRoom] = useState(roomService.get);
  const [message, setMessage] = useState("");
  function run(fn: () => void) {
    try {
      fn();
      return true;
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Unable to save. Please try again.",
      );
      return false;
    }
  }
  function reward(p: DailyPlan[], s: FocusSession[], e: JournalEntry[]) {
    const current = roomService.get();
    const earned = earnedItems(p, s, e);
    const fresh = earned.filter((i) => !current.unlockedItems.includes(i));
    if (fresh.length) {
      const next = {
        ...current,
        unlockedItems: [...current.unlockedItems, ...fresh],
        selectedItems: [...current.selectedItems, ...fresh],
      };
      roomService.save(next);
      setRoom(next);
      setMessage("Something new found its way to your room.");
    }
  }
  return {
    plans,
    entries,
    sessions,
    settings,
    room,
    message,
    setMessage,
    savePlan: (p: DailyPlan) =>
      run(() => {
        dailyPlanService.save(p);
        const all = dailyPlanService.list();
        setPlans(all);
        reward(all, sessions, entries);
      }),
    saveEntry: (e: JournalEntry) =>
      run(() => {
        journalService.save(e);
        const all = journalService.list();
        setEntries(all);
        reward(plans, sessions, all);
      }),
    removeEntry: (id: string) =>
      run(() => {
        journalService.remove(id);
        setEntries(journalService.list());
      }),
    saveSession: (s: FocusSession) =>
      run(() => {
        focusService.save(s);
        const all = focusService.list();
        setSessions(all);
        reward(plans, all, entries);
      }),
    saveSettings: (s: Settings) =>
      run(() => {
        settingsService.save(s);
        setSettings(s);
      }),
    saveRoom: (r: RoomState) =>
      run(() => {
        roomService.save(r);
        setRoom(r);
      }),
  };
}
const Store = createContext<ReturnType<typeof useStoreValue> | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  return <Store.Provider value={value}>{children}</Store.Provider>;
}
export function useStore() {
  const s = useContext(Store);
  if (!s) throw new Error("Store provider missing");
  return s;
}
