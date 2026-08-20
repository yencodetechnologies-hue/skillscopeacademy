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
        console.log("\n========================================");
        console.log("GET UPCOMING SESSIONS API CALLED");
        console.log("========================================");

        const nowSydney = new Date(
            new Date().toLocaleString("en-US", {
                timeZone: "Australia/Sydney",
            })
        );

        const today = new Date(
            nowSydney.getFullYear(),
            nowSydney.getMonth(),
            nowSydney.getDate()
        );

        console.log("Sydney Current Date:", nowSydney);
        console.log("Today:", today);

        const limit = parseInt(req.query.limit) || 20;

        console.log("Limit:", limit);

        // ========================================
        // GET SCHEDULES FROM DATABASE
        // ========================================

        const schedules = await Schedule.find({
            date: { $gte: today },
        })
            .populate({
                path: "course",
                select: "+courseCode",
            })
            .sort({ date: 1 })
            .lean();

        console.log("\n========================================");
        console.log("SCHEDULES FROM DATABASE");
        console.log("========================================");

        console.log("Total schedules:", schedules.length);

        // Check complete MongoDB response
        console.log(
            JSON.stringify(schedules, null, 2)
        );

        const upcoming = [];

        // ========================================
        // LOOP THROUGH SCHEDULES
        // ========================================

        schedules.forEach((schedule, scheduleIndex) => {
            console.log("\n========================================");
            console.log(
                `SCHEDULE ${scheduleIndex + 1}`
            );
            console.log("========================================");

            if (!schedule.course) {
                console.log(
                    "❌ No course found for schedule:",
                    schedule._id
                );
                return;
            }

            console.log(
                "Schedule ID:",
                schedule._id
            );

            console.log(
                "Course ID:",
                schedule.course?._id
            );

            console.log(
                "Course Name:",
                schedule.course?.title
            );

            console.log(
                "Schedule Date:",
                schedule.date
            );

            console.log(
                "Total Sessions:",
                schedule.sessions?.length || 0
            );

            const dateObj = new Date(schedule.date);

            const isSunday =
                dateObj.getDay() === 0;

            const day =
                dateObj.getDate().toString();

            const mon =
                dateObj.toLocaleString("en-AU", {
                    month: "short",
                    timeZone: "Australia/Sydney",
                });

            // ========================================
            // GET ACTIVE SESSIONS
            // ========================================

            const activeSessions =
                schedule.sessions?.filter(
                    (s) => s.status === "Active"
                ) || [];

            console.log(
                "Active sessions:",
                activeSessions.length
            );

            if (activeSessions.length === 0) {
                console.log(
                    "❌ No active sessions"
                );
                return;
            }

            // ========================================
            // LOOP THROUGH ACTIVE SESSIONS
            // ========================================

            activeSessions.forEach(
                (activeSession, sessionIndex) => {
                    console.log(
                        "\n----------------------------------------"
                    );

                    console.log(
                        `SESSION ${sessionIndex + 1}`
                    );

                    console.log(
                        "----------------------------------------"
                    );

                    console.log(
                        "Session ID:",
                        activeSession._id
                    );

                    console.log(
                        "Session Type:",
                        activeSession.sessionType
                    );

                    console.log(
                        "Location:",
                        activeSession.location
                    );

                    console.log(
                        "Available Slots:",
                        activeSession.availableSlots
                    );

                    // ========================================
                    // ⭐ PREFERRED CITY DEBUG
                    // ========================================

                    console.log(
                        "PREFERRED CITY FROM DATABASE:"
                    );

                    console.log(
                        activeSession.preferredCity
                    );

                    console.log(
                        "PREFERRED CITY JSON:"
                    );

                    console.log(
                        JSON.stringify(
                            activeSession.preferredCity,
                            null,
                            2
                        )
                    );

                    // ========================================
                    // AVAILABLE SLOTS
                    // ========================================

                    const slots =
                        activeSession.availableSlots ??
                        0;

                    let spotsType = "ok";

                    if (slots === 0) {
                        spotsType = "full";
                    } else if (slots <= 3) {
                        spotsType = "low";
                    }

                    // ========================================
                    // PREFERRED CITY VALUE
                    // ========================================

                    const preferredCity =
                        activeSession.preferredCity || [];

                    console.log(
                        "PREFERRED CITY TO SEND IN API:"
                    );

                    console.log(
                        preferredCity
                    );

                    // ========================================
                    // ADD TO UPCOMING RESPONSE
                    // ========================================

                    upcoming.push({
                        scheduleId:
                            schedule._id,

                        sessionId:
                            activeSession._id,

                        date:
                            schedule.date,

                        day,

                        mon,

                        isSunday,

                        startTime:
                            activeSession.startTime ||
                            "8:30am",

                        endTime:
                            activeSession.endTime ||
                            "4:30pm",

                        location:
                            activeSession.location ||
                            schedule.course.location ||
                            "Sefton",

                        availableSlots:
                            slots,

                        spotsLabel:
                            slots === 0
                                ? "Full"
                                : `${slots} spots`,

                        spotsType,

                        sessionType:
                            activeSession.sessionType,

                        // ⭐ ADD PREFERRED CITY
                        preferredCity,

                        // COMPLETE COURSE OBJECT
                        course:
                            schedule.course,
                    });
                }
            );
        });

        // ========================================
        // FINAL RESPONSE
        // ========================================

        const finalResponse =
            upcoming.slice(0, limit);

        console.log("\n========================================");
        console.log(
            "FINAL UPCOMING RESPONSE"
        );
        console.log("========================================");

        console.log(
            "Total upcoming sessions:",
            finalResponse.length
        );

        // Show only preferred cities
        console.log(
            "ALL PREFERRED CITIES:"
        );

        finalResponse.forEach(
            (item, index) => {
                console.log(
                    `Session ${index + 1}:`,
                    {
                        scheduleId:
                            item.scheduleId,

                        sessionId:
                            item.sessionId,

                        courseId:
                            item.course?._id,

                        courseName:
                            item.course?.title,

                        preferredCity:
                            item.preferredCity,
                    }
                );
            }
        );

        // Complete final response
        console.log(
            "\nCOMPLETE API RESPONSE:"
        );

        console.log(
            JSON.stringify(
                finalResponse,
                null,
                2
            )
        );

        // ========================================
        // SEND RESPONSE
        // ========================================

        res.json(finalResponse);

    } catch (err) {
        console.error(
            "\n❌ getUpcomingSessions ERROR:"
        );

        console.error(err);

        console.error(
            "Error message:",
            err.message
        );

        console.error(
            "Error stack:",
            err.stack
        );

        res.status(500).json({
            message: "Server error",
            error: err.message,
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
