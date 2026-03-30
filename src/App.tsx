import { useEffect, useState } from "react";
import AppMain from "./AppMain";
import { SignUp } from "./SignUp";
import { LogIn } from "./LogIn";
import { AdminAnalytics } from "./AdminAnalytics";

type CurrentView = "login" | "signup" | "main" | "analytics";

export default function App() {
  const [currentView, setCurrentView] = useState<CurrentView>("login");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      const hash = window.location.hash.slice(1);
      
      if (token) {
        // Decode JWT to check isAdmin (basic check without verification)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setIsAdmin(payload.isAdmin || false);
          
          // Check for hash navigation after auth
          if (hash === "signup") setCurrentView("signup");
          else if (hash === "analytics" && payload.isAdmin) setCurrentView("analytics");
          else setCurrentView("main");
        } catch (e) {
          localStorage.removeItem("authToken");
          setCurrentView("login");
        }
      } else {
        // No token - show login/signup based on hash or default to login
        if (hash === "signup") setCurrentView("signup");
        else setCurrentView("login");
      }
    };

    checkAuth();

    // Listen for URL hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        if (hash === "signup") setCurrentView("signup");
        else setCurrentView("login");
      } else {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (hash === "signup") setCurrentView("signup");
          else if (hash === "analytics" && payload.isAdmin) setCurrentView("analytics");
          else setCurrentView("main");
        } catch {
          setCurrentView("login");
        }
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAdmin(false);
    setCurrentView("login");
  };

  return (
    <>
      {currentView === "login" && (
        <LogIn 
          onSuccess={() => {
            const token = localStorage.getItem("authToken");
            if (token) {
              try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setIsAdmin(payload.isAdmin || false);
                setCurrentView("main");
              } catch (e) {
                console.error("Failed to decode token");
              }
            }
          }}
        />
      )}
      {currentView === "signup" && (
        <SignUp 
          onSuccess={() => {
            const token = localStorage.getItem("authToken");
            if (token) {
              try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setIsAdmin(payload.isAdmin || false);
                setCurrentView("main");
              } catch (e) {
                console.error("Failed to decode token");
              }
            }
          }}
        />
      )}
      {currentView === "main" && (
        <AppMain 
          isAdmin={isAdmin}
          onLogout={handleLogout}
          onViewAnalytics={() => setCurrentView("analytics")}
        />
      )}
      {currentView === "analytics" && isAdmin && (
        <>
          <button
            onClick={() => {
              handleLogout();
              setCurrentView("login");
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
