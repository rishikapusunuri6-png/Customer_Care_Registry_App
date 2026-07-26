const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const usersStore = require("./data/usersStore");
const { readJSON } = require("./utils/fileStore");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const customerRoutes = require("./routes/customerRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const USERS_FILE = path.join(__dirname, "data", "users.json");
const COMPLAINTS_FILE = path.join(__dirname, "data", "complaints.json");

// Makes sure data/users.json and data/complaints.json exist before the server
// starts accepting requests, and seeds one admin account for first-time login.
const initDataStore = async () => {
  await readJSON(USERS_FILE, { users: [] });
  await readJSON(COMPLAINTS_FILE, { customers: [], complaints: [], feedback: [] });

  const users = await usersStore.getAllUsers();
  if (users.length === 0) {
    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    await usersStore.createUser({
      name: "Default Admin",
      email: "admin@ccr.com",
      password: hashedPassword,
      role: "admin",
    });
    console.log("Seeded default admin account -> admin@ccr.com / Admin@123");
  }
};

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Customer Care Registry API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

initDataStore()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
      console.log(`Data files: ${USERS_FILE} , ${COMPLAINTS_FILE}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize data store:", err);
    process.exit(1);
  });
