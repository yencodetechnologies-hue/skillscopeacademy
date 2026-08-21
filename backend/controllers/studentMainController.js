const StudentMain = require("../models/student_main");
const EnrollmentFlow = require("../models/EnrollmentFlows");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const CompanyPayment = require("../models/CompanyPayment");
const Company = require("../models/Company");
const CourseLink = require("../models/CourseLink");
const Course = require("../models/Course");
const EnrollmentLink = require("../models/EnrollmentLink");
const Schedule = require("../models/schedule");
const LLNDAssessment = require("../models/LLNDAssessment");
const EnrollmentForm = require("../models/EnrollmentForm");
const Payment = require("../models/Payment");
const sendEmail = require("../config/sendEmail");
const { formatBookingId } = require("./bookingEmailController");
const adminBookingTemplate = require("../templates/adminBookingTemplate");
const { logAdminActivity } = require("../utils/logAdminActivity");
const {
  buildActivitySubject,
  formatStudentLabel,
  studentPerformerOverride,
} = require("../utils/activityContextHelpers");

function hasAuthHeader(req) {
  return !!req.headers.authorization?.split(" ")[1];
}

async function logStudentActivity(req, { action, summary, targetId, student, companyId, extraMetadata = {} }) {
  const subject = await buildActivitySubject({
    studentId: student._id || student.id,
    email: student.email,
    name: student.name,
    companyId: companyId || student.companyId,
  });
  logAdminActivity(req, {
    action,
    module: "student",
    summary,
    targetId,
    subject,
    metadata: {
      studentId: String(student._id || student.id || ""),
      studentName: student.name || subject.name || "",
      studentEmail: student.email || subject.email || "",
      companyId: subject.companyId || "",
      companyName: subject.companyName || "",
      ...extraMetadata,
    },
    performedByOverride: studentPerformerOverride(
      {
        id: student._id || student.id,
        name: student.name || subject.name,
        email: student.email || subject.email,
      },
      hasAuthHeader(req)
    ),
  });
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

exports.createStudent = async (req, res) => {
  try {
    const {
      name,
      nickname,
      email,
      phone,
      mobile,
      mobileNumber,
      mobilePhone,
      password,
      courseId,
      sessionId,
      paymentMethod,
      transactionId,
      enrollmentType,
      companyId
    } = req.body;
    const finalPhone = phone || mobile || mobileNumber || mobilePhone || "";
    const data = req.body;
    const normalizedEmail = data.email
      ? String(data.email).toLowerCase().trim()
      : "";
    const paymentSlipUrl = req.file ? req.file.path : null;

    // Server-side payment verification for card payments.
    // If ewayTransactionId is provided it must match a completed Payment record —
    // this prevents registrations being created without a real charge.
    const ewayTransactionId = String(data.ewayTransactionId || "").trim();
    if (data.paymentMethod === "Card Payment" && ewayTransactionId) {
      // Client sends the eWAY gateway ID; internal Payment.transactionId is eway_<timestamp>.
      const payment = await Payment.findOne({
        status: "completed",
        $or: [
          { gatewayTransactionId: ewayTransactionId },
          { transactionId: ewayTransactionId },
        ],
      });
      if (!payment) {
        return res.status(400).json({ message: "Card payment could not be verified. Please contact support." });
      }
    }

    // For card payments the bank-transfer transactionId field is empty;
    // use the eWay transaction ID so it's visible in the admin panel.
    const resolvedTransactionId =
      data.paymentMethod === "Card Payment" && ewayTransactionId
        ? ewayTransactionId
        : (transactionId || "");

    let student = normalizedEmail
      ? await StudentMain.findOne({ email: normalizedEmail })
      : null;
    if (!student && normalizedEmail) {
      const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      student = await StudentMain.findOne({
        email: { $regex: new RegExp("^" + escapedEmail + "$", "i") },
      });
    }

    const rawPassword =
      data.password && data.password.trim() !== ""
        ? data.password
        : "123456";

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    if (!student) {
      student = new StudentMain({
        name: data.name,
        email: normalizedEmail || data.email,
        phone: finalPhone,
        companyId: data.companyId || null,
        enrollmentType: data.enrollmentType || "individual",
        password: hashedPassword,
        courses: [
          {
            courseId: data.courseId,
            sessionId: data.sessionId,
            paymentMethod: data.paymentMethod,
            transactionId: resolvedTransactionId,
            slipUrl: paymentSlipUrl,
            step: 2
          }
        ]
      });
    } else {
      // If a student record already exists (matched by email) and this new
      // enrolment is happening via a company link, attach the company tag —
      // otherwise the student stays "Individual" forever even though they're
      // booking through a company. This also keeps enrollmentType in sync.
      if (data.companyId && !student.companyId) {
        student.companyId = data.companyId;
      }
      if (finalPhone && !student.phone) {
        student.phone = finalPhone;
      }
      if (data.enrollmentType && data.enrollmentType !== student.enrollmentType) {
        // Only escalate to "company"/"agent"; never silently downgrade a
        // company student back to "individual".
        const incoming = String(data.enrollmentType).toLowerCase();
        if (incoming === "company" || incoming === "agent") {
          student.enrollmentType = incoming;
        }
      }

      const alreadyExists = student.courses.find(
        c => c.courseId.toString() === data.courseId
      );
      if (!alreadyExists) {
        student.courses.push({
          courseId: data.courseId,
          sessionId: data.sessionId,
          paymentMethod: data.paymentMethod,
          transactionId: resolvedTransactionId,
          slipUrl: paymentSlipUrl,
          step: 2
        });
      }
    }

    if (normalizedEmail && student.email !== normalizedEmail) {
      student.email = normalizedEmail;
    }

    await student.save();

    if (!data.skipFlow) {
      // ✅ Fetch session details if sessionId is provided
      const course = await Course.findById(data.courseId).lean();
      let sessionData = {};
      if (data.sessionId) {
        const schedule = await Schedule.findOne({ "sessions._id": data.sessionId });
        if (schedule) {
          const session = schedule.sessions.id(data.sessionId);
          if (session) {
            sessionData = {
              sessionDate: schedule.date,
              startTime: session.startTime,
              endTime: session.endTime
            };
          }
        }
      }

    // ✅ Create EnrollmentFlow so the student shows up in the Admin table
    const newFlow = new EnrollmentFlow({
      studentId: student._id,
      enrollmentType: data.enrollmentType || "individual",
      companyId: data.companyId || null,
      source: "Manual Admin Add",
      ...sessionData,
      items: [{
        course: {
          courseId: course?._id,
          courseName: course?.title,
          courseCategory: course?.courseCategory,
          price: course?.sellingPrice || 0
        },
        payment: {
          method: data.paymentMethod || "Bank Transfer",
          status: data.paymentMethod === "Pay Later" ? "unpaid" : "pending",
          transactionId: data.transactionId || `MANUAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          slipUrl: paymentSlipUrl || "",
          amount: course?.sellingPrice || 0
        }
      }],
      status: "active",
      currentStep: 2 // ✅ Start at LLND Assessment (Step 2) for manual admin adds
    });

      await newFlow.save();

      // ✅ Notify Admin via Email
      try {
        const adminMailData = {
          contactName: student.name,
          contactEmail: student.email,
          contactPhone: student.phone || "—",
          courseName: course?.title || "Course",
          courseCode: course?.courseCode || "—",
          courseDate: sessionData.sessionDate ? new Date(sessionData.sessionDate).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: "Australia/Sydney" }) : "—",
          courseTime: (sessionData.startTime && sessionData.endTime) ? `${sessionData.startTime} - ${sessionData.endTime}` : "—",
          venue: "15/3 Lancaster Street Ingleburn NSW 2565",
          bookingId: formatBookingId(newFlow._id),
          submittedAt: new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Australia/Sydney" }),
          paymentMethod: data.paymentMethod || "Manual",
          transactionId: data.transactionId || "", 
          totalAmount: course?.sellingPrice ? Number(course.sellingPrice).toFixed(2) : "0.00"
        };

        if (process.env.BOOKINGS_EMAIL) {
          await sendEmail({
            to: process.env.BOOKINGS_EMAIL,
            subject: `Admin Manual Booking - ${student.name} - ${course?.title}`,
            html: adminBookingTemplate(adminMailData)
          });
        }
      } catch (emailErr) {
        console.error("Admin notification email failed:", emailErr.message);
      }
    }

    await logStudentActivity(req, {
      action: "create",
      summary: `Added student: ${formatStudentLabel(student.name, student.email)}`,
      targetId: student._id,
      student,
      companyId: data.companyId || student.companyId,
    });
    res.json(student);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStudentCourse = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    const student = await StudentMain.findOneAndUpdate(
      {
        _id: studentId,
        "courses.courseId": new mongoose.Types.ObjectId(courseId)
      },
      {
        $set: {
          "courses.$.paymentMethod": req.body.paymentMethod,
          "courses.$.transactionId": req.body.transactionId,
          "courses.$.status": "completed",
          "courses.$.step": 4
        }
      },
      { returnDocument: "after" }
    );

    if (!student) {
      return res.status(404).json({ message: "Course not found" });
    }

    await logStudentActivity(req, {
      action: "update",
      summary: `Updated student course payment for ${formatStudentLabel(student.name, student.email)}`,
      targetId: student._id,
      student,
    });
    res.json(student);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await StudentMain.findById(id).lean();
    if (!student) return res.status(404).json({ message: "Student not found" });

    const courses = student.courses || [];
    const total = courses.length;
    const completed = courses.filter(c => c.status === "completed").length;
    const active = courses.filter(c =>
      c.status !== "completed" && c.status !== "cancelled"
    ).length;
    const certificates = completed;

    res.json({
      ...student,
      stats: { total, active, completed, certificates }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await StudentMain.findByIdAndUpdate(
      id,
      req.body,
      { returnDocument: "after" }
    );
    if (updated) {
      await logStudentActivity(req, {
        action: "update",
        summary: `Updated student: ${formatStudentLabel(updated.name, updated.email)}`,
        targetId: updated._id,
        student: updated,
      });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// exports.getAllStudents = async (req, res) => {
//   try {
//     const data = await EnrollmentFlow.find({
//       studentId: { $ne: null }
//     })
//       .populate("studentId")
//       .sort({ createdAt: -1 })
//       .lean();

//     const formatted = await Promise.all(data.map(async (flow) => {
//       const student = flow.studentId || {};
//       const item = flow.items?.[0] || {};

//       // The flow itself is the source of truth for which company an enrolment
//       // belongs to (the booking link / company link writes this). We prefer
//       // flow.companyId over student.companyId so the student card shows the
//       // company even when the student record was created earlier without a
//       // company tag (e.g. they first registered as an individual and later
//       // enrolled via a company link).
//       const resolvedCompanyId = flow.companyId || student.companyId;
//       let companyName = "";
//       if (resolvedCompanyId) {
//         try {
//           const company = await Company.findById(resolvedCompanyId).lean();
//           companyName = company?.name || company?.companyName || "";
//         } catch (e) {}
//       }

//       let agentName = "";
//       let linkName = "";
//       if (flow.source === "Enrollment Link" && flow.sourceToken) {
//         try {
//           const link = await EnrollmentLink.findById(flow.sourceToken).lean();
//           if (link?.agent) {
//             agentName = link?.name || "";
//           } else {
//             linkName = link?.name || "";
//           }
//         } catch (e) {}
//       }

//       let formStatus = "Not Started";
//       let formId = null;
//       if (flow.enrollmentFormId) {
//         try {
//           const form = await EnrollmentForm.findById(flow.enrollmentFormId).select("status").lean();
//           if (form) {
//             formStatus = form.status || "Pending";
//             formId = form._id;
//           }
//         } catch (e) {}
//       } else if (student._id) {
//         try {
//           const form = await EnrollmentForm.findOne({ studentId: student._id.toString() }).select("status").lean();
//           if (form) {
//             formStatus = form.status || "Pending";
//             formId = form._id;
//           }
//         } catch (e) {}
//       }

//       return {
//         id: student._id,
//         flowId: flow._id,
//         registerDate: flow.createdAt
//           ? new Date(flow.createdAt).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" })
//           : "—",
//         registerTime: flow.createdAt
//           ? new Date(flow.createdAt).toLocaleTimeString("en-AU", { 
//               timeZone: "Australia/Sydney", 
//               hour: '2-digit', 
//               minute: '2-digit', 
//               hour12: true 
//             })
//           : "",
//         name: student.name || "",
//         email: student.email || "",
//         phone: student.phone || "",
//         type: flow.enrollmentType
//           ? flow.enrollmentType.charAt(0).toUpperCase() + flow.enrollmentType.slice(1)
//           : "Individual",
//         companyName,
//         agentName,
//         linkName,
//         courseCategory: item.course?.courseCategory || "",
//         courseTitle: item.course?.courseName || "",
//         course: item.course?.courseName || "",
//         paymentMethod: item.payment?.method || "—",
//         transactionId: item.payment?.transactionId || "—",
//         slipUrl: item.payment?.slipUrl || "—",
//         courseBookingDate: flow.sessionDate
//           ? `${new Date(flow.sessionDate).toLocaleDateString("en-AU", {
//               day: "numeric", month: "short", year: "numeric", timeZone: "Australia/Sydney"
//             })} | ${flow.startTime} - ${flow.endTime}`
//           : "-",
//         llndStatus: flow.llnd?.status === "completed" ? "Completed" : "Not Completed",
//         enrollmentForm: flow.enrollmentFormId ? "Completed" : "Not Completed",
//         enrollmentFormId: formId,
//         enrollmentFormStatus: formStatus,
//         paymentStatus: item.payment?.method === "Card Payment"
//           ? (item.payment?.status === "success" || item.payment?.status === "completed") ? "Paid" : "Unpaid"
//           : item.payment?.method === "Bank Transfer"
//             ? item.payment?.status === "success" ? "Verified" : "Not Verified"
//             : item.payment?.method === "Pay Later"
//               ? "Unpaid"
//               : "—",
//         status: flow.status === "active" ? "Active" : "Inactive",
//         lastLogin: student.lastLogin || "Never",
//         bookingId: formatBookingId(flow.createdAt || flow._id),
//       };
//     }));

//     res.json(formatted);
//   } catch (err) {
//     console.error("ERROR:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

exports.getAllStudents = async (req, res) => {
  try {
    // ============================================
    // PAGINATION
    // ============================================
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search || "").trim();
    const statusFilter = (req.query.status || "").trim();

    // ============================================
    // PREFERRED CITY FILTER
    // ============================================
    const preferredCityFilter = (
      req.query.preferredCity || ""
    ).trim();

    console.log("======================================");
    console.log("GET ALL STUDENTS");
    console.log("Page:", page);
    console.log("Limit:", limit);
    console.log("Search:", search);
    console.log("Status:", statusFilter);
    console.log("Preferred City:", preferredCityFilter);
    console.log("======================================");

    // ============================================
    // FLOW QUERY
    // ============================================
    const flowQuery = {
      studentId: { $ne: null },
    };

    // ============================================
    // STATUS FILTER
    // ============================================
    if (statusFilter === "Active") {
      flowQuery.status = "active";
    }

    if (statusFilter === "Inactive") {
      flowQuery.status = "inactive";
    }

    // ============================================
    // SEARCH
    // ============================================
    if (search) {
      const regex = new RegExp(
        escapeRegex(search),
        "i"
      );

      const matchingStudents =
        await StudentMain.find({
          $or: [
            { name: regex },
            { email: regex },
            { phone: regex },
          ],
        })
          .select("_id")
          .lean();

      if (matchingStudents.length === 0) {
        return res.json({
          data: [],
          total: 0,
          page,
          totalPages: 0,
        });
      }

      const studentIds = [
        ...new Set(
          matchingStudents.flatMap((student) => {
            const id = student._id;
            const idString = String(id);

            if (
              mongoose.Types.ObjectId.isValid(
                idString
              )
            ) {
              return [
                id,
                new mongoose.Types.ObjectId(
                  idString
                ),
                idString,
              ];
            }

            return [
              id,
              idString,
            ];
          })
        ),
      ];

      flowQuery.studentId = {
        $in: studentIds,
      };
    }

    // ============================================
    // FETCH FLOWS
    // ============================================
    const allFlows =
      await EnrollmentFlow.find(flowQuery)
        .populate(
          "studentId",
          "name email phone lastLogin companyId"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    console.log(
      "Flows before preferred city filter:",
      allFlows.length
    );

    // ============================================
    // COLLECT IDS
    // ============================================
    const companyIds = new Set();
    const linkIds = new Set();
    const formIds = new Set();

    const paymentTransactionIds = new Set();
    const paymentGatewayTransactionIds =
      new Set();

    // ============================================
    // LOOP FLOWS
    // ============================================
    allFlows.forEach((flow) => {
      const student = flow.studentId || {};

      // ==========================================
      // COMPANY
      // ==========================================
      const resolvedCompanyId =
        flow.companyId ||
        student.companyId;

      if (
        resolvedCompanyId &&
        mongoose.Types.ObjectId.isValid(
          resolvedCompanyId
        )
      ) {
        companyIds.add(
          String(resolvedCompanyId)
        );
      }

      // ==========================================
      // ENROLLMENT LINK
      // ==========================================
      if (
        flow.source === "Enrollment Link" &&
        flow.sourceToken &&
        mongoose.Types.ObjectId.isValid(
          flow.sourceToken
        )
      ) {
        linkIds.add(
          String(flow.sourceToken)
        );
      }

      // ==========================================
      // ENROLLMENT FORM
      // ==========================================
      if (
        flow.enrollmentFormId &&
        mongoose.Types.ObjectId.isValid(
          flow.enrollmentFormId
        )
      ) {
        formIds.add(
          String(flow.enrollmentFormId)
        );
      }

      // ==========================================
      // PAYMENT IDS
      // ==========================================
      const item =
        flow.items?.[0] || {};

      const payment =
        item.payment || {};

      if (payment.transactionId) {
        paymentTransactionIds.add(
          String(
            payment.transactionId
          )
        );
      }

      if (
        payment.gatewayTransactionId
      ) {
        paymentGatewayTransactionIds.add(
          String(
            payment.gatewayTransactionId
          )
        );
      }
    });

    // ============================================
    // BULK FETCH
    // ============================================
    const [
      companies,
      links,
      forms,
      paymentsByTransaction,
      paymentsByGateway,
    ] = await Promise.all([
      // ==========================================
      // COMPANY
      // ==========================================
      Company.find({
        _id: {
          $in: [...companyIds],
        },
      }).lean(),

      // ==========================================
      // ENROLLMENT LINKS
      // ==========================================
      EnrollmentLink.find({
        _id: {
          $in: [...linkIds],
        },
      }).lean(),

      // ==========================================
      // ENROLLMENT FORMS
      // ==========================================
      EnrollmentForm.find({
        _id: {
          $in: [...formIds],
        },
      })
        .select("status")
        .lean(),

      // ==========================================
      // PAYMENT BY TRANSACTION ID
      // ==========================================
      Payment.find({
        transactionId: {
          $in: [
            ...paymentTransactionIds,
          ],
        },
      }).lean(),

      // ==========================================
      // PAYMENT BY GATEWAY TRANSACTION ID
      // ==========================================
      Payment.find({
        gatewayTransactionId: {
          $in: [
            ...paymentGatewayTransactionIds,
          ],
        },
      }).lean(),
    ]);

    // ============================================
    // COMPANY MAP
    // ============================================
    const companyMap =
      Object.fromEntries(
        companies.map((company) => [
          String(company._id),
          company,
        ])
      );

    // ============================================
    // LINK MAP
    // ============================================
    const linkMap =
      Object.fromEntries(
        links.map((link) => [
          String(link._id),
          link,
        ])
      );

    // ============================================
    // FORM MAP
    // ============================================
    const formMap =
      Object.fromEntries(
        forms.map((form) => [
          String(form._id),
          form,
        ])
      );

    // ============================================
    // PAYMENT TRANSACTION MAP
    // ============================================
    const paymentTransactionMap =
      Object.fromEntries(
        paymentsByTransaction.map(
          (payment) => [
            String(
              payment.transactionId
            ),
            payment,
          ]
        )
      );

    // ============================================
    // PAYMENT GATEWAY MAP
    // ============================================
    const paymentGatewayMap =
      Object.fromEntries(
        paymentsByGateway.map(
          (payment) => [
            String(
              payment.gatewayTransactionId
            ),
            payment,
          ]
        )
      );

    // ============================================
    // FILTER BY PREFERRED CITY
    // ============================================
    let filteredFlows = allFlows;

    if (preferredCityFilter) {
      filteredFlows =
        allFlows.filter((flow) => {
          const item =
            flow.items?.[0] || {};

          const flowPayment =
            item.payment || {};

          let paymentRecord = null;

          // ========================================
          // FIRST: GATEWAY TRANSACTION ID
          // ========================================
          if (
            flowPayment.gatewayTransactionId
          ) {
            paymentRecord =
              paymentGatewayMap[
                String(
                  flowPayment.gatewayTransactionId
                )
              ];
          }

          // ========================================
          // SECOND: TRANSACTION ID
          // ========================================
          if (
            !paymentRecord &&
            flowPayment.transactionId
          ) {
            paymentRecord =
              paymentTransactionMap[
                String(
                  flowPayment.transactionId
                )
              ];
          }

          // ========================================
          // PAYMENT.PREFERRED CITY
          // ========================================
          const paymentPreferredCity =
            paymentRecord?.preferredCity
              ?.toString()
              .trim() || "";

          const selectedCity =
            preferredCityFilter
              .toString()
              .trim();

          const isMatch =
            paymentPreferredCity.toLowerCase() ===
            selectedCity.toLowerCase();

          console.log(
            "Preferred City Check:",
            {
              flowId:
                String(flow._id),

              studentId:
                flow.studentId?._id
                  ? String(
                      flow.studentId._id
                    )
                  : "",

              studentName:
                flow.studentId?.name ||
                "",

              transactionId:
                flowPayment.transactionId ||
                "",

              gatewayTransactionId:
                flowPayment.gatewayTransactionId ||
                "",

              paymentPreferredCity,

              paymentCreatedAt:
                paymentRecord?.createdAt ||
                null,

              selectedCity,

              isMatch,
            }
          );

          return isMatch;
        });
    }

    // ============================================
    // TOTAL AFTER CITY FILTER
    // ============================================
    const total =
      filteredFlows.length;

    // ============================================
    // PAGINATION
    // ============================================
    const data =
      filteredFlows.slice(
        skip,
        skip + limit
      );

    console.log(
      "Flows after preferred city filter:",
      total
    );

    console.log(
      "Flows returned:",
      data.length
    );

    // ============================================
    // FORMAT RESPONSE
    // ============================================
    const formatted =
      data.map((flow) => {
        const student =
          flow.studentId || {};

        const item =
          flow.items?.[0] || {};

        const flowPayment =
          item.payment || {};

        // ========================================
        // COMPANY
        // ========================================
        const resolvedCompanyId = (
          flow.companyId ||
          student.companyId ||
          ""
        ).toString();

        const company =
          companyMap[
            resolvedCompanyId
          ];

        const companyName =
          company?.name ||
          company?.companyName ||
          "";

        // ========================================
        // LINK / AGENT
        // ========================================
        const link =
          linkMap[
            flow.sourceToken?.toString()
          ];

        let agentName = "";
        let linkName = "";

        if (
          flow.source ===
            "Enrollment Link" &&
          link
        ) {
          if (link.agent) {
            agentName =
              link.name || "";
          } else {
            linkName =
              link.name || "";
          }
        }

        // ========================================
        // FORM
        // ========================================
        const form =
          formMap[
            flow.enrollmentFormId?.toString()
          ];

        const formStatus =
          form?.status ||
          "Not Started";

        // ========================================
        // FIND PAYMENT
        // ========================================
        let paymentRecord = null;

        // Gateway transaction
        if (
          flowPayment.gatewayTransactionId
        ) {
          paymentRecord =
            paymentGatewayMap[
              String(
                flowPayment.gatewayTransactionId
              )
            ];
        }

        // Transaction
        if (
          !paymentRecord &&
          flowPayment.transactionId
        ) {
          paymentRecord =
            paymentTransactionMap[
              String(
                flowPayment.transactionId
              )
            ];
        }

        // ========================================
        // ⭐ PAYMENT CREATED AT
        // FROM PAYMENT MODEL
        // ========================================
        const paymentCreatedAt =
          paymentRecord?.createdAt ||
          null;

        // ========================================
        // ⭐ PAYMENT CREATED DATE
        // AUSTRALIA/SYDNEY DATE
        // ========================================
        const paymentCreatedDate =
          paymentCreatedAt
            ? new Date(
                paymentCreatedAt
              ).toLocaleDateString(
                "en-AU",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  timeZone:
                    "Australia/Sydney",
                }
              )
            : "—";

        // ========================================
        // PREFERRED CITY
        // FROM PAYMENT MODEL
        // ========================================
        const preferredCity =
          paymentRecord?.preferredCity
            ?.toString()
            .trim() || "";

        // ========================================
        // RETURN STUDENT
        // ========================================
        return {
          id: student._id,

          flowId: flow._id,

          // ======================================
          // ⭐ PAYMENT CREATED DATE
          // ======================================
          paymentCreatedAt,

          paymentCreatedDate,

          // ======================================
          // REGISTER DATE
          // ======================================
          registerDate:
            flow.createdAt
              ? new Date(
                  flow.createdAt
                ).toLocaleDateString(
                  "en-AU",
                  {
                    timeZone:
                      "Australia/Sydney",
                  }
                )
              : "—",

          // ======================================
          // REGISTER TIME
          // ======================================
          registerTime:
            flow.createdAt
              ? new Date(
                  flow.createdAt
                ).toLocaleTimeString(
                  "en-AU",
                  {
                    timeZone:
                      "Australia/Sydney",

                    hour: "2-digit",

                    minute: "2-digit",

                    hour12: true,
                  }
                )
              : "",

          // ======================================
          // STUDENT
          // ======================================
          name:
            student.name || "",

          email:
            student.email || "",

          phone:
            student.phone || "",

          // ======================================
          // TYPE
          // ======================================
          type: flow.enrollmentType
            ? flow.enrollmentType
                .charAt(0)
                .toUpperCase() +
              flow.enrollmentType.slice(1)
            : "Individual",

          // ======================================
          // COMPANY
          // ======================================
          companyName,

          agentName,

          linkName,

          // ======================================
          // COURSE
          // ======================================
          courseCategory:
            item.course
              ?.courseCategory || "",

          courseTitle:
            item.course
              ?.courseName || "",

          course:
            item.course
              ?.courseName || "",

          // ======================================
          // PAYMENT
          // ======================================
          paymentMethod:
            flowPayment.method ||
            "—",

          transactionId:
            flowPayment.transactionId ||
            "—",

          gatewayTransactionId:
            flowPayment.gatewayTransactionId ||
            "—",

          slipUrl:
            flowPayment.slipUrl ||
            "—",

          // ======================================
          // ⭐ PREFERRED CITY
          // ======================================
          preferredCity,

          // ======================================
          // BOOKING DATE
          // ======================================
          courseBookingDate:
            flow.sessionDate
              ? `${new Date(
                  flow.sessionDate
                ).toLocaleDateString(
                  "en-AU",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    timeZone:
                      "Australia/Sydney",
                  }
                )} | ${
                  flow.startTime || ""
                } - ${
                  flow.endTime || ""
                }`
              : "-",

          // ======================================
          // LLND
          // ======================================
          llndStatus:
            flow.llnd?.status ===
            "completed"
              ? "Completed"
              : "Not Completed",

          // ======================================
          // ENROLLMENT FORM
          // ======================================
          enrollmentForm:
            flow.enrollmentFormId
              ? "Completed"
              : "Not Completed",

          enrollmentFormId:
            flow.enrollmentFormId,

          enrollmentFormStatus:
            formStatus,

          // ======================================
          // PAYMENT STATUS
          // ======================================
          paymentStatus:
            flowPayment.method ===
            "Card Payment"
              ? flowPayment.status ===
                  "success" ||
                flowPayment.status ===
                  "completed"
                ? "Paid"
                : "Unpaid"

              : flowPayment.method ===
                "Bank Transfer"
              ? flowPayment.status ===
                "success"
                ? "Verified"
                : "Not Verified"

              : flowPayment.method ===
                "Pay Later"
              ? "Unpaid"

              : "—",

          // ======================================
          // STATUS
          // ======================================
          status:
            flow.status ===
            "active"
              ? "Active"
              : "Inactive",

          // ======================================
          // LOGIN
          // ======================================
          lastLogin:
            student.lastLogin ||
            "Never",

          // ======================================
          // BOOKING ID
          // ======================================
          bookingId:
            formatBookingId(
              flow.createdAt ||
                flow._id
            ),
        };
      });

    // ============================================
    // FINAL RESPONSE
    // ============================================
    console.log(
      "======================================"
    );

    console.log(
      "getAllStudents completed"
    );

    console.log(
      "Preferred City:",
      preferredCityFilter || "ALL"
    );

    console.log(
      "Total matching students:",
      total
    );

    console.log(
      "Current page students:",
      formatted.length
    );

    console.log(
      "======================================"
    );

    return res.json({
      data: formatted,

      total,

      page,

      totalPages:
        Math.ceil(
          total / limit
        ),
    });
  } catch (err) {
    console.error(
      "getAllStudents ERROR:",
      err
    );

    return res.status(500).json({
      error: err.message,
    });
  }
};
exports.deleteStudent = async (req, res) => {
  try {
    const flow = await EnrollmentFlow.findById(req.params.id);

    if (!flow) {
      return res.status(404).json({ message: "Flow not found" });
    }

    const studentId = flow.studentId;
    const student = studentId
      ? await StudentMain.findById(studentId).select("name email companyId").lean()
      : null;

    await Promise.all([
      EnrollmentFlow.findByIdAndDelete(req.params.id),
      studentId && LLNDAssessment.deleteMany({ student: studentId }),
      studentId && EnrollmentForm.deleteMany({ studentId: studentId.toString() }),
      studentId && Payment.deleteMany({ userId: studentId.toString() }),
    ]);

    if (studentId) {
      await StudentMain.findByIdAndDelete(studentId);
    }

    if (student) {
      await logStudentActivity(req, {
        action: "delete",
        summary: `Deleted student enrollment: ${formatStudentLabel(student.name, student.email)}`,
        targetId: req.params.id,
        student,
      });
    } else {
      logAdminActivity(req, {
        action: "delete",
        module: "student",
        summary: `Deleted student enrollment${studentId ? ` (${studentId})` : ""}`,
        targetId: req.params.id,
      });
    }
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStudentStatus = async (req, res) => {
  try {
    const updated = await EnrollmentFlow.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status.toLowerCase() },
      { returnDocument: "after" }
    );
    if (updated) {
      const student = updated.studentId
        ? await StudentMain.findById(updated.studentId).select("name email companyId").lean()
        : null;
      if (student) {
        await logStudentActivity(req, {
          action: "status_change",
          summary: `Student enrollment status set to ${req.body.status} — ${formatStudentLabel(student.name, student.email)}`,
          targetId: updated._id,
          student,
          companyId: updated.companyId,
        });
      } else {
        logAdminActivity(req, {
          action: "status_change",
          module: "student",
          summary: `Student enrollment status set to ${req.body.status}`,
          targetId: updated._id,
        });
      }
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStudentsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const data = await EnrollmentFlow.find({
      companyId,
      studentId: { $ne: null }
    })
      .populate("studentId")
      .sort({ createdAt: -1 })
      .lean();

    // Bulk-fetch course prices to fill in when flow doesn't store them
    const courseIds = [...new Set(
      data.flatMap(f => f.items?.map(i => i.course?.courseId).filter(Boolean) || [])
    )];
    const courses = await Course.find({ _id: { $in: courseIds } })
      .select("sellingPrice")
      .lean();
    const coursePriceMap = Object.fromEntries(
      courses.map(c => [c._id.toString(), c.sellingPrice || 0])
    );

    const formatted = data.map((flow) => {
      const student = flow.studentId || {};
      const item = flow.items?.[0] || {};
      const payment = item.payment || {};
      const source = flow.source || "individual";

      const storedPrice = Number(payment.amount) > 0
        ? Number(payment.amount)
        : Number(item.course?.price) > 0
          ? Number(item.course.price)
          : coursePriceMap[item.course?.courseId?.toString()] || 0;

      const price = storedPrice;

      // Payment method display
      const paymentMethod = source === "Booking Link"
        ? "Link Ref"
        : payment.method || "—";

      // Derived payment status — Booking Link seats are always pre-paid
      let paymentStatus;
      if (source === "Booking Link") {
        paymentStatus = "paid";
      } else if (payment.status === "success" || payment.status === "completed") {
        paymentStatus = "paid";
      } else if (payment.status === "failed") {
        paymentStatus = "failed";
      } else if (payment.slipUrl || payment.transactionId) {
        paymentStatus = "pending";
      } else {
        paymentStatus = "not_paid";
      }

      return {
        id: student._id || flow._id,
        flowId: flow._id,
        name: student.name || "—",
        email: student.email || "—",
        phone: student.phone || "—",
        course: item.course?.courseName || "—",
        amount: `$${price}`,
        amountNum: price,
        paymentMethod,
        paymentStatus,
        source,
        llnd: flow.llnd?.status === "completed" ? "Completed" : "Not Completed",
        form: flow.enrollmentFormId ? "Submitted" : "Not Submitted",
        training: flow.status === "active" ? "Active" : "Inactive",
        enrolled: new Date(flow.createdAt).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" }),
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPaymentsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    // ✅ CompanyPayment-லிருந்து எடு
    const companyPayments = await CompanyPayment.find({ companyId })
      .sort({ createdAt: -1 })
      .lean();

    const payments = [];

    for (const payment of companyPayments) {
      const isPaid = payment.status === "success" || payment.confirmed === true;

      if (payment.courses?.length > 0) {
        // ✅ Per course row
        for (const course of payment.courses) {
          const total = (course.pricePerPerson || 0) * (course.quantity || 1);

          // ✅ CourseLink-லிருந்து usage எடு
          const link = await CourseLink.findOne({
            companyPaymentId: payment._id,
            courseId: course.courseId
          }).lean();

          const usedCount = link?.usedCount || 0;
          const maxUses = link?.maxUses || course.quantity || 1;

          payments.push({
            id: `${payment._id}_${course.courseId}`,
            date: new Date(payment.createdAt).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" }),
            student: `${usedCount}/${maxUses} enrolled`,
            course: course.courseName || "—",
            payment: isPaid ? "paid" : "pending",
            total,
            paid: isPaid ? total : 0,
            balance: isPaid ? 0 : total,
            gatewayTransactionId: payment.card?.gatewayTransactionId || payment.gatewayTransactionId || "",
          });
        }
      } else {
        // ✅ Fallback
        payments.push({
          id: payment._id,
          date: new Date(payment.createdAt).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" }),
          student: "—",
          course: "—",
          payment: isPaid ? "paid" : "pending",
          total: payment.amount || 0,
          paid: isPaid ? payment.amount || 0 : 0,
          balance: isPaid ? 0 : payment.amount || 0,
          gatewayTransactionId: payment.card?.gatewayTransactionId || payment.gatewayTransactionId || "",
        });
      }
    }

    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.paySelected = async (req, res) => {
  try {
    const { flowIds, amount, method, companyId, transactionId, gatewayTransactionId } = req.body;
    const receiptUrl = req.file?.path || "";
    const ids = JSON.parse(flowIds || "[]");

    const isCard = method === "Card Payment";
    let status = isCard ? "success" : "pending";
    let confirmed = isCard;

    if (isCard && !transactionId) {
      console.warn(`[paySelected] Card payment without transactionId! Company: ${companyId}`);
      status = "pending";
      confirmed = false;
    }

    await Promise.all(ids.map(id =>
      EnrollmentFlow.findByIdAndUpdate(id, {
        $set: {
          "items.0.payment.method": method,
          "items.0.payment.transactionId": transactionId || "",
          "items.0.payment.gatewayTransactionId": isCard ? (gatewayTransactionId || transactionId || "") : "",
          "items.0.payment.slipUrl": receiptUrl,
          "items.0.payment.status": status,
        }
      })
    ));

    if (companyId && companyId.length === 24) {
      const company = await Company.findById(companyId).lean();
      await CompanyPayment.create({
        companyId,
        companyName: company?.companyName || "",
        email: company?.email || "",
        mobile: company?.mobileNumber || "",
        amount: Number(amount),
        paymentMethod: isCard ? "Card" : "Bank Transfer",
        courseCount: ids.length,
        receiptUrl,
        transactionReference: transactionId || "",
        gatewayTransactionId: isCard ? (gatewayTransactionId || transactionId || "") : "",
        status: status,
        confirmed: confirmed,
      });
    }

    res.json({ success: true, message: "Payment submitted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getStudentsByLink = async (req, res) => {
  try {
    const { companyId, token } = req.params;

    const data = await EnrollmentFlow.find({
      companyId,
      sourceToken: token,
      studentId: { $ne: null }
    })
      .populate("studentId")
      .sort({ createdAt: -1 })
      .lean();

    const courseIds = [...new Set(
      data.flatMap(f => f.items?.map(i => i.course?.courseId).filter(Boolean) || [])
    )];
    const courses = await Course.find({ _id: { $in: courseIds } })
      .select("sellingPrice")
      .lean();
    const coursePriceMap = Object.fromEntries(
      courses.map(c => [c._id.toString(), c.sellingPrice || 0])
    );

    const formatted = data.map((flow) => {
      const student = flow.studentId || {};
      const item = flow.items?.[0] || {};
      const payment = item.payment || {};

      const price = Number(payment.amount) > 0
        ? Number(payment.amount)
        : Number(item.course?.price) > 0
          ? Number(item.course.price)
          : coursePriceMap[item.course?.courseId?.toString()] || 0;

      // All students in getStudentsByLink came via a Booking Link — always paid
      let paymentStatus;
      if (payment.status === "success" || payment.status === "completed" || flow.source === "Booking Link") {
        paymentStatus = "paid";
      } else if (payment.status === "failed") {
        paymentStatus = "failed";
      } else if (payment.slipUrl || payment.transactionId) {
        paymentStatus = "pending";
      } else {
        paymentStatus = "not_paid";
      }

      return {
        id: student._id || flow._id,
        name: student.name || "—",
        email: student.email || "—",
        course: item.course?.courseName || "—",
        amount: `$${price}`,
        paymentStatus,
        llnd: flow.llnd?.status === "completed" ? "Completed" : "Not Completed",
        enrolled: new Date(flow.createdAt).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" }),
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
