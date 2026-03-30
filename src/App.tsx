import { useEffect, useState } from "react";
import AppMain from "./AppMain";
import { HomePage } from "./HomePage";
import { AdminAnalytics } from "./AdminAnalytics";

type AppView = "auth" | "main" | "analytics";

export default function App() {
  const [view, setView] = useState<AppView>("auth");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Slight delay to let HomePage render first
    const timer = setTimeout(() => {
      checkAuthentication();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const checkAuthentication = () => {
    console.log("🔐 Checking authentication...");
    
    const token = localStorage.getItem("authToken");
    console.log("📋 Token exists:", !!token);
    
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
      console.log("📵 No token, keeping auth view");
      setView("auth");
    }
  };

  const handleAuthSuccess = () => {
    console.log("✨ Auth success, reinitializing");
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

  // ALWAYS show HomePage first (until auth check completes)
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

  // Shouldn't reach here
  return <HomePage onAuthSuccess={handleAuthSuccess} />;
}
