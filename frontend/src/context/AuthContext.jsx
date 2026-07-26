import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/endpoints";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("ccr_user");
    const token = localStorage.getItem("ccr_token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { data, token } = res.data;

    localStorage.setItem("ccr_token", token);
    localStorage.setItem("ccr_user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (name, email, password, role) => {
    const res = await authAPI.register({ name, email, password, role });
    const { data, token } = res.data;

    localStorage.setItem("ccr_token", token);
    localStorage.setItem("ccr_user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("ccr_token");
    localStorage.removeItem("ccr_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
