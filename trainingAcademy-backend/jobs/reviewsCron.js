const cron = require("node-cron");
const Review = require("../models/Review");
const ReviewMeta = require("../models/ReviewMeta");
const { syncGoogleReviews } = require("../services/googleReviewsSync");

const META_KEY = "google_sync";

function getCronSchedule() {
  if (process.env.REVIEWS_CRON_SCHEDULE) {
    return process.env.REVIEWS_CRON_SCHEDULE;
  }
  const minute = Math.min(
    59,
    Math.max(1, parseInt(process.env.GOOGLE_REVIEWS_CRON_MINUTE || "30", 10) || 30)
  );
  return `${minute} 1 * * *`;
}

function isCronEnabled() {
  if (process.env.REVIEWS_CRON_ENABLED === "true") return true;
  if (process.env.REVIEWS_CRON_ENABLED === "false") return false;
  return process.env.GOOGLE_REVIEWS_CRON_ENABLED === "true";
}

async function runSync(label, options = {}) {
  try {
    const result = await syncGoogleReviews(options);
    if (result.skipped) {
      console.log(`[reviews-cron] ${label}: skipped (${result.reason})`);
    } else {
      console.log(
        `[reviews-cron] ${label}: synced ${result.count} reviews for ${result.placeName}`
      );
    }
  } catch (err) {
    console.error(`[reviews-cron] ${label} failed:`, err.message);
  }
}

async function bootstrapIfEmpty() {
  const [count, meta] = await Promise.all([
    Review.countDocuments(),
    ReviewMeta.findOne({ key: META_KEY }),
  ]);
  const needsTotal = meta?.userRatingsTotal == null;
  if (count === 0 || needsTotal) {
    console.log(
      "[reviews-cron] Running bootstrap sync" +
        (count === 0 ? " (no reviews)" : " (missing review total)")
    );
    await runSync("bootstrap", { force: true });
  }
}

function startReviewsCron() {
  const timezone =
    process.env.REVIEWS_CRON_TIMEZONE ||
    process.env.GOOGLE_REVIEWS_CRON_TIMEZONE ||
    "Australia/Sydney";
  const schedule = getCronSchedule();

  bootstrapIfEmpty().catch((err) => {
    console.error("[reviews-cron] bootstrap error:", err.message);
  });

  if (!isCronEnabled()) {
    console.log(
      `[reviews-cron] Scheduled job disabled (set GOOGLE_REVIEWS_CRON_ENABLED=true on one instance)`
    );
    return;
  }

  if (!cron.validate(schedule)) {
    console.error(`[reviews-cron] Invalid cron schedule: ${schedule}`);
    return;
  }

  cron.schedule(
    schedule,
    () => {
      runSync("scheduled");
    },
    { timezone }
  );

  console.log(`[reviews-cron] Scheduled daily at "${schedule}" (${timezone})`);
}

module.exports = { startReviewsCron, runSync };
