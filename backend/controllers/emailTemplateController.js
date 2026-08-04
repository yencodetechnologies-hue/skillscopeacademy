const EmailTemplate = require("../models/EmailTemplate");

// Get all templates
exports.getTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.find().sort({ createdAt: 1 });

    res.json(templates);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Toggle Active / Inactive
exports.toggleStatus = async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    // Toggle status
    template.status =
      template.status === "Active"
        ? "Inactive"
        : "Active";

    // Save to MongoDB
    await template.save();

    res.json({
      success: true,
      message: "Status updated successfully",
      data: template,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};