import "../styles/ScheduleModal.css";
import { useFormik } from "formik";
import axios from "axios";
import { useState, useEffect } from "react";
import { API_URL } from "../data/service";

// ─────────────────────────────────────────────────────────────
// AUTH HELPERS
// ─────────────────────────────────────────────────────────────

function authHeaders() {
  const token = localStorage.getItem("token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

function jsonAuthHeaders() {
  return {
    ...authHeaders(),
    "Content-Type": "application/json",
  };
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const toYMD = (d) =>
  new Date(d).toISOString().split("T")[0];

const todayYMD = toYMD(new Date());

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const DAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

// Available city options
const CITIES = ["Sydney", "Adelaide"];

// ─────────────────────────────────────────────────────────────
// GENERATE DATES
// ─────────────────────────────────────────────────────────────

const generateDates = (
  start,
  end,
  selectedDays
) => {
  if (
    !start ||
    !end ||
    selectedDays.length === 0
  ) {
    return [];
  }

  const result = [];

  const cur = new Date(start);
  const last = new Date(end);

  while (cur <= last) {
    if (selectedDays.includes(cur.getDay())) {
      result.push(toYMD(cur));
    }

    cur.setDate(cur.getDate() + 1);
  }

  return result;
};

// ─────────────────────────────────────────────────────────────
// EDIT SESSION MODAL
// ─────────────────────────────────────────────────────────────

function EditSessionModal({
  session,
  scheduleDate,
  onClose,
  onSaved,
}) {
  const [startTime, setStartTime] = useState(
    session.startTime || ""
  );

  const [endTime, setEndTime] = useState(
    session.endTime || ""
  );

  const [availableSlots, setAvailableSlots] =
    useState(
      session.availableSlots || 0
    );

  // IMPORTANT:
  // Database field is preferredCity
  //
  // Example database response:
  //
  // preferredCity: ["Sydney"]
  // preferredCity: ["Adelaide"]
  // preferredCity: ["Sydney", "Adelaide"]
  //
  // We bind exactly that value.
  const [selectedEditCities, setSelectedEditCities] =
    useState(
      Array.isArray(session.preferredCity)
        ? session.preferredCity
        : []
    );

  const [saving, setSaving] =
    useState(false);

  // ─────────────────────────────────────────────
  // DEBUG API RESPONSE
  // ─────────────────────────────────────────────

  useEffect(() => {
    console.log(
      "========== EDIT SESSION API DATA =========="
    );

    console.log("Full session:", session);

    console.log(
      "preferredCity from API:",
      session?.preferredCity
    );

    console.log(
      "preferredCity is array:",
      Array.isArray(session?.preferredCity)
    );

    console.log(
      "selectedEditCities:",
      selectedEditCities
    );

    console.log(
      "==========================================="
    );
  }, [session, selectedEditCities]);

  // ─────────────────────────────────────────────
  // TOGGLE CITY
  // ─────────────────────────────────────────────

  const toggleCity = (city) => {
    setSelectedEditCities((prev) => {
      if (prev.includes(city)) {
        return prev.filter(
          (item) => item !== city
        );
      }

      return [...prev, city];
    });
  };

  // ─────────────────────────────────────────────
  // SAVE EDIT
  // ─────────────────────────────────────────────

  const handleSave = async () => {
    if (selectedEditCities.length === 0) {
      alert(
        "Please select at least one city."
      );
      return;
    }

    if (!availableSlots) {
      alert(
        "Available slots is required."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        startTime,
        endTime,
        availableSlots: Number(
          availableSlots
        ),

        // DATABASE FIELD NAME
        preferredCity: [
          ...selectedEditCities,
        ],
      };

      console.log(
        "========== EDIT SESSION PAYLOAD =========="
      );

      console.log("Session ID:", session._id);
      console.log("Payload:", payload);
      console.log(
        "preferredCity:",
        payload.preferredCity
      );

      console.log(
        "=========================================="
      );

      const response = await axios.patch(
        `${API_URL}/api/schedules/session/${session._id}/edit`,
        payload,
        {
          headers: jsonAuthHeaders(),
        }
      );

      console.log(
        "========== EDIT SESSION RESPONSE =========="
      );

      console.log(
        "API response:",
        response.data
      );

      console.log(
        "Updated preferredCity:",
        response.data?.session
          ?.preferredCity ||
          response.data?.preferredCity
      );

      console.log(
        "==========================================="
      );

      onSaved();
      onClose();
    } catch (err) {
      console.error(
        "Edit session error:",
        err
      );

      console.error(
        "Edit session error response:",
        err?.response?.data
      );

      alert(
        err?.response?.data?.message ||
          "Could not update the session."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="csm-edit-overlay">
      <div className="csm-edit-modal">

        {/* HEADER */}

        <div className="csm-edit-header">
          <div>
            <h3>Edit Session</h3>

            <p>
              Update the start/end time,
              city and capacity for this
              scheduled session.
            </p>
          </div>

          <button
            type="button"
            className="csm-close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* DATE */}

        <div className="csm-edit-field">
          <label>Date</label>

          <p className="csm-edit-date-val">
            {formatDate(scheduleDate)}
          </p>
        </div>

        {/* START / END TIME */}

        <div className="csm-grid-2">

          <div className="csm-field">
            <label>
              Start Time
            </label>

            <input
              type="time"
              value={startTime}
              onChange={(e) =>
                setStartTime(
                  e.target.value
                )
              }
            />
          </div>

          <div className="csm-field">
            <label>
              End Time
            </label>

            <input
              type="time"
              value={endTime}
              onChange={(e) =>
                setEndTime(
                  e.target.value
                )
              }
            />
          </div>

        </div>

        {/* ACTIVE SLOTS */}

        <div className="csm-field">
          <label>
            Active Slots
          </label>

          <input
            type="number"
            min="1"
            value={availableSlots}
            onChange={(e) =>
              setAvailableSlots(
                e.target.value
              )
            }
          />
        </div>

        {/* CITY */}

        <div className="csm-field csm-field-full">

          <label>
            City *
          </label>

          <div className="csm-city-checkboxes">

            {CITIES.map((city) => (
              <label
                key={city}
                className="csm-city-checkbox"
              >
                <input
                  type="checkbox"
                  value={city}
                  checked={selectedEditCities.includes(
                    city
                  )}
                  onChange={() =>
                    toggleCity(city)
                  }
                />

                <span>
                  {city}
                </span>
              </label>
            ))}

          </div>

          <span className="csm-hint">
            Select one or more cities
          </span>

        </div>

        {/* FOOTER */}

        <div className="csm-edit-footer">

          <button
            type="button"
            className="csm-cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="csm-save-changes-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COURSE SCHEDULE MODAL
// ─────────────────────────────────────────────────────────────

function CourseScheduleModal({
  course,
  close,
}) {
  const [schedules, setSchedules] =
    useState([]);

  const [localSessions, setLocalSessions] =
    useState([]);

  const [bulkMode, setBulkMode] =
    useState(false);

  const [selectedDays, setSelectedDays] =
    useState([]);

  // ADD SINGLE SESSION
  // Sydney selected by default
  const [selectedCities, setSelectedCities] =
    useState(["Sydney"]);

  // ADD BULK SESSION
  // Sydney selected by default
  const [bulkCities, setBulkCities] =
    useState(["Sydney"]);

  const [editTarget, setEditTarget] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [togglingId, setTogglingId] =
    useState(null);

  const [filterType, setFilterType] =
    useState("All");

  // ─────────────────────────────────────────────
  // FETCH SCHEDULES
  // ─────────────────────────────────────────────

  const fetchSchedules = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/schedules/course/${course._id}?includeInactive=true`,
        {
          headers: authHeaders(),
        }
      );

      console.log(
        "========== SCHEDULE API RESPONSE =========="
      );

      console.log(
        "Full schedules:",
        res.data
      );

      res.data?.forEach((schedule) => {
        schedule?.sessions?.forEach(
          (session) => {
            console.log(
              "Session:",
              session._id
            );

            console.log(
              "preferredCity:",
              session.preferredCity
            );

            console.log(
              "preferredCity type:",
              typeof session.preferredCity
            );

            console.log(
              "preferredCity array:",
              Array.isArray(
                session.preferredCity
              )
            );
          }
        );
      });

      console.log(
        "==========================================="
      );

      setSchedules(res.data);
    } catch (err) {
      console.error(
        "Fetch schedules error:",
        err
      );
    }
  };

  useEffect(() => {
    if (course?._id) {
      fetchSchedules();
    }
  }, [course]);

  // ─────────────────────────────────────────────
  // DELETE SESSION
  // ─────────────────────────────────────────────

  const deleteSession = async (id) => {
    if (
      !window.confirm(
        "Delete this session?"
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/api/schedules/session/${id}`,
        {
          headers: authHeaders(),
        }
      );

      await fetchSchedules();
    } catch (err) {
      console.error(err);

      alert(
        err?.response?.data?.message ||
          "Could not delete this session."
      );
    }
  };

  // ─────────────────────────────────────────────
  // TOGGLE SESSION
  // ─────────────────────────────────────────────

  const toggleSession = async (id) => {
    if (togglingId) {
      return;
    }

    setTogglingId(id);

    setSchedules((prev) =>
      prev.map((schedule) => ({
        ...schedule,

        sessions: (
          schedule.sessions || []
        ).map((s) =>
          s._id === id
            ? {
                ...s,
                status:
                  s.status === "Active"
                    ? "Inactive"
                    : "Active",
              }
            : s
        ),
      }))
    );

    try {
      await axios.patch(
        `${API_URL}/api/schedules/session/${id}`,
        null,
        {
          headers: authHeaders(),
        }
      );

      await fetchSchedules();
    } catch (err) {
      console.error(err);

      await fetchSchedules();

      alert(
        "Could not update session status. Please try again."
      );
    } finally {
      setTogglingId(null);
    }
  };

  // ─────────────────────────────────────────────
  // DELETE LOCAL SESSION
  // ─────────────────────────────────────────────

  const deleteLocalSession = (index) => {
    setLocalSessions((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ─────────────────────────────────────────────
  // SINGLE CITY TOGGLE
  // ─────────────────────────────────────────────

  const toggleSingleCity = (city) => {
    setSelectedCities((prev) => {
      if (prev.includes(city)) {
        return prev.filter(
          (item) => item !== city
        );
      }

      return [...prev, city];
    });
  };

  // ─────────────────────────────────────────────
  // BULK CITY TOGGLE
  // ─────────────────────────────────────────────

  const toggleBulkCity = (city) => {
    setBulkCities((prev) => {
      if (prev.includes(city)) {
        return prev.filter(
          (item) => item !== city
        );
      }

      return [...prev, city];
    });
  };

  // ─────────────────────────────────────────────
  // SINGLE SESSION FORMIK
  // ─────────────────────────────────────────────

  const formik = useFormik({
    initialValues: {
      date: "",
      sessionType: "General",
      startTime: "",
      endTime: "",
      location: "",
      availableSlots: "",
    },

    onSubmit: (values) => {
      if (!values.date) {
        alert(
          "Please select a date."
        );
        return;
      }

      if (
        selectedCities.length === 0
      ) {
        alert(
          "Please select at least one city."
        );
        return;
      }

      if (
        !values.availableSlots
      ) {
        alert(
          "Available slots is required."
        );
        return;
      }

      const session = {
        sessionType:
          values.sessionType,

        startTime:
          values.startTime,

        endTime:
          values.endTime,

        location:
          values.location,

        availableSlots:
          Number(
            values.availableSlots
          ),

        // DATABASE FIELD
        preferredCity: [
          ...selectedCities,
        ],
      };

      console.log(
        "New single session:",
        session
      );

      setLocalSessions((prev) => [
        ...prev,
        {
          date: values.date,
          session,
        },
      ]);

      formik.resetForm();

      // Sydney default for next session
      setSelectedCities([
        "Sydney",
      ]);
    },
  });

  // ─────────────────────────────────────────────
  // BULK FORMIK
  // ─────────────────────────────────────────────

  const bulkFormik = useFormik({
    initialValues: {
      startDate: "",
      endDate: "",
      sessionType: "General",
      startTime: "",
      endTime: "",
      location: "Face to Face",
      availableSlots: "",
    },

    onSubmit: (values) => {
      if (
        !values.startDate ||
        !values.endDate
      ) {
        alert(
          "Please select start and end dates."
        );
        return;
      }

      if (
        selectedDays.length === 0
      ) {
        alert(
          "Please select at least one day."
        );
        return;
      }

      if (
        bulkCities.length === 0
      ) {
        alert(
          "Please select at least one city."
        );
        return;
      }

      if (
        !values.availableSlots
      ) {
        alert(
          "Available slots is required."
        );
        return;
      }

      const dates =
        generateDates(
          values.startDate,
          values.endDate,
          selectedDays
        );

      if (dates.length === 0) {
        alert(
          "No dates are available for the selected days."
        );
        return;
      }

      const newSessions =
        dates.map((date) => ({
          date,

          session: {
            sessionType:
              values.sessionType,

            startTime:
              values.startTime,

            endTime:
              values.endTime,

            location:
              values.location,

            availableSlots:
              Number(
                values.availableSlots
              ),

            // DATABASE FIELD
            preferredCity: [
              ...bulkCities,
            ],
          },
        }));

      setLocalSessions((prev) => {
        const merged = [...prev];

        newSessions.forEach((ns) => {
          const exists = merged.some(
            (m) => {
              const oldCities =
                m.session.preferredCity ||
                [];

              const newCities =
                ns.session.preferredCity ||
                [];

              return (
                m.date === ns.date &&
                m.session.startTime ===
                  ns.session.startTime &&
                m.session.endTime ===
                  ns.session.endTime &&
                JSON.stringify(
                  oldCities
                ) ===
                  JSON.stringify(
                    newCities
                  )
              );
            }
          );

          if (!exists) {
            merged.push(ns);
          }
        });

        return merged;
      });

      bulkFormik.resetForm();

      setSelectedDays([]);

      // Sydney default for next bulk session
      setBulkCities(["Sydney"]);
    },
  });

  // ─────────────────────────────────────────────
  // SAVE NEW SESSIONS
  // ─────────────────────────────────────────────

  const saveNewDates = async () => {
    if (
      localSessions.length === 0
    ) {
      return;
    }

    setSaving(true);

    try {
      console.log(
        "========== SAVING NEW SESSIONS =========="
      );

      console.log(
        "Local sessions:",
        localSessions
      );

      await Promise.all(
        localSessions.map(
          ({ date, session }) => {
            const payload = {
              course:
                course._id,

              date,

              session: {
                ...session,

                // DATABASE FIELD
                preferredCity:
                  Array.isArray(
                    session.preferredCity
                  )
                    ? [
                        ...session.preferredCity,
                      ]
                    : [],
              },
            };

            console.log(
              "POST /api/schedules/session payload:",
              payload
            );

            return axios.post(
              `${API_URL}/api/schedules/session`,
              payload,
              {
                headers:
                  jsonAuthHeaders(),
              }
            );
          }
        )
      );

      console.log(
        "========================================="
      );

      setLocalSessions([]);

      await fetchSchedules();
    } catch (err) {
      console.error(
        "Save sessions error:",
        err
      );

      console.error(
        "Save sessions response:",
        err?.response?.data
      );

      alert(
        err?.response?.data
          ?.message ||
          "Could not save the sessions."
      );
    } finally {
      setSaving(false);
    }
  };

  const unsavedCount =
    localSessions.length;

  // ─────────────────────────────────────────────
  // FILTER
  // ─────────────────────────────────────────────

  const sessionTypes = [
    "All",
    "General",
    "Theory",
    "Practical",
    "Exam",
  ];

  const sessionMatchesFilter =
    (session) =>
      filterType === "All" ||
      session.sessionType ===
        filterType;

  const allDates =
    Array.from(
      new Set([
        ...schedules
          .filter((s) =>
            (
              s.sessions || []
            ).some(
              sessionMatchesFilter
            )
          )
          .map((s) =>
            toYMD(s.date)
          ),

        ...localSessions
          .filter((l) =>
            sessionMatchesFilter(
              l.session
            )
          )
          .map(
            (l) => l.date
          ),
      ])
    ).sort();

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <div className="csm-overlay">

      {/* EDIT SESSION MODAL */}

      {editTarget && (
        <EditSessionModal
          session={
            editTarget.session
          }
          scheduleDate={
            editTarget.scheduleDate
          }
          onClose={() =>
            setEditTarget(null)
          }
          onSaved={() => {
            setEditTarget(null);
            fetchSchedules();
          }}
        />
      )}

      <div className="csm-container">

        {/* HEADER */}

        <div className="csm-header">

          <div className="csm-header-icon"></div>

          <div className="csm-header-text">

            <h2 className="csm-title">
              Manage Course Dates
            </h2>

            <p className="csm-subtitle">
              {course?.title}
            </p>

          </div>

          <button
            type="button"
            className="csm-close-btn"
            onClick={close}
          >
            ✕
          </button>

        </div>

        {/* ADD FORM */}

        <div className="csm-form-card">

          <div className="csm-add-header">

            <span className="csm-add-title">
              + Add New Date
            </span>

            <label className="csm-bulk-toggle">

              <input
                type="checkbox"
                checked={bulkMode}
                onChange={(e) => {
                  setBulkMode(
                    e.target.checked
                  );

                  setSelectedDays([]);

                  // Add mode always starts with Sydney
                  setSelectedCities([
                    "Sydney",
                  ]);

                  setBulkCities([
                    "Sydney",
                  ]);
                }}
              />

              <span className="csm-bulk-check"></span>

              Bulk Upload

            </label>

          </div>

          {/* =====================================================
              SINGLE MODE
          ===================================================== */}

          {!bulkMode && (
            <form
              onSubmit={
                formik.handleSubmit
              }
            >

              <div className="csm-grid">

                {/* DATE */}

                <div className="csm-field">

                  <label>
                    Date *
                  </label>

                  <input
                    type="date"
                    name="date"
                    min={todayYMD}
                    value={
                      formik.values
                        .date
                    }
                    onChange={
                      formik.handleChange
                    }
                  />

                </div>

                {/* SESSION TYPE */}

                <div className="csm-field">

                  <label>
                    Session Type
                  </label>

                  <select
                    name="sessionType"
                    value={
                      formik.values
                        .sessionType
                    }
                    onChange={
                      formik.handleChange
                    }
                  >

                    <option>
                      General
                    </option>

                    <option>
                      Theory
                    </option>

                    <option>
                      Practical
                    </option>

                    <option>
                      Exam
                    </option>

                  </select>

                </div>

                {/* START TIME */}

                <div className="csm-field">

                  <label>
                    Start Time
                  </label>

                  <input
                    type="time"
                    name="startTime"
                    value={
                      formik.values
                        .startTime
                    }
                    onChange={
                      formik.handleChange
                    }
                  />

                </div>

                {/* END TIME */}

                <div className="csm-field">

                  <label>
                    End Time
                  </label>

                  <input
                    type="time"
                    name="endTime"
                    min={
                      formik.values
                        .startTime ||
                      undefined
                    }
                    value={
                      formik.values
                        .endTime
                    }
                    onChange={
                      formik.handleChange
                    }
                  />

                </div>

                {/* LOCATION */}

                <div className="csm-field">

                  <label>
                    Location (Optional)
                  </label>

                  <select
                    name="location"
                    value={
                      formik.values
                        .location
                    }
                    onChange={
                      formik.handleChange
                    }
                  >

                    <option value="">
                      Select
                    </option>

                    <option>
                      Online
                    </option>

                    <option>
                      Face to Face
                    </option>

                  </select>

                </div>

                {/* ACTIVE SLOTS */}

                <div className="csm-field">

                  <label>
                    Active Slots *
                  </label>

                  <input
                    type="number"
                    min="1"
                    name="availableSlots"
                    placeholder="e.g., 20"
                    value={
                      formik.values
                        .availableSlots
                    }
                    onChange={
                      formik.handleChange
                    }
                  />

                </div>

                {/* CITY */}

                <div className="csm-field csm-field-full">

                  <label>
                    Preferred City *
                  </label>

                  <div className="csm-city-checkboxes">

                    {CITIES.map(
                      (city) => (
                        <label
                          key={city}
                          className="csm-city-checkbox"
                        >

                          <input
                            type="checkbox"
                            value={city}
                            checked={selectedCities.includes(
                              city
                            )}
                            onChange={() =>
                              toggleSingleCity(
                                city
                              )
                            }
                          />

                          <span>
                            {city}
                          </span>

                        </label>
                      )
                    )}

                  </div>

                  <span className="csm-hint">
                    Sydney is selected by
                    default. You can select
                    multiple cities.
                  </span>

                </div>

                {/* TEACHER */}

                <div className="csm-field csm-field-full">

                  <label>
                    🎓 Assign Teacher
                    (Optional)
                  </label>

                  <input
                    type="text"
                    placeholder="Search teachers by name or email…"
                  />

                  <span className="csm-hint">
                    Search and select a
                    teacher to conduct this
                    session
                  </span>

                </div>

              </div>

              <button
                type="submit"
                className="csm-add-date-btn"
              >
                + Add Date
              </button>

            </form>
          )}

          {/* =====================================================
              BULK MODE
          ===================================================== */}

          {bulkMode && (
            <form
              onSubmit={
                bulkFormik.handleSubmit
              }
            >

              {/* START / END DATE */}

              <div className="csm-grid">

                <div className="csm-field">

                  <label>
                    Start Date *
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    min={todayYMD}
                    value={
                      bulkFormik.values
                        .startDate
                    }
                    onChange={
                      bulkFormik.handleChange
                    }
                  />

                </div>

                <div className="csm-field">

                  <label>
                    End Date *
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    min={
                      bulkFormik.values
                        .startDate ||
                      todayYMD
                    }
                    value={
                      bulkFormik.values
                        .endDate
                    }
                    onChange={
                      bulkFormik.handleChange
                    }
                  />

                </div>

              </div>

              {/* DAYS */}

              <div className="csm-day-picker-wrap">

                <label>
                  Select Days of the Week *
                </label>

                <div className="csm-day-picker">

                  {DAYS.map(
                    (day, idx) => {

                      const rangeActive =
                        bulkFormik.values
                          .startDate &&
                        bulkFormik.values
                          .endDate;

                      const datesForThisDay =
                        rangeActive
                          ? generateDates(
                              bulkFormik
                                .values
                                .startDate,
                              bulkFormik
                                .values
                                .endDate,
                              [idx]
                            )
                          : [1];

                      const disabled =
                        rangeActive &&
                        datesForThisDay.length ===
                          0;

                      return (
                        <button
                          key={day}
                          type="button"
                          disabled={
                            disabled
                          }
                          className={`csm-day-btn ${
                            selectedDays.includes(
                              idx
                            )
                              ? "active"
                              : ""
                          } ${
                            disabled
                              ? "blurred"
                              : ""
                          }`}
                          onClick={() =>
                            setSelectedDays(
                              (prev) =>
                                prev.includes(
                                  idx
                                )
                                  ? prev.filter(
                                      (d) =>
                                        d !==
                                        idx
                                    )
                                  : [
                                      ...prev,
                                      idx,
                                    ]
                            )
                          }
                        >
                          {day}
                        </button>
                      );
                    }
                  )}

                </div>

                <span className="csm-hint">
                  Select the days on which
                  sessions should be scheduled
                </span>

              </div>

              {/* SESSION TYPE */}

              <div className="csm-grid">

                <div className="csm-field">

                  <label>
                    Session Type *
                  </label>

                  <select
                    name="sessionType"
                    value={
                      bulkFormik.values
                        .sessionType
                    }
                    onChange={
                      bulkFormik.handleChange
                    }
                  >

                    <option>
                      General
                    </option>

                    <option>
                      Theory
                    </option>

                    <option>
                      Practical
                    </option>

                    <option>
                      Exam
                    </option>

                  </select>

                </div>

              </div>

              {/* TIME / LOCATION / SLOTS */}

              <div className="csm-grid">

                <div className="csm-field">

                  <label>
                    Start Time
                  </label>

                  <input
                    type="time"
                    name="startTime"
                    value={
                      bulkFormik.values
                        .startTime
                    }
                    onChange={
                      bulkFormik.handleChange
                    }
                  />

                </div>

                <div className="csm-field">

                  <label>
                    End Time
                  </label>

                  <input
                    type="time"
                    name="endTime"
                    value={
                      bulkFormik.values
                        .endTime
                    }
                    onChange={
                      bulkFormik.handleChange
                    }
                  />

                </div>

                <div className="csm-field">

                  <label>
                    Location (Optional)
                  </label>

                  <select
                    name="location"
                    value={
                      bulkFormik.values
                        .location
                    }
                    onChange={
                      bulkFormik.handleChange
                    }
                  >

                    <option value="">
                      Select
                    </option>

                    <option>
                      Online
                    </option>

                    <option>
                      Face to Face
                    </option>

                  </select>

                </div>

                <div className="csm-field">

                  <label>
                    Active Slots *
                  </label>

                  <input
                    type="number"
                    min="1"
                    name="availableSlots"
                    placeholder="e.g., 20"
                    value={
                      bulkFormik.values
                        .availableSlots
                    }
                    onChange={
                      bulkFormik.handleChange
                    }
                  />

                </div>

                {/* CITY */}

                <div className="csm-field csm-field-full">

                  <label>
                    Preferred City *
                  </label>

                  <div className="csm-city-checkboxes">

                    {CITIES.map(
                      (city) => (
                        <label
                          key={city}
                          className="csm-city-checkbox"
                        >

                          <input
                            type="checkbox"
                            value={city}
                            checked={bulkCities.includes(
                              city
                            )}
                            onChange={() =>
                              toggleBulkCity(
                                city
                              )
                            }
                          />

                          <span>
                            {city}
                          </span>

                        </label>
                      )
                    )}

                  </div>

                  <span className="csm-hint">
                    Sydney is selected by
                    default. You can select
                    multiple cities.
                  </span>

                </div>

                {/* TEACHER */}

                <div className="csm-field csm-field-full">

                  <label>
                    🎓 Assign Teacher
                    (Optional)
                  </label>

                  <input
                    type="text"
                    placeholder="Search teachers by name or email…"
                  />

                  <span className="csm-hint">
                    Search and select a
                    teacher to conduct this
                    session
                  </span>

                </div>

              </div>

              <button
                type="submit"
                className="csm-add-date-btn"
              >
                + Add Bulk Dates
              </button>

            </form>
          )}

        </div>

        {/* =====================================================
            SCHEDULE LIST
        ===================================================== */}

        <div className="csm-schedule-section">

          <div className="csm-section-top">

            <h3 className="csm-section-title">

              Scheduled Dates (
              {schedules.length +
                (localSessions.length > 0
                  ? ` +${localSessions.length} unsaved`
                  : "")}
              )

            </h3>

            <div className="csm-filter-row">

              <div className="csm-filter-tabs">

                {sessionTypes.map(
                  (t) => (
                    <button
                      key={t}
                      type="button"
                      className={`csm-filter-tab ${
                        filterType === t
                          ? "active"
                          : ""
                      } ${
                        t === "Exam"
                          ? "exam"
                          : ""
                      }`}
                      onClick={() =>
                        setFilterType(t)
                      }
                    >

                      {t === "Exam" && (
                        <span className="csm-dot green"></span>
                      )}

                      {t}

                    </button>
                  )
                )}

              </div>

            </div>

          </div>

          {allDates.length === 0 && (
            <div className="csm-no-session">
              No session available
            </div>
          )}

          {allDates.map(
            (dateStr) => {

              const backendSchedule =
                schedules.find(
                  (s) =>
                    toYMD(s.date) ===
                    dateStr
                );

              const localForDate =
                localSessions
                  .map(
                    (l, idx) => ({
                      ...l,
                      _localIdx: idx,
                    })
                  )
                  .filter(
                    (l) =>
                      l.date ===
                      dateStr
                  );

              const backendSessions =
                (
                  backendSchedule
                    ?.sessions || []
                ).filter(
                  sessionMatchesFilter
                );

              const localSessionsFiltered =
                localForDate.filter(
                  (l) =>
                    sessionMatchesFilter(
                      l.session
                    )
                );

              if (
                backendSessions.length ===
                  0 &&
                localSessionsFiltered.length ===
                  0
              ) {
                return null;
              }

              const totalSessions =
                backendSessions.length +
                localSessionsFiltered.length;

              return (
                <div
                  key={dateStr}
                  className="csm-date-block"
                >

                  {/* DATE HEADER */}

                  <div className="csm-date-header">

                    <span>

                      <span className="csm-cal-icon"></span>

                      {formatDate(
                        dateStr
                      )}

                    </span>

                    <span className="csm-session-count">
                      {totalSessions}{" "}
                      session available
                    </span>

                    <button
                      type="button"
                      className="csm-add-slot-btn"
                    >
                      + Add slot
                    </button>

                  </div>

                  {/* BACKEND SESSIONS */}

                  {backendSessions.map(
                    (session) => {

                      // IMPORTANT:
                      // Read preferredCity from database
                      const preferredCities =
                        Array.isArray(
                          session.preferredCity
                        )
                          ? session.preferredCity
                          : [];

                      return (
                        <div
                          key={session._id}
                          className={`csm-session-card ${
                            session.status ===
                            "Inactive"
                              ? "csm-session-inactive"
                              : ""
                          }`}
                        >

                          <div className="csm-session-left">

                            <span className="csm-tag">
                              {
                                session.sessionType
                              }
                            </span>

                            <span className="csm-time">
                              ⏱{" "}
                              {
                                session.startTime
                              }{" "}
                              -{" "}
                              {
                                session.endTime
                              }
                            </span>

                            {/* PREFERRED CITY */}

                            {preferredCities.length >
                              0 && (
                              <span className="csm-session-cities">
                                📍{" "}
                                {
                                  preferredCities.join(
                                    ", "
                                  )
                                }
                              </span>
                            )}

                          </div>

                          <div className="csm-avl-slot">

                            {
                              session.availableSlots
                            }

                            <br />

                            <span>
                              Active slots
                            </span>

                          </div>

                          <div className="csm-session-right">

                            <button
                              type="button"
                              className="csm-edit-btn"
                              onClick={() =>
                                setEditTarget({
                                  session,
                                  scheduleDate:
                                    dateStr,
                                })
                              }
                            >
                              Edit
                            </button>

                            <label
                              className={`csm-status-switch ${
                                session.status ===
                                "Active"
                                  ? "is-on"
                                  : ""
                              } ${
                                togglingId ===
                                session._id
                                  ? "is-loading"
                                  : ""
                              }`}
                            >

                              <input
                                type="checkbox"
                                checked={
                                  session.status ===
                                  "Active"
                                }
                                onChange={() =>
                                  toggleSession(
                                    session._id
                                  )
                                }
                                disabled={
                                  togglingId ===
                                  session._id
                                }
                              />

                              <span className="csm-status-slider" />

                              <span className="csm-status-label">

                                {session.status ===
                                "Active"
                                  ? "Active"
                                  : "Deactivate"}

                              </span>

                            </label>

                            <button
                              type="button"
                              className="csm-delete"
                              onClick={() =>
                                deleteSession(
                                  session._id
                                )
                              }
                            >
                              🗑
                            </button>

                          </div>

                        </div>
                      );
                    }
                  )}

                  {/* UNSAVED LOCAL SESSIONS */}

                  {localSessionsFiltered.map(
                    (l) => {

                      const preferredCities =
                        Array.isArray(
                          l.session
                            .preferredCity
                        )
                          ? l.session
                              .preferredCity
                          : [];

                      return (
                        <div
                          key={l._localIdx}
                          className="csm-session-card csm-session-unsaved"
                        >

                          <div className="csm-session-left">

                            <span className="csm-tag">
                              {
                                l.session
                                  .sessionType
                              }
                            </span>

                            <span className="csm-time">
                              ⏱{" "}
                              {
                                l.session
                                  .startTime
                              }{" "}
                              -{" "}
                              {
                                l.session
                                  .endTime
                              }
                            </span>

                            {/* PREFERRED CITY */}

                            {preferredCities.length >
                              0 && (
                              <span className="csm-session-cities">
                                📍{" "}
                                {
                                  preferredCities.join(
                                    ", "
                                  )
                                }
                              </span>
                            )}

                          </div>

                          <div className="csm-avl-slot csm-unsaved-badge">
                            Unsaved
                          </div>

                          <div className="csm-session-right">

                            <button
                              type="button"
                              className="csm-delete"
                              onClick={() =>
                                deleteLocalSession(
                                  l._localIdx
                                )
                              }
                            >
                              🗑
                            </button>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              );
            }
          )}

        </div>

        {/* FOOTER */}

        <div className="csm-footer">

          <button
            type="button"
            className={`csm-save-dates-btn ${
              unsavedCount > 0
                ? "active"
                : ""
            }`}
            onClick={saveNewDates}
            disabled={
              unsavedCount === 0 ||
              saving
            }
          >
            {saving
              ? "Saving..."
              : `Save New Dates (${unsavedCount})`}
          </button>

          <button
            type="button"
            className="csm-cancel-btn"
            onClick={close}
          >
            Close
          </button>

        </div>

      </div>
    </div>
  );
}

export default CourseScheduleModal;