// const EnrollmentFlow = require("../models/EnrollmentFlows");
// const Payment = require("../models/Payment");
// const CourseLink = require("../models/CourseLink");
// const Course = require("../models/Course");
// const Schedule = require("../models/schedule");
// const mongoose = require("mongoose");
// const sendEmail = require("../config/sendEmail");
// const { sendLLNCompletionNotification, sendEnrollmentFormCompletionNotification, formatBookingId } = require("./bookingEmailController");
// const Company = require("../models/Company");
// const EnrollmentLink = require("../models/EnrollmentLink");
// const StudentMain = require("../models/student_main");
// const EnrollmentForm = require("../models/EnrollmentForm");
// const { logAdminActivity } = require("../utils/logAdminActivity");
// const {
//   buildActivitySubject,
//   formatStudentLabel,
//   studentPerformerOverride,
// } = require("../utils/activityContextHelpers");
// const {
//   buildSessionContext,
//   buildBookSummary,
//   contextToMetadata,
//   findSession,
// } = require("../utils/scheduleLogHelpers");

// // ✅ Create new flow
// exports.createFlow = async (req, res) => {
//   try {
//     const {
//       studentId,
//       courseId,
//       courseCategory,
//       courseName,
//       price,
//       enrollmentType,
//       sessionDate,
//       startTime,
//       endTime,
//       sessionId,
//       quantity,
//       paymentMethod,
//       transactionId,
//       ewayTransactionId,
//       slipUrl,
//       companyId,
//       source,
//       sourceToken
//     } = req.body;

//     // For card payments the bank-ref transactionId field is empty;
//     // persist the eWay transaction ID instead.
//     const resolvedTransactionId =
//       paymentMethod === "Card Payment" && ewayTransactionId
//         ? ewayTransactionId
//         : (transactionId || "");

//     const seats = Math.max(Number(quantity) || 1, 1);

//     // Check available slots and decrement atomically
//     if (sessionId && mongoose.Types.ObjectId.isValid(sessionId)) {
//       const scheduleBefore = await Schedule.findOne({ "sessions._id": sessionId });
//       const sessionBefore = scheduleBefore
//         ? findSession(scheduleBefore, sessionId)
//         : null;
//       const slotsBefore = sessionBefore?.availableSlots;

//       const updated = await Schedule.findOneAndUpdate(
//         { "sessions._id": sessionId, "sessions.availableSlots": { $gte: seats } },
//         { $inc: { "sessions.$.availableSlots": -seats } }
//       );
//       if (!updated) {
//         return res.status(400).json({ error: "This session is full or does not have enough available slots." });
//       }

//       if (scheduleBefore && sessionBefore && slotsBefore !== undefined) {
//         const slotsAfter = slotsBefore - seats;
//         const ctx = await buildSessionContext(scheduleBefore, sessionId);
//         if (courseName && !ctx.courseTitle.includes("Unknown")) {
//           ctx.courseTitle = courseName;
//         }
//         const subject = await buildActivitySubject({
//           studentId: studentId && studentId !== "null" && studentId !== "" ? studentId : null,
//           email: req.body.email,
//           name: req.body.name,
//           companyId: companyId || null,
//         });
//         const studentLabel = formatStudentLabel(subject.name, subject.email);
//         let bookSummary = buildBookSummary(ctx, seats, slotsBefore, slotsAfter);
//         if (studentLabel) bookSummary += ` — ${studentLabel}`;
//         const hasAuth = !!req.headers.authorization?.split(" ")[1];
//         logAdminActivity(req, {
//           action: "book",
//           module: "schedule",
//           summary: bookSummary,
//           targetId: sessionId,
//           metadata: contextToMetadata(ctx, {
//             seats,
//             slotsBefore,
//             slotsAfter,
//             studentId: studentId ? String(studentId) : null,
//             studentName: subject.name,
//             studentEmail: subject.email,
//             companyId: subject.companyId,
//             companyName: subject.companyName,
//           }),
//           subject,
//           performedByOverride: studentPerformerOverride(
//             { id: subject.id, name: subject.name, email: subject.email },
//             hasAuth
//           ),
//         });
//       }
//     }

//     // ── Booking Link: look up the CourseLink to get the actual price per person
//     //    and auto-mark payment as success (company already paid in bulk)
//     let resolvedPrice = Number(price) || 0;
//     let resolvedPaymentStatus = "pending";
//     let resolvedMethod = paymentMethod || "";

//     let resolvedCompanyId = companyId || null;

//     if (source === "Booking Link" && sourceToken) {
//       const link = await CourseLink.findOne({ token: sourceToken }).lean();
//       if (link) {
//         const company = await Company.findById(link.companyId).select("payLater").lean()

//         if (company?.payLater) {
//           resolvedPaymentStatus = "pending";
//           resolvedMethod = "Pay Later";
//         } else {
//           resolvedPaymentStatus = "success";   // pre-paid by company
//           resolvedMethod = "Link Ref";
//         }

//         if (!resolvedCompanyId && link.companyId) {
//           resolvedCompanyId = link.companyId;
//         }
//       }
//     }

//     if (source === "Enrollment Link" && sourceToken) {
//       resolvedPaymentStatus = "pending";
//       resolvedMethod = "Pay Later";
//     }

//     if (source === "Company Link" && companyId) {
//       const company = await Company.findById(companyId).select("payLater").lean();
//       if (company?.payLater && resolvedMethod === "Pay Later") {
//         resolvedPaymentStatus = "pending";
//       }
//       // Bank Transfer / Card remain "pending" until admin confirms
//     }

//     // Card payments are charged in real-time via eWay — createFlow is only
//     // called after a successful charge, so mark the payment as success immediately.
//     if (resolvedMethod === "Card Payment") {
//       resolvedPaymentStatus = "success";
//     }

//     // If price is still 0, look up the course's price as fallback
//     if (!resolvedPrice && courseId) {
//       const course = await Course.findById(courseId)
//         .select("pricingType sellingPrice slSinglePrice withExperiencePrice withoutExperiencePrice")
//         .lean();
//       if (course) {
//         if (course.pricingType === "experience") {
//           resolvedPrice = course.withoutExperiencePrice || course.withExperiencePrice || 0;
//         } else if (course.pricingType === "slbl") {
//           resolvedPrice = course.slSinglePrice || course.slblPrice || 0;
//         } else {
//           resolvedPrice = course.sellingPrice || 0;
//         }
//       }
//     }

//     const flowData = {
//       enrollmentType: enrollmentType || "Individual",
//       companyId:      resolvedCompanyId,
//       source:         source || "individual",
//       sourceToken:    sourceToken || "",
//       sessionDate,
//       startTime,
//       endTime,
//       items: [{
//         course: {
//           courseId,
//           price:        resolvedPrice,
//           courseCategory,
//           courseName,
//         },
//         payment: {
//           amount:               resolvedPrice,
//           method:               resolvedMethod,
//           transactionId:        resolvedTransactionId,
//           gatewayTransactionId: paymentMethod === "Card Payment" ? (ewayTransactionId || "") : "",
//           slipUrl:              slipUrl || "",
//           status:               resolvedPaymentStatus,
//         }
//       }],
//       meta: {
//         createdFromIP: req.ip,
//         userAgent:     req.headers["user-agent"]
//       }
//     };

//     // ✅ studentId — individual-ல valid, company-ல null → skip
//     if (studentId && studentId !== "null" && studentId !== "") {
//       flowData.studentId = studentId;

//       const studentIdStr = String(studentId);
//       const existingForm = await EnrollmentForm.findOne({
//         $or: [{ studentId: studentIdStr }, { studentId }],
//       })
//         .select("enrollmentFormCompleted status")
//         .lean();
//       if (existingForm?.enrollmentFormCompleted) {
//         flowData.enrollmentFormId = existingForm._id;
//       }

//       const priorCompletedFlow = await EnrollmentFlow.findOne({
//         studentId,
//         "llnd.status": "completed",
//       })
//         .sort({ createdAt: -1 })
//         .lean();
//       if (priorCompletedFlow?.llnd) {
//         flowData.llnd = priorCompletedFlow.llnd;
//         flowData.currentStep = Math.max(flowData.currentStep || 2, 3);
//       }
//     }

//     console.log("[EnrollmentFlow] Creating flow for student:", studentId, "companyId:", resolvedCompanyId, "source:", source);
//     const flow = await EnrollmentFlow.create(flowData);
//     console.log("[EnrollmentFlow] Flow created successfully:", flow._id);

//     if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
//       await Course.findByIdAndUpdate(courseId, { $inc: { studentsEnrolled: 1 } });
//     }

//     // ✅ If source is Enrollment Link, update the Link's student record with this Booking ID
//     if (source === "Enrollment Link" && sourceToken && mongoose.Types.ObjectId.isValid(sourceToken)) {
//       try {
//         const student = await StudentMain.findById(studentId).lean();
//         if (student) {
//           console.log(`[EnrollmentFlow] Attempting to update EnrollmentLink ${sourceToken} for student ${student.email}`);
//           const updateResult = await EnrollmentLink.updateOne(
//             { _id: sourceToken, "students.email": student.email },
//             { $set: { "students.$.bookingId": flow._id } }
//           );
//           console.log("[EnrollmentFlow] Update Result:", updateResult);
          
//           if (updateResult.matchedCount === 0) {
//             console.warn(`[EnrollmentFlow] No matching student found in EnrollmentLink ${sourceToken} for email ${student.email}`);
//           }
//         } else {
//           console.error(`[EnrollmentFlow] Student not found with ID: ${studentId}`);
//         }
//       } catch (linkErr) {
//         console.error("[EnrollmentFlow] Error updating EnrollmentLink student bookingId:", linkErr);
//       }
//     }

//     res.json(flow);

//   } catch (err) {
//     console.error("createFlow error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };


// // ✅ Add another course
// exports.addCourse = async (req, res) => {
//   try {
//     const { flowId, course } = req.body;

//     await EnrollmentFlow.findByIdAndUpdate(flowId, {
//       $push: {
//         items: {
//           course: {
//             courseId: course.courseId,
//             courseName: course.courseName,
//             price: course.price
//           }
//         }
//       }
//     });

//     res.json({ message: "Course added" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// // ✅ Update payment
// exports.updatePayment = async (req, res) => {
//   try {
//     const { flowId, courseId, payment } = req.body;

//     // ✅ Cloudinary image URL
//     const paymentSlipUrl = req.file ? req.file.path : null;

//     await EnrollmentFlow.updateOne(
//       { _id: flowId, "items.course.courseId": courseId },
//       {
//         $set: {
//           "items.$.payment.status": payment.status,
//           "items.$.payment.paymentId": payment.paymentId,
//           "items.$.payment.amount": payment.amount,
//           "items.$.payment.method": payment.method,
//           "items.$.payment.transactionId": payment.transactionId,
//           "items.$.payment.gatewayTransactionId": payment.gatewayTransactionId || "",
//           "items.$.payment.slipUrl": paymentSlipUrl,
//           "items.$.payment.paidAt": new Date(),
//           currentStep: 2
//         }
//       }
//     );

//     res.json({ message: "Payment updated" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// // ✅ Save LLND
// exports.saveLLND = async (req, res) => {
//   try {
//     const { flowId, ...rest } = req.body; 

//     console.log(`[saveLLND] Attempting to save LLND for flowId: ${flowId}`);

//     if (!flowId) {
//       console.warn("[saveLLND] Flow ID missing in request body");
//       return res.status(400).json({ error: "Flow ID missing" });
//     }

//     if (!mongoose.Types.ObjectId.isValid(flowId)) {
//       console.warn(`[saveLLND] Invalid flowId format: ${flowId}`);
//       return res.status(400).json({ error: "Invalid flowId" });
//     }

//     const existing = await EnrollmentFlow.findById(flowId);

//     if (!existing) {
//       console.warn(`[saveLLND] No flow found with id: ${flowId}`);
//       return res.status(404).json({ error: "Flow not found for id: " + flowId });
//     }

//     const formattedAnswers = Object.entries(rest.answers || {}).flatMap(
//       ([section, answers]) =>
//         Object.entries(answers).map(([key, value]) => ({
//           questionId: `${section}-${key}`,
//           answer: value
//         }))
//     );

//     const updated = await EnrollmentFlow.findByIdAndUpdate(
//       flowId,
//       {
//         $set: {
//           "llnd.answers": formattedAnswers,
//           "llnd.score": Number(rest.percentage) || 0,
//           "llnd.status": "completed",
//           "llnd.summary.total": rest.total,
//           "llnd.summary.correct": rest.correct,
//           "llnd.summary.percentage": Number(rest.percentage),
//           "llnd.summary.sections": rest.sections || [],
//           llndRaw: rest,
//           currentStep: 3
//         }
//       },
//       { returnDocument: "after" }
//     );



//     const subject = await buildActivitySubject({ flowId });
//     const score = updated.llnd?.score || Number(rest.percentage) || 0;
//     const studentLabel = formatStudentLabel(subject.name, subject.email);
//     const hasAuth = !!req.headers.authorization?.split(" ")[1];
//     logAdminActivity(req, {
//       action: "complete",
//       module: "llnd",
//       summary: studentLabel
//         ? `LLND completed: ${studentLabel} — score ${score}%`
//         : `LLND completed — score ${score}%`,
//       targetId: flowId,
//       subject,
//       metadata: {
//         flowId: String(flowId),
//         score,
//         studentId: subject.id || "",
//         studentName: subject.name,
//         studentEmail: subject.email,
//         companyId: subject.companyId || "",
//         companyName: subject.companyName || "",
//       },
//       performedByOverride: studentPerformerOverride(
//         { id: subject.id, name: subject.name, email: subject.email },
//         hasAuth
//       ),
//     });

//     res.json(updated);

//     // ✅ Send Notifications
//     try {
//       const populated = await EnrollmentFlow.findById(flowId).populate("studentId");
//       if (populated && populated.studentId) {
//         const student = populated.studentId;
//         const score = updated.llnd?.score || 0;
//         const isPassed = score >= 66; 
//         const bookingId = formatBookingId(populated._id);

//         const firstItem = populated.items?.[0] || {};
//         const finalTxId = firstItem.payment?.gatewayTransactionId || firstItem.payment?.transactionId || "—";

//         console.log(`[EnrollmentFlow] Triggering LLN email for student: ${student.email} | Score: ${score}%`);
//         await sendLLNCompletionNotification({
//           body: {
//             studentEmail: student.email,
//             studentName: student.name,
//             score: score,
//             isPassed: isPassed,
//             bookingId: bookingId,
//             studentPhone: student.phone || student.mobileNumber || student.mobile || "—",
//             gatewayTransactionId: finalTxId
//           }
//         }, null); 
//         console.log(`[EnrollmentFlow] LLN email trigger sent successfully.`);
//       } else {
//         console.warn("[EnrollmentFlow] Notification skipped: studentId or flow data missing for flow:", flowId);
//       }
//     } catch (emailErr) {
//       console.error("❌ Failed to trigger LLN emails:", emailErr.message);
//     }

//   } catch (err) {
//     console.error("saveLLND error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // exports.updateLLNDDate = async (req, res) => {
// //   try {
// //     const { flowId, newDate } = req.body;
// //     if (!flowId || !newDate) {
// //       return res.status(400).json({ error: "Flow ID and new date are required" });
// //     }

// //     const updated = await EnrollmentFlow.findByIdAndUpdate(
// //       flowId,
// //       { $set: { "llnd.completedAt": new Date(newDate) } },
// //       { returnDocument: 'after' }
// //     );

// //     if (!updated) {
// //       return res.status(404).json({ error: "Flow not found" });
// //     }

// //     res.json({ message: "Date updated successfully", updated });
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // };


// // ✅ Final Enrollment

// exports.updateLLNDDate = async (req, res) => {
//   try {
//     const { flowId, newDate } = req.body;

//     if (!flowId || !newDate) {
//       return res.status(400).json({ error: "Flow ID and new date are required" });
//     }

//     const parsedDate = new Date(newDate);
//     if (isNaN(parsedDate.getTime())) {
//       return res.status(400).json({ error: "Invalid date format" });
//     }

//     const updated = await EnrollmentFlow.findByIdAndUpdate(
//       flowId,
//       { $set: { "llnd.completedAt": parsedDate } },
//       { new: true, runValidators: true }
//     );

//     if (!updated) {
//       return res.status(404).json({ error: "Flow not found" });
//     }

//     return res.json({
//       message: "Date updated successfully",
//       updated
//     });
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };


// exports.completeEnrollment = async (req, res) => {
//   try {
//     const { flowId } = req.body;
//     console.log("[EnrollmentFlow] Completing enrollment for flowId:", flowId);
//     const flow = await EnrollmentFlow.findByIdAndUpdate(flowId, {
//       enrollmentStatus: "enrolled",
//       enrolledAt: new Date(),
//       currentStep: 4 // Note: Some parts of the system might expect 4 or 5
//     }, { returnDocument: 'after' });

//     if (!flow) {
//       console.warn("[EnrollmentFlow] No flow found to complete:", flowId);
//       return res.status(404).json({ message: "Flow not found" });
//     }

//     console.log("[EnrollmentFlow] Enrollment completed successfully for flow:", flow._id);

//     const subject = await buildActivitySubject({ flowId });
//     const studentLabel = formatStudentLabel(subject.name, subject.email);
//     const hasAuth = !!req.headers.authorization?.split(" ")[1];
//     logAdminActivity(req, {
//       action: "complete",
//       module: "enrollment_form",
//       summary: studentLabel
//         ? `Enrollment completed for ${studentLabel}`
//         : "Enrollment flow completed",
//       targetId: flowId,
//       subject,
//       metadata: {
//         flowId: String(flowId),
//         studentId: subject.id || "",
//         studentName: subject.name,
//         studentEmail: subject.email,
//         companyId: subject.companyId || "",
//         companyName: subject.companyName || "",
//       },
//       performedByOverride: studentPerformerOverride(
//         { id: subject.id, name: subject.name, email: subject.email },
//         hasAuth
//       ),
//     });

//     res.json({ message: "Enrollment completed 🎉" });

//     // ✅ Send Notifications
//     try {
//       const populated = await EnrollmentFlow.findById(flowId).populate("studentId");
//       if (populated && populated.studentId) {
//         const student = populated.studentId;
//         const bookingId = formatBookingId(populated._id);
        
//         const firstItem = populated.items?.[0] || {};
//         const finalTxId = firstItem.payment?.gatewayTransactionId || firstItem.payment?.transactionId || "—";

//         console.log(`[EnrollmentFlow] Triggering Enrollment completion email for student: ${student.email}`);
//         await sendEnrollmentFormCompletionNotification({
//           body: {
//             studentEmail: student.email,
//             studentName: student.name,
//             bookingId: bookingId,
//             studentPhone: student.phone || student.mobileNumber || student.mobile || "—",
//             gatewayTransactionId: finalTxId
//           }
//         }, null);
//         console.log(`[EnrollmentFlow] Enrollment email trigger sent successfully.`);
//       } else {
//         console.warn("[EnrollmentFlow] Notification skipped: studentId missing for flow:", flowId);
//       }
//     } catch (emailErr) {
//       console.error("❌ Failed to trigger Enrollment emails:", emailErr.message);
//     }
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// // ✅ Get full flow (resume)
// exports.getFlow = async (req, res) => {
//   try {
//     const { studentId } = req.query;

//     const flow = await EnrollmentFlow.findOne({ studentId })
//       .sort({ createdAt: -1 })
//       .populate("studentId");

//     res.json(flow);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getWeeklyBookings = async (req, res) => {
//   try {
//     const nowSydney = new Date(new Date().toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
//     const dateParam = req.query.date ? new Date(req.query.date) : nowSydney
//     const start = new Date(dateParam)
//     const day = start.getDay()
//     const diff = start.getDate() - day + (day === 0 ? -6 : 1)
//     start.setDate(diff)
//     start.setHours(0, 0, 0, 0)

//     const end = new Date(start)
//     end.setDate(start.getDate() + 6)
//     end.setHours(23, 59, 59, 999)

//     const localDateKey = (d) => {
//       // en-ZA format is YYYY/MM/DD, easy to transform to YYYY-MM-DD
//       const parts = new Intl.DateTimeFormat('en-AU', {
//         year: 'numeric',
//         month: '2-digit',
//         day: '2-digit',
//         timeZone: 'Australia/Sydney'
//       }).formatToParts(d);
//       const y = parts.find(p => p.type === 'year').value;
//       const m = parts.find(p => p.type === 'month').value;
//       const d1 = parts.find(p => p.type === 'day').value;
//       return `${y}-${m}-${d1}`;
//     };

//     const counts = {}
//     for (let i = 0; i < 7; i += 1) {
//       const date = new Date(start)
//       date.setDate(start.getDate() + i)
//       counts[localDateKey(date)] = 0
//     }

//     const flows = await EnrollmentFlow.find({
//       sessionDate: { $gte: start, $lte: end }
//     }).lean()

//     flows.forEach((flow) => {
//       if (!flow.sessionDate) return
//       const key = localDateKey(new Date(flow.sessionDate))
//       if (counts[key] !== undefined) counts[key] += 1
//     })

//     const rangeStartDay = new Intl.DateTimeFormat('en-AU', { day: 'numeric', timeZone: 'Australia/Sydney' }).format(start);
//     const rangeStartMonth = new Intl.DateTimeFormat('en-AU', { month: 'short', timeZone: 'Australia/Sydney' }).format(start);
//     const rangeEndDay = new Intl.DateTimeFormat('en-AU', { day: 'numeric', timeZone: 'Australia/Sydney' }).format(end);
//     const rangeEndMonth = new Intl.DateTimeFormat('en-AU', { month: 'short', timeZone: 'Australia/Sydney' }).format(end);
//     const rangeYear = new Intl.DateTimeFormat('en-AU', { year: 'numeric', timeZone: 'Australia/Sydney' }).format(end);

//     res.json({
//       counts,
//       range: `${rangeStartDay} ${rangeStartMonth} - ${rangeEndDay} ${rangeEndMonth} ${rangeYear}`
//     })
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// // controllers/enrollmentFlowController.js

// // exports.getLLNDResults = async (req, res) => {
// //   try {
// //     const data = await EnrollmentFlow.find({
// //       status: "active",
// //       "llnd.status": "completed"
// //     })
// //       .populate("studentId")
// //       .sort({ "llnd.completedAt": -1, createdAt: -1 })
// //       .lean();

// //     const formatted = data.map((flow) => {
// //       const student = flow.studentId;
// //       const item = flow.items?.[0] || {};

// //       return {
// //         id: flow._id,

// //         date: flow.llnd?.completedAt 
// //           ? new Date(flow.llnd.completedAt).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" }) 
// //           : new Date(flow.createdAt).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" }),

// //         rawDate: flow.llnd?.completedAt || flow.createdAt,

// //         completedDate: flow.llnd?.completedAt 
// //           ? new Date(flow.llnd.completedAt).toLocaleString("en-AU", { 
// //               timeZone: "Australia/Sydney",
// //               year: 'numeric', 
// //               month: '2-digit', 
// //               day: '2-digit', 
// //               hour: '2-digit', 
// //               minute: '2-digit', 
// //               second: '2-digit' 
// //             }) 
// //           : null,

// //         student: student?.name,
// //         email: student?.email,
// //         phone: student?.phone,

// //         course: item.course?.courseName,
// //         bookingDate: new Date(flow.createdAt).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" }),

// //         // 🔥 FIX HERE
// //         type:
// //           student?.enrollmentType === "company"
// //             ? "Company"
// //             : student?.enrollmentType === "agent"
// //             ? "Agent"
// //             : "Individual",

// //         score: flow.llnd?.score || 0,
// //         result: flow.llnd?.status === "completed" ? "Passed" : "Failed",
// //         status: flow.llnd?.status === "completed" ? "Approved" : "Pending",

// //         sections: (flow.llnd?.summary?.sections || []).map(s => ({
// //           name: s.name,
// //           score: s.score,
// //           correct: s.correct || 0,   // ✅ ADD
// //           total: s.total || 0        // ✅ ADD
// //         }))
// //       };
// //     });

// //     res.json(formatted);

// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // };

// exports.getLLNDResults = async (req, res) => {
//   try {
//     const data = await EnrollmentFlow.find({
//       status: "active",
//       "llnd.status": "completed"
//     })
//       .populate("studentId")
//       .sort({ "llnd.completedAt": -1, createdAt: -1 })
//       .lean();

//     const formatted = data.map((flow) => {
//       const student = flow.studentId;
//       const item = flow.items?.[0] || {};
//       const completedAt = flow.llnd?.completedAt || flow.createdAt;

//       return {
//         id: flow._id,
//         _id: flow._id,

//         date: completedAt
//           ? new Date(completedAt).toLocaleDateString("en-AU", {
//               timeZone: "Australia/Sydney"
//             })
//           : null,

//         rawDate: completedAt || null,

//         completedDate: completedAt
//           ? new Date(completedAt).toLocaleString("en-AU", {
//               timeZone: "Australia/Sydney",
//               year: "numeric",
//               month: "2-digit",
//               day: "2-digit",
//               hour: "2-digit",
//               minute: "2-digit",
//               second: "2-digit"
//             })
//           : null,

//         student: student?.name || "",
//         email: student?.email || "",
//         phone: student?.phone || "",

//         course: item.course?.courseName || "",
//         bookingDate: new Date(flow.createdAt).toLocaleDateString("en-AU", {
//           timeZone: "Australia/Sydney"
//         }),

//         type:
//           student?.enrollmentType === "company"
//             ? "Company"
//             : student?.enrollmentType === "agent"
//             ? "Agent"
//             : "Individual",

//         score: flow.llnd?.score || 0,
//         result: flow.llnd?.status === "completed" ? "Passed" : "Failed",
//         status: flow.llnd?.status === "completed" ? "Approved" : "Pending Review",

//         sections: (flow.llnd?.summary?.sections || []).map((s) => ({
//           name: s.name || "",
//           score: s.score || 0,
//           correct: s.correct || 0,
//           total: s.total || 0,
//           status: s.status || ""
//         }))
//       };
//     });

//     return res.json(formatted);
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };

// // ... existing code ...

// exports.getAllPayments = async (req, res) => {
//   try {
//     const [enrollments, gatewayPayments] = await Promise.all([
//       EnrollmentFlow.find({ studentId: { $ne: null } })
//         .populate("studentId", "name email phone mobileNumber mobile")
//         .sort({ createdAt: -1 }),
//       Payment.find({}, "transactionId gatewayTransactionId userId amount")
//     ]);

//     const gatewayMap = {};
//     const fuzzyMap = {}; // cleanPhone_amount -> gatewayId

//     gatewayPayments.forEach(p => {
//       if (p.transactionId) gatewayMap[p.transactionId] = p.gatewayTransactionId;
      
//       // Fallback: match by normalized phone and amount
//       if (p.userId && p.amount) {
//         const cleanPhone = String(p.userId).replace(/\D/g, "");
//         const key = `${cleanPhone}_${p.amount}`;
//         fuzzyMap[key] = p.gatewayTransactionId;
//       }
//     });

//     // Collect all transactionIds that don't yet have a gatewayTransactionId stored
//     const missingTxnIds = [];
//     enrollments.forEach(enroll => {
//       enroll.items.forEach(item => {
//         const p = item.payment;
//         if (p?.transactionId && !p.gatewayTransactionId) {
//           missingTxnIds.push(p.transactionId);
//         }
//       });
//     });

//     // Bulk-fetch gatewayTransactionId from Payment collection for those records
//     if (missingTxnIds.length > 0) {
//       const paymentDocs = await Payment.find(
//         { transactionId: { $in: missingTxnIds } },
//         { transactionId: 1, gatewayTransactionId: 1 }
//       ).lean();
//       paymentDocs.forEach(doc => {
//         if (doc.gatewayTransactionId) {
//           gatewayMap[doc.transactionId] = doc.gatewayTransactionId;
//         }
//       });
//     }

//     let payments = [];
//     let stats = {
//       pending: 0,
//       success: 0,
//       failed: 0,
//       totalAmount: 0
//     };

//     enrollments.forEach(enroll => {
//       if (enroll.enrollmentType && enroll.enrollmentType.toLowerCase() === "agent") {
//         return; // Agent enrollments belong in AgentPayments, not the regular payments queue
//       }

//       const rawPhone = enroll.studentId?.phone || enroll.studentId?.mobileNumber || enroll.studentId?.mobile || "";
//       const cleanStudentPhone = rawPhone.replace(/\D/g, "");

//       enroll.items.forEach(item => {
//         const payment = item.payment;
//         if (!payment) return;

//         const amount = payment.amount || item.course.price || 0;
        
//         // Find gateway ID: 1st by transactionId, 2nd by fuzzy match (normalized phone + amount)
//         let gId = "—";
//         if (payment.transactionId && gatewayMap[payment.transactionId]) {
//           gId = gatewayMap[payment.transactionId];
//         } else if (cleanStudentPhone && amount) {
//           const fKey = `${cleanStudentPhone}_${amount}`;
//           gId = fuzzyMap[fKey] || "—";
//         }

//         payments.push({
//           id: payment.paymentId,
//           enrollmentId: enroll._id,
//           itemId: item._id,
//           createdAt: payment.paidAt || enroll.createdAt,
//           date: payment.paidAt
//             ? new Date(payment.paidAt).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" })
//             : new Date(enroll.createdAt).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" }),
//           sessionDate: enroll.sessionDate
//             ? new Date(enroll.sessionDate).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" })
//             : null,
//           student: enroll.studentId?.name,
//           email: enroll.studentId?.email,

//           course: item.course.courseName,
//           code: item.course.courseId,

//           amount: amount,

//           status: payment.status,
//           transId: payment.transactionId,
//           gatewayTransId: gId,
//           method: payment.method,
//           type: enroll.enrollmentType || "Individual",
//           slipUrl: payment.slipUrl || null,
//           bookingId: formatBookingId(enroll.createdAt || enroll._id),
//         });

//         if (payment.status === "pending" || payment.status === "unpaid") stats.pending++;
        
//         if (payment.status === "success" || payment.status === "completed") {
//           stats.success++;
//           stats.totalAmount += amount;
//         }

//         if (payment.status === "failed") stats.failed++;
//       });
//     });

//     res.json({
//       payments,
//       stats: [
//         { label: "Pending Verification", value: stats.pending, color: "#f39c12" },
//         { label: "Verified Payments", value: stats.success, color: "#27ae60" },
//         { label: "Total Verified Amount", value: `$${stats.totalAmount}`, color: "#8e44ad" }
//       ]
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// exports.updatePaymentStatus = async (req, res) => {
//   try {
//     const { enrollmentId, itemId } = req.params;
//     const { status, reason } = req.body;

//     const enrollment = await EnrollmentFlow.findById(enrollmentId).populate("studentId");

//     if (!enrollment) {
//       return res.status(404).json({ message: "Enrollment not found" });
//     }

//     const item = enrollment.items.id(itemId);

//     if (!item) {
//       return res.status(404).json({ message: "Item not found" });
//     }

//     item.payment.status = status;
//     if (status === "success") {
//       item.payment.paidAt = new Date();
//     }

//     if (status === "failed") {
//       item.payment.rejectionReason = reason;
//     }

//     await enrollment.save();

//     if (status === "success" && enrollment.studentId?.email) {
//       const student = enrollment.studentId;
//       const courseName = item.course?.courseName || "Your Course";
//       const sessionDate = enrollment.sessionDate
//         ? new Date(enrollment.sessionDate).toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Australia/Sydney" })
//         : "To be confirmed";
//       const timeStr = enrollment.startTime && enrollment.endTime
//         ? `${enrollment.startTime} - ${enrollment.endTime}`
//         : "To be confirmed";

//       const credentialsHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
// <body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#333;background-color:#f4f4f4;">
// <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:20px 0;">
// <tr><td align="center">
// <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
// <tr><td style="background:#0d2240;color:#ffffff;padding:24px 30px;text-align:center;border-bottom:4px solid #F5A623;">
//     <h1 style="margin:0;font-size:22px;font-weight:700;">Booking Confirmed!</h1>
// </td></tr>
// <tr><td style="padding:30px;">
//     <p style="margin:0 0 16px;font-size:15px;color:#555;">Dear <strong>${student.name}</strong>,</p>
//     <p style="margin:0 0 24px;font-size:15px;color:#555;">Your payment has been verified and your booking is now <strong>confirmed</strong>. Please find your course details and login credentials below.</p>
//     <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:6px;margin-bottom:24px;border:1px solid #e2e8f0;">
//         <tr><td style="font-size:13px;color:#64748b;width:130px;">Course</td><td style="font-size:14px;font-weight:600;color:#334155;">${courseName}</td></tr>
//         <tr><td style="font-size:13px;color:#64748b;">Date</td><td style="font-size:14px;font-weight:600;color:#334155;">${sessionDate}</td></tr>
//         <tr><td style="font-size:13px;color:#64748b;">Time</td><td style="font-size:14px;font-weight:600;color:#334155;">${timeStr}</td></tr>
//         <tr><td style="font-size:13px;color:#64748b;">Location</td><td style="font-size:14px;font-weight:600;color:#334155;">3/14-16 Marjorie Street, Sefton NSW 2162</td></tr>
//     </table>
//     <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;background-color:#fffbeb;border-radius:8px;border:1px solid #fcd34d;">
//     <tr><td style="padding:20px;">
//         <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:1px;">Your Login Credentials</p>
//         <table width="100%" cellpadding="6" cellspacing="0" border="0" style="font-size:14px;color:#334155;">
//             <tr><td style="width:130px;color:#64748b;">Email</td><td style="font-weight:600;">${student.email}</td></tr>
//             <tr><td style="color:#64748b;">Password</td><td style="font-family:monospace;font-weight:600;font-size:15px;">123456</td></tr>
//         </table>
//         <p style="margin:12px 0 0;font-size:13px;color:#92400e;">Please log in to your student dashboard and complete any pending steps (LLND assessment, enrollment form).</p>
//     </td></tr></table>
//     <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
//     <tr><td style="padding:20px;">
//         <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Contact Details</p>
//         <p style="margin:0 0 4px;font-size:14px;color:#334155;">Office: <a href="mailto:info@safetytrainingacademy.edu.au" style="color:#3b82f6;">info@safetytrainingacademy.edu.au</a></p>
//         <p style="margin:0;font-size:14px;color:#334155;">Business: 1300 976 097 | M: 0483 878 887</p>
//     </td></tr></table>
// </td></tr>
// <tr><td style="padding:20px 30px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
//     <p style="margin:0;font-size:13px;color:#64748b;">Kind regards,<br/><strong style="color:#334155;">Safety Training Academy</strong><br/>Training Team | 1300 976 097</p>
// </td></tr>
// </table></td></tr></table></body></html>`;

//       try {
//         await sendEmail({
//           to: student.email,
//           subject: `Booking Confirmed — ${courseName} | Your Login Details`,
//           html: credentialsHtml,
//         });
//       } catch (emailErr) {
//         console.error("Failed to send verification email:", emailErr.message);
//       }
//     }

//     const student = enrollment.studentId;
//     const studentName = student?.name || student?.email || "student";
//     const studentEmail = student?.email || "";
//     const courseName = item.course?.courseName || "course";
//     const subject = await buildActivitySubject({
//       studentId: student?._id,
//       email: studentEmail,
//       name: student?.name,
//       companyId: enrollment.companyId,
//     });
//     const studentLabel = formatStudentLabel(subject.name || studentName, subject.email || studentEmail);
//     logAdminActivity(req, {
//       action: "status_change",
//       module: "payment",
//       summary: studentLabel
//         ? `Payment ${status} for ${studentLabel} — ${courseName}`
//         : `Payment ${status} for ${studentName} — ${courseName}`,
//       targetId: enrollmentId,
//       subject,
//       metadata: {
//         itemId,
//         status,
//         studentId: subject.id || (student?._id ? String(student._id) : ""),
//         studentName: subject.name || studentName,
//         studentEmail: subject.email || studentEmail,
//         courseName,
//         companyId: subject.companyId || "",
//         companyName: subject.companyName || "",
//       },
//     });
//     res.json({ message: "Payment updated successfully" });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

const EnrollmentFlow = require("../models/EnrollmentFlows");
const Payment = require("../models/Payment");
const CourseLink = require("../models/CourseLink");
const Course = require("../models/Course");
const Schedule = require("../models/schedule");
const mongoose = require("mongoose");
const sendEmail = require("../config/sendEmail");
const { sendLLNCompletionNotification, sendEnrollmentFormCompletionNotification, formatBookingId } = require("./bookingEmailController");
const Company = require("../models/Company");
const EnrollmentLink = require("../models/EnrollmentLink");
const StudentMain = require("../models/student_main");
const EnrollmentForm = require("../models/EnrollmentForm");
const { logAdminActivity } = require("../utils/logAdminActivity");
const {
  buildActivitySubject,
  formatStudentLabel,
  studentPerformerOverride,
} = require("../utils/activityContextHelpers");
const {
  buildSessionContext,
  buildBookSummary,
  contextToMetadata,
  findSession,
} = require("../utils/scheduleLogHelpers");

// ✅ Create new flow
exports.createFlow = async (req, res) => {
  try {
    const {
      studentId,
      courseId,
      courseCategory,
      courseName,
      price,
      enrollmentType,
      sessionDate,
      startTime,
      endTime,
      sessionId,
      quantity,
      paymentMethod,
      transactionId,
      ewayTransactionId,
      slipUrl,
      companyId,
      source,
      sourceToken
    } = req.body;

    // For card payments the bank-ref transactionId field is empty;
    // persist the eWay transaction ID instead.
    const resolvedTransactionId =
      paymentMethod === "Card Payment" && ewayTransactionId
        ? ewayTransactionId
        : (transactionId || "");

    const seats = Math.max(Number(quantity) || 1, 1);

    // Check available slots and decrement atomically
    if (sessionId && mongoose.Types.ObjectId.isValid(sessionId)) {
      const scheduleBefore = await Schedule.findOne({ "sessions._id": sessionId });
      const sessionBefore = scheduleBefore
        ? findSession(scheduleBefore, sessionId)
        : null;
      const slotsBefore = sessionBefore?.availableSlots;

      const updated = await Schedule.findOneAndUpdate(
        { "sessions._id": sessionId, "sessions.availableSlots": { $gte: seats } },
        { $inc: { "sessions.$.availableSlots": -seats } }
      );
      if (!updated) {
        return res.status(400).json({ error: "This session is full or does not have enough available slots." });
      }

      if (scheduleBefore && sessionBefore && slotsBefore !== undefined) {
        const slotsAfter = slotsBefore - seats;
        const ctx = await buildSessionContext(scheduleBefore, sessionId);
        if (courseName && !ctx.courseTitle.includes("Unknown")) {
          ctx.courseTitle = courseName;
        }
        const subject = await buildActivitySubject({
          studentId: studentId && studentId !== "null" && studentId !== "" ? studentId : null,
          email: req.body.email,
          name: req.body.name,
          companyId: companyId || null,
        });
        const studentLabel = formatStudentLabel(subject.name, subject.email);
        let bookSummary = buildBookSummary(ctx, seats, slotsBefore, slotsAfter);
        if (studentLabel) bookSummary += ` — ${studentLabel}`;
        const hasAuth = !!req.headers.authorization?.split(" ")[1];
        logAdminActivity(req, {
          action: "book",
          module: "schedule",
          summary: bookSummary,
          targetId: sessionId,
          metadata: contextToMetadata(ctx, {
            seats,
            slotsBefore,
            slotsAfter,
            studentId: studentId ? String(studentId) : null,
            studentName: subject.name,
            studentEmail: subject.email,
            companyId: subject.companyId,
            companyName: subject.companyName,
          }),
          subject,
          performedByOverride: studentPerformerOverride(
            { id: subject.id, name: subject.name, email: subject.email },
            hasAuth
          ),
        });
      }
    }

    // ── Booking Link: look up the CourseLink to get the actual price per person
    //    and auto-mark payment as success (company already paid in bulk)
    let resolvedPrice = Number(price) || 0;
    let resolvedPaymentStatus = "pending";
    let resolvedMethod = paymentMethod || "";

    let resolvedCompanyId = companyId || null;

    if (source === "Booking Link" && sourceToken) {
      const link = await CourseLink.findOne({ token: sourceToken }).lean();
      if (link) {
        const company = await Company.findById(link.companyId).select("payLater").lean()

        if (company?.payLater) {
          resolvedPaymentStatus = "pending";
          resolvedMethod = "Pay Later";
        } else {
          resolvedPaymentStatus = "success";   // pre-paid by company
          resolvedMethod = "Link Ref";
        }

        if (!resolvedCompanyId && link.companyId) {
          resolvedCompanyId = link.companyId;
        }
      }
    }

    if (source === "Enrollment Link" && sourceToken) {
      resolvedPaymentStatus = "pending";
      resolvedMethod = "Pay Later";
    }

    if (source === "Company Link" && companyId) {
      const company = await Company.findById(companyId).select("payLater").lean();
      if (company?.payLater && resolvedMethod === "Pay Later") {
        resolvedPaymentStatus = "pending";
      }
      // Bank Transfer / Card remain "pending" until admin confirms
    }

    // Card payments are charged in real-time via eWay — createFlow is only
    // called after a successful charge, so mark the payment as success immediately.
    if (resolvedMethod === "Card Payment") {
      resolvedPaymentStatus = "success";
    }

    // If price is still 0, look up the course's price as fallback
    if (!resolvedPrice && courseId) {
      const course = await Course.findById(courseId)
        .select("pricingType sellingPrice slSinglePrice withExperiencePrice withoutExperiencePrice")
        .lean();
      if (course) {
        if (course.pricingType === "experience") {
          resolvedPrice = course.withoutExperiencePrice || course.withExperiencePrice || 0;
        } else if (course.pricingType === "slbl") {
          resolvedPrice = course.slSinglePrice || course.slblPrice || 0;
        } else {
          resolvedPrice = course.sellingPrice || 0;
        }
      }
    }

    const flowData = {
      enrollmentType: enrollmentType || "Individual",
      companyId:      resolvedCompanyId,
      source:         source || "individual",
      sourceToken:    sourceToken || "",
      sessionDate,
      startTime,
      endTime,
      items: [{
        course: {
          courseId,
          price:        resolvedPrice,
          courseCategory,
          courseName,
        },
        payment: {
          amount:               resolvedPrice,
          method:               resolvedMethod,
          transactionId:        resolvedTransactionId,
          gatewayTransactionId: paymentMethod === "Card Payment" ? (ewayTransactionId || "") : "",
          slipUrl:              slipUrl || "",
          status:               resolvedPaymentStatus,
        }
      }],
      meta: {
        createdFromIP: req.ip,
        userAgent:     req.headers["user-agent"]
      }
    };

    // ✅ studentId — individual-ல valid, company-ல null → skip
    if (studentId && studentId !== "null" && studentId !== "") {
      flowData.studentId = studentId;

      const studentIdStr = String(studentId);
      const existingForm = await EnrollmentForm.findOne({
        $or: [{ studentId: studentIdStr }, { studentId }],
      })
        .select("enrollmentFormCompleted status")
        .lean();
      if (existingForm?.enrollmentFormCompleted) {
        flowData.enrollmentFormId = existingForm._id;
      }

      const priorCompletedFlow = await EnrollmentFlow.findOne({
        studentId,
        "llnd.status": "completed",
      })
        .sort({ createdAt: -1 })
        .lean();
      if (priorCompletedFlow?.llnd) {
        flowData.llnd = priorCompletedFlow.llnd;
        flowData.currentStep = Math.max(flowData.currentStep || 2, 3);
      }
    }

    console.log("[EnrollmentFlow] Creating flow for student:", studentId, "companyId:", resolvedCompanyId, "source:", source);
    const flow = await EnrollmentFlow.create(flowData);
    console.log("[EnrollmentFlow] Flow created successfully:", flow._id);

    if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
      await Course.findByIdAndUpdate(courseId, { $inc: { studentsEnrolled: 1 } });
    }

    // ✅ If source is Enrollment Link, update the Link's student record with this Booking ID
    if (source === "Enrollment Link" && sourceToken && mongoose.Types.ObjectId.isValid(sourceToken)) {
      try {
        const student = await StudentMain.findById(studentId).lean();
        if (student) {
          console.log(`[EnrollmentFlow] Attempting to update EnrollmentLink ${sourceToken} for student ${student.email}`);
          const updateResult = await EnrollmentLink.updateOne(
            { _id: sourceToken, "students.email": student.email },
            { $set: { "students.$.bookingId": flow._id } }
          );
          console.log("[EnrollmentFlow] Update Result:", updateResult);
          
          if (updateResult.matchedCount === 0) {
            console.warn(`[EnrollmentFlow] No matching student found in EnrollmentLink ${sourceToken} for email ${student.email}`);
          }
        } else {
          console.error(`[EnrollmentFlow] Student not found with ID: ${studentId}`);
        }
      } catch (linkErr) {
        console.error("[EnrollmentFlow] Error updating EnrollmentLink student bookingId:", linkErr);
      }
    }

    res.json(flow);

  } catch (err) {
    console.error("createFlow error:", err);
    res.status(500).json({ error: err.message });
  }
};


// ✅ Add another course
exports.addCourse = async (req, res) => {
  try {
    const { flowId, course } = req.body;

    await EnrollmentFlow.findByIdAndUpdate(flowId, {
      $push: {
        items: {
          course: {
            courseId: course.courseId,
            courseName: course.courseName,
            price: course.price
          }
        }
      }
    });

    res.json({ message: "Course added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ Update payment
exports.updatePayment = async (req, res) => {
  try {
    const { flowId, courseId, payment } = req.body;

    // ✅ Cloudinary image URL
    const paymentSlipUrl = req.file ? req.file.path : null;

    await EnrollmentFlow.updateOne(
      { _id: flowId, "items.course.courseId": courseId },
      {
        $set: {
          "items.$.payment.status": payment.status,
          "items.$.payment.paymentId": payment.paymentId,
          "items.$.payment.amount": payment.amount,
          "items.$.payment.method": payment.method,
          "items.$.payment.transactionId": payment.transactionId,
          "items.$.payment.gatewayTransactionId": payment.gatewayTransactionId || "",
          "items.$.payment.slipUrl": paymentSlipUrl,
          "items.$.payment.paidAt": new Date(),
          currentStep: 2
        }
      }
    );

    res.json({ message: "Payment updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ Save LLND
exports.saveLLND = async (req, res) => {
  try {
    const { flowId, ...rest } = req.body; 

    console.log(`[saveLLND] Attempting to save LLND for flowId: ${flowId}`);

    if (!flowId) {
      console.warn("[saveLLND] Flow ID missing in request body");
      return res.status(400).json({ error: "Flow ID missing" });
    }

    if (!mongoose.Types.ObjectId.isValid(flowId)) {
      console.warn(`[saveLLND] Invalid flowId format: ${flowId}`);
      return res.status(400).json({ error: "Invalid flowId" });
    }

    const existing = await EnrollmentFlow.findById(flowId);

    if (!existing) {
      console.warn(`[saveLLND] No flow found with id: ${flowId}`);
      return res.status(404).json({ error: "Flow not found for id: " + flowId });
    }

    const formattedAnswers = Object.entries(rest.answers || {}).flatMap(
      ([section, answers]) =>
        Object.entries(answers).map(([key, value]) => ({
          questionId: `${section}-${key}`,
          answer: value
        }))
    );

    const updated = await EnrollmentFlow.findByIdAndUpdate(
      flowId,
      {
        $set: {
          "llnd.answers": formattedAnswers,
          "llnd.score": Number(rest.percentage) || 0,
          "llnd.status": "completed",
          "llnd.summary.total": rest.total,
          "llnd.summary.correct": rest.correct,
          "llnd.summary.percentage": Number(rest.percentage),
          "llnd.summary.sections": rest.sections || [],
          llndRaw: rest,
          currentStep: 3
        }
      },
      { returnDocument: "after" }
    );



    const subject = await buildActivitySubject({ flowId });
    const score = updated.llnd?.score || Number(rest.percentage) || 0;
    const studentLabel = formatStudentLabel(subject.name, subject.email);
    const hasAuth = !!req.headers.authorization?.split(" ")[1];
    logAdminActivity(req, {
      action: "complete",
      module: "llnd",
      summary: studentLabel
        ? `LLND completed: ${studentLabel} — score ${score}%`
        : `LLND completed — score ${score}%`,
      targetId: flowId,
      subject,
      metadata: {
        flowId: String(flowId),
        score,
        studentId: subject.id || "",
        studentName: subject.name,
        studentEmail: subject.email,
        companyId: subject.companyId || "",
        companyName: subject.companyName || "",
      },
      performedByOverride: studentPerformerOverride(
        { id: subject.id, name: subject.name, email: subject.email },
        hasAuth
      ),
    });

    res.json(updated);

    // ✅ Send Notifications
    try {
      const populated = await EnrollmentFlow.findById(flowId).populate("studentId");
      if (populated && populated.studentId) {
        const student = populated.studentId;
        const score = updated.llnd?.score || 0;
        const isPassed = score >= 66; 
        const bookingId = formatBookingId(populated._id);

        const firstItem = populated.items?.[0] || {};
        const finalTxId = firstItem.payment?.gatewayTransactionId || firstItem.payment?.transactionId || "—";

        console.log(`[EnrollmentFlow] Triggering LLN email for student: ${student.email} | Score: ${score}%`);
        await sendLLNCompletionNotification({
          body: {
            studentEmail: student.email,
            studentName: student.name,
            score: score,
            isPassed: isPassed,
            bookingId: bookingId,
            studentPhone: student.phone || student.mobileNumber || student.mobile || "—",
            gatewayTransactionId: finalTxId
          }
        }, null); 
        console.log(`[EnrollmentFlow] LLN email trigger sent successfully.`);
      } else {
        console.warn("[EnrollmentFlow] Notification skipped: studentId or flow data missing for flow:", flowId);
      }
    } catch (emailErr) {
      console.error("❌ Failed to trigger LLN emails:", emailErr.message);
    }

  } catch (err) {
    console.error("saveLLND error:", err);
    res.status(500).json({ error: err.message });
  }
};

// exports.updateLLNDDate = async (req, res) => {
//   try {
//     const { flowId, newDate } = req.body;
//     if (!flowId || !newDate) {
//       return res.status(400).json({ error: "Flow ID and new date are required" });
//     }

//     const updated = await EnrollmentFlow.findByIdAndUpdate(
//       flowId,
//       { $set: { "llnd.completedAt": new Date(newDate) } },
//       { returnDocument: 'after' }
//     );

//     if (!updated) {
//       return res.status(404).json({ error: "Flow not found" });
//     }

//     res.json({ message: "Date updated successfully", updated });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// ✅ Final Enrollment

exports.updateLLNDDate = async (req, res) => {
  try {
    const { flowId, newDate } = req.body;

    if (!flowId || !newDate) {
      return res.status(400).json({ error: "Flow ID and new date are required" });
    }

    const parsedDate = new Date(newDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const updated = await EnrollmentFlow.findByIdAndUpdate(
      flowId,
      { $set: { "llnd.completedAt": parsedDate } },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Flow not found" });
    }

    return res.json({
      message: "Date updated successfully",
      updated
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.completeEnrollment = async (req, res) => {
  try {
    const { flowId } = req.body;
    console.log("[EnrollmentFlow] Completing enrollment for flowId:", flowId);
    const flow = await EnrollmentFlow.findByIdAndUpdate(flowId, {
      enrollmentStatus: "enrolled",
      enrolledAt: new Date(),
      currentStep: 4 // Note: Some parts of the system might expect 4 or 5
    }, { returnDocument: 'after' });

    if (!flow) {
      console.warn("[EnrollmentFlow] No flow found to complete:", flowId);
      return res.status(404).json({ message: "Flow not found" });
    }

    console.log("[EnrollmentFlow] Enrollment completed successfully for flow:", flow._id);

    const subject = await buildActivitySubject({ flowId });
    const studentLabel = formatStudentLabel(subject.name, subject.email);
    const hasAuth = !!req.headers.authorization?.split(" ")[1];
    logAdminActivity(req, {
      action: "complete",
      module: "enrollment_form",
      summary: studentLabel
        ? `Enrollment completed for ${studentLabel}`
        : "Enrollment flow completed",
      targetId: flowId,
      subject,
      metadata: {
        flowId: String(flowId),
        studentId: subject.id || "",
        studentName: subject.name,
        studentEmail: subject.email,
        companyId: subject.companyId || "",
        companyName: subject.companyName || "",
      },
      performedByOverride: studentPerformerOverride(
        { id: subject.id, name: subject.name, email: subject.email },
        hasAuth
      ),
    });

    res.json({ message: "Enrollment completed 🎉" });

    // ✅ Send Notifications
    try {
      const populated = await EnrollmentFlow.findById(flowId).populate("studentId");
      if (populated && populated.studentId) {
        const student = populated.studentId;
        const bookingId = formatBookingId(populated._id);
        
        const firstItem = populated.items?.[0] || {};
        const finalTxId = firstItem.payment?.gatewayTransactionId || firstItem.payment?.transactionId || "—";

        console.log(`[EnrollmentFlow] Triggering Enrollment completion email for student: ${student.email}`);
        await sendEnrollmentFormCompletionNotification({
          body: {
            studentEmail: student.email,
            studentName: student.name,
            bookingId: bookingId,
            studentPhone: student.phone || student.mobileNumber || student.mobile || "—",
            gatewayTransactionId: finalTxId
          }
        }, null);
        console.log(`[EnrollmentFlow] Enrollment email trigger sent successfully.`);
      } else {
        console.warn("[EnrollmentFlow] Notification skipped: studentId missing for flow:", flowId);
      }
    } catch (emailErr) {
      console.error("❌ Failed to trigger Enrollment emails:", emailErr.message);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ Get full flow (resume)
exports.getFlow = async (req, res) => {
  try {
    const { studentId } = req.query;

    const flow = await EnrollmentFlow.findOne({ studentId })
      .sort({ createdAt: -1 })
      .populate("studentId");

    res.json(flow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWeeklyBookings = async (req, res) => {
  try {
    const nowSydney = new Date(new Date().toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
    const dateParam = req.query.date ? new Date(req.query.date) : nowSydney
    const start = new Date(dateParam)
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
    start.setDate(diff)
    start.setHours(0, 0, 0, 0)

    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)

    const localDateKey = (d) => {
      // en-ZA format is YYYY/MM/DD, easy to transform to YYYY-MM-DD
      const parts = new Intl.DateTimeFormat('en-AU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'Australia/Sydney'
      }).formatToParts(d);
      const y = parts.find(p => p.type === 'year').value;
      const m = parts.find(p => p.type === 'month').value;
      const d1 = parts.find(p => p.type === 'day').value;
      return `${y}-${m}-${d1}`;
    };

    const counts = {}
    for (let i = 0; i < 7; i += 1) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      counts[localDateKey(date)] = 0
    }

    const flows = await EnrollmentFlow.find({
      sessionDate: { $gte: start, $lte: end }
    }).lean()

    flows.forEach((flow) => {
      if (!flow.sessionDate) return
      const key = localDateKey(new Date(flow.sessionDate))
      if (counts[key] !== undefined) counts[key] += 1
    })

    const rangeStartDay = new Intl.DateTimeFormat('en-AU', { day: 'numeric', timeZone: 'Australia/Sydney' }).format(start);
    const rangeStartMonth = new Intl.DateTimeFormat('en-AU', { month: 'short', timeZone: 'Australia/Sydney' }).format(start);
    const rangeEndDay = new Intl.DateTimeFormat('en-AU', { day: 'numeric', timeZone: 'Australia/Sydney' }).format(end);
    const rangeEndMonth = new Intl.DateTimeFormat('en-AU', { month: 'short', timeZone: 'Australia/Sydney' }).format(end);
    const rangeYear = new Intl.DateTimeFormat('en-AU', { year: 'numeric', timeZone: 'Australia/Sydney' }).format(end);

    res.json({
      counts,
      range: `${rangeStartDay} ${rangeStartMonth} - ${rangeEndDay} ${rangeEndMonth} ${rangeYear}`
    })
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ Get students booked on a specific date (for dashboard hover modal)
exports.getDailyStudents = async (req, res) => {
  try {
    const { date } = req.query; // expects YYYY-MM-DD
    if (!date) return res.status(400).json({ error: "date query param required" });

    // Build start/end in Sydney timezone boundaries for the given date
    const [year, month, day] = date.split("-").map(Number);
    // Use UTC midnight offsets to capture the full Sydney day
    // Sydney is UTC+10 or UTC+11; use a safe window: T00:00 to T23:59:59 local
    const start = new Date(`${date}T00:00:00+10:00`);
    const end = new Date(`${date}T23:59:59+11:00`);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { sessionDate: { $gte: start, $lte: end } };

    const total = await EnrollmentFlow.countDocuments(query);

    const flows = await EnrollmentFlow.find(query)
      .populate("studentId", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const data = flows.map((flow) => {
      const student = flow.studentId || {};
      return {
        bookingId: formatBookingId(flow._id),
        name: student.name || "—",
        email: student.email || "—",
        phone: student.phone || "—",
        type: flow.enrollmentType || "Individual",
        courseScheduleDate: flow.sessionDate
          ? new Date(flow.sessionDate).toLocaleDateString("en-AU", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Australia/Sydney",
            })
          : "—",
        status: flow.status || "active",
        paymentStatus: flow.items?.[0]?.payment?.status || "—",
      };
    });

    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// controllers/enrollmentFlowController.js

// exports.getLLNDResults = async (req, res) => {
//   try {
//     const data = await EnrollmentFlow.find({
//       status: "active",
//       "llnd.status": "completed"
//     })
//       .populate("studentId")
//       .sort({ "llnd.completedAt": -1, createdAt: -1 })
//       .lean();

//     const formatted = data.map((flow) => {
//       const student = flow.studentId;
//       const item = flow.items?.[0] || {};

//       return {
//         id: flow._id,

//         date: flow.llnd?.completedAt 
//           ? new Date(flow.llnd.completedAt).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" }) 
//           : new Date(flow.createdAt).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" }),

//         rawDate: flow.llnd?.completedAt || flow.createdAt,

//         completedDate: flow.llnd?.completedAt 
//           ? new Date(flow.llnd.completedAt).toLocaleString("en-AU", { 
//               timeZone: "Australia/Sydney",
//               year: 'numeric', 
//               month: '2-digit', 
//               day: '2-digit', 
//               hour: '2-digit', 
//               minute: '2-digit', 
//               second: '2-digit' 
//             }) 
//           : null,

//         student: student?.name,
//         email: student?.email,
//         phone: student?.phone,

//         course: item.course?.courseName,
//         bookingDate: new Date(flow.createdAt).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" }),

//         // 🔥 FIX HERE
//         type:
//           student?.enrollmentType === "company"
//             ? "Company"
//             : student?.enrollmentType === "agent"
//             ? "Agent"
//             : "Individual",

//         score: flow.llnd?.score || 0,
//         result: flow.llnd?.status === "completed" ? "Passed" : "Failed",
//         status: flow.llnd?.status === "completed" ? "Approved" : "Pending",

//         sections: (flow.llnd?.summary?.sections || []).map(s => ({
//           name: s.name,
//           score: s.score,
//           correct: s.correct || 0,   // ✅ ADD
//           total: s.total || 0        // ✅ ADD
//         }))
//       };
//     });

//     res.json(formatted);

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

exports.getLLNDResults = async (req, res) => {
  try {
    const data = await EnrollmentFlow.find({
      status: "active",
      "llnd.status": "completed"
    })
      .populate("studentId")
      .sort({ "llnd.completedAt": -1, createdAt: -1 })
      .lean();

    const formatted = data.map((flow) => {
      const student = flow.studentId;
      const item = flow.items?.[0] || {};
      const completedAt = flow.llnd?.completedAt || flow.createdAt;

      return {
        id: flow._id,
        _id: flow._id,

        date: completedAt
          ? new Date(completedAt).toLocaleDateString("en-AU", {
              timeZone: "Australia/Sydney"
            })
          : null,

        rawDate: completedAt || null,

        completedDate: completedAt
          ? new Date(completedAt).toLocaleString("en-AU", {
              timeZone: "Australia/Sydney",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit"
            })
          : null,

        student: student?.name || "",
        email: student?.email || "",
        phone: student?.phone || "",

        course: item.course?.courseName || "",
        bookingDate: new Date(flow.createdAt).toLocaleDateString("en-AU", {
          timeZone: "Australia/Sydney"
        }),

        type:
          student?.enrollmentType === "company"
            ? "Company"
            : student?.enrollmentType === "agent"
            ? "Agent"
            : "Individual",

        score: flow.llnd?.score || 0,
        result: flow.llnd?.status === "completed" ? "Passed" : "Failed",
        status: flow.llnd?.status === "completed" ? "Approved" : "Pending Review",

        sections: (flow.llnd?.summary?.sections || []).map((s) => ({
          name: s.name || "",
          score: s.score || 0,
          correct: s.correct || 0,
          total: s.total || 0,
          status: s.status || ""
        }))
      };
    });

    return res.json(formatted);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ... existing code ...

exports.getAllPayments = async (req, res) => {
  try {
    const [enrollments, gatewayPayments] = await Promise.all([
      EnrollmentFlow.find({ studentId: { $ne: null } })
        .populate("studentId", "name email phone mobileNumber mobile")
        .sort({ createdAt: -1 }),
      Payment.find({}, "transactionId gatewayTransactionId userId amount")
    ]);

    const gatewayMap = {};
    const fuzzyMap = {}; // cleanPhone_amount -> gatewayId

    gatewayPayments.forEach(p => {
      if (p.transactionId) gatewayMap[p.transactionId] = p.gatewayTransactionId;
      
      // Fallback: match by normalized phone and amount
      if (p.userId && p.amount) {
        const cleanPhone = String(p.userId).replace(/\D/g, "");
        const key = `${cleanPhone}_${p.amount}`;
        fuzzyMap[key] = p.gatewayTransactionId;
      }
    });

    // Collect all transactionIds that don't yet have a gatewayTransactionId stored
    const missingTxnIds = [];
    enrollments.forEach(enroll => {
      enroll.items.forEach(item => {
        const p = item.payment;
        if (p?.transactionId && !p.gatewayTransactionId) {
          missingTxnIds.push(p.transactionId);
        }
      });
    });

    // Bulk-fetch gatewayTransactionId from Payment collection for those records
    if (missingTxnIds.length > 0) {
      const paymentDocs = await Payment.find(
        { transactionId: { $in: missingTxnIds } },
        { transactionId: 1, gatewayTransactionId: 1 }
      ).lean();
      paymentDocs.forEach(doc => {
        if (doc.gatewayTransactionId) {
          gatewayMap[doc.transactionId] = doc.gatewayTransactionId;
        }
      });
    }

    let payments = [];
    let stats = {
      pending: 0,
      success: 0,
      failed: 0,
      totalAmount: 0
    };

    enrollments.forEach(enroll => {
      if (enroll.enrollmentType && enroll.enrollmentType.toLowerCase() === "agent") {
        return; // Agent enrollments belong in AgentPayments, not the regular payments queue
      }

      const rawPhone = enroll.studentId?.phone || enroll.studentId?.mobileNumber || enroll.studentId?.mobile || "";
      const cleanStudentPhone = rawPhone.replace(/\D/g, "");

      enroll.items.forEach(item => {
        const payment = item.payment;
        if (!payment) return;

        const amount = payment.amount || item.course.price || 0;
        
        // Find gateway ID: 1st by transactionId, 2nd by fuzzy match (normalized phone + amount)
        let gId = "—";
        if (payment.transactionId && gatewayMap[payment.transactionId]) {
          gId = gatewayMap[payment.transactionId];
        } else if (cleanStudentPhone && amount) {
          const fKey = `${cleanStudentPhone}_${amount}`;
          gId = fuzzyMap[fKey] || "—";
        }

        payments.push({
          id: payment.paymentId,
          enrollmentId: enroll._id,
          itemId: item._id,
          createdAt: payment.paidAt || enroll.createdAt,
          date: payment.paidAt
            ? new Date(payment.paidAt).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" })
            : new Date(enroll.createdAt).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" }),
          sessionDate: enroll.sessionDate
            ? new Date(enroll.sessionDate).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" })
            : null,
          student: enroll.studentId?.name,
          email: enroll.studentId?.email,

          course: item.course.courseName,
          code: item.course.courseId,

          amount: amount,

          status: payment.status,
          transId: payment.transactionId,
          gatewayTransId: gId,
          method: payment.method,
          type: enroll.enrollmentType || "Individual",
          slipUrl: payment.slipUrl || null,
          bookingId: formatBookingId(enroll.createdAt || enroll._id),
        });

        if (payment.status === "pending" || payment.status === "unpaid") stats.pending++;
        
        if (payment.status === "success" || payment.status === "completed") {
          stats.success++;
          stats.totalAmount += amount;
        }

        if (payment.status === "failed") stats.failed++;
      });
    });

    res.json({
      payments,
      stats: [
        { label: "Pending Verification", value: stats.pending, color: "#f39c12" },
        { label: "Verified Payments", value: stats.success, color: "#27ae60" },
        { label: "Total Verified Amount", value: `$${stats.totalAmount}`, color: "#F5A623" }
      ]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { enrollmentId, itemId } = req.params;
    const { status, reason } = req.body;

    const enrollment = await EnrollmentFlow.findById(enrollmentId).populate("studentId");

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    const item = enrollment.items.id(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.payment.status = status;
    if (status === "success") {
      item.payment.paidAt = new Date();
    }

    if (status === "failed") {
      item.payment.rejectionReason = reason;
    }

    await enrollment.save();

    if (status === "success" && enrollment.studentId?.email) {
      const student = enrollment.studentId;
      const courseName = item.course?.courseName || "Your Course";
      const sessionDate = enrollment.sessionDate
        ? new Date(enrollment.sessionDate).toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Australia/Sydney" })
        : "To be confirmed";
      const timeStr = enrollment.startTime && enrollment.endTime
        ? `${enrollment.startTime} - ${enrollment.endTime}`
        : "To be confirmed";

      const credentialsHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#333;background-color:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:#0d2240;color:#ffffff;padding:24px 30px;text-align:center;border-bottom:4px solid #F5A623;">
    <h1 style="margin:0;font-size:22px;font-weight:700;">Booking Confirmed!</h1>
</td></tr>
<tr><td style="padding:30px;">
    <p style="margin:0 0 16px;font-size:15px;color:#555;">Dear <strong>${student.name}</strong>,</p>
    <p style="margin:0 0 24px;font-size:15px;color:#555;">Your payment has been verified and your booking is now <strong>confirmed</strong>. Please find your course details and login credentials below.</p>
    <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:6px;margin-bottom:24px;border:1px solid #e2e8f0;">
        <tr><td style="font-size:13px;color:#64748b;width:130px;">Course</td><td style="font-size:14px;font-weight:600;color:#334155;">${courseName}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;">Date</td><td style="font-size:14px;font-weight:600;color:#334155;">${sessionDate}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;">Time</td><td style="font-size:14px;font-weight:600;color:#334155;">${timeStr}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;">Location</td><td style="font-size:14px;font-weight:600;color:#334155;">3/14-16 Marjorie Street, Sefton NSW 2162</td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;background-color:#fffbeb;border-radius:8px;border:1px solid #fcd34d;">
    <tr><td style="padding:20px;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:1px;">Your Login Credentials</p>
        <table width="100%" cellpadding="6" cellspacing="0" border="0" style="font-size:14px;color:#334155;">
            <tr><td style="width:130px;color:#64748b;">Email</td><td style="font-weight:600;">${student.email}</td></tr>
            <tr><td style="color:#64748b;">Password</td><td style="font-family:monospace;font-weight:600;font-size:15px;">123456</td></tr>
        </table>
        <p style="margin:12px 0 0;font-size:13px;color:#92400e;">Please log in to your student dashboard and complete any pending steps (LLND assessment, enrollment form).</p>
    </td></tr></table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
    <tr><td style="padding:20px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Contact Details</p>
        <p style="margin:0 0 4px;font-size:14px;color:#334155;">Office: <a href="mailto:info@safetytrainingacademy.edu.au" style="color:#3b82f6;">info@safetytrainingacademy.edu.au</a></p>
        <p style="margin:0;font-size:14px;color:#334155;">Business: 1300 976 097 | M: 0483 878 887</p>
    </td></tr></table>
</td></tr>
<tr><td style="padding:20px 30px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:13px;color:#64748b;">Kind regards,<br/><strong style="color:#334155;">Safety Training Academy</strong><br/>Training Team | 1300 976 097</p>
</td></tr>
</table></td></tr></table></body></html>`;

      try {
        await sendEmail({
          to: student.email,
          subject: `Booking Confirmed — ${courseName} | Your Login Details`,
          html: credentialsHtml,
        });
      } catch (emailErr) {
        console.error("Failed to send verification email:", emailErr.message);
      }
    }

    const student = enrollment.studentId;
    const studentName = student?.name || student?.email || "student";
    const studentEmail = student?.email || "";
    const courseName = item.course?.courseName || "course";
    const subject = await buildActivitySubject({
      studentId: student?._id,
      email: studentEmail,
      name: student?.name,
      companyId: enrollment.companyId,
    });
    const studentLabel = formatStudentLabel(subject.name || studentName, subject.email || studentEmail);
    logAdminActivity(req, {
      action: "status_change",
      module: "payment",
      summary: studentLabel
        ? `Payment ${status} for ${studentLabel} — ${courseName}`
        : `Payment ${status} for ${studentName} — ${courseName}`,
      targetId: enrollmentId,
      subject,
      metadata: {
        itemId,
        status,
        studentId: subject.id || (student?._id ? String(student._id) : ""),
        studentName: subject.name || studentName,
        studentEmail: subject.email || studentEmail,
        courseName,
        companyId: subject.companyId || "",
        companyName: subject.companyName || "",
      },
    });
    res.json({ message: "Payment updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};