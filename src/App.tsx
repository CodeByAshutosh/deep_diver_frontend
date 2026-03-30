import { useEffect, useState } from "react";
import AppMain from "./AppMain";
import { SignUp } from "./SignUp";
import { LogIn } from "./LogIn";
import { AdminAnalytics } from "./AdminAnalytics";

type CurrentView = "loading" | "login" | "signup" | "main" | "analytics";

export default function App() {
  const [currentView, setCurrentView] = useState<CurrentView>("loading");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Force a tiny delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeAuth();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const initializeAuth = () => {
    console.log("🔐 Initializing auth...");
    
    const token = localStorage.getItem("authToken");
    console.log("📋 Token exists:", !!token);

    if (token) {
      try {
        // Decode JWT
        const parts = token.split('.');
        if (parts.length !== 3) {
          throw new Error("Invalid token format");
        }
        const payload = JSON.parse(atob(parts[1]));
        console.log("✅ Token decoded, isAdmin:", payload.isAdmin);
        
        setIsAdmin(payload.isAdmin || false);
        setCurrentView("main");
      } catch (e) {
        console.error("❌ Token decode failed:", e);
        localStorage.removeItem("authToken");
        setCurrentView("login");
      }
    } else {
      console.log("📵 No token, showing login");
      setCurrentView("login");
    }
  };

  const handleHashChange = () => {
    const hash = window.location.hash.slice(1);
    console.log("🔗 Hash changed to:", hash);
    
    const token = localStorage.getItem("authToken");
    
    if (hash === "logout") {
      handleLogout();
      window.location.hash = "";
      return;
    }

    if (!token) {
      // No token - only allow login/signup views
      if (hash === "signup") {
        setCurrentView("signup");
      } else {
        setCurrentView("login");
      }
    } else {
      // Has token - allow any view
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        if (hash === "analytics" && payload.isAdmin) {
          setCurrentView("analytics");
        } else if (hash === "signup") {
          setCurrentView("signup");
        } else {
          setCurrentView("main");
        }
      } catch {
        setCurrentView("main");
      }
    }
  };

  useEffect(() => {
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleLogout = () => {
    console.log("🚪 Logging out...");
    localStorage.removeItem("authToken");
    setIsAdmin(false);
    setCurrentView("login");
  };

  const handleLoginSuccess = () => {
    console.log("✨ Login successful, reinitializing auth");
    initializeAuth();
  };

  const handleSignupSuccess = () => {
    console.log("✨ Signup successful, reinitializing auth");
    initializeAuth();
  };

  // Show loading screen while initializing
  if (currentView === "loading") {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#0f172a",
        color: "#fff",
        fontSize: "20px",
        fontFamily: "system-ui"
      }}>
        Loading Deep Diver...
      </div>
    );
  }

  return (
    <>
      {currentView === "login" && (
        <LogIn onSuccess={handleLoginSuccess} />
      )}
      {currentView === "signup" && (
        <SignUp onSuccess={handleSignupSuccess} />
      )}
      {currentView === "main" && (
        <AppMain
          isAdmin={isAdmin}
          onLogout={handleLogout}
          onViewAnalytics={() => {
            window.location.hash = "analytics";
            setCurrentView("analytics");
          }}
        />
      )}
      {currentView === "analytics" && isAdmin && (
        <>
          <button
            onClick={() => {
              handleLogout();
              window.location.hash = "";
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
      )}
    </>
  );
}
