// import "../../styles/AboutSection.css"
// import ReviewsSection from "../ReviewsSection"
// import woodcutImg from "../../assets/about-us-woodcut.jpeg"
// import systemUser from "../../assets/about-us-sys.jpeg"
// import fire from "../../assets/about-us-fire.jpeg"
// import workers from "../../assets/workers.png"

// function AboutSection() {

//     return (

//         <section className="about-section">

//             <div className="container about-grid">

//                 <div className="about-content">

//                     <div className="about-badge">24</div>

//                     <h2>About Us</h2>

//                     <p>
//                         Safety Training Academy is a Registered Training Organization specializing in
//                         Training and Assessing of High-Risk Licencing under the National Standard.
//                     </p>

//                     <p>
//                         Our team consists of highly skilled industry experts with extensive field
//                         experience and modern training facilities.
//                     </p>

//                     <div className="about-stats">

//                         <div className="stat-box">
//                             <div className="icon">📅</div>
//                             <div className="about-sec-info">
//                                 <h3>2019</h3>
//                                 <p>Year Established</p>
//                             </div>
//                         </div>

//                         <div className="stat-box">
//                             <div className="icon">👥</div>
//                             <div className="about-sec-info">
//                                 <h3>Over 50</h3>
//                                 <p>Years of combined experience</p>
//                             </div>
//                         </div>

//                     </div>

//                     <button className="about-btn">See More</button>

//                 </div>


//                 <div className="about-images">

//                     <img className="system-using-aboutus" src={systemUser} />
//                     <img className="workers-aboutus" src={workers} />
//                     <img className="fire-aboutus" src={fire} />
//                     <img className="woodcut-aboutus" src={woodcutImg} />

//                 </div>

//             </div>
//             <ReviewsSection />

//         </section>

//     )

// }

// export default AboutSection
import "../../styles/AboutSection.css"
import { useNavigate } from "react-router-dom"
import { useMemo } from "react"
import { useGoogleReviews, shortAuthorName, starsString, getReviewDisplayText, GOOGLE_REVIEWS_MAX } from "../../hooks/useGoogleReviews"
import { FALLBACK_ABOUT_REVIEWS } from "../../data/reviewsFallback"

const features = [
    { icon: "🏛", title: "SafeWork NSW Approved RTO #45234", sub: "Nationally recognised — valid in all states" },
    { icon: "📜", title: "Certificate Issued Same Day", sub: "No waiting — walk out job-ready" },
    { icon: "📅", title: "Sunday Sessions Available", sub: "Flexible scheduling for shift workers" },
    { icon: "💰", title: "All-Inclusive Pricing — No Hidden Fees", sub: "SafeWork card fee included in White Card price" },
    { icon: "📍", title: "Sefton NSW — Easy Parking", sub: "3/14-16 Marjorie Street, Sefton NSW 2162" },
]

function AboutSection() {
    const navigte = useNavigate()
    const {
        reviews: apiReviews,
        reviewCountFormatted,
        placeRating,
        userRatingsTotal,
    } = useGoogleReviews()

    const stats = useMemo(
        () => [
            { num: reviewCountFormatted, label: "5-star Google reviews" },
            { num: "15+", label: "courses offered" },
            { num: "2019", label: "established in NSW" },
            {
                num: `${Number(placeRating).toFixed(1)} ★`,
                label: "average Google rating",
            },
        ],
        [reviewCountFormatted, placeRating]
    )

    const reviewsDesc = useMemo(() => {
        const total = Number(userRatingsTotal)
        const count =
            Number.isFinite(total) && total > 0
                ? total.toLocaleString("en-AU")
                : "1,000+"
        return `Safety Training Academy has been delivering nationally recognised workplace safety training since 2019. Over ${count} five-star reviews — and certificate same day.`
    }, [userRatingsTotal])

    const reviews = useMemo(() => {
        if (!apiReviews.length) return FALLBACK_ABOUT_REVIEWS
        return apiReviews.slice(0, GOOGLE_REVIEWS_MAX).map((r) => ({
            stars: starsString(r.stars),
            text: getReviewDisplayText(r),
            author: `${shortAuthorName(r.name)} · ${r.relativeTime || "Google Review"}`,
        }))
    }, [apiReviews])

    return (
        <section className="wcs-section">
            <div className="wcs-split">

                {/* LEFT — Visual */}
                <div className="wcs-visual">
                    <div className="wcs-visual-title">Trusted by thousands</div>
                    <div className="wcs-stat-grid">
                        {stats.map((s, i) => (
                            <div className="wcs-stat-card" key={i}>
                                <div className="wcs-stat-num">{s.num}</div>
                                <div className="wcs-stat-lbl">{s.label}</div>
                            </div>
                        ))}
                    </div>
                    {reviews.map((r, i) => (
                        <div className="wcs-review-block" key={i}>
                            <div className="wcs-rb-stars">{r.stars}</div>
                            <div className="wcs-rb-text">"{r.text}"</div>
                            <div className="wcs-rb-author">{r.author}</div>
                        </div>
                    ))}
                </div>

                {/* RIGHT — Content */}
                <div className="wcs-content">
                    <div className="wcs-label">Why choose STA</div>
                    <div className="wcs-title">NSW's Most Trusted Training RTO</div>
                    <p className="wcs-desc">{reviewsDesc}</p>
                    <ul className="wcs-feature-list">
                        {features.map((f, i) => (
                            <li key={i}>
                                <div className="wcs-fi-icon">{f.icon}</div>
                                <div className="wcs-fi-text">
                                    <div className="wcs-fi-title">{f.title}</div>
                                    <div className="wcs-fi-sub">{f.sub}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button className="wcs-cta-btn" onClick={()=> {navigte(`/book-now`)}}>Book Your Course Now</button>
                </div>

            </div>
        </section>
    )
}

export default AboutSection