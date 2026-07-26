const usersStore = require("../data/usersStore");

// @desc   Get all staff users
// @route  GET /api/users
// @access Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await usersStore.getAllUsers();
    const safeUsers = users
      .map(usersStore.toSafeUser)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ success: true, count: safeUsers.length, data: safeUsers });
  } catch (error) {
    next(error);
  }
};

// @desc   Update a user's role/details
// @route  PUT /api/users/:id
// @access Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const { name, role } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (role) updates.role = role;

    const updated = await usersStore.updateUserById(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: usersStore.toSafeUser(updated) });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete a user
// @route  DELETE /api/users/:id
// @access Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const deleted = await usersStore.deleteUserById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User removed" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, updateUser, deleteUser };
