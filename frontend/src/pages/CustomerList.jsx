import { useEffect, useState } from "react";
import { customerAPI } from "../services/endpoints";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

  const fetchCustomers = async (searchTerm = "") => {
    setLoading(true);
    try {
      const res = await customerAPI.getAll({ search: searchTerm });
      setCustomers(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await customerAPI.create(form);
      setForm({ name: "", email: "", phone: "", address: "" });
      setShowForm(false);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create customer");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await customerAPI.remove(id);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete customer");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Customers</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Customer"}
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      {showForm && (
        <form className="inline-form" onSubmit={handleCreate}>
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
          <input
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
          />
          <button type="submit" className="btn btn-primary">
            Save
          </button>
        </form>
      )}

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary">
          Search
        </button>
      </form>

      {loading ? (
        <p>Loading customers...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone || "-"}</td>
                <td>{c.address || "-"}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5}>No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CustomerList;
