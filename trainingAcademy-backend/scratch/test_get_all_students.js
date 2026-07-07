require("dns").setServers(["8.8.8.8"]);
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const EnrollmentFlow = require("../models/EnrollmentFlows");
const StudentMain = require("../models/student_main");
const Company = require("../models/Company");
const EnrollmentLink = require("../models/EnrollmentLink");
const EnrollmentForm = require("../models/EnrollmentForm");

async function check() {
  const uri = process.env.MONGO_URI;
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to DB");

    console.time("Full getAllStudents simulation");

    const data = await EnrollmentFlow.find({
      studentId: { $ne: null }
    })
      .populate("studentId")
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Retrieved ${data.length} flows`);

    // Extract all IDs to fetch them in bulk
    const companyIds = [];
    const enrollmentLinkIds = [];
    const enrollmentFormIds = [];
    const studentIds = [];

    data.forEach((flow) => {
      const student = flow.studentId || {};
      const resolvedCompanyId = flow.companyId || student.companyId;
      if (resolvedCompanyId) {
        companyIds.push(resolvedCompanyId);
      }
      if (flow.source === "Enrollment Link" && flow.sourceToken) {
        enrollmentLinkIds.push(flow.sourceToken);
      }
      if (flow.enrollmentFormId) {
        enrollmentFormIds.push(flow.enrollmentFormId);
      }
      if (student._id) {
        studentIds.push(student._id.toString());
      }
    });

    console.log("Unique company IDs count:", [...new Set(companyIds.map(id => id.toString()))].length);
    console.log("Unique link IDs count:", [...new Set(enrollmentLinkIds.map(id => id.toString()))].length);
    console.log("Unique form IDs count:", [...new Set(enrollmentFormIds.map(id => id.toString()))].length);
    console.log("Unique student IDs count:", [...new Set(studentIds)].length);

    // 1. Fetch companies in bulk
    const uniqueCompanyIds = [...new Set(companyIds.map(id => id.toString()))].filter(id => mongoose.Types.ObjectId.isValid(id));
    const companies = await Company.find({ _id: { $in: uniqueCompanyIds } }).lean();
    const companyMap = new Map(companies.map(c => [c._id.toString(), c]));

    // 2. Fetch enrollment links in bulk
    const uniqueLinkIds = [...new Set(enrollmentLinkIds.map(id => id.toString()))].filter(id => mongoose.Types.ObjectId.isValid(id));
    const enrollmentLinks = await EnrollmentLink.find({ _id: { $in: uniqueLinkIds } }).lean();
    const linkMap = new Map(enrollmentLinks.map(l => [l._id.toString(), l]));

    // 3. Fetch enrollment forms in bulk
    const uniqueFormIds = [...new Set(enrollmentFormIds.map(id => id.toString()))].filter(id => mongoose.Types.ObjectId.isValid(id));
    const uniqueStudentIds = [...new Set(studentIds)].filter(id => mongoose.Types.ObjectId.isValid(id));

    const forms = await EnrollmentForm.find({
      $or: [
        { _id: { $in: uniqueFormIds } },
        { studentId: { $in: uniqueStudentIds } }
      ]
    }).select("status studentId").lean();

    const formMapById = new Map(forms.map(f => [f._id.toString(), f]));
    const formMapByStudentId = new Map(
      forms.filter(f => f.studentId).map(f => [f.studentId.toString(), f])
    );

    console.log("Mapping formatting...");
    // Map the results in-memory
    const formatted = data.map((flow) => {
      const student = flow.studentId || {};
      const item = flow.items?.[0] || {};

      const resolvedCompanyId = flow.companyId || student.companyId;
      let companyName = "";
      if (resolvedCompanyId) {
        const company = companyMap.get(resolvedCompanyId.toString());
        companyName = company?.name || company?.companyName || "";
      }

      let agentName = "";
      let linkName = "";
      if (flow.source === "Enrollment Link" && flow.sourceToken) {
        const link = linkMap.get(flow.sourceToken.toString());
        if (link?.agent) {
          agentName = link?.name || "";
        } else {
          linkName = link?.name || "";
        }
      }

      let formStatus = "Not Started";
      let formId = null;
      if (flow.enrollmentFormId) {
        const form = formMapById.get(flow.enrollmentFormId.toString());
        if (form) {
          formStatus = form.status || "Pending";
          formId = form._id;
        }
      } else if (student._id) {
        const form = formMapByStudentId.get(student._id.toString());
        if (form) {
          formStatus = form.status || "Pending";
          formId = form._id;
        }
      }

      return {
        id: student._id,
        flowId: flow._id,
        registerDate: flow.createdAt
          ? new Date(flow.createdAt).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" })
          : "—",
        registerTime: flow.createdAt
          ? new Date(flow.createdAt).toLocaleTimeString("en-AU", { 
              timeZone: "Australia/Sydney", 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: true 
            })
          : "",
        name: student.name || "",
        email: student.email || "",
        phone: student.phone || "",
        type: flow.enrollmentType
          ? flow.enrollmentType.charAt(0).toUpperCase() + flow.enrollmentType.slice(1)
          : "Individual",
        companyName,
        agentName,
        linkName,
        courseCategory: item.course?.courseCategory || "",
        courseTitle: item.course?.courseName || "",
        course: item.course?.courseName || "",
        paymentMethod: item.payment?.method || "—",
        transactionId: item.payment?.transactionId || "—",
        slipUrl: item.payment?.slipUrl || "—",
        courseBookingDate: flow.sessionDate
          ? `${new Date(flow.sessionDate).toLocaleDateString("en-AU", {
              day: "numeric", month: "short", year: "numeric", timeZone: "Australia/Sydney"
            })} | ${flow.startTime} - ${flow.endTime}`
          : "-",
        llndStatus: flow.llnd?.status === "completed" ? "Completed" : "Not Completed",
        enrollmentForm: flow.enrollmentFormId ? "Completed" : "Not Completed",
        enrollmentFormId: formId,
        enrollmentFormStatus: formStatus,
        paymentStatus: item.payment?.method === "Card Payment"
          ? (item.payment?.status === "success" || item.payment?.status === "completed") ? "Paid" : "Unpaid"
          : item.payment?.method === "Bank Transfer"
            ? item.payment?.status === "success" ? "Verified" : "Not Verified"
            : item.payment?.method === "Pay Later"
              ? "Unpaid"
              : "—",
        status: flow.status === "active" ? "Active" : "Inactive",
        lastLogin: student.lastLogin || "Never",
      };
    });

    console.timeEnd("Full getAllStudents simulation");
    console.log(`Success! Formatted ${formatted.length} records`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

check();
