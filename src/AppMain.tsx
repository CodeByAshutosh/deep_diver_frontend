import { useState } from "react";
import RepoInput from "./RepoInput";
import PRList from "./PRList";
import SlideViewer from "./SlideViewer";
import Toast from "./Toast";
import { themes } from "./theme";

type View =
  | { type: "home" }
  | { type: "prs"; owner: string; repo: string; prs: any[] }
  | { type: "slides"; url: string; previousView: View };

interface AppMainProps {
  isAdmin?: boolean;
  onLogout?: () => void;
  onViewAnalytics?: () => void;
}

export default function AppMain({ isAdmin, onLogout, onViewAnalytics }: AppMainProps) {
  const [view, setView] = useState<View>({ type: "home" });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isDark, setIsDark] = useState(true);

  const currentTheme = isDark ? themes.dark : themes.light;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: isDark 
          ? `linear-gradient(135deg, ${currentTheme.colors.bg}, #1e1b4b)`
          : `linear-gradient(135deg, ${currentTheme.colors.bg}, #f3f4f6)`,
        color: currentTheme.colors.text,
        padding: "40px 20px",
        fontFamily: "Inter, system-ui",
        transition: "background 0.3s ease, color 0.3s ease",
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ flex: 1 }} />
          <div style={{ textAlign: "center", flex: 1 }}>
            <h1 style={{ fontSize: 48, fontWeight: 800, margin: "0 0 10px 0" }}>
              🎯 Deep Diver
            </h1>
            <p style={{ fontSize: 18, color: currentTheme.colors.textMuted, margin: 0 }}>
              Turning PRs into learning lessons in minutes
            </p>
          </div>
           <div style={{ flex: 1, textAlign: "right", display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center" }}>
            {isAdmin && (
              <button
                onClick={onViewAnalytics}
                style={{
                  background: currentTheme.colors.accent,
                  border: `2px solid ${currentTheme.colors.accent}`,
                  color: "white",
                  fontSize: 14,
                  padding: "8px 16px",
                  borderRadius: currentTheme.radius,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                📊 Analytics
              </button>
            )}
            <button
              onClick={() => setIsDark(!isDark)}
              style={{
                background: "transparent",
                border: `2px solid ${currentTheme.colors.border}`,
                color: currentTheme.colors.text,
                fontSize: 20,
                padding: "10px 16px",
                borderRadius: currentTheme.radius,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = currentTheme.colors.accent;
                e.currentTarget.style.borderColor = currentTheme.colors.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = currentTheme.colors.border;
              }}
            >
              {isDark ? "☀️" : "🌙"}
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                style={{
                  background: "transparent",
                  border: `2px solid ${currentTheme.colors.border}`,
                  color: currentTheme.colors.text,
                  fontSize: 14,
                  padding: "8px 16px",
                  borderRadius: currentTheme.radius,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* HOME VIEW */}
      {view.type === "home" && (
        <div style={{ animation: "fadeIn 0.4s ease" }}>
          <RepoInput
            theme={currentTheme}
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
            theme={currentTheme}
            onBack={() => setView({ type: "home" })}
            onOpenSlides={(url) => {
              setToast({ message: "Opening slides…", type: "success" });
              setView({ type: "slides", url, previousView: { type: "prs", owner: view.owner, repo: view.repo, prs: view.prs } });
            }}
          />
        </div>
      )}

      {/* SLIDE VIEWER */}
      {view.type === "slides" && (
        <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SlideViewer
            url={view.url}
            onBack={() => setView(view.previousView)}
          />
        </div>
      )}
    </div>
  );
}