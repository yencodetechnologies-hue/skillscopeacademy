const EnrollmentForm = require("../models/EnrollmentForm");
const {
  resolveStudentContext,
  resolveCompanyContext,
} = require("./activityContextHelpers");

function parseEmailFromSummary(summary) {
  if (!summary) return "";
  const match = String(summary).match(/\(([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\)/);
  return match ? match[1] : "";
}

function parseNameFromSummary(summary) {
  if (!summary) return "";
  const text = String(summary);
  const patterns = [
    /Added student:\s*(.+?)(?:\s*\(|$)/i,
    /(?:Approved|Rejected|Set to Pending)\s+enrollment form for\s+(.+?)(?:\s*\(|$)/i,
    /LLND completed:\s*(.+?)(?:\s*—|\s*\(|$)/i,
    /Enrollment completed for\s+(.+?)(?:\s*\(|$)/i,
    /Booked\s+.+?\s+—\s+(.+?)(?:\s*\(|$)/i,
    /Student enrolled via link:.+?—\s+(.+?)(?:\s*\(|$)/i,
    /Payment\s+\w+\s+for\s+(.+?)(?:\s*—|\s*\(|$)/i,
    /Updated student(?::|\s+course payment for)\s+(.+?)(?:\s*\(|$)/i,
    /Deleted student enrollment:\s*(.+?)(?:\s*\(|$)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return "";
}

/**
 * Read-only display enrichment for activity logs.
 * Does not modify stored documents — only adds a `display` object to API responses.
 */
async function enrichLogForDisplay(log) {
  const meta = log.metadata || {};
  const subject = log.subject || {};

  let subjectName = subject.name || meta.studentName || "";
  let subjectEmail = subject.email || meta.studentEmail || "";
  let companyName = subject.companyName || meta.companyName || "";
  let companyId = subject.companyId || meta.companyId || "";

  if (!subjectEmail) subjectEmail = parseEmailFromSummary(log.summary);
  if (!subjectName) subjectName = parseNameFromSummary(log.summary);

  const studentId =
    subject.id ||
    meta.studentId ||
    (log.module === "student" && log.action === "create" ? log.targetId : null);

  if ((!subjectEmail || !subjectName) && studentId) {
    const student = await resolveStudentContext({ studentId });
    if (student) {
      subjectName = subjectName || student.name || "";
      subjectEmail = subjectEmail || student.email || "";
      companyId = companyId || student.companyId || "";
    }
  }

  if (
    log.module === "enrollment_form" &&
    log.targetId &&
    (!subjectEmail || !subjectName)
  ) {
    try {
      const form = await EnrollmentForm.findById(log.targetId)
        .select("studentName studentId personalDetails.email personalDetails.givenName personalDetails.surname")
        .lean();
      if (form) {
        subjectEmail =
          subjectEmail ||
          form.personalDetails?.email ||
          "";
        subjectName =
          subjectName ||
          form.studentName ||
          [form.personalDetails?.givenName, form.personalDetails?.surname]
            .filter(Boolean)
            .join(" ")
            .trim();
        if (!studentId && form.studentId) {
          const student = await resolveStudentContext({ studentId: form.studentId });
          if (student) {
            subjectEmail = subjectEmail || student.email || "";
            subjectName = subjectName || student.name || "";
            companyId = companyId || student.companyId || "";
          }
        }
      }
    } catch (err) {
      console.error("[enrichLogForDisplay] enrollment form lookup:", err.message);
    }
  }

  if (!companyName && companyId) {
    const company = await resolveCompanyContext({ companyId });
    if (company) companyName = company.companyName || "";
  }

  const performer = log.performedBy || {};
  const isLegacyPublic =
    (!performer.role || performer.role === "Public") &&
    !performer.name &&
    !performer.email &&
    !log.clientIp;

  return {
    ...log,
    display: {
      subjectName,
      subjectEmail,
      companyName,
      isLegacyPublic,
    },
  };
}

async function enrichLogsForDisplay(logs) {
  if (!Array.isArray(logs) || logs.length === 0) return [];
  return Promise.all(logs.map((log) => enrichLogForDisplay(log)));
}

module.exports = {
  enrichLogForDisplay,
  enrichLogsForDisplay,
  parseEmailFromSummary,
  parseNameFromSummary,
};
