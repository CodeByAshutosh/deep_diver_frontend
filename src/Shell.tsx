import { useState } from "react";
import { API_BASE } from "./config";
import "./Shell.css";

type Mode = "landing" | "login" | "signup" | "app";

export default function Shell() {
  const [mode, setMode] = useState<Mode>("landing");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (provider: "github" | "google" | "microsoft") => {
    setLoading(true);
    setError("");
    try {
      const mockToken = `mock_${provider}_token_${Date.now()}`;
      const endpoint = mode === "signup" ? "/auth/signup" : "/auth/login";

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          providerIdToken: mockToken,
          email: email || undefined,
          name: name || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed");
        return;
      }

      // Success
      localStorage.setItem("authToken", data.token);
      
      setMode("app");
      setEmail("");
      setName("");
    } catch (err) {
      setError("Error: " + (err instanceof Error ? err.message : "unknown"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setMode("landing");
    setEmail("");
    setName("");
  };

  // LANDING PAGE
  if (mode === "landing") {
    return (
      <div className="shell-landing">
        <div className="shell-content">
          <div className="shell-logo">🎯</div>
          <h1>Deep Diver</h1>
          <p>Turning PRs into learning lessons in minutes</p>
          
          <div className="shell-features">
            <div className="shell-feature">
              <span>📊</span>
              <h3>Auto-Generate</h3>
              <p>PR slides in seconds</p>
            </div>
            <div className="shell-feature">
              <span>⚡</span>
              <h3>5 Free Slides</h3>
              <p>Test it out first</p>
            </div>
            <div className="shell-feature">
              <span>🔗</span>
              <h3>Easy Share</h3>
              <p>Share with team</p>
            </div>
          </div>

          <div className="shell-cta">
            <button className="shell-btn primary" onClick={() => setMode("login")}>
              Log In
            </button>
            <button className="shell-btn secondary" onClick={() => setMode("signup")}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LOGIN PAGE
  if (mode === "login") {
    return (
      <div className="shell-auth">
        <div className="shell-auth-card">
          <button className="shell-back" onClick={() => setMode("landing")}>← Back</button>
          
          <h2>Log In</h2>
          <p>Welcome back to Deep Diver</p>

          {error && <div className="shell-error">{error}</div>}

          <div className="shell-oauth">
            <button className="shell-oauth-btn" onClick={() => handleAuth("github")} disabled={loading}>
              ⭐ GitHub
            </button>
            <button className="shell-oauth-btn" onClick={() => handleAuth("google")} disabled={loading}>
              🔵 Google
            </button>
            <button className="shell-oauth-btn" onClick={() => handleAuth("microsoft")} disabled={loading}>
              ◻️ Microsoft
            </button>
          </div>

          <div className="shell-divider">or</div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="shell-input"
          />
          
          <button
            className="shell-submit"
            onClick={() => handleAuth("github")}
            disabled={loading || !email}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          <p className="shell-toggle">
            Don't have an account? <button className="shell-link" onClick={() => setMode("signup")}>Sign up</button>
          </p>
        </div>
      </div>
    );
  }

  // SIGNUP PAGE
  if (mode === "signup") {
    return (
      <div className="shell-auth">
        <div className="shell-auth-card">
          <button className="shell-back" onClick={() => setMode("landing")}>← Back</button>
          
          <h2>Create Account</h2>
          <p>Get 5 free PR slides</p>

          {error && <div className="shell-error">{error}</div>}

          <div className="shell-oauth">
            <button className="shell-oauth-btn" onClick={() => handleAuth("github")} disabled={loading}>
              ⭐ GitHub
            </button>
            <button className="shell-oauth-btn" onClick={() => handleAuth("google")} disabled={loading}>
              🔵 Google
            </button>
            <button className="shell-oauth-btn" onClick={() => handleAuth("microsoft")} disabled={loading}>
              ◻️ Microsoft
            </button>
          </div>

          <div className="shell-divider">or</div>

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className="shell-input"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="shell-input"
          />
          
          <button
            className="shell-submit"
            onClick={() => handleAuth("github")}
            disabled={loading || !email || !name}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          <p className="shell-toggle">
            Already have an account? <button className="shell-link" onClick={() => setMode("login")}>Log in</button>
          </p>
        </div>
      </div>
    );
  }

  // MAIN APP
  if (mode === "app") {
    return (
      <div className="shell-app">
        <div className="shell-app-header">
          <h1>🎯 Deep Diver</h1>
          <button className="shell-logout" onClick={handleLogout}>Logout</button>
        </div>
        
        <div className="shell-app-content">
          <div className="shell-input-section">
            <h2>Enter a GitHub Repository or PR Link</h2>
            <input
              type="text"
              placeholder="https://github.com/ or owner/repo or owner/repo/pull/123"
              className="shell-input-large"
            />
            <button className="shell-submit-large">Generate Slides</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
