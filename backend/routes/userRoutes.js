const express = require("express");
const router = express.Router();

const { getUsers, updateUser, deleteUser } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.use(protect, authorizeRoles("admin"));

router.get("/", getUsers);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
