import { useState, useEffect } from "react";
import { API_BASE } from "./config";
import "./Shell.css";

type Mode = "landing" | "guest" | "login" | "signup" | "app" | "paywall";

interface GuestData {
  prCount: number;
  generatedPRs: string[];
}

export default function Shell() {
  const [mode, setMode] = useState<Mode>("landing");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prLink, setPrLink] = useState("");
  const [guestData, setGuestData] = useState<GuestData>({ prCount: 0, generatedPRs: [] });
  const [generating, setGenerating] = useState(false);

  // Check on mount: token → app, no token → landing or guest
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setMode("app");
    } else {
      // Check if guest data exists
      const guestStr = localStorage.getItem("guestData");
      if (guestStr) {
        try {
          const guest = JSON.parse(guestStr);
          setGuestData(guest);
          setMode("guest");
        } catch {
          setMode("landing");
        }
      } else {
        setMode("landing");
      }
    }
  }, []);

  // Parse PR URL into owner, repo, prNumber
  const parsePRUrl = (url: string): { owner?: string; repo?: string; prNumber?: string } => {
    try {
      // Support formats: https://github.com/owner/repo/pull/123, owner/repo/pull/123, owner/repo#123
      const match = url.match(/(?:https?:\/\/github\.com\/)?([^/]+)\/([^/]+)(?:\/pull\/(\d+)|#(\d+))?/);
      if (match) {
        return {
          owner: match[1],
          repo: match[2],
          prNumber: match[3] || match[4],
        };
      }
    } catch {}
    return {};
  };

  // Generate slides for guest users
  const handleGuestGenerate = async () => {
    if (!prLink.trim()) {
      setError("Please enter a PR link");
      return;
    }

    // Check if already at limit
    if (guestData.prCount >= 5) {
      setMode("paywall");
      return;
    }

    setGenerating(true);
    setError("");
    try {
      const parsed = parsePRUrl(prLink);
      if (!parsed.owner || !parsed.repo || !parsed.prNumber) {
        setError("Please enter a valid PR URL (e.g., owner/repo/pull/123 or https://github.com/owner/repo/pull/123)");
        setGenerating(false);
        return;
      }

      // Call backend /generate endpoint (no auth required for guest)
      const url = new URL(`${API_BASE}/generate`);
      url.searchParams.set("owner", parsed.owner);
      url.searchParams.set("repo", parsed.repo);
      url.searchParams.set("prNumber", parsed.prNumber);

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate slides");
      }

      // Success: increment count
      const newCount = guestData.prCount + 1;
      const newPRs = [...guestData.generatedPRs, prLink];
      const newGuestData = { prCount: newCount, generatedPRs: newPRs };
      
      localStorage.setItem("guestData", JSON.stringify(newGuestData));
      setGuestData(newGuestData);
      setPrLink("");

    } catch (err) {
      setError("Error: " + (err instanceof Error ? err.message : "unknown"));
    } finally {
      setGenerating(false);
    }
  };

  const handleAuth = async (provider: "github" | "google" | "microsoft") => {
    setLoading(true);
    setError("");
    try {
      const mockToken = `mock_${provider}_token_${Date.now()}`;
      // Use /auth/login for both login and signup - backend will handle it
      const endpoint = "/auth/login";

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

      // Success: clear guest data and set auth token
      localStorage.removeItem("guestData");
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
    localStorage.removeItem("guestData");
    setMode("landing");
    setEmail("");
    setName("");
    setGuestData({ prCount: 0, generatedPRs: [] });
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
              <p>No signup needed</p>
            </div>
            <div className="shell-feature">
              <span>🔗</span>
              <h3>Easy Share</h3>
              <p>Share with team</p>
            </div>
          </div>

          <div className="shell-cta">
            <button className="shell-btn primary" onClick={() => setMode("guest")}>
              Try for Free (5 PRs)
            </button>
            <button className="shell-btn secondary" onClick={() => setMode("login")}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // GUEST MODE (Free tier - up to 5 PRs)
  if (mode === "guest") {
    const remaining = 5 - guestData.prCount;
    return (
      <div className="shell-app">
        <div className="shell-app-header">
          <div>
            <h1>🎯 Deep Diver</h1>
            <p className="shell-guest-badge">Free Trial • {guestData.prCount}/5 PRs Used</p>
          </div>
          <div className="shell-header-actions">
            <button 
              className="shell-btn secondary" 
              onClick={() => setMode("login")}
              style={{ marginRight: "10px" }}
            >
              Sign In
            </button>
            <button 
              className="shell-btn secondary" 
              onClick={() => setMode("signup")}
            >
              Create Account
            </button>
          </div>
        </div>
        
        <div className="shell-app-content">
          {/* Progress Bar */}
          <div className="shell-progress">
            <div className="shell-progress-label">
              <span>{guestData.prCount} of 5 free slides used</span>
              <span>{remaining} remaining</span>
            </div>
            <div className="shell-progress-bar">
              <div 
                className="shell-progress-fill"
                style={{ width: `${(guestData.prCount / 5) * 100}%` }}
              />
            </div>
          </div>

          <div className="shell-input-section">
            <h2>Generate Your {guestData.prCount + 1}st PR Slide</h2>
            <input
              type="text"
              placeholder="https://github.com/owner/repo or owner/repo/pull/123"
              value={prLink}
              onChange={(e) => setPrLink(e.target.value)}
              disabled={generating}
              className="shell-input-large"
            />
            <button
              className="shell-submit-large"
              onClick={handleGuestGenerate}
              disabled={generating || remaining <= 0}
            >
              {generating ? "Generating..." : remaining > 0 ? "Generate Slides" : "Limit Reached"}
            </button>
          </div>

          {error && <div className="shell-error">{error}</div>}

          {remaining === 1 && (
            <div className="shell-warning">
              ⚠️ <strong>1 slide remaining!</strong> Sign up to unlock unlimited slides.
            </div>
          )}

          {remaining === 0 && (
            <div className="shell-upgrade-cta">
              <h3>You've Generated 5 Free Slides!</h3>
              <p>Sign up to unlock unlimited PR slides and keep building knowledge.</p>
              <button 
                className="shell-btn primary"
                onClick={() => setMode("signup")}
              >
                Create Free Account
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // PAYWALL (After 5 PRs, force signup)
  if (mode === "paywall") {
    return (
      <div className="shell-auth">
        <div className="shell-paywall-card">
          <div className="shell-paywall-header">
            <div className="shell-paywall-icon">🎉</div>
            <h2>Limit Reached!</h2>
            <p>You've used all 5 free PR slides</p>
          </div>

          <div className="shell-paywall-benefits">
            <h3>Sign Up to Unlock:</h3>
            <ul>
              <li>✅ Unlimited PR slides</li>
              <li>✅ Save & share collections</li>
              <li>✅ Team collaboration</li>
              <li>✅ Advanced analytics</li>
            </ul>
          </div>

          <div className="shell-oauth">
            <button 
              className="shell-oauth-btn" 
              onClick={() => { setMode("signup"); handleAuth("github"); }} 
              disabled={loading}
            >
              ⭐ Continue with GitHub
            </button>
            <button 
              className="shell-oauth-btn" 
              onClick={() => { setMode("signup"); handleAuth("google"); }} 
              disabled={loading}
            >
              🔵 Continue with Google
            </button>
            <button 
              className="shell-oauth-btn" 
              onClick={() => { setMode("signup"); handleAuth("microsoft"); }} 
              disabled={loading}
            >
              ◻️ Continue with Microsoft
            </button>
          </div>

          <button 
            className="shell-back" 
            onClick={() => setMode("guest")}
          >
            ← Go Back
          </button>
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
          
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>

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
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="shell-toggle">
            Don't have an account? <button className="shell-link" onClick={() => setMode("signup")}>Create one</button>
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
          <p>Get unlimited PR slides</p>

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
            Already have an account? <button className="shell-link" onClick={() => setMode("login")}>Sign in</button>
          </p>
        </div>
      </div>
    );
  }

  // MAIN APP (Authenticated users)
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
