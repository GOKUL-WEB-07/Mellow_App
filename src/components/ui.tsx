import { useEffect, useRef, useId, type ReactNode } from "react";
import {
  X,
  Sun,
  Leaf,
  Heart,
  Sparkles,
  Coffee,
  Flame,
  Image,
  Check,
  ArrowUpRight,
} from "lucide-react";
export const kindIcons = { finish: Sun, care: Heart, enjoy: Sparkles };
export function Cup({ small = false }: { small?: boolean }) {
  return (
    <div className={`cup-art ${small ? "small" : ""}`} aria-hidden="true">
      <div className="steam">
        <i />
        <i />
        <i />
      </div>
      <div className="cup-handle" />
      <div className="cup-bowl">
        <span>✿</span>
      </div>
      <div className="saucer" />
    </div>
  );
}
export function RoomScene({
  large = false,
  items = [],
}: {
  large?: boolean;
  items?: string[];
}) {
  return (
    <div className={`room-scene ${large ? "large" : ""}`}>
      <img
        src={`${import.meta.env.BASE_URL}room.webp`}
        alt="A quiet companion drinking tea beside a sunlit window, with a wooden desk, books, plants, and a sleeping cat"
        fetchPriority={large ? "auto" : "high"}
      />
      {items.length > 0 && (
        <div className="room-additions" aria-label="Your room decorations">
          {items.map((id) => {
            const Icon =
              id === "cup"
                ? Coffee
                : id === "plant"
                  ? Leaf
                  : id === "candle"
                    ? Flame
                    : Image;
            return (
              <span key={id} title={id}>
                <Icon size={24} />
              </span>
            );
          })}
        </div>
      )}
      <span className="scene-note">
        <span /> A little space to just be.
      </span>
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const el = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    el?.showModal();
    el?.querySelector<HTMLElement>("input, select, textarea, button")?.focus();
    return () => {
      el?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={onClose}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const elements = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
          ),
        );
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-head">
        <h2 id={titleId}>{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function EmptyState({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty">
      <Leaf size={28} />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export function SectionTitle({
  title,
  note,
}: {
  title: string;
  note?: string;
}) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {note && <span>{note}</span>}
    </div>
  );
}
export { Check, ArrowUpRight };
