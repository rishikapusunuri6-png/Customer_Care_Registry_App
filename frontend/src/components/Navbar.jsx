import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-title">Customer Care Registry</div>
      {user && (
        <div className="navbar-user">
          <span>
            {user.name} <em>({user.role})</em>
          </span>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
