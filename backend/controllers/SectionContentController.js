// controllers/sectionContentController.js
const SectionContent = require("../models/SectionContent");

// ===== Quick Facts Bar =====

// GET /api/section-content/quick-facts/all
exports.getAllQuickFacts = async (req, res) => {
  try {
    const facts = await SectionContent.find().sort({ order: 1 });
    res.status(200).json(facts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch quick facts", error: err.message });
  }
};

// GET /api/section-content/quick-facts/:id
exports.getQuickFactById = async (req, res) => {
  try {
    const fact = await SectionContent.findById(req.params.id);
    if (!fact) return res.status(404).json({ message: "Quick fact not found" });
    res.status(200).json(fact);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch quick fact", error: err.message });
  }
};

// PUT /api/section-content/quick-facts/:id  (val + label only — icon is never writable)
exports.updateQuickFact = async (req, res) => {
  try {
    const { val, label } = req.body;

    if (!val || !label) {
      return res.status(400).json({ message: "Value and label are required" });
    }

    const fact = await SectionContent.findByIdAndUpdate(
      req.params.id,
      { val, label },
      { new: true, runValidators: true }
    );

    if (!fact) return res.status(404).json({ message: "Quick fact not found" });

    res.status(200).json(fact);
  } catch (err) {
    res.status(500).json({ message: "Failed to update quick fact", error: err.message });
  }
};