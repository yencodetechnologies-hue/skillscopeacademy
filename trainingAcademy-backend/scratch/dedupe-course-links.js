/**
 * Removes duplicate CourseLink rows (same companyPaymentId + courseId).
 * Keeps the link with highest usedCount; if tied, keeps the oldest.
 * Skips deletion if an enrollment flow still references that token.
 *
 * Usage: node scratch/dedupe-course-links.js
 *        node scratch/dedupe-course-links.js --dry-run
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const CourseLink = require("../models/CourseLink");
const EnrollmentFlow = require("../models/EnrollmentFlows");

const dryRun = process.argv.includes("--dry-run");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(dryRun ? "DRY RUN — no deletes" : "LIVE — will delete duplicates");

  const all = await CourseLink.find().sort({ createdAt: 1 }).lean();
  const groups = new Map();

  for (const link of all) {
    const key = `${link.companyPaymentId}::${link.courseId}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(link);
  }

  let removed = 0;
  for (const [, group] of groups) {
    if (group.length < 2) continue;

    const sorted = [...group].sort((a, b) => {
      if (b.usedCount !== a.usedCount) return b.usedCount - a.usedCount;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
    const keep = sorted[0];
    const toRemove = sorted.slice(1);

    for (const link of toRemove) {
      const inUse = await EnrollmentFlow.exists({ sourceToken: link.token });
      if (inUse) {
        console.log(`SKIP (flow uses token): ${link.token} ${link.courseName}`);
        continue;
      }
      console.log(
        `REMOVE duplicate: ${link.courseName} token=${link.token.slice(0, 12)}… (keeping ${keep.token.slice(0, 12)}…)`,
      );
      if (!dryRun) {
        await CourseLink.deleteOne({ _id: link._id });
      }
      removed++;
    }
  }

  console.log(`Done. ${removed} duplicate link(s) ${dryRun ? "would be" : ""} removed.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
