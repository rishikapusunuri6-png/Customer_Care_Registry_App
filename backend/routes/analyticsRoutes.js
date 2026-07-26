const express = require("express");
const router = express.Router();

const {
  getSummary,
  getTrends,
  getAgentPerformance,
} = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/summary", getSummary);
router.get("/trends", getTrends);
router.get("/agent-performance", getAgentPerformance);

module.exports = router;
