import { useEffect, useState } from "react";
import { feedbackAPI, customerAPI } from "../services/endpoints";
import FeedbackForm from "../components/FeedbackForm";
import { useAuth } from "../context/AuthContext";

const FeedbackPage = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const res = await customerAPI.getAll({ limit: 100 });
      setCustomers(res.data.data);
    } catch (err) {
      // non-blocking
    }
  };

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      if (user?.role === "admin") {
        const res = await feedbackAPI.getAll();
        setFeedbackList(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page">
      <h1>Feedback</h1>
      {error && <div className="form-error">{error}</div>}

      <div className="feedback-submit-block">
        <h2>Submit Feedback</h2>
        <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
          <option value="">Select Customer</option>
          {customers.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} ({c.email})
            </option>
          ))}
        </select>
        {selectedCustomer && (
          <FeedbackForm customerId={selectedCustomer} onSubmitted={fetchFeedback} />
        )}
      </div>

      {user?.role === "admin" && (
        <>
          <h2>All Feedback</h2>
          {loading ? (
            <p>Loading feedback...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Comments</th>
                  <th>Ticket</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {feedbackList.map((f) => (
                  <tr key={f._id}>
                    <td>{f.customer?.name}</td>
                    <td>{f.rating} / 5</td>
                    <td>{f.comments || "-"}</td>
                    <td>{f.ticket?.subject || "-"}</td>
                    <td>{new Date(f.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {feedbackList.length === 0 && (
                  <tr>
                    <td colSpan={5}>No feedback yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default FeedbackPage;
