const AdminActivityLog = require("../models/AdminActivityLog");
const { enrichLogsForDisplay } = require("../utils/activityLogReadHelpers");

exports.getLogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.module) {
      filter.module = req.query.module;
    }
    if (req.query.action) {
      filter.action = req.query.action;
    }
    if (req.query.search) {
      const q = String(req.query.search).trim();
      if (q) {
        const regex = { $regex: q, $options: "i" };
        filter.$or = [
          { summary: regex },
          { "performedBy.name": regex },
          { "performedBy.email": regex },
          { "metadata.courseTitle": regex },
          { "metadata.studentName": regex },
          { "metadata.studentEmail": regex },
          { clientIp: regex },
          { "subject.name": regex },
          { "subject.email": regex },
          { "subject.companyName": regex },
        ];
      }
    }
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) {
        filter.createdAt.$gte = new Date(req.query.from);
      }
      if (req.query.to) {
        const to = new Date(req.query.to);
        to.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = to;
      }
    }

    const [logs, total] = await Promise.all([
      AdminActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdminActivityLog.countDocuments(filter),
    ]);

    const enrichedLogs = await enrichLogsForDisplay(logs);

    res.json({
      success: true,
      data: {
        logs: enrichedLogs,
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
