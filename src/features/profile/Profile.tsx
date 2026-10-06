import { Link } from "react-router-dom";
import { ArrowRight, Lock, History, UserRound } from "lucide-react";
import { useStore } from "../../app/Store";
import { teas, sounds, type Settings } from "../../services/data";
import { InstallCard } from "../install/Install";
export default function Profile() {
  const { settings, saveSettings } = useStore();
  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    saveSettings({ ...settings, [key]: value });
  }
  return (
    <>
      <div className="page-heading">
        <span className="small-label">Keep it comfortable</span>
        <h1>Your day, your way.</h1>
        <p>A few little things to help you feel at home.</p>
      </div>
      <div className="settings-layout">
        <section className="paper settings-panel">
          <div className="profile-avatar">
            <UserRound size={28} />
          </div>
          <h2>The little details</h2>
          <label htmlFor="name">What should we call you?</label>
          <input
            id="name"
            maxLength={40}
            value={settings.name}
            placeholder="Your name"
            onChange={(e) => update("name", e.target.value)}
          />
          <label htmlFor="preferred-tea">Your usual drink</label>
          <select
            id="preferred-tea"
            value={settings.preferredTea}
            onChange={(e) => update("preferredTea", e.target.value)}
          >
            {teas.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <label htmlFor="default-duration">A comfortable focus length</label>
          <select
            id="default-duration"
            value={settings.defaultFocusDuration}
            onChange={(e) =>
              update("defaultFocusDuration", Number(e.target.value))
            }
          >
            {[15, 25, 45].map((d) => (
              <option value={d} key={d}>
                {d} minutes
              </option>
            ))}
          </select>
          <label htmlFor="preferred-sound">Your background sound</label>
          <select
            id="preferred-sound"
            value={settings.preferredAmbientSound}
            onChange={(e) => update("preferredAmbientSound", e.target.value)}
          >
            {sounds.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <label htmlFor="default-volume">
            Sound volume · {settings.volume}%
          </label>
          <input
            id="default-volume"
            type="range"
            min="0"
            max="100"
            value={settings.volume}
            onChange={(e) => update("volume", Number(e.target.value))}
          />
        </section>
        <div>
          <InstallCard />
          <section className="paper settings-panel">
            <h2>The atmosphere</h2>
            <label htmlFor="theme">Light in your space</label>
            <select
              id="theme"
              value={settings.themePreference}
              onChange={(e) => update("themePreference", e.target.value)}
            >
              {["Auto", "Morning", "Evening", "Night"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <label className="switch-row" htmlFor="motion">
              <span>
                Less movement<small>Keep the little animations still.</small>
              </span>
              <input
                id="motion"
                type="checkbox"
                checked={settings.reduceMotion}
                onChange={(e) => update("reduceMotion", e.target.checked)}
              />
            </label>
            <label htmlFor="reminder">A gentle daily reminder</label>
            <input
              id="reminder"
              type="time"
              value={settings.reminder}
              onChange={(e) => update("reminder", e.target.value)}
            />
            <p className="hint">An in-app nudge, while Soft Day is open.</p>
            {settings.reminder && (
              <button
                className="text-button"
                onClick={() => update("reminder", "")}
              >
                Turn reminder off
              </button>
            )}
          </section>
          <Link className="history-settings paper" to="/history">
            <History size={24} />
            <div>
              <h3>Your days, collected</h3>
              <p>Intentions, moods, and little memories.</p>
            </div>
            <ArrowRight size={19} />
          </Link>
          <section className="privacy-settings">
            <Lock size={19} />
            <div>
              <h3>A private space</h3>
              <p>
                Your journal and days are saved only in this browser. There’s no
                account or cloud sync. Anyone with access to this browser can
                open them; clearing browser data removes them.
              </p>
            </div>
          </section>
          <p className="hint">Preferences save as you go.</p>
        </div>
      </div>
    </>
  );
}
