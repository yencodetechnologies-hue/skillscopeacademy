import { useState, useEffect } from "react";
import { useFormik } from "formik"
import * as Yup from "yup"
import axios from "axios"
import "../../styles/CreateCourseModal.css";
import DynamicField from "../DynamicField";
import { API_URL } from "../../data/service";
import { authHeaders } from "../../utils/authHeaders";

// Quick client-side slug sanitizer — mirrors the backend's `slugify`
// rules so what the admin previews matches what gets persisted.
const toSlug = (raw) =>
    String(raw || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")

function CreateCourseModal({ close, categories, refreshCourses, editCourse }) {

    const [activeTab, setActiveTab] = useState("basic")
    const [descriptions, setDescriptions] = useState([""]);
    const [trainingOverview, setTrainingOverview] = useState([""]);
    const [vocationalOutcome, setVocationalOutcome] = useState([""]);
    const [feesCharges, setFeesCharges] = useState([""]);
    const [optionalCharges, setOptionalCharges] = useState([""]);
    const [outcomePoint, setOutcomePoint] = useState([""]);
    const [requirements, setRequirements] = useState([""]);
    const [pathways, setPathways] = useState([""]);
    const [pricingType, setPricingType] = useState("standard")
    const [comboEnabled, setComboEnabled] = useState(false)
    const [withExpPrice, setWithExpPrice] = useState("")
    const [withExpOriginal, setWithExpOriginal] = useState("")
    const [withoutExpPrice, setWithoutExpPrice] = useState("")
    const [withoutExpOriginal, setWithoutExpOriginal] = useState("")
    const [slSingleStrikePrice, setSlSingleStrikePrice] = useState("")
    const [slSinglePrice, setSlSinglePrice] = useState("")
    const [imageType, setImageType] = useState("url")
    const [imageFile, setImageFile] = useState(null)
    const [comboDescription, setComboDescription] = useState("")
    const [comboPrice, setComboPrice] = useState("")
    const [comboDuration, setComboDuration] = useState("")
    const [handbookTitle, setHandbookTitle] = useState("")
    const [handbookFile, setHandbookFile] = useState(null)
    const [handbookUrl, setHandbookUrl] = useState("")
    const [existingHandbookPdf, setExistingHandbookPdf] = useState("")
    const [handbookCardImageFile, setHandbookCardImageFile] = useState(null)
    const [existingHandbookCardImage, setExistingHandbookCardImage] = useState("")
    const [syllabusFile, setSyllabusFile] = useState(null)
    const [existingSyllabusUrl, setExistingSyllabusUrl] = useState("")

    // Yup schema — only the slug is enforced strictly here. Other fields
    // already have permissive backend handling, so we don't lock them down.
    // The unique check is async; Formik runs it on blur and on submit
    // (validateOnChange is intentionally off for the slug, keyed by
    // the `validateOnBlur: true` behaviour Formik defaults to).
    const validationSchema = Yup.object({
        slug: Yup.string()
            .trim()
            .required("Slug is required")
            .matches(
                /^[a-z0-9-]+$/,
                "Use lowercase letters, numbers and hyphens only"
            )
            .test(
                "unique-slug",
                "already exists, try a different one",
                async function (value) {
                    if (!value) return true
                    if (!/^[a-z0-9-]+$/.test(value)) return true
                    try {
                        const url = `${API_URL}/api/courses/slug-available/${encodeURIComponent(value)}`
                        const params = editCourse?._id ? { excludeId: editCourse._id } : {}
                        const res = await axios.get(url, { params })
                        return !!res.data?.available
                    } catch {
                        return true
                    }
                }
            ),
    })

    const formik = useFormik({
        enableReinitialize: true,
        validationSchema,
        validateOnChange: false,
        validateOnBlur: true,

        initialValues: {
            courseCode: editCourse?.courseCode || "",
            title: editCourse?.title || "",
            slug:  editCourse?.slug  || "",
            category: editCourse?.category?._id || editCourse?.category || "",
            duration: editCourse?.duration || "",
            certificateValidity: editCourse?.certificateValidity || "",
            deliveryMethod: editCourse?.deliveryMethod || "",
            location: editCourse?.location || "",
            courseImage: editCourse?.image || "",
            originalPrice: editCourse?.originalPrice || "",
            sellingPrice: editCourse?.sellingPrice || "",
            vocPrice: editCourse?.vocPrice ?? 150,
            slblStrikePrice: editCourse?.slblStrikePrice || "",
            slblPrice: editCourse?.slblPrice || "",
            metaTitle: editCourse?.metaTitle || "",
            metaDescription: editCourse?.metaDescription || "",

        },
        onSubmit: async (values, { setFieldError }) => {

            const formData = new FormData()

            // normal fields
            formData.append("courseCode", values.courseCode)
            formData.append("title", values.title)
            // Manual SEO slug — sanitize one more time before sending so a
            // copy-pasted value with stray casing/spaces never breaks the
            // backend's strict regex.
            formData.append("slug", toSlug(values.slug))
            formData.append("category", values.category)
            formData.append("duration", values.duration)
            formData.append("certificateValidity", values.certificateValidity)
            formData.append("deliveryMethod", values.deliveryMethod)
            formData.append("location", values.location)
            formData.append("metaTitle", values.metaTitle || "")
            formData.append("metaDescription", values.metaDescription || "")

            formData.append("pricingType", pricingType)
            formData.append("originalPrice", values.originalPrice)
            formData.append("sellingPrice", values.sellingPrice)
            formData.append("vocPrice", values.vocPrice)
            formData.append("slSingleStrikePrice", slSingleStrikePrice)
            formData.append("slSinglePrice", slSinglePrice)
            formData.append("slblStrikePrice", values.slblStrikePrice)
            formData.append("slblPrice", values.slblPrice)

            // arrays convert to string
            formData.append("description", JSON.stringify(descriptions))
            formData.append("trainingOverview", JSON.stringify(trainingOverview))
            formData.append("vocationalOutcome", JSON.stringify(vocationalOutcome))
            formData.append("feesCharges", JSON.stringify(feesCharges))
            formData.append("optionalCharges", JSON.stringify(optionalCharges))
            formData.append("outcomePoints", JSON.stringify(outcomePoint))

            formData.append("requirements", JSON.stringify(requirements))
            formData.append("pathways", JSON.stringify(pathways))

            formData.append("experienceBasedBooking", pricingType === "experience")

            formData.append("withExperiencePrice", withExpPrice)
            formData.append("withExperienceOriginal", withExpOriginal)
            formData.append("withoutExperiencePrice", withoutExpPrice)
            formData.append("withoutExperienceOriginal", withoutExpOriginal)
            formData.append("comboEnabled", comboEnabled)
            formData.append("comboDescription", comboDescription)
            formData.append("comboPrice", comboPrice)
            formData.append("comboDuration", comboDuration)

            // image logic
            if (imageType === "upload" && imageFile) {
                formData.append("image", imageFile)
            }

            if (imageType === "url") {
                formData.append("image", values.courseImage)
            }

            // handbook logic
            formData.append("handbookTitle", handbookTitle)
            if (handbookFile) {
                formData.append("handbookPdf", handbookFile)
            } else {
                formData.append("handbookPdf", existingHandbookPdf || "")
            }

            if (handbookCardImageFile) {
                formData.append("handbookCardImage", handbookCardImageFile)
            } else {
                formData.append("handbookCardImage", existingHandbookCardImage || "")
            }
            formData.append("handbookUrl", handbookUrl)

            if (syllabusFile) {
                formData.append("syllabusPdf", syllabusFile)
            } else {
                formData.append("syllabusPdf", existingSyllabusUrl || "")
            }

            try {

                if (editCourse) {

                    await axios.put(
                        `${API_URL}/api/courses/${editCourse._id}`,
                        formData,
                        { headers: authHeaders() }
                    )

                } else {

                    await axios.post(
                        `${API_URL}/api/courses`,
                        formData,
                        { headers: authHeaders() }
                    )

                }

                refreshCourses()
                close()

            } catch (err) {
                // Race-condition / direct-DB conflict — backend returns
                // { field: "slug", message: "already exists, ..." }.
                const data = err?.response?.data
                if (err?.response?.status === 409 && data?.field === "slug") {
                    setFieldError("slug", data.message || "already exists, try a different one")
                    return
                }
                console.log(err)
            }

        }
    })
    useEffect(() => {
        if (editCourse) {
            setDescriptions(editCourse.description || [""]);
            setTrainingOverview(editCourse.trainingOverview || [""]);
            setVocationalOutcome(editCourse.vocationalOutcome || [""]);
            setFeesCharges(editCourse.feesCharges || [""]);
            setOptionalCharges(editCourse.optionalCharges || [""]);
            setOutcomePoint(editCourse.outcomePoints || [""]);
            setRequirements(editCourse.requirements || [""]);
            setPathways(editCourse.pathways || [""]);
            setPricingType(editCourse.pricingType || (editCourse.experienceBasedBooking ? "experience" : "standard"));
            setImageType("url")
            setWithExpPrice(editCourse.withExperiencePrice || "");
            setWithExpOriginal(editCourse.withExperienceOriginal || "");
            setWithoutExpPrice(editCourse.withoutExperiencePrice || "");
            setWithoutExpOriginal(editCourse.withoutExperienceOriginal || "");
            setSlSingleStrikePrice(editCourse.slSingleStrikePrice || "");
            setSlSinglePrice(editCourse.slSinglePrice || "");
            setComboEnabled(editCourse.comboEnabled || false);
            setComboDescription(editCourse.comboDescription || "");
            setComboPrice(editCourse.comboPrice || "");
            setComboDuration(editCourse.comboDuration || "");
            setHandbookTitle(editCourse.handbook?.title || "");
            setHandbookUrl(editCourse.handbook?.url || "");
            setExistingHandbookPdf(editCourse.handbook?.pdf || "");
            setExistingHandbookCardImage(editCourse.handbook?.cardImage || "");
            setExistingSyllabusUrl(editCourse.syllabusUrl || "");
        } else {
            setDescriptions([""]);
            setTrainingOverview([""]);
            setVocationalOutcome([""]);
            setFeesCharges([""]);
            setOptionalCharges([""]);
            setOutcomePoint([""]);
            setRequirements([""]);
            setPathways([""]);
            setPricingType("standard");
            setImageType("upload");
            setWithExpPrice("");
            setWithExpOriginal("");
            setWithoutExpPrice("");
            setWithoutExpOriginal("");
            setSlSingleStrikePrice("");
            setSlSinglePrice("");
            setComboEnabled(false);
            setComboDescription("");
            setComboPrice("");
            setComboDuration("");
            setHandbookTitle("");
            setHandbookUrl("");
            setExistingHandbookPdf("");
            setExistingHandbookCardImage("");
            setExistingSyllabusUrl("");
            setSyllabusFile(null);
            setHandbookFile(null);
        }
    }, [editCourse]);

    return (

        <div className="modal-overlay">

            <div className="course-modal">

                <div className="modal-header">

                    <div>
                        <h2>Create New Course</h2>
                        <p>Set up a new course with comprehensive details</p>
                    </div>

                    <button onClick={close}>✕</button>

                </div>

                {/* TABS */}

                <div className="modal-tabs">

                    <button
                        className={activeTab === "basic" ? "active" : ""}
                        onClick={() => setActiveTab("basic")}
                    >
                        Basic Info
                    </button>

                    <button
                        className={activeTab === "details" ? "active" : ""}
                        onClick={() => setActiveTab("details")}
                    >
                        Details
                    </button>

                    <button
                        className={activeTab === "requirements" ? "active" : ""}
                        onClick={() => setActiveTab("requirements")}
                    >
                        Requirements
                    </button>

                    <button
                        className={activeTab === "pathways" ? "active" : ""}
                        onClick={() => setActiveTab("pathways")}
                    >
                        Pathways
                    </button>

                    <button
                        className={activeTab === "combo" ? "active" : ""}
                        onClick={() => setActiveTab("combo")}
                    >
                        Combo Offer
                    </button>

                </div>

                {/* TAB CONTENT */}
                <form onSubmit={formik.handleSubmit}>
                    <div className="modal-body">


                        {activeTab === "basic" && (

                            <div className="form-grid">

                                <div className="course-form">

                                    <div className="form-group">
                                        <label>Course Code (Optional)</label>
                                        <input type="text" placeholder="e.g., RIIHAN309F"
                                            name="courseCode"
                                            value={formik.values.courseCode}
                                            onChange={formik.handleChange}
                                        />
                                    </div>

                                    {/* ✅ ONLY CHANGE: category dropdown from backend */}
                                    <div className="form-group">
                                        <label>Category (Optional)</label>
                                        <select
                                            name="category"
                                            value={formik.values.category}
                                            onChange={formik.handleChange}
                                        >
                                            <option value="">Select Category</option>
                                            {categories && categories.map((cat, i) => (
                                                <option
                                                    key={i}
                                                    value={typeof cat === "object" && cat._id ? cat._id : cat}
                                                >
                                                    {typeof cat === "object" ? cat.name : cat}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <p className="pricing">Pricing Type</p>
                                    <div className="pricing-type-selector">
                                        <label className={`pricing-type-option ${pricingType === "standard" ? "active" : ""}`}>
                                            <input type="radio" value="standard" checked={pricingType === "standard"} onChange={() => setPricingType("standard")} />
                                            Standard
                                        </label>
                                        <label className={`pricing-type-option ${pricingType === "experience" ? "active" : ""}`}>
                                            <input type="radio" value="experience" checked={pricingType === "experience"} onChange={() => setPricingType("experience")} />
                                            Experience-Based
                                        </label>
                                        <label className={`pricing-type-option ${pricingType === "slbl" ? "active" : ""}`}>
                                            <input type="radio" value="slbl" checked={pricingType === "slbl"} onChange={() => setPricingType("slbl")} />
                                            SL or BL
                                        </label>
                                    </div>

                                    <div className="form-group">
                                        <label>VOC Price ($)</label>
                                        <input type="number" placeholder="e.g., 150"
                                            name="vocPrice"
                                            value={formik.values.vocPrice}
                                            onChange={formik.handleChange}
                                        />
                                    </div>

                                    {pricingType === "standard" && (
                                        <>
                                            <div className="form-group">
                                                <label>Original Price / Strike Price ($)</label>
                                                <input type="number" placeholder="e.g., 1200"
                                                    name="originalPrice"
                                                    value={formik.values.originalPrice}
                                                    onChange={formik.handleChange}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Selling Price ($)</label>
                                                <input type="number" placeholder="e.g., 1050"
                                                    name="sellingPrice"
                                                    value={formik.values.sellingPrice}
                                                    onChange={formik.handleChange}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {pricingType === "experience" && (
                                        <div className="experience-pricing">
                                            <div className="experience-card">
                                                <h3>With Experience</h3>
                                                <label>Strike Price ($)</label>
                                                <input type="number" placeholder="e.g., 500"
                                                    value={withExpOriginal}
                                                    onChange={(e) => setWithExpOriginal(e.target.value)}
                                                />
                                                <label>Selling Price ($)</label>
                                                <input type="number" placeholder="e.g., 400"
                                                    value={withExpPrice}
                                                    onChange={(e) => setWithExpPrice(e.target.value)}
                                                />
                                            </div>
                                            <div className="experience-card no-exp">
                                                <h3>Without Experience</h3>
                                                <label>Strike Price ($)</label>
                                                <input type="number" placeholder="e.g., 800"
                                                    value={withoutExpOriginal}
                                                    onChange={(e) => setWithoutExpOriginal(e.target.value)}
                                                />
                                                <label>Selling Price ($)</label>
                                                <input type="number" placeholder="e.g., 620"
                                                    value={withoutExpPrice}
                                                    onChange={(e) => setWithoutExpPrice(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {pricingType === "slbl" && (
                                        <>
                                            <p className="pricing-sub">SL or BL (individual)</p>
                                            <div className="form-group">
                                                <label>Strike Price ($)</label>
                                                <input type="number" placeholder="e.g., 1200"
                                                    value={slSingleStrikePrice}
                                                    onChange={(e) => setSlSingleStrikePrice(e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Selling Price ($)</label>
                                                <input type="number" placeholder="e.g., 1050"
                                                    value={slSinglePrice}
                                                    onChange={(e) => setSlSinglePrice(e.target.value)}
                                                />
                                            </div>
                                            <p className="pricing-sub">SL + BL (combo)</p>
                                            <div className="form-group">
                                                <label>Strike Price ($)</label>
                                                <input type="number" placeholder="e.g., 2200"
                                                    name="slblStrikePrice"
                                                    value={formik.values.slblStrikePrice}
                                                    onChange={formik.handleChange}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Selling Price ($)</label>
                                                <input type="number" placeholder="e.g., 1900"
                                                    name="slblPrice"
                                                    value={formik.values.slblPrice}
                                                    onChange={formik.handleChange}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="course-form">
                                    <div className="form-group">
                                        <label>Course Title (Optional)</label>
                                        <input type="text" placeholder="e.g., Conduct Telescopic mate"
                                            name="title"
                                            value={formik.values.title}
                                            onChange={formik.handleChange}
                                            onBlur={(e) => {
                                                formik.handleBlur(e)
                                                // Auto-suggest the slug only when the field is
                                                // still empty — never overwrite an admin's
                                                // manual choice.
                                                if (!formik.values.slug && e.target.value) {
                                                    formik.setFieldValue("slug", toSlug(e.target.value))
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>URL Slug *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., forklift-licence"
                                            name="slug"
                                            value={formik.values.slug}
                                            onChange={(e) => {
                                                // Live-sanitize as the admin types so what
                                                // they see is exactly what gets saved.
                                                formik.setFieldValue("slug", e.target.value.toLowerCase())
                                            }}
                                            onBlur={(e) => {
                                                formik.setFieldValue("slug", toSlug(e.target.value))
                                                formik.handleBlur(e)
                                            }}
                                            style={{
                                                borderColor:
                                                    formik.touched.slug && formik.errors.slug
                                                        ? "#e53935"
                                                        : undefined,
                                            }}
                                        />
                                        <small style={{ color: "#6b7280", fontSize: 12 }}>
                                            Page URL: <code>/course/{formik.values.slug || "your-slug"}</code>
                                        </small>
                                        {formik.touched.slug && formik.errors.slug && (
                                            <div
                                                style={{
                                                    color: "#e53935",
                                                    fontSize: 12,
                                                    marginTop: 4,
                                                }}
                                            >
                                                {formik.errors.slug}
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label>Duration (Optional)</label>
                                        <input type="text" placeholder="e.g., 1 Day Course"
                                            name="duration"
                                            value={formik.values.duration}
                                            onChange={formik.handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Certificate Validity (Optional)</label>
                                        <input type="text" placeholder="e.g., 3 years"
                                            name="certificateValidity"
                                            value={formik.values.certificateValidity}
                                            onChange={formik.handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Delivery Method</label>
                                        <input type="text" placeholder="e.g., Online, Classroom"
                                            name="deliveryMethod"
                                            value={formik.values.deliveryMethod}
                                            onChange={formik.handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Location</label>
                                        <input type="text" placeholder="e.g., New York, London"
                                            name="location"
                                            value={formik.values.location}
                                            onChange={formik.handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Course Image</label>
                                        <div className="image-upload-options">

                                            <button
                                                type="button"
                                                className={imageType === "upload" ? "active" : ""}
                                                onClick={() => setImageType("upload")}
                                            >
                                                Upload Image
                                            </button>

                                            <button
                                                type="button"
                                                className={imageType === "url" ? "active" : ""}
                                                onClick={() => setImageType("url")}
                                            >
                                                URL
                                            </button>

                                        </div>
                                        {imageType === "upload" && imageFile && (
                                            <img
                                                src={URL.createObjectURL(imageFile)}
                                                alt="preview"
                                                style={{ width: "120px", borderRadius: "8px", marginTop: "10px" }}
                                            />
                                        )}

                                        {/* ✅ URL preview — type பண்ணும் போதே + edit mode existing image */}
                                        {imageType === "url" && formik.values.courseImage && (
                                            <img
                                                key={formik.values.courseImage}
                                                src={formik.values.courseImage}
                                                alt="preview"
                                                onError={(e) => e.target.style.display = "none"}  // ✅ broken URL hide
                                                style={{ width: "200px", borderRadius: "8px", marginTop: "20px", display: "block" }}
                                            />
                                        )}
                                    </div>
                                    <div className="form-group">
                                        {imageType === "upload" && (

                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setImageFile(e.target.files[0])}
                                            />

                                        )}

                                        {imageType === "url" && (

                                            <input
                                                type="text"
                                                placeholder="https://example.com/image.jpg"
                                                name="courseImage"
                                                value={formik.values.courseImage}
                                                onChange={formik.handleChange}
                                            />

                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "details" && (
                            <div className="details-section">
                                <div className="form-group">
                                    <DynamicField
                                        label="Course Description"
                                        placeholder="Course Description..."
                                        values={descriptions}
                                        setValues={setDescriptions}
                                    />
                                </div>
                                <div className="form-group">
                                    <DynamicField
                                        label="Training Overview"
                                        placeholder="Training Overview..."
                                        values={trainingOverview}
                                        setValues={setTrainingOverview}
                                    />
                                </div>
                                <div className="form-group">
                                    <DynamicField
                                        label="Vocational Outcome"
                                        placeholder="Vocational Outcome..."
                                        values={vocationalOutcome}
                                        setValues={setVocationalOutcome}
                                    />
                                </div>
                                <div className="form-group">
                                    <DynamicField
                                        label="Fees and Charges"
                                        placeholder="Fees and Charges..."
                                        values={feesCharges}
                                        setValues={setFeesCharges}
                                    />
                                </div>

                                <div className="form-group">
                                    <DynamicField
                                        label="Optional Charges"
                                        placeholder="Optional Charges..."
                                        values={optionalCharges}
                                        setValues={setOptionalCharges}
                                    />
                                </div>

                                <div className="form-group">
                                    <DynamicField
                                        label="Outcome Point"
                                        placeholder="Outcome Point..."
                                        values={outcomePoint}
                                        setValues={setOutcomePoint}
                                    />
                                </div>

                                <div className="seo-section">
                                    <h3 className="seo-section-title">SEO Settings</h3>

                                    <div className="form-group">
                                        <label>Meta title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. EWP Licence Over 11m | Boom Lift Course NSW | Safety Training Academy"
                                            maxLength={60}
                                            name="metaTitle"
                                            value={formik.values.metaTitle}
                                            onChange={formik.handleChange}
                                        />
                                        <small className="seo-char-count">
                                            {formik.values.metaTitle?.length || 0} / 60
                                        </small>
                                        <small className="seo-hint">
                                            Shown as the blue link title in Google search results. Keep under 60 characters.
                                        </small>
                                    </div>

                                    <div className="form-group">
                                        <label>Meta description</label>
                                        <textarea
                                            placeholder="e.g. Get your EWP over 11m licence in NSW. 3-day boom lift training & SafeWork NSW assessment in Sefton. RTO 45234 accredited. From $500. Book online today."
                                            maxLength={160}
                                            name="metaDescription"
                                            value={formik.values.metaDescription}
                                            onChange={formik.handleChange}
                                            rows={3}
                                        />
                                        <small className="seo-char-count">
                                            {formik.values.metaDescription?.length || 0} / 160
                                        </small>
                                        <small className="seo-hint">
                                            Shown as the grey snippet text below the title in Google. Keep under 160 characters.
                                        </small>
                                    </div>
                                </div>

                            </div>
                        )}

                        {activeTab === "requirements" && (
                            <div className="requirements-section">
                                <DynamicField
                                    label="Course Requirement"
                                    placeholder="Course Requirement..."
                                    values={requirements}
                                    setValues={setRequirements}
                                />

                                <div className="handbook-card" style={{ marginTop: '20px' }}>
                                    <div className="handbook-header">
                                        <span className="icon">📄</span>
                                        <h3>Upload Code of Practice (Optional)</h3>
                                    </div>
                                    <p className="handbook-desc">
                                        Upload a PDF or enter a URL. This document is shown on the course details page with a view option.
                                    </p>
                                    <label>Course of Practice title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Code of Practice Managing the Risk..."
                                        value={handbookTitle}
                                        onChange={(e) => setHandbookTitle(e.target.value)}
                                    />
                                    <label>Upload Course of Practice</label>
                                    <div className="upload-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <label className="upload-btn" style={{ flex: 1, margin: 0, display: 'block' }}>
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={(e) => {
                                                    setHandbookFile(e.target.files[0]);
                                                    setExistingHandbookPdf("");
                                                }}
                                            />
                                            <span>
                                                {handbookFile ? handbookFile.name : (existingHandbookPdf ? "📄 Existing PDF" : "⬆ Choose PDF")}
                                            </span>
                                        </label>
                                        {(handbookFile || existingHandbookPdf) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setHandbookFile(null);
                                                    setExistingHandbookPdf("");
                                                }}
                                                style={{
                                                    background: '#ff4d4f',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '8px 12px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="handbook-card" style={{ marginTop: '20px' }}>
                                    <div className="handbook-header">
                                        <span className="icon">📚</span>
                                        <h3>Upload Course Syllabus (Optional)</h3>
                                    </div>
                                    <p className="handbook-desc">
                                        Upload the course syllabus [PDF]. This will be viewable by students on the course details page.
                                    </p>
                                    <label>Upload Syllabus PDF</label>
                                    <div className="upload-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <label className="upload-btn" style={{ flex: 1, margin: 0, display: 'block' }}>
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={(e) => {
                                                    setSyllabusFile(e.target.files[0]);
                                                    setExistingSyllabusUrl("");
                                                }}
                                            />
                                            <span>
                                                {syllabusFile ? syllabusFile.name : (existingSyllabusUrl ? "📄 Existing Syllabus" : "⬆ Choose Syllabus PDF")}
                                            </span>
                                        </label>
                                        {(syllabusFile || existingSyllabusUrl) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSyllabusFile(null);
                                                    setExistingSyllabusUrl("");
                                                }}
                                                style={{
                                                    background: '#ff4d4f',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '8px 12px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "pathways" && (
                            <div className="details-section">
                                <DynamicField
                                    label="Pathways"
                                    placeholder="Pathways..."
                                    values={pathways}
                                    setValues={setPathways}
                                />

                            </div>

                        )}


                        {activeTab === "combo" && (

                            <div className="combo-section">
                                <div className="combo-card premium">

                                    <div className="combo-header">
                                        <h3>Combo Package Offer</h3>
                                        <span className="badge purple">Premium</span>
                                    </div>

                                    <p className="combo-desc">
                                        Create a combo package offer by bundling this course with another course at a discounted price
                                    </p>

                                    <label className="checkbox-row">
                                        <input type="checkbox"
                                            checked={comboEnabled}
                                            onChange={(e) => setComboEnabled(e.target.checked)}
                                        />
                                        Enable Combo Package Offer
                                    </label>
                                    {comboEnabled && (
                                        <div className="combo-expanded">

                                            <div className="form-group">
                                                <label>Combo Description (Optional)</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., RIIWHS204E + RIIWHS202E Enter and work in confined spaces"
                                                    value={comboDescription}
                                                    onChange={(e) => setComboDescription(e.target.value)}
                                                />
                                                <small>Describe what courses are included in this combo package</small>
                                            </div>

                                            <div className="combo-price-duration-row">

                                                <div className="form-group">
                                                    <label>Combo Price ($) (Optional)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="e.g., 350"
                                                        value={comboPrice}
                                                        onChange={(e) => setComboPrice(e.target.value)}
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label>Combo Duration (Optional)</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g., 2 Days Training"
                                                        value={comboDuration}
                                                        onChange={(e) => setComboDuration(e.target.value)}
                                                    />
                                                </div>

                                            </div>

                                            <div className="preview-box">
                                                <h3>Combo Preview</h3>
                                                <p><strong>Package:</strong> {comboDescription || "N/A"}</p>
                                                <p><strong>Price:</strong> ${comboPrice || 0}</p>
                                                <p><strong>Duration:</strong> {comboDuration || "N/A"}</p>
                                            </div>

                                        </div>
                                    )}

                                </div>

                            </div>
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="modal-footer">
                        <button className="create-btn" type="submit">
                            {editCourse ? "Update Course" : "Create Course"}
                        </button>
                        <button className="cancel-btn" onClick={close}>
                            Cancel
                        </button>
                    </div>
                </form>

            </div>

        </div >

    )

}

export default CreateCourseModal