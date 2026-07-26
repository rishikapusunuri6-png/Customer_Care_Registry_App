import api from "./api";

// ---------- Auth ----------
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/me"),
};

// ---------- Users (admin) ----------
export const userAPI = {
  getAll: () => api.get("/users"),
  update: (id, data) => api.put(`/users/${id}`, data),
  remove: (id) => api.delete(`/users/${id}`),
};

// ---------- Customers ----------
export const customerAPI = {
  getAll: (params) => api.get("/customers", { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post("/customers", data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  remove: (id) => api.delete(`/customers/${id}`),
};

// ---------- Tickets ----------
export const ticketAPI = {
  getAll: (params) => api.get("/tickets", { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post("/tickets", data),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  remove: (id) => api.delete(`/tickets/${id}`),
  addLog: (id, note) => api.post(`/tickets/${id}/logs`, { note }),
};

// ---------- Feedback ----------
export const feedbackAPI = {
  create: (data) => api.post("/feedback", data),
  getAll: () => api.get("/feedback"),
  getByCustomer: (id) => api.get(`/feedback/customer/${id}`),
};

// ---------- Analytics ----------
export const analyticsAPI = {
  getSummary: () => api.get("/analytics/summary"),
  getTrends: () => api.get("/analytics/trends"),
  getAgentPerformance: () => api.get("/analytics/agent-performance"),
};
