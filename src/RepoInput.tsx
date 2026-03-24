import { useState } from "react";
import { theme } from "./theme";
import { API_BASE } from "./config";

type RepoInputProps = {
  onLoaded: (owner: string, repo: string, prs: any[]) => void;
};

function RepoInput({ onLoaded }: RepoInputProps) {
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(
      `${API_BASE}/prs?repoUrl=${encodeURIComponent(repoUrl)}`
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
        🔗 Enter a GitHub Repository URL
      </label>

      <input
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        placeholder="https://github.com/org/repo"
        style={{
          width: "100%",
          padding: "14px 18px",
          borderRadius: theme.radius,
          border: `1px solid ${theme.colors.border}`,
          background: "#0f172a",
          color: theme.colors.text,
          fontSize: 16,
          marginBottom: 16,
        }}
      />

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: theme.radius,
          background: loading ? "#475569" : theme.colors.accent,
          color: "white",
          fontSize: 18,
          fontWeight: 600,
          cursor: "pointer",
          transition: "0.2s",
        }}
      >
        {loading ? "Fetching PRs…" : "✨ Fetch Pull Requests"}
      </button>
    </form>
  );
}

export default RepoInput;