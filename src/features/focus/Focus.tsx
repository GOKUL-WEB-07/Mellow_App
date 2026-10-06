import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Coffee,
  Headphones,
  Play,
  Pause,
  Plus,
  Minus,
  Volume2,
  Check,
  Leaf,
} from "lucide-react";
import { useStore } from "../../app/Store";
import {
  dateKey,
  focusService,
  teas,
  sounds,
  timerSnapshot,
  type ActiveSession,
  type FocusSession,
} from "../../services/data";
import { Cup } from "../../components/ui";
import { playAudio, stopAudio, setVolume } from "./audio";
export default function Focus() {
  const store = useStore();
  const { settings, plans, saveSession, savePlan, setMessage } = store;
  const location = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState<ActiveSession | null>(
    focusService.active,
  );
  const activeRef = useRef(active);
  activeRef.current = active;
  const [duration, setDuration] = useState<number>(
    (location.state as { duration?: number } | null)?.duration ??
      settings.defaultFocusDuration,
  );
  const [custom, setCustom] = useState(false);
  const [tea, setTea] = useState(active?.tea ?? settings.preferredTea);
  const [sound, setSound] = useState(
    active?.sound ?? settings.preferredAmbientSound,
  );
  const [volume, changeVolume] = useState(settings.volume);
  const [playing, setPlaying] = useState(false);
  const [task, setTask] = useState(
    plans.find((p) => p.date === dateKey())?.finish.text ?? "",
  );
  const [clock, setClock] = useState(Date.now());
  const [completed, setCompleted] = useState<FocusSession | null>(() =>
    location.pathname === "/focus/complete" && !active
      ? (focusService.list()[0] ?? null)
      : null,
  );
  const [note, setNote] = useState(completed?.note ?? "");
  const [reflection, setReflection] = useState(completed?.reflection ?? "");
  const persist = (next: ActiveSession | null) => {
    try {
      focusService.setActive(next);
      setActive(next);
      return true;
    } catch (e) {
      setMessage((e as Error).message);
      return false;
    }
  };
  function finish(early: boolean) {
    const current = activeRef.current;
    if (!current) return;
    const snap = timerSnapshot(current);
    const session: FocusSession = {
      id: current.id,
      userId: "local",
      dailyPlanId: current.date,
      taskText: current.taskText,
      plannedDuration: current.planned,
      actualDuration: snap.elapsed,
      tea: current.tea,
      ambientSound: current.sound,
      status: early ? "ended-early" : "completed",
      startedAt: current.startedAt,
      completedAt: new Date().toISOString(),
    };
    if (saveSession(session)) {
      persist(null);
      setCompleted(session);
      setReflection("");
      setNote("");
      void stopAudio();
      setPlaying(false);
      navigate("/focus/complete", { replace: true });
    }
  }
  useEffect(() => {
    const id = window.setInterval(() => setClock(Date.now()), 250);
    return () => {
      clearInterval(id);
      void stopAudio();
    };
  }, []);
  useEffect(() => {
    if (active?.deadline && clock >= active.deadline) finish(false);
  });
  const current = active ? timerSnapshot(active, clock) : null;
  const remaining = current?.remaining ?? duration * 60;
  const display = `${Math.floor(remaining / 60)
    .toString()
    .padStart(2, "0")}:${(remaining % 60).toString().padStart(2, "0")}`;
  async function audio(next = sound) {
    try {
      await playAudio(next, volume);
      setPlaying(next !== "Silence");
    } catch {
      setPlaying(false);
      setMessage("Sound could not start. Tap Play sound to try again.");
    }
  }
  function begin() {
    if (!Number.isFinite(duration) || duration < 1 || duration > 180) {
      setMessage("Choose between 1 and 180 minutes.");
      return;
    }
    const next: ActiveSession = {
      id: crypto.randomUUID(),
      taskText: task.trim() || "A little quiet focus",
      planned: duration * 60,
      remaining: duration * 60,
      elapsed: 0,
      deadline: Date.now() + duration * 60000,
      startedAt: new Date().toISOString(),
      tea,
      sound,
      date: dateKey(),
    };
    if (persist(next)) {
      navigate("/focus/active", { replace: true });
      void audio();
    }
  }
  function toggle() {
    if (!active) return;
    const snap = timerSnapshot(active);
    persist({
      ...snap,
      deadline: active.deadline ? null : Date.now() + snap.remaining * 1000,
    });
  }
  function adjust(seconds: number) {
    if (!active) return;
    const snap = timerSnapshot(active);
    const delta = Math.max(1 - snap.remaining, seconds);
    persist({
      ...snap,
      planned: snap.planned + delta,
      remaining: snap.remaining + delta,
      deadline:
        snap.deadline === null
          ? null
          : Date.now() + (snap.remaining + delta) * 1000,
    });
  }
  if (completed)
    return (
      <section className="completion paper">
        <Leaf size={32} />
        <h1>That was enough for now.</h1>
        <p>A little progress counts. Leave the rest for later.</p>
        <div className="session-receipt">
          <span>
            {Math.round(completed.actualDuration / 60)} minutes focused
          </span>
          <span>{completed.tea}</span>
          <span>{completed.ambientSound}</span>
        </div>
        <h2>How does the task feel?</h2>
        <div className="choice-row">
          {["Done", "Continue later", "A little closer"].map((r) => (
            <button
              className={reflection === r ? "chip selected" : "chip"}
              aria-pressed={reflection === r}
              key={r}
              onClick={() => setReflection(r)}
            >
              {r === "Done" && <Check size={16} />} {r}
            </button>
          ))}
        </div>
        <label htmlFor="focus-note">A note, if you like</label>
        <textarea
          id="focus-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Anything you want to leave here…"
        />
        <button
          className="primary"
          onClick={() => {
            if (!saveSession({ ...completed, reflection, note })) return;
            const plan = plans.find((p) => p.date === completed.dailyPlanId);
            if (
              reflection === "Done" &&
              plan &&
              plan.finish.text === completed.taskText &&
              !savePlan({
                ...plan,
                finish: { ...plan.finish, completed: true },
              })
            )
              return;
            setCompleted(null);
            navigate("/today");
          }}
        >
          Back to your day
        </button>
      </section>
    );
  return (
    <>
      <div className="page-heading centered">
        <span className="small-label">A little room for attention</span>
        <h1>
          {active ? "One thing at a time." : "What are you settling into?"}
        </h1>
        <p>
          {active
            ? active.taskText
            : "Bring something warm. Let everything else wait."}
        </p>
      </div>
      <div className="focus-layout">
        <section className="timer-panel">
          {!active && (
            <label className="task-input-label">
              Today’s focus
              <input
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="A little quiet focus"
                maxLength={180}
              />
            </label>
          )}
          <div className="timer-ring">
            <svg viewBox="0 0 300 300" aria-hidden="true">
              <defs>
                <linearGradient id="ring">
                  <stop stopColor="#86a68d" />
                  <stop offset="1" stopColor="#d8b48d" />
                </linearGradient>
              </defs>
              <circle className="ring-track" cx="150" cy="150" r="139" />
              <circle
                className="ring-progress"
                cx="150"
                cy="150"
                r="139"
                strokeDasharray={874}
                strokeDashoffset={
                  active ? 874 * (1 - remaining / active.planned) : 0
                }
              />
            </svg>
            <div className="timer-inside">
              <span
                className="timer-time"
                role="timer"
                aria-label={`${Math.floor(remaining / 60)} minutes ${remaining % 60} seconds`}
              >
                {display}
              </span>
              <span>
                {active
                  ? active.deadline
                    ? "Nothing else needs you right now."
                    : "Take your time. This can wait."
                  : "A small beginning is enough."}
              </span>
              <Leaf size={23} />
            </div>
          </div>
          {active ? (
            <>
              <p className="finish-estimate">
                {active.deadline
                  ? `Finish around ${new Date(active.deadline).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`
                  : "Your quiet moment is paused."}
              </p>
              <div className="timer-actions">
                <button className="secondary" onClick={toggle}>
                  {active.deadline ? <Pause size={17} /> : <Play size={17} />}{" "}
                  {active.deadline ? "Pause" : "Resume"}
                </button>
                <button className="primary" onClick={() => finish(true)}>
                  Finish early
                </button>
              </div>
              <div className="adjust-time">
                <button onClick={() => adjust(-300)}>
                  <Minus size={14} /> 5 min
                </button>
                <button onClick={() => adjust(300)}>
                  <Plus size={14} /> 5 min
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="duration-pills">
                {[15, 25, 45].map((n) => (
                  <button
                    key={n}
                    className={!custom && duration === n ? "selected" : ""}
                    onClick={() => {
                      setDuration(n);
                      setCustom(false);
                    }}
                  >
                    {n} min
                  </button>
                ))}
                <button
                  className={custom ? "selected" : ""}
                  onClick={() => setCustom(true)}
                >
                  Custom
                </button>
              </div>
              {custom && (
                <label className="custom-duration">
                  Minutes (1–180)
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                  />
                </label>
              )}
              <button className="primary begin-button" onClick={begin}>
                <Play size={17} /> Begin a quiet moment
              </button>
            </>
          )}
        </section>
        <aside className="ritual-panel">
          <Cup />
          <h2>Your focus ritual</h2>
          <p>Little comforts make a difference.</p>
          <label htmlFor="tea">
            <Coffee size={17} /> Something warm
          </label>
          <select
            id="tea"
            value={tea}
            disabled={!!active}
            onChange={(e) => setTea(e.target.value)}
          >
            {teas.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <label htmlFor="sound">
            <Headphones size={17} /> A sound to settle into
          </label>
          <select
            id="sound"
            value={sound}
            onChange={(e) => {
              const value = e.target.value;
              setSound(value);
              if (active) persist({ ...active, sound: value });
              if (playing) void audio(value);
            }}
          >
            {sounds.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button
            className="secondary audio-toggle"
            disabled={sound === "Silence"}
            onClick={() => {
              if (playing) {
                void stopAudio();
                setPlaying(false);
              } else void audio();
            }}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}{" "}
            {playing ? "Pause sound" : "Play sound"}
          </button>
          <label htmlFor="volume">
            <Volume2 size={17} /> Sound volume <span>{volume}%</span>
          </label>
          <input
            id="volume"
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => {
              const v = Number(e.target.value);
              changeVolume(v);
              setVolume(v);
            }}
          />
          <p className="hint">
            Soft, synthesized soundscapes. Headphones welcome.
          </p>
        </aside>
      </div>
    </>
  );
}
