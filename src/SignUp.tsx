import { useState } from "react";
import "./Auth.css";
import { API_BASE } from "./config";

interface SignUpProps {
  onSuccess?: () => void;
}

export function SignUp({ onSuccess }: SignUpProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOAuth = async (provider: "github" | "google" | "microsoft") => {
    setLoading(true);
    setError("");
    try {
      // In production, open OAuth provider login
      // For now, simulate with a test token
      const mockToken = `mock_${provider}_token_${Date.now()}`;
      
      // Call backend
      const res = await fetch(`${API_BASE}/auth/signup`, {
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
        setError(data.error || "Signup failed");
        console.error("Signup error:", data);
        return;
      }

      // Store token
      localStorage.setItem("authToken", data.token);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Signup failed - " + (err instanceof Error ? err.message : "unknown error"));
      console.error("Signup catch:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Sign Up to Deep Diver</h1>
        <p className="auth-subtitle">Get 5 free PR slides to analyze</p>

        {error && <div className="error-message">{error}</div>}

        <div className="oauth-buttons">
          <button
            className="oauth-btn github"
            onClick={() => handleOAuth("github")}
            disabled={loading}
          >
            <span className="oauth-icon">⭐</span>
            Continue with GitHub
          </button>
          <button
            className="oauth-btn google"
            onClick={() => handleOAuth("google")}
            disabled={loading}
          >
            <span className="oauth-icon">🔵</span>
            Continue with Google
          </button>
          <button
            className="oauth-btn microsoft"
            onClick={() => handleOAuth("microsoft")}
            disabled={loading}
          >
            <span className="oauth-icon">◻️</span>
            Continue with Microsoft
          </button>
        </div>

        <div className="divider">or</div>

        <div className="email-form">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
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
              if (!email || !name) {
                setError("Please fill in all fields");
                return;
              }
              handleOAuth("github");
            }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </div>

        <p className="auth-footer">
          Already have an account?{" "}
          <a href="#" onClick={() => window.location.hash = "login"} className="link">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}
