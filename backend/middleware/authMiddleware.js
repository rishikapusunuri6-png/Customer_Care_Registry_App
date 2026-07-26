const jwt = require("jsonwebtoken");
const usersStore = require("../data/usersStore");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await usersStore.findUserById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found, authorization denied",
        });
      }

      req.user = usersStore.toSafeUser(user);
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, invalid or expired token",
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }
};

module.exports = { protect };
