import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { analyticsAPI } from "../services/endpoints";

const Analytics = () => {
  const [trends, setTrends] = useState(null);
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendsRes, agentRes] = await Promise.all([
          analyticsAPI.getTrends(),
          analyticsAPI.getAgentPerformance(),
        ]);
        setTrends(trendsRes.data.data);
        setAgentPerformance(agentRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="page">Loading analytics...</div>;

  const categoryData =
    trends?.categoryTrends.map((c) => ({ category: c._id, count: c.count })) || [];

  return (
    <div className="page">
      <h1>Analytics</h1>
      {error && <div className="form-error">{error}</div>}

      <h2>Tickets by Category</h2>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#4f46e5" name="Ticket Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2>Agent Performance</h2>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={agentPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalAssigned" fill="#94a3b8" name="Assigned" />
            <Bar dataKey="resolved" fill="#22c55e" name="Resolved" />
            <Bar dataKey="closed" fill="#0ea5e9" name="Closed" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
