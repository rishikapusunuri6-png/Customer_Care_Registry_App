import { useEffect, useState } from "react";
import { ticketAPI, customerAPI } from "../services/endpoints";
import TicketCard from "../components/TicketCard";

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    customer: "",
    subject: "",
    description: "",
    category: "general",
    priority: "medium",
  });

  const fetchTickets = async (status = "") => {
    setLoading(true);
    try {
      const res = await ticketAPI.getAll(status ? { status } : {});
      setTickets(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await customerAPI.getAll({ limit: 100 });
      setCustomers(res.data.data);
    } catch (err) {
      // non-blocking
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchCustomers();
  }, []);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    fetchTickets(value);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await ticketAPI.create(form);
      setForm({
        customer: "",
        subject: "",
        description: "",
        category: "general",
        priority: "medium",
      });
      setShowForm(false);
      fetchTickets(statusFilter);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create ticket");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Tickets</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Ticket"}
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      {showForm && (
        <form className="inline-form-block" onSubmit={handleCreate}>
          <select name="customer" value={form.customer} onChange={handleChange} required>
            <option value="">Select Customer</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.email})
              </option>
            ))}
          </select>
          <input
            name="subject"
            placeholder="Subject"
            value={form.subject}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
            rows={3}
          />
          <div className="inline-form-row">
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="general">General</option>
              <option value="complaint">Complaint</option>
              <option value="other">Other</option>
            </select>
            <select name="priority" value={form.priority} onChange={handleChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            Create Ticket
          </button>
        </form>
      )}

      <div className="filter-bar">
        <label>Filter by status: </label>
        <select value={statusFilter} onChange={handleFilterChange}>
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {loading ? (
        <p>Loading tickets...</p>
      ) : (
        <div className="ticket-grid">
          {tickets.map((t) => (
            <TicketCard key={t._id} ticket={t} />
          ))}
          {tickets.length === 0 && <p>No tickets found.</p>}
        </div>
      )}
    </div>
  );
};

export default TicketList;
