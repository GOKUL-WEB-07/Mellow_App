import { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";
import {
  Sun,
  Timer,
  BookOpen,
  Armchair,
  UserRound,
  Leaf,
  X,
  ArrowRight,
} from "lucide-react";
import { StoreProvider, useStore } from "./Store";
import { dateKey, teas, sounds, focusService } from "../services/data";
import { Modal, Cup } from "../components/ui";
import {
  InstallProvider,
  InstallButton,
  InstallGuide,
} from "../features/install/Install";
const Today = lazy(() => import("../features/today/Today"));
const History = lazy(() =>
  import("../features/today/Today").then((m) => ({ default: m.History })),
);
const Focus = lazy(() => import("../features/focus/Focus"));
const Journal = lazy(() => import("../features/journal/Journal"));
const JournalEditor = lazy(() =>
  import("../features/journal/Journal").then((m) => ({
    default: m.JournalEditor,
  })),
);
const Room = lazy(() => import("../features/room/Room"));
const Profile = lazy(() => import("../features/profile/Profile"));
const nav = [
  { path: "/today", name: "Today", icon: Sun },
  { path: "/focus", name: "Focus", icon: Timer },
  { path: "/journal", name: "Journal", icon: BookOpen },
  { path: "/room", name: "Room", icon: Armchair },
  { path: "/profile", name: "Profile", icon: UserRound },
];
function Shell() {
  const { settings, saveSettings, message, setMessage } = useStore();
  const location = useLocation();
  const [welcome, setWelcome] = useState(false);
  const [step, setStep] = useState(0);
  const [reminded, setReminded] = useState("");
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const hhmm = `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`;
    if (settings.reminder === hhmm && reminded !== dateKey()) {
      setMessage(
        "Anything worth finishing today? There’s a little room for you here.",
      );
      setReminded(dateKey());
    }
  }, [time, settings.reminder, reminded, setMessage]);
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${nav.find((n) => location.pathname.startsWith(n.path))?.name ?? "Your days"} · Soft Day`;
  }, [location.pathname]);
  const hour = time.getHours();
  const theme =
    settings.themePreference === "Auto"
      ? hour < 17 && hour >= 6
        ? "Morning"
        : hour < 21 && hour >= 6
          ? "Evening"
          : "Night"
      : settings.themePreference;
  useEffect(() => {
    document.documentElement.dataset.theme = theme.toLowerCase();
    document.documentElement.dataset.motion = settings.reduceMotion
      ? "reduced"
      : "normal";
  }, [theme, settings.reduceMotion]);
  const active = focusService.active();
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <Link className="brand" to="/today" aria-label="Soft Day home">
          <Sun size={30} strokeWidth={1.5} />
          <span>
            soft day<span className="brand-dot">.</span>
          </span>
        </Link>
        <nav aria-label="Main navigation">
          {nav.map(({ path, name, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              aria-label={name}
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <Icon size={18} />
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>
        <InstallButton className="secondary header-install" />
      </header>
      <main id="main" tabIndex={-1}>
        {!settings.onboarded && (
          <div className="welcome-banner">
            <span>A little focus. A little care. A softer day.</span>
            <button
              onClick={() => {
                setWelcome(true);
                setStep(0);
              }}
            >
              Welcome to Soft Day <ArrowRight size={14} />
            </button>
            <button
              className="icon-button"
              aria-label="Dismiss welcome"
              onClick={() => saveSettings({ ...settings, onboarded: true })}
            >
              <X size={16} />
            </button>
          </div>
        )}
        {active && !location.pathname.startsWith("/focus") && (
          <Link className="active-banner" to="/focus/active">
            <Timer size={16} /> Your quiet moment is{" "}
            {active.deadline ? "running" : "paused"}. Return to focus{" "}
            <ArrowRight size={15} />
          </Link>
        )}
        <Suspense
          fallback={
            <div className="loading" role="status">
              Making a little room…
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Navigate to="/today" replace />} />
            <Route path="/today" element={<Today />} />
            <Route path="/focus/*" element={<Focus />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/journal/new" element={<JournalEditor key="new" />} />
            <Route path="/journal/:entryId" element={<JournalEditor />} />
            <Route path="/room" element={<Room />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Profile />} />
            <Route path="/history" element={<History />} />
            <Route
              path="*"
              element={
                <div className="empty">
                  <h1>A quiet wrong turn.</h1>
                  <Link to="/today">Back to your day</Link>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </main>
      <footer className="site-footer">
        <span>soft day.</span>
        <span>Productivity without pressure.</span>
        <Link to="/history">Your days, collected</Link>
      </footer>
      {message && (
        <div className="toast" role="status">
          <Leaf size={18} />
          <span>{message}</span>
          <button
            className="icon-button"
            aria-label="Dismiss message"
            onClick={() => setMessage("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {welcome && (
        <Modal
          title={
            step === 0
              ? "A softer kind of day."
              : step === 1
                ? "What helps you settle in?"
                : "Only what matters."
          }
          onClose={() => setWelcome(false)}
        >
          <div className="onboarding">
            <Cup />
            {step === 0 ? (
              <p>
                Productivity without pressure. A little attention for what
                matters, and plenty of room for you.
              </p>
            ) : step === 1 ? (
              <>
                <label htmlFor="welcome-tea">Something warm</label>
                <select
                  id="welcome-tea"
                  value={settings.preferredTea}
                  onChange={(e) =>
                    saveSettings({ ...settings, preferredTea: e.target.value })
                  }
                >
                  {teas.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <label htmlFor="welcome-sound">Something quiet</label>
                <select
                  id="welcome-sound"
                  value={settings.preferredAmbientSound}
                  onChange={(e) =>
                    saveSettings({
                      ...settings,
                      preferredAmbientSound: e.target.value,
                    })
                  }
                >
                  {sounds.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </>
            ) : (
              <p>
                One thing to <strong>finish</strong>. One moment of{" "}
                <strong>care</strong>. Something to <strong>enjoy</strong>.
                <br />
                <br />
                An invitation, never an obligation.
              </p>
            )}
            <button
              className="primary"
              onClick={() => {
                if (step < 2) setStep(step + 1);
                else if (saveSettings({ ...settings, onboarded: true }))
                  setWelcome(false);
              }}
            >
              {step === 0
                ? "Begin"
                : step === 1
                  ? "A little more"
                  : "Make yourself at home"}{" "}
              <ArrowRight size={16} />
            </button>
            <span className="hint">{step + 1} of 3</span>
          </div>
        </Modal>
      )}
      <InstallGuide />
    </>
  );
}
export default function App() {
  return (
    <InstallProvider>
      <StoreProvider>
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
      </StoreProvider>
    </InstallProvider>
  );
}
