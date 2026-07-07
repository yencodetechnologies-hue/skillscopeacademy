const EnrollmentLink = require("../models/EnrollmentLink");
const { logAdminActivity } = require("../utils/logAdminActivity");
const {
  buildActivitySubject,
  formatStudentLabel,
  studentPerformerOverride,
} = require("../utils/activityContextHelpers");

// GET /api/enrollment-links
const getAll = async (req, res) => {
  try {
    const links = await EnrollmentLink.find().sort({ createdAt: -1 });
    res.json({ success: true, data: links });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/enrollment-links/:id
const getOne = async (req, res) => {
  try {
    const link = await EnrollmentLink.findById(req.params.id);
    if (!link) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: link });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/enrollment-links
const create = async (req, res) => {
  try {
    const { name, description, course, maxUses, expires, payLater, agent } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Link name is required" });
    }
    const link = await EnrollmentLink.create({
      name: name.trim(),
      description: description || "",
      course: course || "Any course",
      maxUses: maxUses ? parseInt(maxUses) : null,
      expires: expires || null,
      payLater: !!payLater,
      agent: !!agent,
    });
    logAdminActivity(req, { action: "create", module: "enrollment_link", summary: `Created enrollment link: ${link.name}`, targetId: link._id, statusCode: 201 });
    res.status(201).json({ success: true, data: link });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/enrollment-links/:id
const update = async (req, res) => {
  try {
    const { expires, maxUses } = req.body;
    const link = await EnrollmentLink.findByIdAndUpdate(
      req.params.id,
      {
        expires: expires || null,
        maxUses: maxUses ? parseInt(maxUses) : null,
      },
      { returnDocument: "after" }
    );
    if (!link) return res.status(404).json({ success: false, message: "Not found" });
    logAdminActivity(req, { action: "update", module: "enrollment_link", summary: `Updated enrollment link: ${link.name}`, targetId: link._id });
    res.json({ success: true, data: link });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/enrollment-links/:id/toggle-status
const toggleStatus = async (req, res) => {
  try {
    const link = await EnrollmentLink.findById(req.params.id);
    if (!link) return res.status(404).json({ success: false, message: "Not found" });
    link.status = link.status === "Active" ? "Inactive" : "Active";
    await link.save();
    logAdminActivity(req, { action: "toggle", module: "enrollment_link", summary: `${link.status === "Active" ? "Activated" : "Deactivated"} enrollment link: ${link.name}`, targetId: link._id });
    res.json({ success: true, data: link });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/enrollment-links/:id
const remove = async (req, res) => {
  try {
    const link = await EnrollmentLink.findByIdAndDelete(req.params.id);
    if (!link) return res.status(404).json({ success: false, message: "Not found" });
    logAdminActivity(req, { action: "delete", module: "enrollment_link", summary: `Deleted enrollment link: ${link.name}`, targetId: link._id });
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/enrollment-links/:id/enroll  (public — student enrolls via link)
const enroll = async (req, res) => {
  try {
    const { name, email } = req.body;
    const link = await EnrollmentLink.findById(req.params.id);
    if (!link) return res.status(404).json({ success: false, message: "Link not found" });
    if (link.status !== "Active") return res.status(400).json({ success: false, message: "Link is inactive" });
    if (link.maxUses && link.usage >= link.maxUses) {
      return res.status(400).json({ success: false, message: "Link has reached max uses" });
    }
    const today = new Date().toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" });
    link.students.push({ name, email, date: today });
    link.usage += 1;
    await link.save();
    const subject = await buildActivitySubject({ email, name });
    const studentLabel = formatStudentLabel(name, email);
    const hasAuth = !!req.headers.authorization?.split(" ")[1];
    logAdminActivity(req, {
      action: "create",
      module: "enrollment_link",
      summary: studentLabel
        ? `Student enrolled via link: ${link.name} — ${studentLabel}`
        : `Student enrolled via link: ${link.name}`,
      targetId: link._id,
      subject,
      metadata: {
        studentName: name || subject.name,
        studentEmail: email || subject.email,
        linkName: link.name,
      },
      performedByOverride: studentPerformerOverride(
        { name, email },
        hasAuth
      ),
    });
    res.json({ success: true, data: link });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/enrollment-links/:id/use  (increment usage when link is accessed)
const use = async (req, res) => {
  try {
    const link = await EnrollmentLink.findById(req.params.id);
    if (!link) return res.status(404).json({ success: false, message: "Link not found" });
    if (link.status !== "Active") return res.status(400).json({ success: false, message: "Link is inactive" });
    if (link.maxUses && link.usage >= link.maxUses) {
      return res.status(400).json({ success: false, message: "Link has reached max uses" });
    }
    link.usage += 1;
    await link.save();
    res.json({ success: true, data: link });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getOne, create, update, toggleStatus, remove, enroll, use };