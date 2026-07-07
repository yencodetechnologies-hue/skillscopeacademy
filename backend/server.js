
try {
  require("dns").setServers(["8.8.8.8"]);
} catch (err) {
  console.warn("Could not set DNS servers:", err.message);
}
require("dotenv").config({ path: require("path").join(__dirname, ".env") });
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
connectDB();

const app = express();
app.set("trust proxy", 1);
const allowedOrigins = [
  'https://skillscopeacademy.vercel.app',
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

// ROUTES
app.use("/auth", require("./routes/authRoutes"));
app.use("/courses", require("./routes/courseRoutes"));
app.use("/enrollments", require("./routes/enrollmentRoutes"));
app.use("/schedules", require("./routes/scheduleRoutes"));
app.use("/enrollment-form", require("./routes/enrollmentFormRoutes"));
app.use("/companies", companyRoutes);
app.use("/book-now", companyEnrollRoutes);
app.use("/enroll", studentRoutes);
app.use("/llnd", require("./routes/llndRoutes"));
app.use("/payment", paymentRouter);
app.use("/flow", enrollmentRoutes);
app.use("/students", studentRoutes);
app.use("/student", studentDashboardRoutes);
app.use("/booking-email", bookingEmailRoutes);
app.use("/enrollment-links", enrollmentLinksRouter);
app.use("/gallery", galleryRouter)
app.use("/company-payments", companypaymentroute);
app.use("/course-links", courseLinkRoutes);
app.use("/results", resultRoutes);
app.use("/categories", require("./routes/categoryRoutes")); // ✅ ADD
app.use("/sliders", require("./routes/sliderRoutes"));
app.use("/partners", require("./routes/partnerRoutes"));
app.use("/site-banner", require("./routes/siteBannerRoutes"));
app.use("/form-documents", require("./routes/formDocumentRoutes"));
app.use("/code-of-practice", require("./routes/codeOfPracticeRoutes"));
app.use("/voc", require("./routes/vocRoutes"));
app.use("/files", require("./routes/filesRoutes"));

app.use("/admin-logs", require("./routes/adminActivityLogRoutes"));

app.get("/health", async (req, res) => {
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