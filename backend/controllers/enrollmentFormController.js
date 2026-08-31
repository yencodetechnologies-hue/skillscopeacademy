const mongoose = require("mongoose");
const EnrollmentForm = require("../models/EnrollmentForm");
const EnrollmentFlow = require("../models/EnrollmentFlows");
const StudentMain = require("../models/student_main");
const cloudinary = require("../config/cloudinary")
const { logAdminActivity } = require("../utils/logAdminActivity")
const { formatScheduleDate } = require("../utils/scheduleLogHelpers")
const {
  buildActivitySubject,
  formatStudentLabel,
} = require("../utils/activityContextHelpers")

/**
 * Keep StudentMain (login + admin lists) in sync when profile section 1 changes email/phone/name.
 * Never throws — duplicate or DB errors are logged; caller always gets { student, emailSyncSkipped }.
 */
async function syncStudentMainFromSection1(studentId, personalDetails) {
  const empty = { student: null, emailSyncSkipped: false };

  if (!studentId || !personalDetails) return empty;

  try {
    const studentObjectId = mongoose.Types.ObjectId.isValid(studentId)
      ? new mongoose.Types.ObjectId(studentId)
      : studentId;

    const updates = {};
    let emailSyncSkipped = false;

    const rawEmail = personalDetails.email ? String(personalDetails.email).trim() : "";
    if (rawEmail) {
      const normalized = rawEmail.toLowerCase();
      const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const currentStudent = await StudentMain.findById(studentObjectId).select("email").lean();
      const emailUnchanged =
        currentStudent?.email &&
        String(currentStudent.email).toLowerCase() === normalized;

      if (!emailUnchanged) {
        const duplicate = await StudentMain.findOne({
          _id: { $ne: studentObjectId },
          email: { $regex: new RegExp("^" + escaped + "$", "i") },
        });

        if (duplicate) {
          emailSyncSkipped = true;
          console.warn(
            `[syncStudentMainFromSection1] Email ${normalized} already used by student ${duplicate._id.toString()}, skipping email sync for student ${studentObjectId.toString()}`
          );
        } else {
          updates.email = normalized;
        }
      }
    }

    const mobile = personalDetails.mobilePhone ? String(personalDetails.mobilePhone).trim() : "";
    if (mobile) updates.phone = mobile;

    const displayName = [personalDetails.givenName, personalDetails.surname]
      .filter(Boolean)
      .map((s) => String(s).trim())
      .join(" ")
      .trim();
    if (displayName) updates.name = displayName;

    if (Object.keys(updates).length === 0) {
      return { student: null, emailSyncSkipped };
    }

    const student = await StudentMain.findByIdAndUpdate(studentObjectId, updates, {
      returnDocument: "after",
    });

    return { student, emailSyncSkipped };
  } catch (err) {
    console.error("[syncStudentMainFromSection1] Sync failed:", err.message);
    return { student: null, emailSyncSkipped: true };
  }
}

function buildStudentDisplayName(data) {
  if (data.studentName && String(data.studentName).trim()) {
    return String(data.studentName).trim()
  }
  const parts = [data.givenName, data.surname].filter(Boolean)
  return parts.join(" ").trim()
}

function buildEnrollmentFormSummary(data, flow) {
  const name = buildStudentDisplayName(data) || "Student"
  const email = data.email ? String(data.email).trim() : ""
  const identity = email ? `${name} (${email})` : name

  const courseName =
    flow?.items?.[0]?.course?.courseName ||
    data.enrolledCourseName ||
    ""

  let sessionPart = ""
  if (flow?.sessionDate) {
    const dateStr = formatScheduleDate(flow.sessionDate)
    const times = [flow.startTime, flow.endTime].filter(Boolean).join("–")
    sessionPart = times ? `, session ${dateStr} ${times}` : `, session ${dateStr}`
  }

  const coursePart = courseName ? ` — ${courseName}${sessionPart}` : ""
  return `Enrollment form submitted: ${identity}${coursePart}`
}

const createEnrollmentForm = async (req, res) => {
  try {
    const data = req.body;
    let { userId, flowId, studentId } = data;

    // ✅ Clean up "null"/"undefined" strings from frontend
    if (userId === "null" || userId === "undefined") userId = null;
    if (flowId === "null" || flowId === "undefined") flowId = null;
    if (studentId === "null" || studentId === "undefined") studentId = null;

    const studentIdToUse = userId || studentId;

    console.log("[EnrollmentForm] createEnrollmentForm called. studentIdToUse:", studentIdToUse, "flowId:", flowId);

    if (!studentIdToUse) {
        return res.status(400).json({ message: "Student ID is missing. Please try logging in again." });
    }

    // Allow "Already uploaded" documents by reusing saved URLs
    const existingForm = await EnrollmentForm.findOne({ studentId: studentIdToUse })
      .select("idDocumentUrl photoDocumentUrl signatureUrl")
      .lean();

    const uploadedIdDocumentUrl = req.files?.idDocument?.[0]?.path || null;
    const uploadedPhotoDocumentUrl = req.files?.photoDocument?.[0]?.path || null;
    const uploadedSignatureUrl = req.files?.signature?.[0]?.path || null;

    const effectiveIdDocumentUrl = uploadedIdDocumentUrl || existingForm?.idDocumentUrl || null;
    const effectivePhotoDocumentUrl = uploadedPhotoDocumentUrl || existingForm?.photoDocumentUrl || null;
    const effectiveSignatureUrl = uploadedSignatureUrl || existingForm?.signatureUrl || null;

    if (!effectiveIdDocumentUrl) {
      return res.status(400).json({ message: "Identification document is required." });
    }
    if (!effectivePhotoDocumentUrl) {
      return res.status(400).json({ message: "Photo is required." });
    }
    if (!effectiveSignatureUrl) {
      return res.status(400).json({ message: "Signature is required." });
    }

    // ✅ Use dot notation for qualifications so evidenceUrls is NOT wiped on final submit
    const updateData = {
      studentId: studentIdToUse,

      personalDetails: {
        title: data.title,
        surname: data.surname,
        givenName: data.givenName,
        middleName: data.middleName,
        preferredName: data.preferredName,
        dob: data.dob,
        gender: data.gender,
        email: data.email,
        homePhone: data.homePhone,
        workPhone: data.workPhone,
        mobilePhone: data.mobilePhone,
      },

      address: {
        residential: {
          address: data.residentialAddress,
          suburb: data.suburb,
          state: data.state,
          postcode: data.postcode,
        },
        postal: {
          address: data.postalAddress,
          suburb: data.postalSuburb,
          state: data.postalState,
          postcode: data.postalPostcode,
        }
      },

      emergencyContact: {
        name: data.emergencyName,
        relationship: data.emergencyRelationship,
        contactNumber: data.emergencyContact,
        consent: data.emergencyPermission === "yes"
      },

      education: {
        highestLevel: data.educationLevel,
        yearCompleted: data.yearCompleted,
        schoolName: data.schoolName,
        schoolState: data.schoolState,
        schoolPostcode: data.schoolPostcode,
        schoolCountry: data.schoolCountry,
      },

      // ✅ dot notation — evidenceUrls array untouched
      "qualifications.hasQualification": data.hasQualifications === "yes" || data.hasQualifications === "true",
      "qualifications.types": Array.isArray(data.qualificationLevels)
        ? data.qualificationLevels
        : [data.qualificationLevels].filter(Boolean),
      "qualifications.details": data.qualificationDetails || "",
      "qualifications.evidenceUrl": data.qualificationFileUrl || null,

      employment: {
        status: data.employmentStatus,
        details: {
          employerName: data.employerName,
          supervisorName: data.supervisorName,
          address: data.workplaceAddress,
          email: data.employerEmail,
          phone: data.employerPhone
        }
      },

      trainingReason: data.trainingReason,

      language: {
        countryOfBirth: data.countryOfBirth,
        otherLanguage: data.otherLanguage,
        speaksOtherLanguage: data.speaksOtherLanguage,
        indigenousStatus: data.indigenousStatus,
      },

      specialNeeds: {
        hasDisability: data.hasDisability === "yes",
        types: data.disabilityTypes,
        other: data.disabilityNotes
      },

      idDocumentUrl: effectiveIdDocumentUrl,
      photoDocumentUrl: effectivePhotoDocumentUrl,
      signatureUrl: effectiveSignatureUrl,

      studentName: data.studentName,
      declarationDate: data.declarationDate,
      enrollment: {
        units: data.enrolledCourseId ? [data.enrolledCourseId] : []
      },
      enrollmentFormCompleted: true,
      enrollmentFormSubmittedAt: new Date(),
      status: "Pending"
    }

    const form = await EnrollmentForm.findOneAndUpdate(
      { studentId: studentIdToUse },
      { $set: updateData },
      { returnDocument: "after", upsert: true }
    )

    // Update EnrollmentFlow as well
    const flowUpdateData = { 
      enrollmentFormId: form._id, 
      currentStep: 5,
      enrollmentStatus: "pending" // Mark as pending until approved by admin
    };
    
    let flow;
    if (flowId && flowId !== "null" && flowId !== "undefined") {
      console.log("[EnrollmentForm] Updating flow by flowId:", flowId);
      flow = await EnrollmentFlow.findByIdAndUpdate(flowId, flowUpdateData, { returnDocument: 'after' });
    } else {
      console.log("[EnrollmentForm] Updating flow by studentId:", studentIdToUse);
      flow = await EnrollmentFlow.findOneAndUpdate(
        { studentId: studentIdToUse },
        flowUpdateData,
        { sort: { createdAt: -1 }, new: true }
      )
    }

    if (!flow) {
      console.warn("[EnrollmentForm] No EnrollmentFlow found to update for student:", studentIdToUse);
    } else {
      console.log("[EnrollmentForm] EnrollmentFlow updated successfully:", flow._id);
    }

    const studentName = buildStudentDisplayName(data)
    const studentEmail = data.email ? String(data.email).trim() : ""
    const subject = await buildActivitySubject({
      studentId: studentIdToUse,
      email: studentEmail,
      name: studentName,
      flowId: flow?._id,
      companyId: flow?.companyId,
    })
    logAdminActivity(req, {
      action: "create",
      module: "enrollment_form",
      summary: buildEnrollmentFormSummary(data, flow),
      targetId: studentIdToUse,
      statusCode: 201,
      metadata: {
        studentId: String(studentIdToUse),
        studentName,
        studentEmail,
        courseName: flow?.items?.[0]?.course?.courseName || "",
        flowId: flow?._id ? String(flow._id) : flowId || null,
        companyId: subject.companyId || "",
        companyName: subject.companyName || "",
      },
      subject,
      performedByOverride: {
        userId: String(studentIdToUse),
        role: "Student",
        name: studentName,
        email: studentEmail,
      },
    })
    res.status(201).json({ message: "Enrollment form submitted successfully" })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
}

const getEnrollmentForms = async (req, res) => {
  try {
    const { studentId } = req.query;
    const query = studentId ? { studentId } : {};
    const forms = await EnrollmentForm.find(query).sort({ createdAt: -1 }).lean();

    const studentIds = [
      ...new Set(
        forms
          .map((f) => f.studentId)
          .filter((id) => id && mongoose.Types.ObjectId.isValid(id))
      ),
    ];

    const objectIds = studentIds.map((id) => new mongoose.Types.ObjectId(id));
    const flows = studentIds.length
      ? await EnrollmentFlow.find({ studentId: { $in: objectIds } })
          .sort({ createdAt: -1 })
          .lean()
      : [];

    const flowMap = {};
    flows.forEach((flow) => {
      const sid = flow.studentId?.toString();
      if (sid && !flowMap[sid]) flowMap[sid] = flow;
    });

    const enriched = forms.map((form) => {
      const flow = flowMap[form.studentId?.toString()] || {};
      const item = flow.items?.[0] || {};
      const courseName = item.course?.courseName || "";

      const courseBookingDate = flow.sessionDate
        ? `${new Date(flow.sessionDate).toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "Australia/Sydney",
          })} | ${flow.startTime || ""} - ${flow.endTime || ""}`
        : "";

      const enrollmentType = flow.enrollmentType
        ? flow.enrollmentType.charAt(0).toUpperCase() +
          flow.enrollmentType.slice(1).toLowerCase()
        : "Individual";

      return {
        ...form,
        courseTitle: courseName,
        courseBookingDate,
        enrollmentType,
      };
    });

    res.status(200).json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching forms" });
  }
};

const updateEnrollmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await EnrollmentForm.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: "after" }
    );

    if (!updated) {
      return res.status(404).json({ message: "Form not found" });
    }

    // ✅ Also sync with EnrollmentFlow based on status
    if (updated.studentId) {
      try {
        const flowStatus = status === "Approved" ? "enrolled" : "pending";
        await EnrollmentFlow.findOneAndUpdate(
          { studentId: updated.studentId },
          { $set: { enrollmentStatus: flowStatus } },
          { sort: { createdAt: -1 } }
        );
        console.log(`[EnrollmentForm] Linked EnrollmentFlow marked as '${flowStatus}' for student:`, updated.studentId);
      } catch (flowErr) {
        console.error("[EnrollmentForm] Error syncing flow status:", flowErr);
      }
    }

    const studentEmail =
      updated.personalDetails?.email ||
      updated.email ||
      "";
    const studentName =
      updated.studentName ||
      buildStudentDisplayName({
        ...(updated.personalDetails || {}),
        studentName: updated.studentName,
      });
    const subject = await buildActivitySubject({
      studentId: updated.studentId,
      email: studentEmail,
      name: studentName,
    });
    const studentLabel = formatStudentLabel(subject.name, subject.email);
    const statusVerb =
      status === "Approved"
        ? "Approved"
        : status === "Rejected"
          ? "Rejected"
          : "Set to Pending";

    logAdminActivity(req, {
      action: "status_change",
      module: "enrollment_form",
      summary: studentLabel
        ? `${statusVerb} enrollment form for ${studentLabel}`
        : `${statusVerb} enrollment form`,
      targetId: updated._id,
      subject,
      metadata: {
        studentId: updated.studentId ? String(updated.studentId) : "",
        studentName: subject.name || studentName,
        studentEmail: subject.email || studentEmail,
        status,
        companyId: subject.companyId || "",
        companyName: subject.companyName || "",
      },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const saveSection = async (req, res) => {
  try {
    let { studentId, section, userId, flowId, ...sectionData } = req.body

    // ✅ Clean up "null"/"undefined" strings from frontend
    if (userId === "null" || userId === "undefined") userId = null;
    if (flowId === "null" || flowId === "undefined") flowId = null;
    if (studentId === "null" || studentId === "undefined") studentId = null;

    const studentIdToUse = userId || studentId;

    console.log("[EnrollmentForm] saveSection called. section:", section, "studentId:", studentIdToUse, "flowId:", flowId);

    if (!studentIdToUse) return res.status(400).json({ message: "studentId required" })

    // ✅ Section 1 may arrive as multipart/form-data (when ID/Photo files are attached
    // from the new upload UI on Section 1), in which case personalDetails/address/
    // emergencyContact travel as JSON strings. When section 1 is sent as plain JSON
    // (no new files chosen), these are already objects — parsing is then a safe no-op.
    const parseIfString = (val) => {
      if (typeof val !== "string") return val
      try { return JSON.parse(val) } catch { return val }
    }
    if (section === "1" || section === 1) {
      sectionData.personalDetails = parseIfString(sectionData.personalDetails)
      sectionData.address = parseIfString(sectionData.address)
      sectionData.emergencyContact = parseIfString(sectionData.emergencyContact)
    }

    let updateFields = {}

    if (section === "1" || section === 1) {
      updateFields = {
        personalDetails: sectionData.personalDetails,
        address: sectionData.address,
        emergencyContact: sectionData.emergencyContact
      }

      // ✅ NEW: ID/Photo documents uploaded from Section 1 (same uploadEnrollment
      // Cloudinary middleware used by createEnrollmentForm / section2-file / section3-file).
      // req.files is only populated for multipart requests, so JSON-only saves
      // (no new file chosen) leave these untouched, as before.
      const idDocumentUrl = req.files?.idDocument?.[0]?.path || null;
      const photoDocumentUrl = req.files?.photoDocument?.[0]?.path || null;
      if (idDocumentUrl) updateFields.idDocumentUrl = idDocumentUrl;
      if (photoDocumentUrl) updateFields.photoDocumentUrl = photoDocumentUrl;
    }

    if (section === "2" || section === 2) {
      updateFields = {
        "usi.number": sectionData.usiNumber,
        "usi.permission": sectionData.usiPermission,
        "usi.staApplication": sectionData.staApplication,
        "usi.staAuthoriseName": sectionData.staAuthoriseName,
        "usi.staConsent": sectionData.staConsent,
        "usi.staTownOfBirth": sectionData.staTownOfBirth,
        "usi.staOverseasTown": sectionData.staOverseasTown,
        "usi.staIdType": sectionData.staIdType,
      }
    }

    if (section === "3" || section === 3) {
      // ✅ dot notation — evidenceUrls array untouched
      updateFields = {
        education: sectionData.education,
        "qualifications.hasQualification": sectionData.qualifications?.hasQualification,
        "qualifications.types": sectionData.qualifications?.types,
        "qualifications.details": sectionData.qualifications?.details || "",
        employment: sectionData.employment,
        trainingReason: sectionData.trainingReason,
        trainingReasonOther: sectionData.trainingReasonOther,
      }
    }

    if (section === "4" || section === 4) {
      updateFields = {
        "language.countryOfBirth": sectionData.language?.countryOfBirth,
        "language.otherLanguage": sectionData.language?.otherLanguage,
        "language.speaksOtherLanguage": sectionData.language?.speaksOtherLanguage,
        "language.indigenousStatus": sectionData.language?.indigenousStatus,
        "language.englishLevel": sectionData.language?.englishLevel,
        specialNeeds: sectionData.specialNeeds,
      }
    }

    const form = await EnrollmentForm.findOneAndUpdate(
      { studentId: studentIdToUse },
      { $set: updateFields },
      { returnDocument: "after", upsert: true }
    )

    let syncedStudent = null
    let studentSyncWarning = null
    if (section === "1" || section === 1) {
      const syncResult = await syncStudentMainFromSection1(
        studentIdToUse,
        sectionData.personalDetails
      )
      syncedStudent = syncResult?.student || null
      if (syncResult?.emailSyncSkipped) {
        studentSyncWarning =
          "Section saved. Your login email was not changed because that address is already used by another account."
      }
    }

    return res.status(200).json({
      message: `Section ${section} saved`,
      form,
      student: syncedStudent
        ? { _id: syncedStudent._id, email: syncedStudent.email, name: syncedStudent.name, phone: syncedStudent.phone }
        : undefined,
      ...(studentSyncWarning ? { studentSyncWarning } : {}),
    })

  } catch (err) {
    console.error("[EnrollmentForm] saveSection error:", err)
    const status = err.statusCode || 500
    res.status(status).json({ message: err.message || "Server error" })
  }
}

const saveSection2File = async (req, res) => {
  try {
    const { studentId } = req.body;
    const staIdFileUrl = req.file?.path || null;

    if (!studentId) return res.status(400).json({ message: "studentId required" });
    if (!staIdFileUrl) return res.status(400).json({ message: "File required" });

    const form = await EnrollmentForm.findOneAndUpdate(
      { studentId },
      { $set: { "usi.staIdFileUrl": staIdFileUrl } },
      { returnDocument: "after", upsert: true }
    );

    res.json({ message: "File uploaded", staIdFileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ FIXED: saveSection3File — per-qualification evidence upload
const saveSection3File = async (req, res) => {
  try {
    const { studentId, qualificationDetails, qualificationLevel } = req.body
    const qualificationFileUrl = req.file?.path || null

    if (!studentId) return res.status(400).json({ message: "studentId required" })

    if (qualificationFileUrl && qualificationLevel) {
      // Step 1: Pull existing entry for this level
      await EnrollmentForm.findOneAndUpdate(
        { studentId },
        {
          $set: { "qualifications.details": qualificationDetails || "" },
          $pull: { "qualifications.evidenceUrls": { level: qualificationLevel } }
        },
        { upsert: true }
      )

      // Step 2: Push new entry for this level
      await EnrollmentForm.findOneAndUpdate(
        { studentId },
        {
          $push: { "qualifications.evidenceUrls": { level: qualificationLevel, url: qualificationFileUrl } }
        },
        { upsert: true }
      )
    } else {
      // Fallback: just save details (no file or no level)
      await EnrollmentForm.findOneAndUpdate(
        { studentId },
        { $set: { "qualifications.details": qualificationDetails || "" } },
        { upsert: true }
      )
    }

    res.json({
      message: "File saved",
      qualificationFileUrl,
      qualificationLevel
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
}

const deleteSection2File = async (req, res) => {
  try {
    const { studentId, fileUrl } = req.body
    if (!studentId || !fileUrl) return res.status(400).json({ message: "Required" })

    const parts = fileUrl.split("/")
    const filename = parts[parts.length - 1].split(".")[0]
    const publicId = `enrollment-docs/${filename}`

    await cloudinary.uploader.destroy(publicId)

    await EnrollmentForm.findOneAndUpdate(
      { studentId },
      { $set: { "usi.staIdFileUrl": null } }
    )

    res.json({ message: "File deleted" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
}

// ✅ FIXED: deleteSection3File — per-qualification evidence removal
const deleteSection3File = async (req, res) => {
  try {
    const { studentId, fileUrl, qualificationLevel } = req.body
    if (!studentId || !fileUrl) return res.status(400).json({ message: "Required" })

    const parts = fileUrl.split("/")
    const filename = parts[parts.length - 1].split(".")[0]
    const publicId = `enrollment-docs/${filename}`

    await cloudinary.uploader.destroy(publicId)

    if (qualificationLevel) {
      await EnrollmentForm.findOneAndUpdate(
        { studentId },
        { $pull: { "qualifications.evidenceUrls": { level: qualificationLevel } } }
      )
    } else {
      await EnrollmentForm.findOneAndUpdate(
        { studentId },
        { $set: { "qualifications.evidenceUrl": null } }
      )
    }

    res.json({ message: "File deleted" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
}

const deleteSection5File = async (req, res) => {
  try {
    const { studentId, fileUrl, fileType } = req.body
    if (!studentId || !fileUrl) return res.status(400).json({ message: "Required" })

    const parts = fileUrl.split("/")
    const filename = parts[parts.length - 1].split(".")[0]
    const publicId = `enrollment-docs/${filename}`

    await cloudinary.uploader.destroy(publicId)

    const fieldMap = {
      idDocument: "idDocumentUrl",
      photoDocument: "photoDocumentUrl",
      signature: "signatureUrl"
    }

    const field = fieldMap[fileType]
    if (field) {
      await EnrollmentForm.findOneAndUpdate(
        { studentId },
        { $set: { [field]: null } }
      )
    }

    res.json({ message: "File deleted" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
}

const getEnrollmentFormByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ message: "studentId is required" });
    }

    const form = await EnrollmentForm.findOne({ studentId });

    if (!form) {
      // Not an error — just means the student hasn't started/saved anything yet
      return res.status(200).json({ found: false, data: null });
    }

    return res.status(200).json({ found: true, data: form });
  } catch (err) {
    console.error("[getEnrollmentFormByStudentId] Error:", err);
    return res.status(500).json({ message: "Failed to fetch enrollment form" });
  }
};

const getEnrollmentFormById = async (req, res) => {
  console.log("getEnrollmentFormById called with id:", req.params.id)
  try {
    const form = await EnrollmentForm.findById(req.params.id)
    if (!form) return res.status(404).json({ message: "Not found" })
    res.json(form)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const updateReviewedDate = async (req, res) => {
  try {
    const { reviewedAt } = req.body;

    if (!reviewedAt) {
      return res.status(400).json({ message: "reviewedAt date is required" });
    }

    const parsedDate = new Date(reviewedAt);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const updated = await EnrollmentForm.findByIdAndUpdate(
      req.params.id,
      { reviewedAt: parsedDate },
      { returnDocument: "after" }
    );

    if (!updated) {
      return res.status(404).json({ message:"Form not found" });
    }

    logAdminActivity(req, {
      action: "update",
      module: "enrollment_form",
      summary: `Updated reviewed date to ${parsedDate.toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" })}`,
      targetId: updated._id,
      metadata: {
        reviewedAt: parsedDate.toISOString(),
      },
    });

    res.json({ reviewedAt: updated.reviewedAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createEnrollmentForm,
  getEnrollmentForms,
  updateEnrollmentStatus,
  updateReviewedDate,
  saveSection,
  saveSection2File,
  saveSection3File,
  deleteSection2File,
  deleteSection3File,
  deleteSection5File,
  getEnrollmentFormById,
  getEnrollmentFormByStudentId
}