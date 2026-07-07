const mongoose = require("mongoose");
const StudentMain = require("../models/student_main");
const Company = require("../models/Company");
const EnrollmentFlow = require("../models/EnrollmentFlows");

function formatStudentLabel(name, email) {
  if (name && email) return `${name} (${email})`;
  return name || email || "";
}

function buildSubject({ student, company } = {}) {
  const subject = {
    type: "",
    id: "",
    name: "",
    email: "",
    companyId: "",
    companyName: "",
  };

  if (student) {
    subject.type = "student";
    subject.id = student.id ? String(student.id) : "";
    subject.name = student.name || "";
    subject.email = student.email || "";
    if (student.companyId) subject.companyId = String(student.companyId);
  }

  if (company) {
    if (!subject.type) subject.type = "company";
    subject.companyId = company.id ? String(company.id) : subject.companyId;
    subject.companyName = company.companyName || company.name || "";
    if (!subject.email && company.email) subject.email = company.email;
  }

  return subject;
}

async function resolveStudentContext({ studentId, email, name, flowId } = {}) {
  let student = null;

  try {
    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
      student = await StudentMain.findById(studentId)
        .select("name email companyId")
        .lean();
    }

    if (!student && flowId && mongoose.Types.ObjectId.isValid(flowId)) {
      const flow = await EnrollmentFlow.findById(flowId)
        .populate("studentId", "name email companyId")
        .lean();
      if (flow?.studentId && typeof flow.studentId === "object") {
        student = flow.studentId;
      } else if (flow?.studentId) {
        student = await StudentMain.findById(flow.studentId)
          .select("name email companyId")
          .lean();
      }
    }

    if (!student && email) {
      const normalized = String(email).toLowerCase().trim();
      student = await StudentMain.findOne({ email: normalized })
        .select("name email companyId")
        .lean();
    }
  } catch (err) {
    console.error("[activityContextHelpers] resolveStudentContext:", err.message);
  }

  if (!student && (name || email)) {
    return {
      id: studentId ? String(studentId) : "",
      name: name || "",
      email: email || "",
      companyId: null,
    };
  }

  if (!student) return null;

  return {
    id: String(student._id),
    name: student.name || "",
    email: student.email || "",
    companyId: student.companyId ? String(student.companyId) : null,
  };
}

async function resolveCompanyContext({ companyId } = {}) {
  if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) return null;

  try {
    const company = await Company.findById(companyId)
      .select("companyName email")
      .lean();
    if (!company) return null;
    return {
      id: String(companyId),
      companyName: company.companyName || "",
      email: company.email || "",
    };
  } catch (err) {
    console.error("[activityContextHelpers] resolveCompanyContext:", err.message);
    return null;
  }
}

async function buildActivitySubject({
  studentId,
  email,
  name,
  flowId,
  companyId,
} = {}) {
  const student = await resolveStudentContext({ studentId, email, name, flowId });
  const resolvedCompanyId = companyId || student?.companyId;
  const company = await resolveCompanyContext({ companyId: resolvedCompanyId });
  return buildSubject({ student, company });
}

function studentPerformerOverride(student, hasAuth) {
  if (hasAuth || !student) return null;
  if (!student.email && !student.name) return null;
  return {
    userId: student.id || null,
    role: "Student",
    name: student.name || "",
    email: student.email || "",
  };
}

module.exports = {
  formatStudentLabel,
  buildSubject,
  resolveStudentContext,
  resolveCompanyContext,
  buildActivitySubject,
  studentPerformerOverride,
};
