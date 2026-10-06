import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Download, Check, Smartphone } from "lucide-react";
import { Modal } from "../../components/ui";

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function useInstallState() {
  const [installed, setInstalled] = useState(isStandalone);
  const [busy, setBusy] = useState(false);
  const [guide, setGuide] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const promptRef = useRef<InstallPromptEvent | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    const capture = (event: Event) => {
      event.preventDefault();
      promptRef.current = event as InstallPromptEvent;
    };
    const complete = () => {
      completedRef.current = true;
      promptRef.current = null;
      setInstalled(true);
      setGuide(false);
      setStatus("Soft Day has been added to your device.");
    };
    const displayMode = window.matchMedia("(display-mode: standalone)");
    const change = () => {
      if (isStandalone()) complete();
    };
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", complete);
    displayMode.addEventListener("change", change);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", complete);
      displayMode.removeEventListener("change", change);
    };
  }, []);

  async function download() {
    if (installed || busy) return;
    const event = promptRef.current;
    if (!event) {
      setError("");
      setGuide(true);
      return;
    }
    // A browser installation event can only be used once, from a user gesture.
    promptRef.current = null;
    setBusy(true);
    setStatus("");
    try {
      await event.prompt();
      const choice = await event.userChoice;
      if (!completedRef.current)
        setStatus(
          choice.outcome === "accepted"
            ? "Your browser is adding Soft Day to your device."
            : "You can add Soft Day whenever you feel like it.",
        );
    } catch {
      setError(
        "The install prompt could not open. You can still use your browser’s menu.",
      );
      setGuide(true);
    } finally {
      setBusy(false);
    }
  }
  return {
    installed,
    busy,
    guide,
    error,
    status,
    download,
    closeGuide: () => setGuide(false),
  };
}

const InstallContext = createContext<ReturnType<typeof useInstallState> | null>(
  null,
);
export function InstallProvider({ children }: { children: ReactNode }) {
  const value = useInstallState();
  return (
    <InstallContext.Provider value={value}>{children}</InstallContext.Provider>
  );
}
function useInstall() {
  const value = useContext(InstallContext);
  if (!value) throw new Error("Install provider missing");
  return value;
}

export function InstallButton({
  className = "secondary",
}: {
  className?: string;
}) {
  const { installed, busy, download } = useInstall();
  return (
    <button
      className={className}
      disabled={installed || busy}
      onClick={() => void download()}
    >
      {installed ? (
        <Check size={16} aria-hidden="true" />
      ) : (
        <Download size={16} aria-hidden="true" />
      )}
      {installed ? "App installed" : busy ? "Opening install…" : "Download app"}
    </button>
  );
}

export function InstallCard() {
  const { installed } = useInstall();
  return (
    <section className="paper install-card">
      <div className="install-card-icon">
        <Smartphone size={24} aria-hidden="true" />
      </div>
      <div>
        <h2>A little closer, whenever you need it.</h2>
        <p>
          {installed
            ? "Soft Day is at home on your device."
            : "Add Soft Day to your device and open it in its own quiet window."}
        </p>
      </div>
      <InstallButton className="primary" />
      <p className="hint">
        Your saved days stay in this browser. The app works offline after your
        first visit.
      </p>
    </section>
  );
}

export function InstallGuide() {
  const { guide, error, status, closeGuide } = useInstall();
  const ios =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return (
    <>
      <span className="install-status" role="status">
        {status}
      </span>
      {guide && (
        <Modal title="Take Soft Day with you." onClose={closeGuide}>
          <div className="install-guide">
            <p>
              Add Soft Day to your home screen or desktop, so your quiet corner
              is always nearby.
            </p>
            {error && (
              <p className="install-error" role="alert">
                {error}
              </p>
            )}
            {ios ? (
              <>
                <h3>On iPhone or iPad</h3>
                <ol>
                  <li>Open Soft Day in Safari.</li>
                  <li>
                    Tap Share, then <strong>Add to Home Screen</strong>.
                  </li>
                  <li>
                    Keep <strong>Open as Web App</strong> on if shown, then tap{" "}
                    <strong>Add</strong>.
                  </li>
                </ol>
              </>
            ) : (
              <>
                <h3>In Chrome or Edge</h3>
                <ol>
                  <li>
                    Look for the install icon in the address bar, or open the
                    browser menu.
                  </li>
                  <li>
                    Choose <strong>Install Soft Day</strong> or{" "}
                    <strong>Install this site as an app</strong>. It may be
                    under Apps or Save and share.
                  </li>
                  <li>Confirm Install to add it to your device.</li>
                </ol>
                <h3>Using Safari on Mac?</h3>
                <p>
                  Choose <strong>File → Add to Dock</strong>, then Add.
                </p>
              </>
            )}
            <p className="hint">
              If an install option isn’t available, try Chrome, Edge, or Safari.
              You can keep using Soft Day in this tab.
            </p>
            <div className="form-actions">
              <button className="primary" onClick={closeGuide}>
                Got it
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
