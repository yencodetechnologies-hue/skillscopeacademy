const mongoose = require("mongoose");
const EnrollmentFlow = require("../models/EnrollmentFlows");
const StudentMain = require("../models/student_main");
const Course = require("../models/Course");

exports.getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.params.id;

    if (!studentId || studentId === "null") {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid ObjectId format" });
    }

    // Fetch ALL flows for this student to aggregate all courses
    const flows = await EnrollmentFlow.find({ studentId })
      .sort({ createdAt: -1 })
      .populate("studentId");

    if (!flows || flows.length === 0) {
      return res.status(200).json({
        studentName: null,
        assessmentScore: 0,
        paymentVerified: false,
        assessmentPassed: false,
        enrollmentFormApproved: false,
        paymentMethod: "",
        enrollmentType: "Individual",
        enrolledCourses: []
      });
    }

    // Use the latest flow for general dashboard stats (Score, LLND, etc.)
    const latestFlow = flows[0];
    
    // Check if any flow has a successful payment or is an agent enrollment
    const paymentVerified = flows.some(f => {
      const isAgent = f.enrollmentType?.toLowerCase() === "agent" || f.source === "Enrollment Link";
      const hasSuccess = f.items?.some(item => 
        item.payment?.status === "success" || item.payment?.status === "completed"
      );
      return isAgent || hasSuccess;
    });

    const completedFlow = flows.find((f) => f.llnd?.status === "completed");
    const llndScore = completedFlow?.llnd?.score ?? latestFlow.llnd?.score ?? 0;
    const assessmentPassed = flows.some((f) => f.llnd?.status === "completed");

    const firstItem = latestFlow.items?.[0];
    const paymentMethod = firstItem?.payment?.method || "";

    let enrollmentType = latestFlow.enrollmentType;
    if (!enrollmentType) {
      enrollmentType = latestFlow.companyId ? "Company" : "Individual";
    }
    if (!enrollmentType && latestFlow.studentId?.enrollmentType) {
      const studentType = latestFlow.studentId.enrollmentType;
      enrollmentType = studentType.charAt(0).toUpperCase() + studentType.slice(1).toLowerCase();
    }
    enrollmentType = enrollmentType || "Individual";

    const EnrollmentForm = require("../models/EnrollmentForm");
    const existingForm = await EnrollmentForm.findOne({ studentId }).lean();

    // ✅ Aggregate ALL courses from ALL flows
    const allCourses = [];
    for (const f of flows) {
      for (const item of (f.items || [])) {
        const course = await Course.findById(item.course?.courseId).select("image").lean();
        
        allCourses.push({
          courseId: item.course?.courseId,
          courseName: item.course?.courseName,
          price: item.course?.price,
          paymentStatus: item.payment?.status || "Pending",
          image: course?.image || null,
          sessionDate: f.sessionDate || null,
          startTime: f.startTime || null,
          endTime: f.endTime || null,
          status: f.status || "active",
          llndStatus: f.llnd?.status || "pending",
          formStatus: f.enrollmentFormId || existingForm?._id ? "submitted" : "pending",
          flowId: f._id,
        });
      }
    }

    console.log("[Dashboard] Checking form for studentId:", studentId);
    console.log("[Dashboard] Form found:", existingForm ? "YES" : "NO", existingForm?._id);
    
    // ✅ If enrollmentFormCompleted is true, it means they finished the final step
    const enrollmentFormSubmitted = !!existingForm?.enrollmentFormCompleted || latestFlow.enrollmentStatus === "enrolled";
    const enrollmentFormApproved = existingForm?.status === "Approved";

    const response = {
      latestFlowId: latestFlow._id,
      studentName: latestFlow.studentId?.name,
      assessmentScore: llndScore,
      paymentVerified,
      assessmentPassed,
      enrollmentFormSubmitted,
      enrollmentFormApproved,
      enrollmentFormStatus: existingForm?.status || "Pending",
      paymentMethod,
      enrollmentType,
      enrolledCourses: allCourses
    };

    res.json(response);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getStudentProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await StudentMain.findById(id).lean();
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const flows = await EnrollmentFlow.find({ studentId: id }).lean();
    
    // Live aggregate unique courses from flows
    const courseMap = new Map();
    flows.forEach(f => {
      (f.items || []).forEach(item => {
        if (!item.course?.courseId) return;
        const cid = String(item.course.courseId);
        if (!courseMap.has(cid)) {
          courseMap.set(cid, {
            status: f.status === "completed" ? "completed" : "active"
          });
        }
      });
    });

    const totalCourses = courseMap.size;
    const completedCourses = Array.from(courseMap.values()).filter(c => c.status === "completed").length;
    const activeCourses = totalCourses - completedCourses;

    const certCount = flows.filter(f =>
      f.items?.some(item => (item.payment?.status === "success" || item.payment?.status === "completed")) && 
      f.enrollmentFormId
    ).length;

    const EnrollmentForm = require("../models/EnrollmentForm");
    const latestForm = await EnrollmentForm.findOne({ studentId: student._id.toString() })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      _id: student._id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      profileImage: student.profileImage || latestForm?.photoDocumentUrl || "",
      studentId: `STU-${new Date(student.createdAt).getFullYear()}-${String(student._id).slice(-6).toUpperCase()}`,
      createdAt: student.createdAt,
      dob: student.dob || latestForm?.personalDetails?.dob || "",
      bio: student.bio || "",
      address: {
        street: student.address?.street || latestForm?.address?.residential?.address || "",
        city: student.address?.city || latestForm?.address?.residential?.suburb || "",
        state: student.address?.state || latestForm?.address?.residential?.state || "",
        zip: student.address?.zip || latestForm?.address?.residential?.postcode || "",
      },
      emergencyContact: {
        name: student.emergencyContact?.name || latestForm?.emergencyContact?.name || "",
        phone: student.emergencyContact?.phone || latestForm?.emergencyContact?.contactNumber || "",
        relationship: student.emergencyContact?.relationship || latestForm?.emergencyContact?.relationship || "",
      },
      stats: {
        total: totalCourses,
        active: activeCourses,
        completed: completedCourses,
        certificates: certCount,
      },
    });
  } catch (err) {
    console.error("getStudentProfile error:", err);
    res.status(500).json({ message: err.message });
  }
};