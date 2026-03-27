import { useState } from "react";
import { theme } from "./theme";
import Spinner from "./Spinner";
import Toast from "./Toast";
import ProgressBar from "./ProgressBar";
import { API_BASE } from "./config";

function sparkline() {
  const points = Array.from({ length: 10 }, () =>
    Math.floor(Math.random() * 8)
  );
  const chars = "▁▂▃▄▅▆▇█";
  return points.map((p) => chars[p]).join("");
}

type PRListProps = {
  owner: string;
  repo: string;
  prs: {
    number: number;
    title: string;
    user: string;
    updatedAt: string;
    labels: string[];
  }[];
  onBack: () => void;
  onOpenSlides: (url: string) => void;
};

export default function PRList({
  owner,
  repo,
  prs,
  onBack,
  onOpenSlides,
}: PRListProps) {
  const [loadingPR, setLoadingPR] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: any } | null>(
    null
  );

  async function generateSlides(prNumber: number) {
    setLoadingPR(prNumber);
    setProgress(10);

    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 10, 90));
    }, 200);

    const res = await fetch(`${API_BASE}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repoUrl: `https://github.com/${owner}/${repo}`,
        prNumber,
      }),
    });

    const data = await res.json();
    clearInterval(interval);

    if (res.ok) {
      setProgress(100);
      setToast({ message: "Slides ready! 🎉", type: "success" });
      setTimeout(() => onOpenSlides(data.url), 400);
    } else {
      setToast({ message: "Failed to generate slides", type: "error" });
    }

    setLoadingPR(null);
    setTimeout(() => setProgress(0), 500);
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <button
        onClick={onBack}
        style={{
          marginBottom: 20,
          background: "transparent",
          color: theme.colors.textMuted,
          border: "none",
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        ← Back
      </button>

      <h2 style={{ fontSize: 32, marginBottom: 20 }}>
        📂 {owner}/{repo}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {prs.map((pr) => (
          <div
            key={pr.number}
            style={{
              background: theme.colors.card,
              padding: 20,
              borderRadius: theme.radius,
              boxShadow: theme.shadow,
              transition: "transform 0.2s, opacity 0.3s",
              opacity: loadingPR && loadingPR !== pr.number ? 0.4 : 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: 14, color: theme.colors.textMuted }}>
              #{pr.number} • {pr.user}
            </div>

            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 6 }}>
              {pr.title}
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 12,
                color: theme.colors.accent2,
              }}
            >
              📈 Activity: {sparkline()}
            </div>

            {loadingPR === pr.number && (
              <>
                <Spinner />
                <ProgressBar progress={progress} />
              </>
            )}

            <button
              onClick={() => generateSlides(pr.number)}
              disabled={loadingPR !== null}
              style={{
                marginTop: 16,
                width: "100%",
                padding: "10px",
                borderRadius: theme.radius,
                background:
                  loadingPR === pr.number
                    ? "#475569"
                    : theme.colors.accent,
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              🎞️ {loadingPR === pr.number ? "Generating…" : "Generate Slides"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
