const Schedule = require("../models/schedule")
const Course = require("../models/Course")
const { logAdminActivity } = require("../utils/logAdminActivity")
const {
  buildSessionContext,
  buildCreateSummary,
  buildUpdateSummary,
  buildToggleSummary,
  buildDeleteSummary,
  buildDeleteScheduleSummary,
  contextToMetadata,
  resolveCourseTitle,
  formatScheduleDate,
} = require("../utils/scheduleLogHelpers")

const COURSE_POPULATE_SELECT =
    "title pricingType sellingPrice slSinglePrice withExperiencePrice withoutExperiencePrice location duration slug status _id"

const populateActiveCourse = {
    path: "course",
    match: { status: "Active" },
    select: COURSE_POPULATE_SELECT,
}

const resolveDisplayPrice = (course) => {
    const pt = course.pricingType || "standard"
    if (pt === "experience") return course.withoutExperiencePrice || course.withExperiencePrice || 0
    if (pt === "slbl")       return course.slSinglePrice || 0
    return course.sellingPrice || 0
}

const createSchedule = async (req,res) => {
 try{
  const schedule = new Schedule(req.body)
  const savedSchedule = await schedule.save()
  const courseTitle = await resolveCourseTitle(savedSchedule.course)
  const dateStr = formatScheduleDate(savedSchedule.date)
  const sessionCount = savedSchedule.sessions?.length || 0
  logAdminActivity(req, {
    action: "create",
    module: "schedule",
    summary: `Created schedule: ${courseTitle} — ${dateStr}${sessionCount ? ` (${sessionCount} session(s))` : ""}`,
    targetId: savedSchedule._id,
    statusCode: 201,
    metadata: { courseTitle, date: dateStr, scheduleId: String(savedSchedule._id) },
  })
  res.status(201).json(savedSchedule)
 }
 catch(err){
  res.status(500).json({
   message:err.message
  })
 }
}

const getUpcomingSessions = async (req, res) => {
    try {
        const nowSydney = new Date(
            new Date().toLocaleString("en-US", {
                timeZone: "Australia/Sydney"
            })
        );

        const today = new Date(
            nowSydney.getFullYear(),
            nowSydney.getMonth(),
            nowSydney.getDate()
        );

        const limit = parseInt(req.query.limit) || 20;

        const schedules = await Schedule.find({
            date: { $gte: today }
        })
            .populate({
                path: "course",
                select: "+courseCode"
            })
            .sort({ date: 1 })
            .lean();

        const upcoming = [];

        schedules.forEach((schedule) => {
            if (!schedule.course) return;

            const dateObj = new Date(schedule.date);

            const isSunday = dateObj.getDay() === 0;

            const day = dateObj.getDate().toString();

            const mon = dateObj.toLocaleString("en-AU", {
                month: "short",
                timeZone: "Australia/Sydney"
            });

            // Get ALL active sessions
            const activeSessions =
                schedule.sessions?.filter(
                    (s) => s.status === "Active"
                ) || [];

            if (activeSessions.length === 0) return;

            console.log("COURSE:", schedule.course);

            // Loop through every active session
            activeSessions.forEach((activeSession) => {
                const slots = activeSession.availableSlots ?? 0;

                let spotsType = "ok";

                if (slots === 0) {
                    spotsType = "full";
                } else if (slots <= 3) {
                    spotsType = "low";
                }

                upcoming.push({
                    scheduleId: schedule._id,

                    sessionId: activeSession._id,

                    date: schedule.date,

                    day,

                    mon,

                    isSunday,

                    startTime:
                        activeSession.startTime || "8:30am",

                    endTime:
                        activeSession.endTime || "4:30pm",

                    location:
                        activeSession.location ||
                        schedule.course.location ||
                        "Sefton",

                    availableSlots: slots,

                    spotsLabel:
                        slots === 0
                            ? "Full"
                            : `${slots} spots`,

                    spotsType,

                    sessionType:
                        activeSession.sessionType,

                    // 🔥 COMPLETE COURSE OBJECT
                    course: schedule.course
                });
            });
        });

        res.json(
            upcoming.slice(0, limit)
        );

    } catch (err) {
        console.error(
            "getUpcomingSessions error:",
            err
        );

        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};
const editSession = async (req, res) => {
  try {
    const {
      startTime,
      endTime,
      availableSlots,
      preferredCity,
    } = req.body;

    console.log(
      "========== EDIT SESSION =========="
    );

    console.log("Session ID:", req.params.id);
    console.log("Request body:", req.body);
    console.log(
      "preferredCity from request:",
      preferredCity
    );

    // ─────────────────────────────────────────────
    // FIND SCHEDULE
    // ─────────────────────────────────────────────

    const schedule = await Schedule.findOne({
      "sessions._id": req.params.id,
    });

    if (!schedule) {
      return res.status(404).json({
        message: "Schedule not found",
      });
    }

    // ─────────────────────────────────────────────
    // FIND SESSION
    // ─────────────────────────────────────────────

    const session = schedule.sessions.id(
      req.params.id
    );

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    // ─────────────────────────────────────────────
    // OLD VALUES
    // ─────────────────────────────────────────────

    const before = {
      startTime: session.startTime,
      endTime: session.endTime,
      availableSlots:
        session.availableSlots,

      preferredCity: Array.isArray(
        session.preferredCity
      )
        ? [...session.preferredCity]
        : [],
    };

    const changes = [];

    // ─────────────────────────────────────────────
    // UPDATE START TIME
    // ─────────────────────────────────────────────

    if (
      startTime !== undefined &&
      startTime !== before.startTime
    ) {
      session.startTime = startTime;

      changes.push({
        field: "startTime",
        from: before.startTime,
        to: startTime,
      });
    }

    // ─────────────────────────────────────────────
    // UPDATE END TIME
    // ─────────────────────────────────────────────

    if (
      endTime !== undefined &&
      endTime !== before.endTime
    ) {
      session.endTime = endTime;

      changes.push({
        field: "endTime",
        from: before.endTime,
        to: endTime,
      });
    }

    // ─────────────────────────────────────────────
    // UPDATE AVAILABLE SLOTS
    // ─────────────────────────────────────────────

    if (availableSlots !== undefined) {
      const next = Number(
        availableSlots
      );

      if (
        Number.isNaN(next) ||
        next < 1
      ) {
        return res.status(400).json({
          message:
            "Available slots must be a valid number greater than 0.",
        });
      }

      if (
        next !== before.availableSlots
      ) {
        session.availableSlots = next;

        changes.push({
          field: "availableSlots",
          from: before.availableSlots,
          to: next,
        });
      }
    }

    // ─────────────────────────────────────────────
    // UPDATE PREFERRED CITY
    // ─────────────────────────────────────────────
    //
    // Database field:
    // preferredCity
    //
    // Expected value:
    // ["Sydney"]
    // ["Adelaide"]
    // ["Sydney", "Adelaide"]
    //
    // ─────────────────────────────────────────────

    if (
      preferredCity !== undefined
    ) {
      let nextPreferredCity = [];

      if (
        Array.isArray(preferredCity)
      ) {
        nextPreferredCity =
          preferredCity
            .filter(
              (city) =>
                typeof city === "string"
            )
            .map((city) =>
              city.trim()
            )
            .filter(Boolean);
      } else if (
        typeof preferredCity ===
        "string"
      ) {
        nextPreferredCity =
          preferredCity
            .split(",")
            .map((city) =>
              city.trim()
            )
            .filter(Boolean);
      }

      // Remove duplicate cities
      nextPreferredCity = [
        ...new Set(
          nextPreferredCity
        ),
      ];

      const oldCities =
        before.preferredCity;

      const citiesChanged =
        JSON.stringify(
          oldCities
        ) !==
        JSON.stringify(
          nextPreferredCity
        );

      if (citiesChanged) {
        session.preferredCity =
          nextPreferredCity;

        changes.push({
          field: "preferredCity",
          from: oldCities,
          to: nextPreferredCity,
        });
      }
    }

    // ─────────────────────────────────────────────
    // SAVE
    // ─────────────────────────────────────────────

    await schedule.save();

    // ─────────────────────────────────────────────
    // BUILD CONTEXT
    // ─────────────────────────────────────────────

    const ctx =
      await buildSessionContext(
        schedule,
        req.params.id
      );

    // ─────────────────────────────────────────────
    // ADMIN ACTIVITY LOG
    // ─────────────────────────────────────────────

    logAdminActivity(req, {
      action: "update",
      module: "schedule",

      summary:
        buildUpdateSummary(
          ctx,
          changes
        ),

      targetId: req.params.id,

      metadata:
        contextToMetadata(ctx, {
          changes,
        }),
    });

    console.log(
      "Updated session:",
      session
    );

    console.log(
      "Updated preferredCity:",
      session.preferredCity
    );

    console.log(
      "Changes:",
      changes
    );

    console.log(
      "=================================="
    );

    // ─────────────────────────────────────────────
    // RESPONSE
    // ─────────────────────────────────────────────

    return res.json({
      message:
        "Session updated successfully",

      session,

      schedule,

      changes,
    });
  } catch (err) {
    console.error(
      "Edit session error:",
      err
    );

    return res.status(500).json({
      message: err.message,
    });
  }
};
const addSession = async (req, res) => {
  try {
    const { course, date, session } = req.body;

    console.log("Received session:", session);

    // Validate available slots
    if (
      session?.availableSlots === undefined ||
      session?.availableSlots === null ||
      session?.availableSlots === ""
    ) {
      return res.status(400).json({
        message: "Available slots is required.",
      });
    }

    const sessionData = {
      ...session,

      availableSlots: Number(session.availableSlots),

      preferredCity:
        Array.isArray(session.preferredCity) &&
        session.preferredCity.length > 0
          ? session.preferredCity
          : ["Sydney"],
    };

    let schedule = await Schedule.findOne({
      course,
      date,
    });

    if (!schedule) {
      schedule = new Schedule({
        course,
        date,
        sessions: [sessionData],
      });
    } else {
      schedule.sessions.push(sessionData);
    }

    await schedule.save();

    const addedSession =
      schedule.sessions[schedule.sessions.length - 1];

    const ctx = await buildSessionContext(
      schedule,
      addedSession._id
    );

    logAdminActivity(req, {
      action: "create",
      module: "schedule",
      summary: buildCreateSummary(
        ctx,
        sessionData.availableSlots
      ),
      targetId: addedSession._id,
      metadata: contextToMetadata(ctx),
    });

    res.json(schedule);

  } catch (err) {
    console.error("Add Session Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};

const toggleSession = async (req, res) => {
  try {
    const schedule = await Schedule.findOne({
      "sessions._id": req.params.id,
    })

    if (!schedule) {
      return res.status(404).json({ message: "Session not found" })
    }

    const session = schedule.sessions.id(req.params.id)
    if (!session) {
      return res.status(404).json({ message: "Session not found" })
    }

    session.status = session.status === "Active" ? "Inactive" : "Active"
    await schedule.save()

    const ctx = await buildSessionContext(schedule, req.params.id)
    const isActive = session.status === "Active"
    logAdminActivity(req, {
      action: "toggle",
      module: "schedule",
      summary: buildToggleSummary(ctx, isActive),
      targetId: req.params.id,
      metadata: contextToMetadata(ctx, { status: session.status }),
    })
    res.json(schedule)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Public booking: hide Inactive sessions. Admin (?includeInactive=true) sees all.
const sessionPassesTodayBookingRules = (session, schedule, now) => {
  const [startH, startM] = (session.startTime || "0:0").split(":").map(Number)
  const sessionStart = new Date(schedule.date)
  sessionStart.setHours(startH, startM, 0, 0)

  const [endH, endM] = (session.endTime || "0:0").split(":").map(Number)
  const sessionEnd = new Date(schedule.date)
  sessionEnd.setHours(endH, endM, 0, 0)

  const isEnded = now >= sessionEnd
  const isUpcoming = sessionStart > now
  const isBookable = session.availableSlots > 0

  if (isEnded) return false
  return isUpcoming || isBookable
}

const shouldIncludeSession = (session, schedule, now, isToday, includeInactive) => {
  if (!includeInactive && session.status !== "Active") return false
  if (!isToday || includeInactive) return true
  return sessionPassesTodayBookingRules(session, schedule, now)
}

const getCourseSchedules = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === "true"
    const nowSydney = new Date(new Date().toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
    const now = nowSydney;
    const today = new Date(nowSydney.getFullYear(), nowSydney.getMonth(), nowSydney.getDate());

    const schedules = await Schedule.find({
      course: req.params.courseId,
      date: { $gte: today }
    }).sort({ date: 1 })

    // Admin manage-dates view: return every session; Active/Inactive is hide/show only.
    if (includeInactive) {
      return res.json(schedules)
    }

    const filteredSchedules = schedules.map(schedule => {
      const isToday = schedule.date.toDateString() === now.toDateString()
      const filteredSessions = schedule.sessions.filter(session =>
        shouldIncludeSession(session, schedule, now, isToday, includeInactive)
      )

      return {
        ...schedule._doc,
        sessions: filteredSessions
      }
    }).filter(schedule => schedule.sessions.length > 0)

    res.json(filteredSchedules)

  } catch (err) {
    res.status(500).json({
      message: err.message
    })
  }
}

const deleteSchedule = async (req,res) => {
 try{
  const schedule = await Schedule.findById(req.params.id)
  if (!schedule) {
    return res.status(404).json({ message: "Schedule not found" })
  }
  const ctx = await buildSessionContext(schedule, null)
  await Schedule.findByIdAndDelete(req.params.id)
  logAdminActivity(req, {
    action: "delete",
    module: "schedule",
    summary: buildDeleteScheduleSummary(ctx),
    targetId: req.params.id,
    metadata: contextToMetadata(ctx),
  })
  res.json({
   message:"Schedule deleted"
  })
 }
 catch(err){
  res.status(500).json({
   message:err.message
  })
 }
}

const deleteSession = async(req,res)=>{
 try{
  const schedule = await Schedule.findOne({
   "sessions._id":req.params.id
  })
  if(!schedule){
   return res.status(404).json({
    message:"Schedule not found"
   })
  }
  const ctx = await buildSessionContext(schedule, req.params.id)
schedule.sessions.pull(req.params.id)

if(schedule.sessions.length === 0){
  await schedule.deleteOne()
}else{
  await schedule.save()
}
  logAdminActivity(req, {
    action: "delete",
    module: "schedule",
    summary: buildDeleteSummary(ctx),
    targetId: req.params.id,
    metadata: contextToMetadata(ctx),
  })
  res.json({
   message:"Session deleted"
  })
 }
 catch(err){
  res.status(500).json({
   message:err.message
  })
 }
}

const getActiveCoursIds = async (req, res) => {
  try {
    const nowSydney = new Date(new Date().toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
    const today = new Date(nowSydney.getFullYear(), nowSydney.getMonth(), nowSydney.getDate());

    const activeCourseIds = new Set(
      (await Course.find({ status: "Active" }).select("_id").lean()).map((c) =>
        String(c._id)
      )
    )

    const schedules = await Schedule.find({
      date: { $gte: today }
    }).select("course sessions").lean()

    const ids = [...new Set(
      schedules
        .filter(
          (s) =>
            activeCourseIds.has(String(s.course)) &&
            s.sessions.some((sess) => sess.status === "Active")
        )
        .map((s) => String(s.course))
    )]

    res.json(ids)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = {
 createSchedule,
 getCourseSchedules,
 deleteSchedule,
 addSession,
 toggleSession,
 deleteSession,
 editSession,
 getUpcomingSessions,
 getActiveCoursIds
}
