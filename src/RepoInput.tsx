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
  
  const fullUrl = repoUrl.startsWith("https://github.com/") ? repoUrl : `https://github.com/${repoUrl}`;
  const isValidUrl = repoUrl.trim().length > 0 && repoUrl.includes("/");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

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
  }

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
        🔗 Enter a GitHub Repository
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
          placeholder="owner/repo"
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
        {loading ? "Fetching PRs…" : "✨ Fetch Pull Requests"}
      </button>
    </form>
  );
}

export default RepoInput;