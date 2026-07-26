const express = require("express");
const router = express.Router();

const {
  getCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");
const { protect } = require("../middleware/authMiddleware");
const { customerValidation } = require("../utils/validators");

router.use(protect);

router.route("/").get(getCustomers).post(customerValidation, createCustomer);
router.route("/:id").get(getCustomerById).put(updateCustomer).delete(deleteCustomer);

module.exports = router;
