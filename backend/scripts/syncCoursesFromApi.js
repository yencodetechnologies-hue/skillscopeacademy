/**
 * Sync categories + courses from production API into MongoDB (MONGO_URI).
 *
 * Usage:
 *   node scripts/syncCoursesFromApi.js
 *   node scripts/syncCoursesFromApi.js --dry-run
 */
const path = require("path");
const fs = require("fs");
const dns = require("dns");
const mongoose = require("mongoose");
const Course = require("../models/Course");
const Category = require("../models/Category");

// Corporate DNS often fails Atlas SRV lookups
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const BASE =
  process.env.SYNC_API_BASE ||
  "https://skillscopeacademy.yencodetechnologies.in";
const COURSES_URL = `${BASE}/api/courses`;
const CATEGORIES_URL = `${BASE}/api/categories`;

const COURSES_FALLBACK = path.join(__dirname, "..", "scratch", "courses-api.json");
const CATEGORIES_FALLBACK = path.join(__dirname, "..", "scratch", "categories-api.json");

const DRY_RUN = process.argv.includes("--dry-run");

const COURSE_FIELDS = [
  "courseCode",
  "title",
  "duration",
  "trainingDuration",
  "certificateValidity",
  "deliveryMethod",
  "location",
  "image",
  "pricingType",
  "originalPrice",
  "sellingPrice",
  "vocPrice",
  "slSingleStrikePrice",
  "slSinglePrice",
  "slblStrikePrice",
  "slblPrice",
  "metaTitle",
  "metaDescription",
  "description",
  "trainingOverview",
  "vocationalOutcome",
  "feesCharges",
  "optionalCharges",
  "outcomePoints",
  "syllabusUrl",
  "headingDescription",
  "headingTrainingOverview",
  "headingVocationalOutcome",
  "headingFeesCharges",
  "headingOptionalCharges",
  "headingOutcomePoint",
  "requirements",
  "handbook",
  "pathways",
  "comboType",
  "studentsEnrolled",
  "status",
  "experienceBasedBooking",
  "comboEnabled",
  "comboDescription",
  "comboPrice",
  "comboDuration",
  "slug",
  "withExperiencePrice",
  "withExperienceOriginal",
  "withoutExperiencePrice",
  "withoutExperienceOriginal",
  "sortOrder",
];

async function fetchJson(url, fallbackPath) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Expected array");
    console.log(`Fetched ${data.length} from ${url}`);
    if (fallbackPath) {
      fs.mkdirSync(path.dirname(fallbackPath), { recursive: true });
      fs.writeFileSync(fallbackPath, JSON.stringify(data, null, 2));
    }
    return data;
  } catch (err) {
    if (fallbackPath && fs.existsSync(fallbackPath)) {
      console.warn(`Fetch failed (${err.message}), using ${fallbackPath}`);
      return JSON.parse(fs.readFileSync(fallbackPath, "utf8"));
    }
    throw err;
  }
}

function pickCoursePayload(apiCourse, categoryId) {
  const payload = {};
  for (const field of COURSE_FIELDS) {
    if (apiCourse[field] !== undefined && apiCourse[field] !== null) {
      payload[field] = apiCourse[field];
    }
  }

  if (payload.image == null && apiCourse.thumbnail) {
    payload.image = apiCourse.thumbnail;
  }
  if (payload.sellingPrice == null && apiCourse.price != null) {
    payload.sellingPrice = Number(apiCourse.price);
  }
  if (payload.sortOrder == null && apiCourse.order != null) {
    payload.sortOrder = Number(apiCourse.order);
  }
  if (!payload.slug && apiCourse.urlSlug) {
    payload.slug = String(apiCourse.urlSlug).toLowerCase().trim();
  }

  if (payload.pricingType === "experience") {
    payload.experienceBasedBooking = true;
  } else if (payload.pricingType) {
    payload.experienceBasedBooking = false;
  }

  if (categoryId) payload.category = categoryId;
  return payload;
}

async function syncCategories(apiCategories) {
  let created = 0;
  let updated = 0;

  for (const apiCat of apiCategories) {
    const name = (apiCat.name || "").trim();
    if (!name) continue;

    const fields = {
      name,
      courseCount: apiCat.courseCount ?? 0,
      active: apiCat.active !== false,
      order: apiCat.order ?? 0,
      image: apiCat.image || "",
    };

    let existing = null;
    if (apiCat._id && mongoose.isValidObjectId(apiCat._id)) {
      existing = await Category.findById(apiCat._id);
    }
    if (!existing) {
      existing = await Category.findOne({ name });
    }

    if (DRY_RUN) {
      console.log(`  [dry-run] category ${existing ? "~" : "+"} ${name}`);
      existing ? (updated += 1) : (created += 1);
      continue;
    }

    if (existing) {
      Object.assign(existing, fields);
      await existing.save();
      updated += 1;
      console.log(`  ~ category: ${name}`);
    } else {
      const doc = { ...fields };
      if (apiCat._id && mongoose.isValidObjectId(apiCat._id)) {
        doc._id = apiCat._id;
      }
      await Category.create(doc);
      created += 1;
      console.log(`  + category: ${name}`);
    }
  }

  return { created, updated };
}

async function resolveCategoryId(apiCourse, nameToId) {
  if (apiCourse.categoryId && mongoose.isValidObjectId(apiCourse.categoryId)) {
    const byId = await Category.findById(apiCourse.categoryId);
    if (byId) return byId._id;
  }

  const name = (apiCourse.category || "").toString().trim();
  if (name && nameToId.has(name)) return nameToId.get(name);

  if (name) {
    const byName = await Category.findOne({ name });
    if (byName) {
      nameToId.set(name, byName._id);
      return byName._id;
    }
  }
  return null;
}

async function syncCourses(apiCourses) {
  const cats = await Category.find().select("_id name");
  const nameToId = new Map(cats.map((c) => [c.name, c._id]));

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors = [];

  for (const apiCourse of apiCourses) {
    const slug = (apiCourse.slug || apiCourse.urlSlug || "")
      .toString()
      .trim()
      .toLowerCase();
    if (!slug) {
      skipped += 1;
      errors.push({ title: apiCourse.title, reason: "missing slug" });
      continue;
    }

    try {
      const categoryId = await resolveCategoryId(apiCourse, nameToId);
      const payload = pickCoursePayload(apiCourse, categoryId);
      payload.slug = slug;

      let existing = await Course.findOne({ slug });
      if (!existing && apiCourse._id && mongoose.isValidObjectId(apiCourse._id)) {
        existing = await Course.findById(apiCourse._id);
      }

      if (DRY_RUN) {
        console.log(`  [dry-run] course ${existing ? "~" : "+"} ${slug}`);
        existing ? (updated += 1) : (created += 1);
        continue;
      }

      if (existing) {
        Object.assign(existing, payload);
        await existing.save();
        updated += 1;
        console.log(`  ~ course: ${slug}`);
      } else {
        const doc = { ...payload };
        if (apiCourse._id && mongoose.isValidObjectId(apiCourse._id)) {
          doc._id = apiCourse._id;
        }
        await Course.create(doc);
        created += 1;
        console.log(`  + course: ${slug}`);
      }
    } catch (err) {
      skipped += 1;
      errors.push({ slug, title: apiCourse.title, reason: err.message });
      console.error(`  ! course failed: ${slug} — ${err.message}`);
    }
  }

  return { created, updated, skipped, errors };
}

async function refreshCategoryCounts() {
  if (DRY_RUN) return;
  const categories = await Category.find();
  for (const cat of categories) {
    cat.courseCount = await Course.countDocuments({ category: cat._id });
    await cat.save();
  }
}

async function sync() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set in backend/.env");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 25000,
  });
  console.log(`MongoDB connected → ${mongoose.connection.name}`);
  if (DRY_RUN) console.log("DRY RUN — no writes");

  const before = {
    courses: await Course.countDocuments(),
    categories: await Category.countDocuments(),
  };
  console.log("Before:", before);

  console.log("\n=== Categories ===");
  const apiCategories = await fetchJson(CATEGORIES_URL, CATEGORIES_FALLBACK);
  const catStats = await syncCategories(apiCategories);

  console.log("\n=== Courses ===");
  const apiCourses = await fetchJson(COURSES_URL, COURSES_FALLBACK);
  const courseStats = await syncCourses(apiCourses);

  console.log("\n=== Refresh category counts ===");
  await refreshCategoryCounts();

  const after = {
    courses: await Course.countDocuments(),
    categories: await Category.countDocuments(),
  };

  console.log("\nSync complete");
  console.log({
    dryRun: DRY_RUN,
    categories: catStats,
    courses: courseStats,
    before,
    after,
  });

  await mongoose.disconnect();
}

sync().catch((err) => {
  console.error(err);
  process.exit(1);
});
