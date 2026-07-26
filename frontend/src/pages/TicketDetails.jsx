import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ticketAPI } from "../services/endpoints";

const TicketDetails = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [logs, setLogs] = useState([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const res = await ticketAPI.getById(id);
      setTicket(res.data.data.ticket);
      setLogs(res.data.data.logs);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (e) => {
    try {
      await ticketAPI.update(id, { status: e.target.value });
      fetchTicket();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const handlePriorityChange = async (e) => {
    try {
      await ticketAPI.update(id, { priority: e.target.value });
      fetchTicket();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update priority");
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    try {
      await ticketAPI.addLog(id, note);
      setNote("");
      fetchTicket();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add note");
    }
  };

  if (loading) return <div className="page">Loading...</div>;
  if (!ticket) return <div className="page">Ticket not found.</div>;

  return (
    <div className="page">
      {error && <div className="form-error">{error}</div>}

      <div className="ticket-detail-header">
        <h1>{ticket.subject}</h1>
        <p>{ticket.description}</p>
        <p>
          <strong>Customer:</strong> {ticket.customer?.name} ({ticket.customer?.email})
        </p>
        <p>
          <strong>Category:</strong> {ticket.category}
        </p>

        <div className="inline-form-row">
          <div>
            <label>Status: </label>
            <select value={ticket.status} onChange={handleStatusChange}>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label>Priority: </label>
            <select value={ticket.priority} onChange={handlePriorityChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      <h2>Interaction Log</h2>
      <ul className="log-list">
        {logs.map((log) => (
          <li key={log._id}>
            <strong>{log.performedBy?.name || "System"}</strong> — {log.action}
            {log.note && <div className="log-note">"{log.note}"</div>}
            <span className="log-time">{new Date(log.createdAt).toLocaleString()}</span>
          </li>
        ))}
        {logs.length === 0 && <li>No interaction logs yet.</li>}
      </ul>

      <form className="inline-form" onSubmit={handleAddNote}>
        <input
          placeholder="Add a note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Add Note
        </button>
      </form>
    </div>
  );
};

export default TicketDetails;
