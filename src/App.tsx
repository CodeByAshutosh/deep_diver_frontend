import { useState } from "react";
import RepoInput from "./RepoInput";
import PRList from "./PRList";
import SlideViewer from "./SlideViewer";
import Toast from "./Toast";
import { theme } from "./theme";

type View =
  | { type: "home" }
  | { type: "prs"; owner: string; repo: string; prs: any[] }
  | { type: "slides"; url: string };

export default function App() {
  const [view, setView] = useState<View>({ type: "home" });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${theme.colors.bg}, #1e1b4b)`,
        color: theme.colors.text,
        padding: "40px",
        fontFamily: "Inter, system-ui",
        transition: "opacity 0.4s ease",
      }}
    >
      {/* Global Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <header style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 48, fontWeight: 800 }}>
          🚀 PR Slides Studio
        </h1>
        <p style={{ fontSize: 18, color: theme.colors.textMuted }}>
          Turn GitHub PRs into beautiful, SDE2‑level slide decks in seconds.
        </p>
      </header>

      {/* HOME VIEW */}
      {view.type === "home" && (
        <div style={{ animation: "fadeIn 0.4s ease" }}>
          <RepoInput
            onLoaded={(owner, repo, prs) => {
              setToast({ message: "Repository loaded! 🎉", type: "success" });
              setView({ type: "prs", owner, repo, prs });
            }}
          />
        </div>
      )}

      {/* PR LIST VIEW */}
      {view.type === "prs" && (
        <div style={{ animation: "fadeIn 0.4s ease" }}>
          <PRList
            owner={view.owner}
            repo={view.repo}
            prs={view.prs}
            onBack={() => setView({ type: "home" })}
            onOpenSlides={(url) => {
              setToast({ message: "Opening slides…", type: "success" });
              setView({ type: "slides", url });
            }}
          />
        </div>
      )}

      {/* SLIDE VIEWER */}
      {view.type === "slides" && (
        <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SlideViewer
            url={view.url}
            onBack={() => setView({ type: "home" })}
          />
        </div>
      )}
    </div>
  );
}