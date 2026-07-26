const express = require("express");
const router = express.Router();

const {
  createFeedback,
  getAllFeedback,
  getFeedbackByCustomer,
} = require("../controllers/feedbackController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { feedbackValidation } = require("../utils/validators");

router.use(protect);

router.post("/", feedbackValidation, createFeedback);
router.get("/", authorizeRoles("admin"), getAllFeedback);
router.get("/customer/:id", getFeedbackByCustomer);

module.exports = router;
