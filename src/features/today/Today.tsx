import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Plus, Pencil, Check, Leaf, Sun } from "lucide-react";
import { useStore } from "../../app/Store";
import { dateKey, newPlan, type IntentionKind } from "../../services/data";
import {
  RoomScene,
  Cup,
  Modal,
  kindIcons,
  SectionTitle,
} from "../../components/ui";
const descriptions = {
  finish: "One meaningful thing",
  care: "Something for yourself",
  enjoy: "Just because it feels good",
};
const placeholders = {
  finish: "What would you like to finish?",
  care: "A walk, a stretch, a moment to breathe…",
  enjoy: "A chapter, a favorite film, something lovely…",
};
export default function Today() {
  const { plans, settings, savePlan } = useStore();
  const navigate = useNavigate();
  const today = dateKey();
  const plan = plans.find((p) => p.date === today) ?? newPlan(today);
  const [editing, setEditing] = useState<IntentionKind | null>(null);
  const [text, setText] = useState("");
  const [duration, setDuration] = useState(settings.defaultFocusDuration);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const empty = !plan.finish.text && !plan.care.text && !plan.enjoy.text;
  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="date-label">
            <Sun size={15} />
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
          <h1>
            {greeting}
            {settings.name ? `, ${settings.name}` : ""}.
          </h1>
          <p>Take it gently. There’s room to go at your own pace.</p>
        </div>
        <div className="quiet-label">
          <Leaf size={16} /> A softer kind of productive
        </div>
      </section>
      <div className="today-layout">
        <div className="intentions">
          <div className="question">
            <h2>
              What would make today
              <br className="desktop-break" /> feel complete?
            </h2>
            <p>
              {empty
                ? "A quiet day is waiting."
                : "Three little intentions. A day that feels like yours."}
            </p>
          </div>
          <div className="intent-list">
            {(["finish", "care", "enjoy"] as IntentionKind[]).map((kind) => {
              const Icon = kindIcons[kind];
              const intent = plan[kind];
              return (
                <article
                  className={`intent-card ${kind} ${intent.completed ? "completed" : ""}`}
                  key={kind}
                >
                  <div className="intent-icon">
                    <Icon size={22} />
                  </div>
                  <div className="intent-content">
                    <div className="intent-label">
                      {kind[0].toUpperCase() + kind.slice(1)}
                      <span>{descriptions[kind]}</span>
                    </div>
                    {intent.text ? (
                      <>
                        <button
                          className="intent-text"
                          onClick={() => {
                            setEditing(kind);
                            setText(intent.text);
                          }}
                        >
                          {intent.text}
                          <Pencil size={13} />
                        </button>
                        {kind === "finish" && !intent.completed && (
                          <Link className="text-link" to="/focus">
                            Start focus <ArrowRight size={14} />
                          </Link>
                        )}
                      </>
                    ) : (
                      <button
                        className="add-intent"
                        onClick={() => {
                          setEditing(kind);
                          setText("");
                        }}
                      >
                        <Plus size={16} /> Add {kind}
                      </button>
                    )}
                  </div>
                  {intent.text && (
                    <button
                      className="complete-button"
                      aria-label={`${intent.completed ? "Reopen" : "Complete"} ${kind}`}
                      aria-pressed={intent.completed}
                      onClick={() =>
                        savePlan({
                          ...plan,
                          [kind]: { ...intent, completed: !intent.completed },
                        })
                      }
                    >
                      {intent.completed && <Check size={17} />}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
          <p className="gentle-footnote">
            <Leaf size={14} />
            {empty
              ? "Add only what feels worth carrying today."
              : "You don’t have to do it all. These are invitations."}
          </p>
        </div>
        <aside className="cozy-column">
          <RoomScene />
          <div className="companion-caption">
            <span>“One thing at a time.”</span>
            <span>Your quiet corner</span>
          </div>
          <div className="tea-card">
            <Cup />
            <div>
              <span className="small-label">Today’s little ritual</span>
              <h3>{settings.preferredTea}</h3>
              <p>Something warm. A moment for you.</p>
            </div>
            <Link
              to="/focus"
              className="icon-button"
              aria-label="Choose your tea"
            >
              <ArrowRight size={18} />
            </Link>
          </div>
        </aside>
      </div>
      <section className="focus-invitation">
        <div className="focus-symbol">
          <Sun size={27} />
        </div>
        <div>
          <h2>Make a little progress.</h2>
          <p>A quiet moment, just for one thing.</p>
        </div>
        <div className="duration-pills">
          {[15, 25, 45].map((n) => (
            <button
              className={duration === n ? "selected" : ""}
              key={n}
              onClick={() => setDuration(n)}
              aria-pressed={duration === n}
            >
              {n} min
            </button>
          ))}
        </div>
        <button
          className="primary"
          onClick={() => navigate("/focus", { state: { duration } })}
        >
          Settle into focus <ArrowRight size={17} />
        </button>
      </section>
      {hour >= 17 && (
        <section className="evening-note">
          <div>
            <h3>You made it through today.</h3>
            <p>Want to leave a little note before the day ends?</p>
          </div>
          <Link to="/journal/new" className="secondary">
            How did today feel?
          </Link>
        </section>
      )}
      <div className="page-footer">
        A peaceful day is more important than a perfectly productive day.
      </div>
      {editing && (
        <Modal title={`A little ${editing}`} onClose={() => setEditing(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                savePlan({
                  ...plan,
                  [editing]: {
                    text: text.trim(),
                    completed: text.trim() ? plan[editing].completed : false,
                  },
                })
              )
                setEditing(null);
            }}
          >
            <label htmlFor="intention">{descriptions[editing]}</label>
            <input
              id="intention"
              autoFocus
              maxLength={180}
              placeholder={placeholders[editing]}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <p className="hint">
              One thing is enough. You can change your mind later.
            </p>
            <div className="form-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button className="primary">Save intention</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
export function History() {
  const { plans, entries, sessions } = useStore();
  const dates = [
    ...new Set([
      ...plans.map((p) => p.date),
      ...entries.map((e) => e.date),
      ...sessions.map((s) => s.dailyPlanId),
    ]),
  ]
    .sort()
    .reverse();
  return (
    <>
      <div className="page-heading">
        <h1>Your days, softly collected.</h1>
        <p>Small moments that made a day your own.</p>
      </div>
      {!dates.length ? (
        <p className="empty">No need to rush. Your days will collect here.</p>
      ) : (
        dates.map((date) => (
          <section className="history-card" key={date}>
            <SectionTitle
              title={new Date(date + "T12:00:00").toLocaleDateString(
                undefined,
                { weekday: "long", month: "long", day: "numeric" },
              )}
            />
            {(["finish", "care", "enjoy"] as IntentionKind[]).map((k) => {
              const intent = plans.find((p) => p.date === date)?.[k];
              return (
                intent?.text && (
                  <p key={k}>
                    <span className={`history-kind ${k}`}>{k}</span>
                    {intent.completed ? (
                      <Check size={16} />
                    ) : (
                      <span className="open-dot" />
                    )}
                    {intent.text}
                  </p>
                )
              );
            })}
            {entries
              .filter((e) => e.date === date)
              .map((e) => (
                <Link
                  className="memory-link"
                  to={`/journal/${e.id}`}
                  key={e.id}
                >
                  {e.mood && <span>{e.mood} · </span>}
                  {e.text.slice(0, 120) || "A photo memory"}
                </Link>
              ))}
            {sessions.some((s) => s.dailyPlanId === date) && (
              <small>
                {Math.round(
                  sessions
                    .filter((s) => s.dailyPlanId === date)
                    .reduce((a, s) => a + s.actualDuration, 0) / 60,
                )}{" "}
                quiet minutes
              </small>
            )}
          </section>
        ))
      )}
    </>
  );
}
