const jwt = require("jsonwebtoken");
const AdminActivityLog = require("../models/AdminActivityLog");
const User = require("../models/User");
const Company = require("../models/Company");
const StudentMain = require("../models/student_main");

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const first = String(forwarded).split(",")[0]?.trim();
    if (first) return first;
  }
  return req.ip || req.socket?.remoteAddress || "";
}

function decodeToken(req) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token || !process.env.JWT_SECRET) return null;
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function mergePerformer(resolved, override) {
  if (!override) return resolved;
  return {
    userId: override.userId ?? resolved.userId,
    role: override.role || resolved.role,
    name: override.name || resolved.name,
    email: override.email || resolved.email,
  };
}

function normalizeSubject(subject) {
  if (!subject) return undefined;
  const normalized = {
    type: subject.type || "",
    id: subject.id ? String(subject.id) : "",
    name: subject.name || "",
    email: subject.email || "",
    companyId: subject.companyId ? String(subject.companyId) : "",
    companyName: subject.companyName || "",
  };
  const hasData =
    normalized.type ||
    normalized.id ||
    normalized.name ||
    normalized.email ||
    normalized.companyId ||
    normalized.companyName;
  return hasData ? normalized : undefined;
}

async function resolvePerformer(decoded) {
  if (!decoded) {
    return {
      userId: null,
      role: "Public",
      name: "",
      email: "",
    };
  }

  const role = decoded.role || "Public";
  const userId = decoded.id ? String(decoded.id) : null;
  const base = { userId, role, name: "", email: "" };

  try {
    if (role.toLowerCase() === "admin" && userId) {
      const user = await User.findById(userId).select("name email").lean();
      if (user) {
        base.name = user.name || "";
        base.email = user.email || "";
      }
      return base;
    }

    if (role.toLowerCase() === "company" && userId) {
      const company = await Company.findById(userId)
        .select("companyName email")
        .lean();
      if (company) {
        base.name = company.companyName || "";
        base.email = company.email || "";
      }
      return base;
    }

    if (role.toLowerCase() === "student" && userId) {
      const student = await StudentMain.findById(userId)
        .select("name email")
        .lean();
      if (student) {
        base.name = student.name || "";
        base.email = student.email || "";
      }
      return base;
    }
  } catch (err) {
    console.error("[logAdminActivity] resolvePerformer:", err.message);
  }

  return base;
}

/**
 * Fire-and-forget admin activity logger. Never throws.
 * @param {import('express').Request} req
 * @param {{ action: string, module: string, summary: string, targetId?: *, statusCode?: number, metadata?: object, performedByOverride?: object, subject?: object }} opts
 */
function logAdminActivity(req, opts) {
  const {
    action,
    module,
    summary,
    targetId = null,
    statusCode = 200,
    metadata = null,
    performedByOverride = null,
    subject = null,
  } = opts;

  if (!action || !module || !summary) return;

  const decoded = req.user || decodeToken(req);
  const method = req.method || "";
  const path = req.originalUrl || req.path || "";
  const clientIp = getClientIp(req);

  void (async () => {
    try {
      let performedBy = await resolvePerformer(decoded);
      performedBy = mergePerformer(performedBy, performedByOverride);
      await AdminActivityLog.create({
        action,
        module,
        summary: String(summary).slice(0, 500),
        targetId: targetId ? String(targetId) : null,
        performedBy,
        method,
        path,
        statusCode,
        metadata: metadata || undefined,
        clientIp,
        subject: normalizeSubject(subject),
      });
    } catch (err) {
      console.error("[logAdminActivity]", err.message);
    }
  })();
}

module.exports = { logAdminActivity, getClientIp };
