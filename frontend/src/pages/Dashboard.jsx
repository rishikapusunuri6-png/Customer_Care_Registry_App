import { useEffect, useState } from "react";
import { analyticsAPI } from "../services/endpoints";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await analyticsAPI.getSummary();
        setSummary(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="page">
      <h1>Welcome, {user?.name}</h1>
      {loading && <p>Loading summary...</p>}
      {error && <div className="form-error">{error}</div>}

      {summary && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{summary.totalTickets}</h3>
            <p>Total Tickets</p>
          </div>
          <div className="stat-card">
            <h3>{summary.open}</h3>
            <p>Open</p>
          </div>
          <div className="stat-card">
            <h3>{summary.inProgress}</h3>
            <p>In Progress</p>
          </div>
          <div className="stat-card">
            <h3>{summary.resolved}</h3>
            <p>Resolved</p>
          </div>
          <div className="stat-card">
            <h3>{summary.closed}</h3>
            <p>Closed</p>
          </div>
          <div className="stat-card">
            <h3>{summary.averageRating}</h3>
            <p>Avg. Feedback Rating ({summary.totalFeedback} reviews)</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
