const axios = require("axios");
const Review = require("../models/Review");
const ReviewMeta = require("../models/ReviewMeta");

const META_KEY = "google_sync";
const MAX_REVIEWS = 5;

function todayInTimezone(timezone) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function buildPlacesUrl() {
  const placeId = process.env.GOOGLE_PLACE_ID;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!placeId || !apiKey) {
    throw new Error("GOOGLE_PLACE_ID and GOOGLE_PLACES_API_KEY must be set");
  }
  const params = new URLSearchParams({
    place_id: placeId,
    fields: "name,rating,user_ratings_total,reviews",
    reviews_sort: "newest",
    key: apiKey,
  });
  return `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`;
}

async function syncGoogleReviews({ force = false } = {}) {
  const timezone =
    process.env.REVIEWS_CRON_TIMEZONE ||
    process.env.GOOGLE_REVIEWS_CRON_TIMEZONE ||
    "Australia/Sydney";
  const today = todayInTimezone(timezone);

  if (!force) {
    const meta = await ReviewMeta.findOne({ key: META_KEY });
    if (meta?.lastSyncDate === today) {
      return { skipped: true, reason: "already_synced_today", date: today };
    }
  }

  const url = buildPlacesUrl();
  const { data } = await axios.get(url, { timeout: 30000 });

  if (data.status !== "OK" || !data.result) {
    const message = data.error_message || data.status || "Unknown Places API error";
    await ReviewMeta.findOneAndUpdate(
      { key: META_KEY },
      { lastError: message, lastSyncAt: new Date() },
      { upsert: true }
    );
    throw new Error(message);
  }

  const {
    name: placeName = "",
    rating: placeRating = null,
    user_ratings_total: userRatingsTotal = null,
    reviews = [],
  } = data.result;
  const top = reviews.slice(0, MAX_REVIEWS);
  const fetchedAt = new Date();

  const docs = top.map((r) => ({
    googleTime: r.time,
    authorName: r.author_name || "Anonymous",
    authorUrl: r.author_url || "",
    profilePhotoUrl: r.profile_photo_url || "",
    rating: r.rating ?? 5,
    text: r.text || "",
    relativeTime: r.relative_time_description || "",
    placeName,
    placeRating,
    fetchedAt,
  }));

  if (docs.length > 0) {
    await Review.deleteMany({});
    await Review.insertMany(docs);
  }

  await ReviewMeta.findOneAndUpdate(
    { key: META_KEY },
    {
      lastSyncDate: today,
      lastSyncAt: fetchedAt,
      lastError: "",
      placeName,
      placeRating,
      userRatingsTotal,
    },
    { upsert: true }
  );

  return {
    skipped: false,
    count: docs.length,
    placeName,
    placeRating,
    userRatingsTotal,
    syncedAt: fetchedAt,
  };
}

module.exports = { syncGoogleReviews, MAX_REVIEWS };
