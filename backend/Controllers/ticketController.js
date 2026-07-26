const complaintsStore = require("../data/complaintsStore");
const usersStore = require("../data/usersStore");

// Shrinks a user down to the safe public subset used in populated fields
const toAgentSummary = (user) =>
  user ? { _id: user._id, name: user.name, email: user.email } : null;

// Attaches customer and assignedAgent objects onto a ticket, mimicking
// Mongoose's .populate() so the frontend doesn't need to change.
const populateTicket = async (ticket) => {
  const [customer, agent] = await Promise.all([
    complaintsStore.getCustomerById(ticket.customer),
    ticket.assignedAgent ? usersStore.findUserById(ticket.assignedAgent) : Promise.resolve(null),
  ]);

  return {
    ...ticket,
    customer: customer
      ? { _id: customer._id, name: customer.name, email: customer.email, phone: customer.phone }
      : null,
    assignedAgent: toAgentSummary(agent),
  };
};

// Same as above but keeps the full customer record (address included) for detail view
const populateTicketDetail = async (ticket) => {
  const [customer, agent] = await Promise.all([
    complaintsStore.getCustomerById(ticket.customer),
    ticket.assignedAgent ? usersStore.findUserById(ticket.assignedAgent) : Promise.resolve(null),
  ]);

  return {
    ...ticket,
    customer,
    assignedAgent: toAgentSummary(agent),
  };
};

// Attaches the acting user's name/email onto each embedded log entry
const populateLogs = async (logs) => {
  const userIds = [...new Set(logs.map((l) => l.performedBy).filter(Boolean))];
  const users = await Promise.all(userIds.map((id) => usersStore.findUserById(id)));
  const userMap = new Map(userIds.map((id, i) => [id, users[i]]));

  return logs.map((log) => ({
    ...log,
    performedBy: toAgentSummary(userMap.get(log.performedBy)),
  }));
};

// @desc   Get all tickets (filter by status/priority/category/agent)
// @route  GET /api/tickets
// @access Private
const getTickets = async (req, res, next) => {
  try {
    const { status, priority, category, assignedAgent, page = 1, limit = 10 } = req.query;

    let tickets = await complaintsStore.getComplaints();

    if (status) tickets = tickets.filter((t) => t.status === status);
    if (priority) tickets = tickets.filter((t) => t.priority === priority);
    if (category) tickets = tickets.filter((t) => t.category === category);
    if (assignedAgent) tickets = tickets.filter((t) => t.assignedAgent === assignedAgent);

    tickets = [...tickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = tickets.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const start = (pageNum - 1) * limitNum;
    const paginated = tickets.slice(start, start + limitNum);

    const populated = await Promise.all(paginated.map(populateTicket));

    res.status(200).json({
      success: true,
      count: populated.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Create new ticket
// @route  POST /api/tickets
// @access Private
const createTicket = async (req, res, next) => {
  try {
    const { customer, subject, description, category, priority, assignedAgent } = req.body;

    const ticket = await complaintsStore.createComplaint({
      customer,
      subject,
      description,
      category,
      priority,
      assignedAgent: assignedAgent || null,
      status: "open",
    });

    await complaintsStore.addComplaintLog(ticket._id, {
      performedBy: req.user._id,
      action: "Ticket created",
      note: "",
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

// @desc   Get ticket details + interaction log
// @route  GET /api/tickets/:id
// @access Private
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await complaintsStore.getComplaintById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const populatedTicket = await populateTicketDetail(ticket);
    const logs = await populateLogs(
      [...ticket.logs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    );

    res.status(200).json({ success: true, data: { ticket: populatedTicket, logs } });
  } catch (error) {
    next(error);
  }
};

// @desc   Update ticket (status, priority, assign agent, etc.)
// @route  PUT /api/tickets/:id
// @access Private
const updateTicket = async (req, res, next) => {
  try {
    const ticket = await complaintsStore.getComplaintById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const { subject, description, category, priority, status, assignedAgent } = req.body;

    const updates = {};
    const changes = [];

    if (status && status !== ticket.status) {
      changes.push(`Status changed from "${ticket.status}" to "${status}"`);
      updates.status = status;
    }
    if (priority && priority !== ticket.priority) {
      changes.push(`Priority changed from "${ticket.priority}" to "${priority}"`);
      updates.priority = priority;
    }
    if (assignedAgent && String(assignedAgent) !== String(ticket.assignedAgent)) {
      changes.push("Agent reassigned");
      updates.assignedAgent = assignedAgent;
    }
    if (subject) updates.subject = subject;
    if (description) updates.description = description;
    if (category) updates.category = category;

    const updated = await complaintsStore.updateComplaint(req.params.id, updates);

    if (changes.length > 0) {
      await complaintsStore.addComplaintLog(req.params.id, {
        performedBy: req.user._id,
        action: changes.join("; "),
        note: "",
      });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete ticket
// @route  DELETE /api/tickets/:id
// @access Private
const deleteTicket = async (req, res, next) => {
  try {
    const deleted = await complaintsStore.deleteComplaint(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    res.status(200).json({ success: true, message: "Ticket removed" });
  } catch (error) {
    next(error);
  }
};

// @desc   Add a manual interaction log entry (e.g. a note)
// @route  POST /api/tickets/:id/logs
// @access Private
const addInteractionLog = async (req, res, next) => {
  try {
    const ticket = await complaintsStore.getComplaintById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const { note } = req.body;
    if (!note) {
      return res.status(400).json({ success: false, message: "Note is required" });
    }

    const log = await complaintsStore.addComplaintLog(req.params.id, {
      performedBy: req.user._id,
      action: "Note added",
      note,
    });

    const [populatedLog] = await populateLogs([log]);

    res.status(201).json({ success: true, data: populatedLog });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTickets,
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket,
  addInteractionLog,
};
