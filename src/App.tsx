import { useState } from "react";
import { LandingPage } from "./LandingPage";
import { HomePage } from "./HomePage";
import AppMain from "./AppMain";
import { AdminAnalytics } from "./AdminAnalytics";

type AppState = "landing" | "auth" | "main" | "analytics";

export default function App() {
  const [state, setState] = useState<AppState>("landing");
  const [isAdmin, setIsAdmin] = useState(false);

  const handleEnterApp = () => {
    console.log("🌍 User entered app, checking auth...");
    checkAuth();
  };

  const checkAuth = () => {
    const token = localStorage.getItem("authToken");
    
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          setIsAdmin(payload.isAdmin || false);
          setState("main");
          return;
        }
      } catch (e) {
        console.error("Token error:", e);
      }
    }
    
    setState("auth");
  };

  const handleAuthSuccess = () => {
    checkAuth();
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAdmin(false);
    setState("landing");
  };

  // Landing page - shown first, no conditions
  if (state === "landing") {
    return <LandingPage onEnter={handleEnterApp} />;
  }

  // Auth page - login/signup
  if (state === "auth") {
    return <HomePage onAuthSuccess={handleAuthSuccess} />;
  }

  // Main app - authenticated
  if (state === "main") {
    return (
      <AppMain
        isAdmin={isAdmin}
        onLogout={handleLogout}
        onViewAnalytics={() => setState("analytics")}
      />
    );
  }

  // Analytics - admin only
  if (state === "analytics" && isAdmin) {
    return (
      <>
        <button
          onClick={() => {
            handleLogout();
            setState("landing");
          }}
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            padding: "10px 20px",
            background: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            zIndex: 1000,
          }}
        >
          Logout
        </button>
        <AdminAnalytics />
      </>
    );
  }

  return <LandingPage onEnter={handleEnterApp} />;
}
