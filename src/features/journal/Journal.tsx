import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Plus, BookOpen, ImagePlus, X, Lock, ArrowLeft } from "lucide-react";
import { useStore } from "../../app/Store";
import {
  dateKey,
  prettyDate,
  moods,
  type JournalEntry,
} from "../../services/data";
import { EmptyState, Modal } from "../../components/ui";
export default function Journal() {
  const { entries } = useStore();
  return (
    <>
      <div className="page-heading heading-with-action">
        <div>
          <span className="small-label">Your private little notebook</span>
          <h1>A place to leave a thought.</h1>
          <p>Big feelings, small moments, and everything in between.</p>
        </div>
        <Link className="primary" to="/journal/new">
          <Plus size={18} /> Leave a little note
        </Link>
      </div>
      <div className="journal-prompt">
        <BookOpen size={28} />
        <div>
          <h2>What stayed with you today?</h2>
          <p>You don’t have to find the right words. Just your own.</p>
        </div>
        <Link to="/journal/new" className="text-link">
          Open your notebook
        </Link>
      </div>
      {entries.length ? (
        <div className="journal-grid">
          {entries.map((entry) => (
            <Link
              className="journal-card"
              to={`/journal/${entry.id}`}
              key={entry.id}
            >
              <span className="small-label">
                {prettyDate(entry.date)} · {entry.kind}
              </span>
              {entry.mood && <span className="mood-tag">{entry.mood}</span>}
              <p>{entry.text || "A little memory, kept here."}</p>
              {entry.photos[0] && (
                <img
                  src={entry.photos[0]}
                  alt="Photo saved with this journal entry"
                />
              )}
              <span className="text-link">Read your note</span>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="Nothing written yet.">
          Leave a thought whenever you feel like it.
        </EmptyState>
      )}
      <p className="privacy-note">
        <Lock size={14} /> Just for you. Your entries stay in this browser on
        this device.
      </p>
    </>
  );
}
const prompts = [
  "Something I enjoyed…",
  "Something I noticed…",
  "Something I’m grateful for…",
  "Something I want to leave here…",
  "Something I want tomorrow…",
];
export function JournalEditor() {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const { entries, saveEntry, removeEntry, setMessage } = useStore();
  const entry = entries.find((e) => e.id === entryId);
  const [text, setText] = useState(entry?.text ?? "");
  const [mood, setMood] = useState(entry?.mood ?? "");
  const [kind, setKind] = useState(entry?.kind ?? "Daily journal");
  const [photos, setPhotos] = useState<string[]>(entry?.photos ?? []);
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  async function addPhotos(files: FileList | null) {
    if (!files) return;
    setLoading(true);
    try {
      for (const file of Array.from(files).slice(0, 3 - photos.length)) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
          throw new Error("Choose a JPG, PNG, or WebP photo.");
        if (file.size > 15 * 1024 * 1024)
          throw new Error("Choose a photo smaller than 15 MB.");
        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement("canvas");
        const ratio = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height));
        canvas.width = bitmap.width * ratio;
        canvas.height = bitmap.height * ratio;
        canvas
          .getContext("2d")!
          .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        const photo = canvas.toDataURL("image/jpeg", 0.75);
        setPhotos((p) => [...p, photo].slice(0, 3));
        setDirty(true);
      }
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  if (entryId && !entry)
    return (
      <EmptyState title="This page is missing.">
        <Link to="/journal">Return to your notebook</Link>
      </EmptyState>
    );
  function save() {
    const time = new Date().toISOString();
    const next: JournalEntry = {
      id: entry?.id ?? crypto.randomUUID(),
      userId: "local",
      date: entry?.date ?? dateKey(),
      text: text.trim(),
      mood,
      kind,
      photos,
      createdAt: entry?.createdAt ?? time,
      updatedAt: time,
    };
    if (saveEntry(next)) {
      setDirty(false);
      navigate("/journal");
    }
  }
  return (
    <>
      <Link
        to="/journal"
        className="back-link"
        onClick={(e) => {
          if (
            dirty &&
            !window.confirm("Leave this note without saving your changes?")
          )
            e.preventDefault();
        }}
      >
        <ArrowLeft size={16} /> Your notebook
      </Link>
      <form
        className="journal-editor paper"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="small-label">
          {prettyDate(entry?.date ?? dateKey())}
        </div>
        <h1>How did today feel?</h1>
        <p>There’s no right answer. There’s just you.</p>
        <fieldset>
          <legend>A word for your day, if you like</legend>
          <div className="choice-row">
            {moods.map((m) => (
              <button
                type="button"
                key={m}
                aria-pressed={mood === m}
                className={`chip ${mood === m ? "selected" : ""}`}
                onClick={() => {
                  setMood(mood === m ? "" : m);
                  setDirty(true);
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </fieldset>
        <label htmlFor="entry-kind">A place for a…</label>
        <select
          id="entry-kind"
          value={kind}
          onChange={(e) => {
            setKind(e.target.value);
            setDirty(true);
          }}
        >
          {[
            "Daily journal",
            "Thought",
            "Memory",
            "Idea",
            "Gratitude",
            "Photo",
          ].map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
        <label className="writing-label" htmlFor="journal-text">
          What stayed with you today?
        </label>
        <textarea
          id="journal-text"
          className="notebook-text"
          placeholder="Start wherever you are…"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setDirty(true);
          }}
        />
        <details>
          <summary>A little help getting started</summary>
          <div className="prompt-list">
            {prompts.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => {
                  setText((t) => t + (t ? "\n\n" : "") + p + "\n");
                  setDirty(true);
                  document.getElementById("journal-text")?.focus();
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </details>
        <div className="photo-strip">
          {photos.map((p, i) => (
            <div key={i}>
              <img src={p} alt={`Memory ${i + 1}`} />
              <button
                type="button"
                className="icon-button"
                aria-label={`Remove photo ${i + 1}`}
                onClick={() => {
                  setPhotos(photos.filter((_, j) => j !== i));
                  setDirty(true);
                }}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        {photos.length < 3 && (
          <label className="photo-upload">
            <ImagePlus size={18} />
            {loading ? "Keeping your photo…" : "Add a photo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={loading}
              onChange={(e) => void addPhotos(e.target.files)}
            />
          </label>
        )}
        <div className="form-actions">
          {entry && (
            <button
              type="button"
              className="text-button"
              onClick={() => setConfirm(true)}
            >
              Delete entry
            </button>
          )}
          <span className="hint">
            {dirty ? "Changes not yet saved" : "Only for you"}
          </span>
          <button
            className="primary"
            disabled={loading || (!text.trim() && !mood && !photos.length)}
          >
            Keep this memory
          </button>
        </div>
      </form>
      {confirm && (
        <Modal title="Let this entry go?" onClose={() => setConfirm(false)}>
          <p>This removes the note and its photos from this device.</p>
          <div className="form-actions">
            <button className="secondary" onClick={() => setConfirm(false)}>
              Keep it
            </button>
            <button
              className="primary"
              onClick={() => {
                if (entry && removeEntry(entry.id)) navigate("/journal");
              }}
            >
              Delete entry
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
