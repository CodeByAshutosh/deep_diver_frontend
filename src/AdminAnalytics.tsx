import { useState, useEffect } from "react";
import "./Analytics.css";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalSlides: number;
  totalTokens: number;
  estimatedCost: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  provider: string;
  isAdmin: boolean;
  createdAt: string;
  lastLogin: string;
}

export function AdminAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      try {
        const res = await fetch("/admin/analytics", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          setError("Failed to fetch analytics");
          return;
        }

        const data = await res.json();
        setStats(data.stats);
        setUsers(data.users);
      } catch (err) {
        setError("Error loading analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const exportCSV = () => {
    const csv = [
      ["User Email", "Name", "Provider", "Joined", "Last Login"],
      ...users.map((u) => [
        u.email,
        u.name,
        u.provider,
        new Date(u.createdAt).toLocaleDateString(),
        new Date(u.lastLogin).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "deep-diver-users.csv";
    a.click();
  };

  if (loading) return <div className="analytics-container"><p>Loading...</p></div>;
  if (error) return <div className="analytics-container"><p className="error">{error}</p></div>;
  if (!stats) return <div className="analytics-container"><p>No data</p></div>;

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>📊 Deep Diver Analytics</h1>
        <button className="export-btn" onClick={exportCSV}>
          📥 Export CSV
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{stats.activeUsers}</div>
          <div className="stat-label">Active (7d)</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{stats.totalSlides}</div>
          <div className="stat-label">Slides Generated</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">${stats.estimatedCost.toFixed(2)}</div>
          <div className="stat-label">Est. Cost</div>
        </div>
      </div>

      <div className="analytics-section">
        <h2>👥 Users</h2>
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Provider</th>
                <th>Joined</th>
                <th>Last Active</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.name}</td>
                  <td>{user.provider}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>{new Date(user.lastLogin).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${user.isAdmin ? "admin" : "user"}`}>
                      {user.isAdmin ? "Admin" : "User"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="analytics-section">
        <h2>💡 Key Metrics</h2>
        <div className="metrics-grid">
          <div className="metric-box">
            <div className="metric-label">Avg Slides per User</div>
            <div className="metric-value">
              {stats.totalUsers > 0 ? (stats.totalSlides / stats.totalUsers).toFixed(1) : 0}
            </div>
          </div>
          <div className="metric-box">
            <div className="metric-label">Cost per Slide</div>
            <div className="metric-value">
              ${stats.totalSlides > 0 ? (stats.estimatedCost / stats.totalSlides).toFixed(3) : 0}
            </div>
          </div>
          <div className="metric-box">
            <div className="metric-label">Revenue Potential (if $5/5 slides)</div>
            <div className="metric-value">
              ${(stats.totalUsers * 5).toLocaleString()}
            </div>
          </div>
          <div className="metric-box">
            <div className="metric-label">Retention Rate</div>
            <div className="metric-value">
              {stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(0) : 0}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
