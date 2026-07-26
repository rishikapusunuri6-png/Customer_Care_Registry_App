import { Link } from "react-router-dom";

const statusColors = {
  open: "badge-open",
  "in-progress": "badge-progress",
  resolved: "badge-resolved",
  closed: "badge-closed",
};

const priorityColors = {
  low: "badge-low",
  medium: "badge-medium",
  high: "badge-high",
};

const TicketCard = ({ ticket }) => {
  return (
    <Link to={`/tickets/${ticket._id}`} className="ticket-card">
      <div className="ticket-card-header">
        <h3>{ticket.subject}</h3>
        <span className={`badge ${statusColors[ticket.status] || ""}`}>{ticket.status}</span>
      </div>
      <p className="ticket-card-desc">{ticket.description?.slice(0, 100)}</p>
      <div className="ticket-card-footer">
        <span className={`badge ${priorityColors[ticket.priority] || ""}`}>
          {ticket.priority}
        </span>
        <span className="ticket-card-category">{ticket.category}</span>
        {ticket.customer?.name && (
          <span className="ticket-card-customer">Customer: {ticket.customer.name}</span>
        )}
      </div>
    </Link>
  );
};

export default TicketCard;
