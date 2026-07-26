const path = require("path");
const { randomUUID } = require("crypto");
const { readJSON, updateJSON } = require("../utils/fileStore");

const FILE_PATH = path.join(__dirname, "users.json");
const DEFAULT_DATA = { users: [] };

const getAllUsers = async () => {
  const data = await readJSON(FILE_PATH, DEFAULT_DATA);
  return data.users;
};

const findUserByEmail = async (email) => {
  const users = await getAllUsers();
  return users.find((u) => u.email.toLowerCase() === String(email).toLowerCase()) || null;
};

const findUserById = async (id) => {
  const users = await getAllUsers();
  return users.find((u) => u._id === id) || null;
};

// userData must already include a hashed password
const createUser = (userData) =>
  updateJSON(FILE_PATH, DEFAULT_DATA, (data) => {
    const now = new Date().toISOString();
    const newUser = {
      _id: randomUUID(),
      ...userData,
      createdAt: now,
      updatedAt: now,
    };
    data.users.push(newUser);
    return newUser;
  });

const updateUserById = (id, updates) =>
  updateJSON(FILE_PATH, DEFAULT_DATA, (data) => {
    const user = data.users.find((u) => u._id === id);
    if (!user) return null;
    Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    return user;
  });

const deleteUserById = (id) =>
  updateJSON(FILE_PATH, DEFAULT_DATA, (data) => {
    const index = data.users.findIndex((u) => u._id === id);
    if (index === -1) return false;
    data.users.splice(index, 1);
    return true;
  });

// Strips the password field before sending a user object back to the client
const toSafeUser = (user) => {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
};

module.exports = {
  getAllUsers,
  findUserByEmail,
  findUserById,
  createUser,
  updateUserById,
  deleteUserById,
  toSafeUser,
};
