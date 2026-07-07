import { useRef, useState } from "react";
import "../styles/ReviewsSection.css";
import { useGoogleReviews, getReviewDisplayText } from "../hooks/useGoogleReviews";

function ReviewsSection() {
  const { reviews: allReviews } = useGoogleReviews();
  const reviews = allReviews;

  const trackRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const doubled = reviews;

  return (
    <section className="reviews-section">
      <div className="container review-container">
        <h2 className="review-title">Reviews</h2>

        <div
          className="carousel-wrapper"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className={`carousel-track ${isPaused ? "paused" : ""}`}
            ref={trackRef}
            style={{ "--total": doubled.length }}
          >
            {doubled.map((r, i) => (
              <div key={i} className="review-card">
                <div className="review-avatar">
                  {r.name.charAt(0).toUpperCase()}
                </div>
                <h4 className="reviewer-name">{r.name}</h4>
                <div className="stars">
                  {"⭐".repeat(r.stars)}
                </div>
                <p className="review-text">"{getReviewDisplayText(r)}"</p>

                <a
                  href={r.reviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="review-btn"
                >
                  View on Google
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReviewsSection;
