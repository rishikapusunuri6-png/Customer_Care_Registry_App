import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();

  const linkClass = ({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link");

  return (
    <aside className="sidebar">
      <nav>
        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/customers" className={linkClass}>
          Customers
        </NavLink>
        <NavLink to="/tickets" className={linkClass}>
          Tickets
        </NavLink>
        <NavLink to="/feedback" className={linkClass}>
          Feedback
        </NavLink>
        {user?.role === "admin" && (
          <NavLink to="/analytics" className={linkClass}>
            Analytics
          </NavLink>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
