const complaintsStore = require("../data/complaintsStore");
const usersStore = require("../data/usersStore");

// @desc   Summary counts for dashboard
// @route  GET /api/analytics/summary
// @access Private
const getSummary = async (req, res, next) => {
  try {
    const tickets = await complaintsStore.getComplaints();
    const feedback = await complaintsStore.getAllFeedback();

    const counts = { open: 0, "in-progress": 0, resolved: 0, closed: 0 };
    tickets.forEach((t) => {
      if (counts[t.status] !== undefined) counts[t.status] += 1;
    });

    const avgRating = feedback.length
      ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalTickets: tickets.length,
        open: counts.open,
        inProgress: counts["in-progress"],
        resolved: counts.resolved,
        closed: counts.closed,
        averageRating: avgRating,
        totalFeedback: feedback.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Recurring issue categories over time
// @route  GET /api/analytics/trends
// @access Private
const getTrends = async (req, res, next) => {
  try {
    const tickets = await complaintsStore.getComplaints();

    const categoryMap = new Map();
    const monthlyMap = new Map();

    tickets.forEach((t) => {
      categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + 1);

      const date = new Date(t.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { year: date.getFullYear(), month: date.getMonth() + 1, count: 0 });
      }
      monthlyMap.get(key).count += 1;
    });

    const categoryTrends = [...categoryMap.entries()]
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => b.count - a.count);

    const monthlyTrends = [...monthlyMap.values()]
      .map((m) => ({ _id: { year: m.year, month: m.month }, count: m.count }))
      .sort((a, b) => a._id.year - b._id.year || a._id.month - b._id.month);

    res.status(200).json({ success: true, data: { categoryTrends, monthlyTrends } });
  } catch (error) {
    next(error);
  }
};

// @desc   Tickets resolved per agent
// @route  GET /api/analytics/agent-performance
// @access Private
const getAgentPerformance = async (req, res, next) => {
  try {
    const tickets = await complaintsStore.getComplaints();
    const assigned = tickets.filter((t) => t.assignedAgent);

    const statsByAgent = new Map();
    assigned.forEach((t) => {
      if (!statsByAgent.has(t.assignedAgent)) {
        statsByAgent.set(t.assignedAgent, { totalAssigned: 0, resolved: 0, closed: 0 });
      }
      const stats = statsByAgent.get(t.assignedAgent);
      stats.totalAssigned += 1;
      if (t.status === "resolved") stats.resolved += 1;
      if (t.status === "closed") stats.closed += 1;
    });

    const agentIds = [...statsByAgent.keys()];
    const agents = await Promise.all(agentIds.map((id) => usersStore.findUserById(id)));

    const performance = agentIds
      .map((id, i) => {
        const agent = agents[i];
        if (!agent) return null;
        const stats = statsByAgent.get(id);
        return {
          agentId: agent._id,
          name: agent.name,
          email: agent.email,
          totalAssigned: stats.totalAssigned,
          resolved: stats.resolved,
          closed: stats.closed,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.resolved - a.resolved);

    res.status(200).json({ success: true, data: performance });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSummary, getTrends, getAgentPerformance };
