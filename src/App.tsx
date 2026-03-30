import { useEffect, useState } from "react";
import AppMain from "./AppMain";
import { HomePage } from "./HomePage";
import { AdminAnalytics } from "./AdminAnalytics";

type AppView = "loading" | "auth" | "main" | "analytics";

export default function App() {
  const [view, setView] = useState<AppView>("loading");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check auth on mount
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    console.log("🔐 Checking authentication...");
    
    const token = localStorage.getItem("authToken");
    
    if (token) {
      try {
        // Validate token format
        const parts = token.split('.');
        if (parts.length !== 3) {
          throw new Error("Invalid token format");
        }
        
        const payload = JSON.parse(atob(parts[1]));
        console.log("✅ Token valid, user:", payload.email);
        
        setIsAdmin(payload.isAdmin || false);
        setView("main");
      } catch (e) {
        console.error("❌ Token invalid:", e);
        localStorage.removeItem("authToken");
        setView("auth");
      }
    } else {
      console.log("📵 No token, showing auth");
      setView("auth");
    }
  };

  const handleAuthSuccess = () => {
    console.log("✨ Auth success, checking token");
    checkAuthentication();
  };

  const handleLogout = () => {
    console.log("🚪 Logging out");
    localStorage.removeItem("authToken");
    setIsAdmin(false);
    setView("auth");
  };

  const handleViewAnalytics = () => {
    console.log("📊 Viewing analytics");
    setView("analytics");
  };

  // Only show loading briefly
  if (view === "loading") {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#0f172a",
        color: "#fff",
        fontSize: "18px",
        fontFamily: "system-ui"
      }}>
        🚀 Loading Deep Diver...
      </div>
    );
  }

  // NOT AUTHENTICATED - Show HomePage with login/signup
  if (view === "auth") {
    return <HomePage onAuthSuccess={handleAuthSuccess} />;
  }

  // AUTHENTICATED - Show MainApp
  if (view === "main") {
    return (
      <AppMain
        isAdmin={isAdmin}
        onLogout={handleLogout}
        onViewAnalytics={handleViewAnalytics}
      />
    );
  }

  // ANALYTICS - Admin only
  if (view === "analytics" && isAdmin) {
    return (
      <>
        <button
          onClick={() => {
            handleLogout();
            setView("auth");
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

  // Fallback (shouldn't happen)
  return <div>Error: Unknown view state</div>;
}
