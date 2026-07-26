const express = require("express");
const router = express.Router();

const {
  getTickets,
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket,
  addInteractionLog,
} = require("../controllers/ticketController");
const { protect } = require("../middleware/authMiddleware");
const { ticketValidation } = require("../utils/validators");

router.use(protect);

router.route("/").get(getTickets).post(ticketValidation, createTicket);
router.route("/:id").get(getTicketById).put(updateTicket).delete(deleteTicket);
router.post("/:id/logs", addInteractionLog);

module.exports = router;
