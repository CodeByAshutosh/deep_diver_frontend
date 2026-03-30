import { useState } from "react";
import { API_BASE } from "./config";
import "./HomePage.css";

interface HomePageProps {
  onAuthSuccess: () => void;
}

export function HomePage({ onAuthSuccess }: HomePageProps) {
  const [mode, setMode] = useState<"intro" | "login" | "signup">("intro");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOAuth = async (provider: "github" | "google" | "microsoft") => {
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
        setError(data.error || `${mode} failed`);
        console.error(`${mode} error:`, data);
        return;
      }

      // Success - store token and notify parent
      localStorage.setItem("authToken", data.token);
      console.log(`✅ ${mode} successful!`);
      onAuthSuccess();
    } catch (err) {
      setError(`${mode} failed - ` + (err instanceof Error ? err.message : "unknown error"));
      console.error(`${mode} catch:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (mode === "signup") {
      if (!email || !name) {
        setError("Please fill in all fields");
        return;
      }
    } else {
      if (!email) {
        setError("Please enter your email");
        return;
      }
    }

    // For email auth, use GitHub as default provider
    await handleOAuth("github");
  };

  // INTRO MODE - Landing page
  if (mode === "intro") {
    return (
      <div className="homepage-container">
        <div className="homepage-content">
          <div className="hero-section">
            <div className="logo-section">
              <div className="logo">🎯</div>
              <h1>Deep Diver</h1>
              <p className="tagline">Turning PRs into learning lessons in minutes</p>
            </div>

            <div className="features-grid">
              <div className="feature">
                <span className="icon">📊</span>
                <h3>Auto-Generate Slides</h3>
                <p>Transforms any PR into beautiful learning slides</p>
              </div>
              <div className="feature">
                <span className="icon">⚡</span>
                <h3>5 Free Slides</h3>
                <p>Test drive with 5 PR slide generations</p>
              </div>
              <div className="feature">
                <span className="icon">🔗</span>
                <h3>Easy Share</h3>
                <p>Share slides with your team instantly</p>
              </div>
            </div>

            <div className="cta-buttons">
              <button
                className="cta-btn primary"
                onClick={() => setMode("login")}
              >
                Get Started
              </button>
              <button
                className="cta-btn secondary"
                onClick={() => setMode("signup")}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LOGIN/SIGNUP MODE
  return (
    <div className="homepage-container">
      <div className="auth-card-container">
        <button
          className="back-btn"
          onClick={() => {
            setMode("intro");
            setError("");
            setEmail("");
            setName("");
          }}
        >
          ← Back
        </button>

        <div className="auth-card">
          <h1>{mode === "login" ? "Welcome Back" : "Create Account"}</h1>
          <p className="subtitle">
            {mode === "login"
              ? "Log in to generate PR slides"
              : "Sign up to get 5 free PR slides"}
          </p>

          {error && <div className="error-message">{error}</div>}

          <div className="oauth-section">
            <h3>Sign in with</h3>
            <div className="oauth-buttons">
              <button
                className="oauth-btn github"
                onClick={() => handleOAuth("github")}
                disabled={loading}
              >
                <span className="oauth-icon">⭐</span>
                GitHub
              </button>
              <button
                className="oauth-btn google"
                onClick={() => handleOAuth("google")}
                disabled={loading}
              >
                <span className="oauth-icon">🔵</span>
                Google
              </button>
              <button
                className="oauth-btn microsoft"
                onClick={() => handleOAuth("microsoft")}
                disabled={loading}
              >
                <span className="oauth-icon">◻️</span>
                Microsoft
              </button>
            </div>
          </div>

          <div className="divider">
            <span>or</span>
          </div>

          <div className="email-section">
            {mode === "signup" && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="input-field"
              />
            )}
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="input-field"
            />
            <button
              className="submit-btn"
              onClick={handleEmailSubmit}
              disabled={loading}
            >
              {loading
                ? mode === "login"
                  ? "Logging In..."
                  : "Creating Account..."
                : mode === "login"
                ? "Log In"
                : "Create Account"}
            </button>
          </div>

          <p className="mode-toggle">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  className="link-btn"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                  }}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  className="link-btn"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                >
                  Log in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
