import { useEffect, useState } from "react";
import AppMain from "./AppMain";
import { SignUp } from "./SignUp";
import { LogIn } from "./LogIn";
import { AdminAnalytics } from "./AdminAnalytics";

type CurrentView = "login" | "signup" | "main" | "analytics";

export default function App() {
  const [currentView, setCurrentView] = useState<CurrentView>("main");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        // Decode JWT to check isAdmin (basic check without verification)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setIsAuthenticated(true);
          setIsAdmin(payload.isAdmin || false);
          setCurrentView("main");
        } catch (e) {
          localStorage.removeItem("authToken");
          setCurrentView("login");
        }
      } else {
        setCurrentView("login");
      }
    };

    checkAuth();

    // Listen for URL hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === "signup") setCurrentView("signup");
      else if (hash === "analytics" && isAdmin) setCurrentView("analytics");
      else setCurrentView("main");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
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
                setIsAuthenticated(true);
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
                setIsAuthenticated(true);
                setIsAdmin(payload.isAdmin || false);
                setCurrentView("main");
              } catch (e) {
                console.error("Failed to decode token");
              }
            }
          }}
        />
      )}
      {currentView === "main" && isAuthenticated && (
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
