const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "Birthday Wishes",
        "Festival Wishes",
        "Course Reminder",
        "Payment Reminder"
      ]
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Inactive"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("EmailTemplate", emailTemplateSchema);