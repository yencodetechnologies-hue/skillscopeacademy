import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../data/service";
import { FALLBACK_REVIEWS_SECTION } from "../data/reviewsFallback";

export function shortAuthorName(fullName) {
  if (!fullName) return "Anonymous";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

export function starsString(rating) {
  const n = Math.min(5, Math.max(1, Math.round(Number(rating) || 5)));
  return "★".repeat(n);
}

/** Text for star-only Google reviews (API often returns empty text). */
export function getReviewDisplayText(review) {
  const t = String(review?.text || "").trim();
  if (t) return t;
  const stars = Math.round(Number(review?.stars) || 5);
  const when = review?.relativeTime || "on Google";
  return `Rated ${stars} stars · ${when}`;
}

export const GOOGLE_REVIEWS_MAX = 5;
const FALLBACK_TOTAL = 1000;

export function formatReviewCount(total) {
  const n = Number(total);
  if (!Number.isFinite(n) || n <= 0) {
    return `${FALLBACK_TOTAL.toLocaleString("en-AU")}+`;
  }
  return n.toLocaleString("en-AU");
}

export function formatGoogleReviewsLabel(total) {
  const n = Number(total);
  if (!Number.isFinite(n) || n <= 0) {
    return `${FALLBACK_TOTAL.toLocaleString("en-AU")}+ Google reviews`;
  }
  return `${n.toLocaleString("en-AU")} Google reviews`;
}

export function formatTrustReviewsLine(rating, total) {
  const r = Number(rating);
  const ratingStr = Number.isFinite(r) ? r.toFixed(1) : "5.0";
  const n = Number(total);
  const countStr =
    Number.isFinite(n) && n > 0
      ? n.toLocaleString("en-AU")
      : `${FALLBACK_TOTAL.toLocaleString("en-AU")}+`;
  return `⭐ ${ratingStr} · ${countStr} reviews`;
}

/**
 * Fetches synced Google reviews from the backend (up to 5, including star-only).
 */
export function useGoogleReviews() {
  const [reviews, setReviews] = useState(FALLBACK_REVIEWS_SECTION);
  const [placeName, setPlaceName] = useState("SafeTicks");
  const [placeRating, setPlaceRating] = useState(5);
  const [userRatingsTotal, setUserRatingsTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fromApi, setFromApi] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await axios.get(`${API_URL}/api/reviews/public`);
        if (cancelled || !res.data?.success) return;

        const data = res.data.data || {};
        const list = (data.reviews || []).slice(0, GOOGLE_REVIEWS_MAX);

        if (list.length > 0) setReviews(list);
        if (data.placeName) setPlaceName(data.placeName);
        if (data.placeRating != null) setPlaceRating(data.placeRating);
        if (data.userRatingsTotal != null) {
          setUserRatingsTotal(Number(data.userRatingsTotal));
          setFromApi(true);
        } else if (list.length > 0) {
          setFromApi(true);
        }
      } catch {
        // keep fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    reviews,
    placeName,
    placeRating,
    userRatingsTotal,
    loading,
    fromApi,
    reviewCountLabel: formatGoogleReviewsLabel(userRatingsTotal),
    reviewCountFormatted: formatReviewCount(userRatingsTotal),
    trustReviewsLine: formatTrustReviewsLine(placeRating, userRatingsTotal),
  };
}
