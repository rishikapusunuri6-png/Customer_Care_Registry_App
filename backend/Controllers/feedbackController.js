const complaintsStore = require("../data/complaintsStore");

// Attaches customer {name,email} and ticket {subject,status} onto a feedback record
const populateFeedback = async (feedback) => {
  const [customer, ticket] = await Promise.all([
    complaintsStore.getCustomerById(feedback.customer),
    feedback.ticket ? complaintsStore.getComplaintById(feedback.ticket) : Promise.resolve(null),
  ]);

  return {
    ...feedback,
    customer: customer ? { _id: customer._id, name: customer.name, email: customer.email } : null,
    ticket: ticket ? { _id: ticket._id, subject: ticket.subject, status: ticket.status } : null,
  };
};

// @desc   Submit feedback
// @route  POST /api/feedback
// @access Private
const createFeedback = async (req, res, next) => {
  try {
    const { customer, ticket, rating, comments } = req.body;

    const feedback = await complaintsStore.createFeedback({
      customer,
      ticket: ticket || null,
      rating,
      comments,
    });

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    next(error);
  }
};

// @desc   List all feedback
// @route  GET /api/feedback
// @access Private/Admin
const getAllFeedback = async (req, res, next) => {
  try {
    const feedback = await complaintsStore.getAllFeedback();
    const sorted = [...feedback].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const populated = await Promise.all(sorted.map(populateFeedback));

    res.status(200).json({ success: true, count: populated.length, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc   Get feedback for a specific customer
// @route  GET /api/feedback/customer/:id
// @access Private
const getFeedbackByCustomer = async (req, res, next) => {
  try {
    const feedback = await complaintsStore.getFeedbackByCustomerId(req.params.id);
    const sorted = [...feedback].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const populated = await Promise.all(sorted.map(populateFeedback));

    res.status(200).json({ success: true, count: populated.length, data: populated });
  } catch (error) {
    next(error);
  }
};

module.exports = { createFeedback, getAllFeedback, getFeedbackByCustomer };
