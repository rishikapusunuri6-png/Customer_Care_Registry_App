const complaintsStore = require("../data/complaintsStore");

// @desc   Get all customers (search + pagination)
// @route  GET /api/customers?search=&page=&limit=
// @access Private
const getCustomers = async (req, res, next) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    let customers = await complaintsStore.getCustomers();

    if (search) {
      const term = search.toLowerCase();
      customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          (c.phone || "").toLowerCase().includes(term)
      );
    }

    customers = [...customers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = customers.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const start = (pageNum - 1) * limitNum;
    const paginated = customers.slice(start, start + limitNum);

    res.status(200).json({
      success: true,
      count: paginated.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: paginated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Create new customer
// @route  POST /api/customers
// @access Private
const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;

    const existing = await complaintsStore.findCustomerByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Customer with this email already exists",
      });
    }

    const customer = await complaintsStore.createCustomer({ name, email, phone, address });
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single customer by ID
// @route  GET /api/customers/:id
// @access Private
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await complaintsStore.getCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @desc   Update customer
// @route  PUT /api/customers/:id
// @access Private
const updateCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;

    const updated = await complaintsStore.updateCustomer(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete customer
// @route  DELETE /api/customers/:id
// @access Private
const deleteCustomer = async (req, res, next) => {
  try {
    const deleted = await complaintsStore.deleteCustomer(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.status(200).json({ success: true, message: "Customer removed" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
