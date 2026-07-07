const Review = require("../models/Review");
const ReviewMeta = require("../models/ReviewMeta");
const { syncGoogleReviews } = require("../services/googleReviewsSync");
const { logAdminActivity } = require("../utils/logAdminActivity");

const META_KEY = "google_sync";

function toPublicReview(doc) {
  return {
    name: doc.authorName,
    stars: doc.rating,
    text: doc.text || "",
    reviewUrl: doc.authorUrl || "",
    relativeTime: doc.relativeTime || "",
    profilePhotoUrl: doc.profilePhotoUrl || "",
    googleTime: doc.googleTime,
  };
}

exports.getPublic = async (req, res) => {
  try {
    const [reviews, meta] = await Promise.all([
      Review.find().sort({ googleTime: -1 }).limit(5),
      ReviewMeta.findOne({ key: META_KEY }),
    ]);
    const first = reviews[0];

    const updatedAt =
      meta?.lastSyncAt ||
      reviews.reduce(
        (latest, r) => (r.fetchedAt > latest ? r.fetchedAt : latest),
        reviews[0]?.fetchedAt || null
      );

    res.json({
      success: true,
      data: {
        placeName: meta?.placeName || first?.placeName || "Safety Training Academy",
        placeRating: meta?.placeRating ?? first?.placeRating ?? 5,
        userRatingsTotal: meta?.userRatingsTotal ?? null,
        updatedAt,
        reviews: reviews.map(toPublicReview),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sync = async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production" && req.query.force !== "1") {
      const enabled =
        process.env.GOOGLE_REVIEWS_CRON_ENABLED === "true" ||
        process.env.REVIEWS_SYNC_MANUAL_ENABLED === "true";
      if (!enabled) {
        return res.status(403).json({
          success: false,
          message: "Manual sync is disabled in production.",
        });
      }
    }

    const result = await syncGoogleReviews({ force: true });
    logAdminActivity(req, {
      action: "update",
      module: "review",
      summary: "Synced Google reviews",
    });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
