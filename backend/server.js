
try {
  require("dns").setServers(["8.8.8.8"]);
} catch (err) {
  console.warn("Could not set DNS servers:", err.message);
}
require("dotenv").config({ path: require("path").join(__dirname, ".env") });
require("./cron/birthdayCron");
require("./cron/festivalCron");
require("./cron/paymentReminderCron");
require("./cron/courseReminderCron");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const companyRoutes = require("./routes/companyRoutes");
const companyEnrollRoutes = require("./routes/companyEnrollRoutes");
const studentRoutes = require("./routes/studentMainRoutes");
const enrollmentRoutes = require("./routes/enrollmentFlowRoutes");
const studentDashboardRoutes = require("./routes/studentDashboardRoutes");
const bookingEmailRoutes = require("./routes/bookingEmailRoutes");
const paymentRouter = require("./routes/paymentRouter");
const enrollmentLinksRouter = require("./routes/enrollmentLinks");
const galleryRouter = require("./routes/gallery")
const companypaymentroute = require("./routes/companypaymentroute");
const courseLinkRoutes = require("./routes/courseLinkRoutes")
const resultRoutes = require("./routes/resultRoutes");
const mailRoutes = require("./routes/mailRoutes");
const sendMultipleMailRoutes = require("./routes/sentMultiplemailRoutes");
const emailTemplateRoutes = require("./routes/emailTemplateRoutes");
const promotionMailRoutes = require("./routes/promotionMailRoutes");
const customMailRoutes =
require("./routes/customMailRoutes");





connectDB();

const app = express();
app.set("trust proxy", 1);
const allowedOrigins = [
  'https://skillscopeacademy.vercel.app',
  "https://www.safeticks.com",
  'https://skillscopeacademy.yencodetechnologies.in',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  
];

// Combine with origins from .env
if (process.env.CLIENT_ORIGIN) {
  process.env.CLIENT_ORIGIN.split(",").forEach((origin) => {
    const trimmed = origin.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  })
);

// ✅ Increased limits to handle file uploads up to 50MB
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/api/send-mail", mailRoutes);
app.use("/api/email-template", emailTemplateRoutes);
app.use("/api/send-promotion-mail", promotionMailRoutes);

app.use("/api/send-mail/multiple", sendMultipleMailRoutes);
app.use(
"/api/send-custom-mail",
customMailRoutes
);

// ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/enrollments", require("./routes/enrollmentRoutes"));
app.use("/api/schedules", require("./routes/scheduleRoutes"));
app.use("/api/enrollment-form", require("./routes/enrollmentFormRoutes"));
app.use("/api/companies", companyRoutes);
app.use("/api/book-now", companyEnrollRoutes);
app.use("/api/enroll", studentRoutes);
app.use("/api/llnd", require("./routes/llndRoutes"));
app.use("/api/payment", paymentRouter);
app.use("/api/flow", enrollmentRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/student", studentDashboardRoutes);
app.use("/api/booking-email", bookingEmailRoutes);
app.use("/api/enrollment-links", enrollmentLinksRouter);
app.use("/api/gallery", galleryRouter)
app.use("/api/company-payments", companypaymentroute);
app.use("/api/course-links", courseLinkRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/categories", require("./routes/categoryRoutes")); // ✅ ADD
app.use("/api/sliders", require("./routes/sliderRoutes"));
app.use("/api/partners", require("./routes/partnerRoutes"));
app.use("/api/site-banner", require("./routes/siteBannerRoutes"));
app.use("/api/form-documents", require("./routes/formDocumentRoutes"));
app.use("/api/code-of-practice", require("./routes/codeOfPracticeRoutes"));
app.use("/api/voc", require("./routes/vocRoutes"));
app.use("/api/files", require("./routes/filesRoutes"));

app.use("/api/admin-logs", require("./routes/adminActivityLogRoutes"));

app.get("/api/health", async (req, res) => {
  const mongoose = require("mongoose");
  const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  res.json({
    status: "OK",
    database: dbStatus,
    origin: req.headers.origin || "No Origin Header",
    allowedOrigins: allowedOrigins
  });
});

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.stack);
  
  // Ensure CORS headers are present on error responses
  const origin = req.headers.origin;
  const isAllowed = origin && allowedOrigins.some(allowed => {
    return origin === allowed || origin === allowed + "/";
  });

  if (isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.status(500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

const PORT = process.env.PORT || 7001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);

});