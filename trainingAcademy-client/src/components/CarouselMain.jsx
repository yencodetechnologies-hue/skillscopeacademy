import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Carousel.css";
import { API_URL } from "../data/service";
import { cdnImage } from "../utils/cdnImage";

export default function HomePage({ courses = [] }) {
  // Categories now come from /api/categories so we get the admin-managed
  // image. We fall back to deriving from `courses` if the fetch fails or
  // the field is empty (legacy data) so the carousel never goes blank.
  const [dbCategories, setDbCategories] = useState(null);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    axios
      .get(`${API_URL}/api/categories`)
      .then((res) => { if (alive) setDbCategories(Array.isArray(res.data) ? res.data : []); })
      .catch(() => { if (alive) setDbCategories([]); });
    return () => { alive = false; };
  }, []);

  // Derive a quick "course image by category name" map so we can keep the
  // legacy fallback for categories that haven't been given an image yet.
  const courseImgByCat = courses.reduce((acc, c) => {
    if (!c?.category) return acc;
    const key = typeof c.category === "string" ? c.category : (c.category?.name || "");
    if (key && !acc[key] && c.image) acc[key] = c.image;
    return acc;
  }, {});

  // Build the final list. Prefer the active categories from the DB. If the
  // fetch failed and we have nothing, use the deduped course-derived list.
  let categoryList = [];
  if (dbCategories === null) {
    categoryList = []; // loading
  } else if (dbCategories.length > 0) {
    categoryList = dbCategories
      .filter((c) => c.active !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0)) // ✅ Respect Admin Order
      .map((c) => ({
        name: c.name,
        image: c.image || courseImgByCat[c.name] || "",
      }));
  } else {
    categoryList = [
      ...new Map(
        courses
          .filter((c) => c?.category)
          .map((c) => {
            const key = typeof c.category === "string" ? c.category : (c.category?.name || "");
            return [key, { name: key, image: c.image }];
          })
      ).values(),
    ]
      .filter((cat) => cat.name)
      .sort((a, b) => a.name.localeCompare(b.name)); // Default to alphabetical
  }

  // Duplicate the list for seamless infinite scroll
  const marqueeList = categoryList;

  const loading = dbCategories === null && courses.length === 0;

  return (
    <section className="hp-section">
      <div className="hp-header">
        <div className="hp-header-left">
          {/* <p className="hp-tagline">Explore Our Courses</p> */}
          {/* <h2 className="hp-title">Engineered for your career</h2> */}
        </div>
      </div>

      <div className="hp-carousel-container">
        <div className="hp-track marquee-scroll">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="hp-card hp-card-skeleton" />
              ))
            : marqueeList.map((cat, idx) => (
                <div
                  key={`${cat.name}-${idx}`}
                  className="hp-card"
                  onClick={() =>
                    navigate(`/all-courses?category=${encodeURIComponent(cat.name)}`)
                  }
                >
                  <div className="hp-card-img-wrap">
                    {cat.image ? (
                      <img
                        src={cdnImage(cat.image, { w: 320 })}
                        alt={cat.name}
                        className="hp-card-img"
                        loading="lazy"
                        decoding="async"
                        width="320"
                        height="200"
                      />
                    ) : (
                      <div className="hp-card-img-placeholder" />
                    )}
                  </div>
                  <div className="hp-card-label">{cat.name}</div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
