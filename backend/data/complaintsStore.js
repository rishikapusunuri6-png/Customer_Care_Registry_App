const path = require("path");
const { randomUUID } = require("crypto");
const { readJSON, updateJSON } = require("../utils/fileStore");

const FILE_PATH = path.join(__dirname, "complaints.json");
const DEFAULT_DATA = { customers: [], complaints: [], feedback: [] };

const readAll = () => readJSON(FILE_PATH, DEFAULT_DATA);

// ---------------- Customers ----------------

const getCustomers = async () => (await readAll()).customers;

const getCustomerById = async (id) => (await getCustomers()).find((c) => c._id === id) || null;

const findCustomerByEmail = async (email) =>
  (await getCustomers()).find((c) => c.email.toLowerCase() === String(email).toLowerCase()) ||
  null;

const createCustomer = (customerData) =>
  updateJSON(FILE_PATH, DEFAULT_DATA, (data) => {
    const now = new Date().toISOString();
    const newCustomer = { _id: randomUUID(), ...customerData, createdAt: now, updatedAt: now };
    data.customers.push(newCustomer);
    return newCustomer;
  });

const updateCustomer = (id, updates) =>
  updateJSON(FILE_PATH, DEFAULT_DATA, (data) => {
    const customer = data.customers.find((c) => c._id === id);
    if (!customer) return null;
    Object.assign(customer, updates, { updatedAt: new Date().toISOString() });
    return customer;
  });

const deleteCustomer = (id) =>
  updateJSON(FILE_PATH, DEFAULT_DATA, (data) => {
    const index = data.customers.findIndex((c) => c._id === id);
    if (index === -1) return false;
    data.customers.splice(index, 1);
    return true;
  });

// ---------------- Complaints (Tickets) ----------------

const getComplaints = async () => (await readAll()).complaints;

const getComplaintById = async (id) => (await getComplaints()).find((t) => t._id === id) || null;

const createComplaint = (complaintData) =>
  updateJSON(FILE_PATH, DEFAULT_DATA, (data) => {
    const now = new Date().toISOString();
    const newComplaint = {
      _id: randomUUID(),
      ...complaintData,
      logs: [],
      createdAt: now,
      updatedAt: now,
    };
    data.complaints.push(newComplaint);
    return newComplaint;
  });

const updateComplaint = (id, updates) =>
  updateJSON(FILE_PATH, DEFAULT_DATA, (data) => {
    const complaint = data.complaints.find((t) => t._id === id);
    if (!complaint) return null;
    Object.assign(complaint, updates, { updatedAt: new Date().toISOString() });
    return complaint;
  });

const deleteComplaint = (id) =>
  updateJSON(FILE_PATH, DEFAULT_DATA, (data) => {
    const index = data.complaints.findIndex((t) => t._id === id);
    if (index === -1) return false;
    data.complaints.splice(index, 1);
    return true;
  });

// Adds a log entry (interaction log) to a complaint's embedded logs array
const addComplaintLog = (id, logData) =>
  updateJSON(FILE_PATH, DEFAULT_DATA, (data) => {
    const complaint = data.complaints.find((t) => t._id === id);
    if (!complaint) return null;
    const newLog = { _id: randomUUID(), ...logData, createdAt: new Date().toISOString() };
    complaint.logs.push(newLog);
    complaint.updatedAt = new Date().toISOString();
    return newLog;
  });

// ---------------- Feedback ----------------

const getAllFeedback = async () => (await readAll()).feedback;

const getFeedbackByCustomerId = async (customerId) =>
  (await getAllFeedback()).filter((f) => f.customer === customerId);

const createFeedback = (feedbackData) =>
  updateJSON(FILE_PATH, DEFAULT_DATA, (data) => {
    const newFeedback = {
      _id: randomUUID(),
      ...feedbackData,
      createdAt: new Date().toISOString(),
    };
    data.feedback.push(newFeedback);
    return newFeedback;
  });

module.exports = {
  getCustomers,
  getCustomerById,
  findCustomerByEmail,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  addComplaintLog,
  getAllFeedback,
  getFeedbackByCustomerId,
  createFeedback,
};
