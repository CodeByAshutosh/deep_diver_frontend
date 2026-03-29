import { useState } from "react";
import { API_BASE } from "./config";

type ThemeType = {
  colors: Record<string, string>;
  radius: string;
  shadow: string;
};

type RepoInputProps = {
  theme: ThemeType;
  onLoaded: (owner: string, repo: string, prs: any[]) => void;
};

function RepoInput({ theme, onLoaded }: RepoInputProps) {
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [buttonMode, setButtonMode] = useState<"repo" | "pr" | "none">("none");
  
  // Parse input to determine if it's a repo or PR link
  const parseInput = (input: string) => {
    const trimmed = input.trim();
    
    // Check if it's a PR link
    const prMatch = trimmed.match(/(?:https:\/\/)?github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
    if (prMatch) {
      return { type: "pr", owner: prMatch[1], repo: prMatch[2], prNumber: parseInt(prMatch[3]) };
    }
    
    // Check if it's a repo link
    const repoMatch = trimmed.match(/(?:https:\/\/github\.com\/)?([^/]+)\/([^/\s]+)/);
    if (repoMatch) {
      return { type: "repo", owner: repoMatch[1], repo: repoMatch[2].replace(/\/$/, "") };
    }
    
    return null;
  };

  const parsed = parseInput(repoUrl);
  const isValidUrl = parsed !== null;
  
  // Update button mode based on parsed input
  if (isValidUrl && parsed.type === "pr") {
    if (buttonMode !== "pr") setButtonMode("pr");
  } else if (isValidUrl && parsed.type === "repo") {
    if (buttonMode !== "repo") setButtonMode("repo");
  } else if (buttonMode !== "none") {
    setButtonMode("none");
  }

  async function handleFetchPRs(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!parsed || parsed.type !== "repo") return;
    
    setLoading(true);
    const fullUrl = `https://github.com/${parsed.owner}/${parsed.repo}`;
    
    try {
      const res = await fetch(
        `${API_BASE}/prs?repoUrl=${encodeURIComponent(fullUrl)}`
      );
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        onLoaded(data.owner, data.repo, data.prs);
      } else {
        alert(data.error);
      }
    } catch (err) {
      setLoading(false);
      alert("Error fetching PRs");
    }
  }

  async function handleGenerateSlides(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!parsed || parsed.type !== "pr") return;
    
    setLoading(true);
    const slideUrl = `${API_BASE}/generate?owner=${parsed.owner}&repo=${parsed.repo}&prNumber=${parsed.prNumber}`;
    
    try {
      const res = await fetch(slideUrl);
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.url) {
        window.open(data.url, "_blank");
      } else {
        alert(data.error || "Failed to generate slides");
      }
    } catch (err) {
      setLoading(false);
      alert("Error generating slides");
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (buttonMode === "pr") {
      handleGenerateSlides(e);
    } else if (buttonMode === "repo") {
      handleFetchPRs(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 600,
        margin: "0 auto",
        background: theme.colors.card,
        padding: 32,
        borderRadius: theme.radius,
        boxShadow: theme.shadow,
      }}
    >
      <label style={{ fontSize: 16, marginBottom: 8, display: "block" }}>
        🔗 Enter a GitHub Repository or PR Link
      </label>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value="https://github.com/"
          disabled
          style={{
            padding: "14px 18px",
            borderRadius: theme.radius,
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.bg,
            color: theme.colors.textMuted,
            fontSize: 16,
            width: "200px",
            cursor: "not-allowed",
          }}
        />
        <input
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="owner/repo or owner/repo/pull/123"
          style={{
            flex: 1,
            padding: "14px 18px",
            borderRadius: theme.radius,
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.bg,
            color: theme.colors.text,
            fontSize: 16,
          }}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !isValidUrl}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: theme.radius,
          background: (loading || !isValidUrl) ? theme.colors.textMuted : theme.colors.accent,
          color: "white",
          fontSize: 18,
          fontWeight: 600,
          cursor: (loading || !isValidUrl) ? "not-allowed" : "pointer",
          transition: "0.2s",
          opacity: (loading || !isValidUrl) ? 0.6 : 1,
        }}
      >
        {loading ? "Processing…" : (
          buttonMode === "pr" 
            ? "🚀 Generate Slides" 
            : buttonMode === "repo" 
            ? "✨ Fetch Pull Requests"
            : "✨ Enter a link"
        )}
      </button>
    </form>
  );
}

export default RepoInput;