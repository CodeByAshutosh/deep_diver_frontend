import { useState } from "react";
import "./Auth.css";

interface LogInProps {
  onSuccess?: () => void;
}

export function LogIn({ onSuccess }: LogInProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOAuth = async (provider: "github" | "google" | "microsoft") => {
    setLoading(true);
    setError("");
    try {
      const mockToken = `mock_${provider}_token_${Date.now()}`;

      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          providerIdToken: mockToken,
          email: email || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }

      localStorage.setItem("authToken", data.token);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back to Deep Diver</h1>
        <p className="auth-subtitle">Log in to continue</p>

        {error && <div className="error-message">{error}</div>}

        <div className="oauth-buttons">
          <button
            className="oauth-btn github"
            onClick={() => handleOAuth("github")}
            disabled={loading}
          >
            <span className="oauth-icon">⭐</span>
            Log in with GitHub
          </button>
          <button
            className="oauth-btn google"
            onClick={() => handleOAuth("google")}
            disabled={loading}
          >
            <span className="oauth-icon">🔵</span>
            Log in with Google
          </button>
          <button
            className="oauth-btn microsoft"
            onClick={() => handleOAuth("microsoft")}
            disabled={loading}
          >
            <span className="oauth-icon">◻️</span>
            Log in with Microsoft
          </button>
        </div>

        <div className="divider">or</div>

        <div className="email-form">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <button
            className="submit-btn"
            onClick={() => {
              if (!email) {
                setError("Please enter your email");
                return;
              }
              handleOAuth("github");
            }}
            disabled={loading}
          >
            {loading ? "Logging In..." : "Log In"}
          </button>
        </div>

        <p className="auth-footer">
          Don't have an account?{" "}
          <a href="#" onClick={() => window.location.hash = "signup"} className="link">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
