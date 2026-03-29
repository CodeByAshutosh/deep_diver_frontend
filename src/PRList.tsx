import { useState } from "react";
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

type ThemeType = {
  colors: Record<string, string>;
  radius: string;
  shadow: string;
};

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
  theme: ThemeType;
  onBack: () => void;
  onOpenSlides: (url: string) => void;
};

const ITEMS_PER_PAGE = 12;

export default function PRList({
  owner,
  repo,
  prs,
  theme,
  onBack,
  onOpenSlides,
}: PRListProps) {
  const [loadingPR, setLoadingPR] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: any } | null>(
    null
  );

  const totalPages = Math.ceil(prs.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPRs = prs.slice(startIdx, startIdx + ITEMS_PER_PAGE);

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
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
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

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 32, margin: 0 }}>
          📂 {owner}/{repo}
        </h2>
        <span style={{ color: theme.colors.textMuted, fontSize: 14 }}>
          {prs.length} PRs
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
          marginBottom: 40,
        }}
      >
        {paginatedPRs.map((pr) => (
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
                    ? theme.colors.textMuted
                    : theme.colors.accent,
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
              }}
            >
              🎞️ {loadingPR === pr.number ? "Generating…" : "Generate Slides"}
            </button>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 40 }}>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              padding: "10px 16px",
              borderRadius: theme.radius,
              background: currentPage === 1 ? theme.colors.textMuted : theme.colors.accent,
              color: "white",
              fontWeight: 600,
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              border: "none",
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                padding: "10px 14px",
                borderRadius: theme.radius,
                background: currentPage === page ? theme.colors.accent : theme.colors.card,
                color: currentPage === page ? "white" : theme.colors.text,
                fontWeight: 600,
                cursor: "pointer",
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: "10px 16px",
              borderRadius: theme.radius,
              background: currentPage === totalPages ? theme.colors.textMuted : theme.colors.accent,
              color: "white",
              fontWeight: 600,
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              border: "none",
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
