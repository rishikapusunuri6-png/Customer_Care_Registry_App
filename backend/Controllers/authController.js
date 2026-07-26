const bcrypt = require("bcryptjs");
const usersStore = require("../data/usersStore");
const generateToken = require("../utils/generateToken");

// @desc   Register new staff user (admin/agent)
// @route  POST /api/auth/register
// @access Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await usersStore.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await usersStore.createUser({
      name,
      email: String(email).toLowerCase(),
      password: hashedPassword,
      role: role === "admin" ? "admin" : "agent",
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      data: usersStore.toSafeUser(user),
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await usersStore.findUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      data: usersStore.toSafeUser(user),
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get logged-in user profile
// @route  GET /api/auth/me
// @access Private
const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, getProfile };
