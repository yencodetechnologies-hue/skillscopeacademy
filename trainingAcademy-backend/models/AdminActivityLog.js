const mongoose = require("mongoose");

const adminActivityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    targetId: {
      type: String,
      default: null,
    },
    performedBy: {
      userId: { type: String, default: null },
      role: { type: String, default: "Public" },
      name: { type: String, default: "" },
      email: { type: String, default: "" },
    },
    method: { type: String, default: "" },
    path: { type: String, default: "" },
    statusCode: { type: Number, default: 200 },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    clientIp: { type: String, default: "" },
    subject: {
      type: { type: String, default: "" },
      id: { type: String, default: "" },
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      companyId: { type: String, default: "" },
      companyName: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

adminActivityLogSchema.index({ createdAt: -1 });
adminActivityLogSchema.index({ module: 1, createdAt: -1 });

module.exports = mongoose.model("AdminActivityLog", adminActivityLogSchema);
