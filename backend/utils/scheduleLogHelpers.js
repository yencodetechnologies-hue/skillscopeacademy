const Course = require("../models/Course");

function formatScheduleDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Australia/Sydney",
  });
}

function formatTimeRange(startTime, endTime) {
  const parts = [];
  if (startTime) parts.push(startTime);
  if (endTime) parts.push(endTime);
  return parts.length ? parts.join("–") : "";
}

async function resolveCourseTitle(courseRef) {
  if (!courseRef) return "Unknown course";
  if (typeof courseRef === "object" && courseRef.title) return courseRef.title;
  const course = await Course.findById(courseRef).select("title").lean();
  return course?.title || "Unknown course";
}

/**
 * @param {import('../models/schedule')} schedule
 * @param {string|import('mongoose').Types.ObjectId} sessionId
 */
function findSession(schedule, sessionId) {
  if (!sessionId || !schedule?.sessions) return null;
  if (typeof schedule.sessions.id === "function") {
    return schedule.sessions.id(sessionId);
  }
  return schedule.sessions.find((s) => String(s._id) === String(sessionId)) || null;
}

async function buildSessionContext(schedule, sessionId) {
  const session = sessionId ? findSession(schedule, sessionId) : null;
  const courseTitle = await resolveCourseTitle(schedule.course);
  const dateStr = formatScheduleDate(schedule.date);

  return {
    courseTitle,
    courseId: schedule.course?._id?.toString?.() || String(schedule.course || ""),
    scheduleId: String(schedule._id),
    sessionId: session?._id ? String(session._id) : sessionId ? String(sessionId) : null,
    dateStr,
    sessionType: session?.sessionType || "",
    startTime: session?.startTime || "",
    endTime: session?.endTime || "",
    availableSlots: session?.availableSlots,
    status: session?.status || "",
    location: session?.location || "",
  };
}

function sessionDetailSuffix(ctx) {
  const time = formatTimeRange(ctx.startTime, ctx.endTime);
  const type = ctx.sessionType || "Session";
  return `${type}${time ? ` ${time}` : ""}`;
}

function baseSessionLabel(ctx) {
  return `${ctx.courseTitle} — ${ctx.dateStr}, ${sessionDetailSuffix(ctx)}`;
}

function buildCreateSummary(ctx, slots) {
  const slotPart =
    slots !== undefined && slots !== null ? `, ${slots} slots` : "";
  return `Added session: ${baseSessionLabel(ctx)}${slotPart}`;
}

function buildUpdateSummary(ctx, changes) {
  const changeParts = (changes || [])
    .map((c) => {
      if (c.field === "availableSlots") return `slots ${c.from} → ${c.to}`;
      if (c.field === "startTime") return `start ${c.from || "—"} → ${c.to}`;
      if (c.field === "endTime") return `end ${c.from || "—"} → ${c.to}`;
      return `${c.field} ${c.from} → ${c.to}`;
    })
    .filter(Boolean);

  const suffix = changeParts.length ? ` (${changeParts.join("; ")})` : "";
  return `Updated session: ${baseSessionLabel(ctx)}${suffix}`;
}

function buildToggleSummary(ctx, active) {
  const verb = active ? "Activated" : "Deactivated";
  return `${verb} session: ${ctx.courseTitle} — ${ctx.dateStr}, ${ctx.sessionType || "Session"}`;
}

function buildDeleteSummary(ctx) {
  return `Deleted session: ${ctx.courseTitle} — ${ctx.dateStr}, ${ctx.sessionType || "Session"}`;
}

function buildDeleteScheduleSummary(ctx) {
  return `Deleted schedule: ${ctx.courseTitle} — ${ctx.dateStr}`;
}

function contextToMetadata(ctx, extra = {}) {
  return {
    courseTitle: ctx.courseTitle,
    courseId: ctx.courseId,
    scheduleId: ctx.scheduleId,
    sessionId: ctx.sessionId,
    date: ctx.dateStr,
    sessionType: ctx.sessionType,
    ...extra,
  };
}

function buildBookSummary(ctx, seats, slotsBefore, slotsAfter) {
  const seatLabel = seats === 1 ? "1 seat" : `${seats} seats`;
  return `Booked ${seatLabel}: ${baseSessionLabel(ctx)} (slots ${slotsBefore} → ${slotsAfter})`;
}

module.exports = {
  formatScheduleDate,
  findSession,
  buildSessionContext,
  buildCreateSummary,
  buildUpdateSummary,
  buildToggleSummary,
  buildDeleteSummary,
  buildDeleteScheduleSummary,
  buildBookSummary,
  contextToMetadata,
  resolveCourseTitle,
  baseSessionLabel,
};
