/** Booking / public catalog: only sessions explicitly marked Active. */
export const isActiveSession = (session) => session?.status === "Active"

export const filterActiveScheduleSlots = (schedules) =>
  (Array.isArray(schedules) ? schedules : [])
    .map((slot) => ({
      ...slot,
      sessions: (slot.sessions || []).filter(isActiveSession),
    }))
    .filter((slot) => slot.sessions.length > 0)
