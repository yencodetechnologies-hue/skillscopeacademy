import { useState, useEffect } from "react";
import { colors } from '../../constants/theme';
import { useFormik } from "formik"
import * as Yup from "yup"
import axios from "axios"
import "../../styles/CreateCourseModal.css";
import DynamicField from "../DynamicField";
import EditableLabel from "../EditableLabel";
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
    const [descriptions, setDescriptions] = useState([""])
    const [trainingOverview, setTrainingOverview] = useState([""])
    const [vocationalOutcome, setVocationalOutcome] = useState([""])
    const [feesCharges, setFeesCharges] = useState([""])
    const [optionalCharges, setOptionalCharges] = useState([""])
    const [outcomePoint, setOutcomePoint] = useState([""])
    const [requirements, setRequirements] = useState([""])
    const [pathways, setPathways] = useState([""])
    const [trainingDuration, setTrainingDuration] = useState("")
    // Editable section headings for Details tab
    const [headingDescription, setHeadingDescription]           = useState("Course Description")
    const [headingTrainingOverview, setHeadingTrainingOverview] = useState("Training Overview")
    const [headingVocationalOutcome, setHeadingVocationalOutcome] = useState("Vocational Outcome")
    const [headingFeesCharges, setHeadingFeesCharges]           = useState("Fees and Charges")
    const [headingOptionalCharges, setHeadingOptionalCharges]   = useState("Optional Charges")
    const [headingOutcomePoint, setHeadingOutcomePoint]         = useState("Outcome Point")
    const [headingTrainingDuration, setHeadingTrainingDuration] = useState("Training Duration")

    // Editable labels — Basic Info tab
    const [lblCourseCode, setLblCourseCode]               = useState("Course Code (Optional)")
    const [lblCategory, setLblCategory]                   = useState("Category (Optional)")
    const [lblPricingType, setLblPricingType]             = useState("Pricing Type")
    const [lblVocPrice, setLblVocPrice]                   = useState("VOC Price ($)")
    const [lblOriginalPrice, setLblOriginalPrice]         = useState("Original Price / Strike Price ($)")
    const [lblSellingPrice, setLblSellingPrice]           = useState("Selling Price ($)")
    const [lblCourseTitle, setLblCourseTitle]             = useState("Course Title (Optional)")
    const [lblUrlSlug, setLblUrlSlug]                     = useState("URL Slug *")
    const [lblDuration, setLblDuration]                   = useState("Duration (Optional)")
    const [lblCertValidity, setLblCertValidity]           = useState("Certificate Validity (Optional)")
    const [lblDeliveryMethod, setLblDeliveryMethod]       = useState("Delivery Method")
    const [lblLocation, setLblLocation]                   = useState("Location")
    const [lblCourseImage, setLblCourseImage]             = useState("Course Image")

    // Editable labels — Requirements tab
    const [lblCourseReq, setLblCourseReq]                 = useState("Course Requirement")
    const [lblCopTitle, setLblCopTitle]                   = useState("Course of Practice title")
    const [lblCopUpload, setLblCopUpload]                 = useState("Upload Course of Practice")
    const [lblSyllabusUpload, setLblSyllabusUpload]       = useState("Upload Syllabus PDF")

    // Editable labels — Pathways tab
    const [lblPathways, setLblPathways]                   = useState("Pathways")

    // Editable labels — Combo tab
    const [lblComboDesc, setLblComboDesc]                 = useState("Combo Description (Optional)")
    const [lblComboPrice, setLblComboPrice]               = useState("Combo Price ($) (Optional)")
    const [lblComboDuration, setLblComboDuration]         = useState("Combo Duration (Optional)")
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
            formData.append("trainingDuration", trainingDuration)
            formData.append("headingDescription", headingDescription)
            formData.append("headingTrainingOverview", headingTrainingOverview)
            formData.append("headingVocationalOutcome", headingVocationalOutcome)
            formData.append("headingFeesCharges", headingFeesCharges)
            formData.append("headingOptionalCharges", headingOptionalCharges)
            formData.append("headingOutcomePoint", headingOutcomePoint)
            formData.append("headingTrainingDuration", headingTrainingDuration)
            // Basic Info labels
            formData.append("lblCourseCode", lblCourseCode)
            formData.append("lblCategory", lblCategory)
            formData.append("lblPricingType", lblPricingType)
            formData.append("lblVocPrice", lblVocPrice)
            formData.append("lblOriginalPrice", lblOriginalPrice)
            formData.append("lblSellingPrice", lblSellingPrice)
            formData.append("lblCourseTitle", lblCourseTitle)
            formData.append("lblUrlSlug", lblUrlSlug)
            formData.append("lblDuration", lblDuration)
            formData.append("lblCertValidity", lblCertValidity)
            formData.append("lblDeliveryMethod", lblDeliveryMethod)
            formData.append("lblLocation", lblLocation)
            formData.append("lblCourseImage", lblCourseImage)
            // Requirements labels
            formData.append("lblCourseReq", lblCourseReq)
            formData.append("lblCopTitle", lblCopTitle)
            formData.append("lblCopUpload", lblCopUpload)
            formData.append("lblSyllabusUpload", lblSyllabusUpload)
            // Pathways labels
            formData.append("lblPathways", lblPathways)
            // Combo labels
            formData.append("lblComboDesc", lblComboDesc)
            formData.append("lblComboPrice", lblComboPrice)
            formData.append("lblComboDuration", lblComboDuration)

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
            setDescriptions(editCourse.description || [""])
            setTrainingOverview(editCourse.trainingOverview || [""])
            setVocationalOutcome(editCourse.vocationalOutcome || [""])
            setFeesCharges(editCourse.feesCharges || [""])
            setOptionalCharges(editCourse.optionalCharges || [""])
            setOutcomePoint(editCourse.outcomePoints || [""])
            setRequirements(editCourse.requirements || [""])
            setPathways(editCourse.pathways || [""])
            setTrainingDuration(editCourse.trainingDuration || "")
            setHeadingDescription(editCourse.headingDescription || "Course Description")
            setHeadingTrainingOverview(editCourse.headingTrainingOverview || "Training Overview")
            setHeadingVocationalOutcome(editCourse.headingVocationalOutcome || "Vocational Outcome")
            setHeadingFeesCharges(editCourse.headingFeesCharges || "Fees and Charges")
            setHeadingOptionalCharges(editCourse.headingOptionalCharges || "Optional Charges")
            setHeadingOutcomePoint(editCourse.headingOutcomePoint || "Outcome Point")
            setHeadingTrainingDuration(editCourse.headingTrainingDuration || "Training Duration")
            setLblCourseCode(editCourse.lblCourseCode || "Course Code (Optional)")
            setLblCategory(editCourse.lblCategory || "Category (Optional)")
            setLblPricingType(editCourse.lblPricingType || "Pricing Type")
            setLblVocPrice(editCourse.lblVocPrice || "VOC Price ($)")
            setLblOriginalPrice(editCourse.lblOriginalPrice || "Original Price / Strike Price ($)")
            setLblSellingPrice(editCourse.lblSellingPrice || "Selling Price ($)")
            setLblCourseTitle(editCourse.lblCourseTitle || "Course Title (Optional)")
            setLblUrlSlug(editCourse.lblUrlSlug || "URL Slug *")
            setLblDuration(editCourse.lblDuration || "Duration (Optional)")
            setLblCertValidity(editCourse.lblCertValidity || "Certificate Validity (Optional)")
            setLblDeliveryMethod(editCourse.lblDeliveryMethod || "Delivery Method")
            setLblLocation(editCourse.lblLocation || "Location")
            setLblCourseImage(editCourse.lblCourseImage || "Course Image")
            setLblCourseReq(editCourse.lblCourseReq || "Course Requirement")
            setLblCopTitle(editCourse.lblCopTitle || "Course of Practice title")
            setLblCopUpload(editCourse.lblCopUpload || "Upload Course of Practice")
            setLblSyllabusUpload(editCourse.lblSyllabusUpload || "Upload Syllabus PDF")
            setLblPathways(editCourse.lblPathways || "Pathways")
            setLblComboDesc(editCourse.lblComboDesc || "Combo Description (Optional)")
            setLblComboPrice(editCourse.lblComboPrice || "Combo Price ($) (Optional)")
            setLblComboDuration(editCourse.lblComboDuration || "Combo Duration (Optional)")
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
            setTrainingOverview([""])
            setVocationalOutcome([""])
            setFeesCharges([""])
            setOptionalCharges([""])
            setOutcomePoint([""])
            setRequirements([""])
            setPathways([""])
            setTrainingDuration("")
            setHeadingDescription("Course Description")
            setHeadingTrainingOverview("Training Overview")
            setHeadingVocationalOutcome("Vocational Outcome")
            setHeadingFeesCharges("Fees and Charges")
            setHeadingOptionalCharges("Optional Charges")
            setHeadingOutcomePoint("Outcome Point")
            setHeadingTrainingDuration("Training Duration")
            setLblCourseCode("Course Code (Optional)")
            setLblCategory("Category (Optional)")
            setLblPricingType("Pricing Type")
            setLblVocPrice("VOC Price ($)")
            setLblOriginalPrice("Original Price / Strike Price ($)")
            setLblSellingPrice("Selling Price ($)")
            setLblCourseTitle("Course Title (Optional)")
            setLblUrlSlug("URL Slug *")
            setLblDuration("Duration (Optional)")
            setLblCertValidity("Certificate Validity (Optional)")
            setLblDeliveryMethod("Delivery Method")
            setLblLocation("Location")
            setLblCourseImage("Course Image")
            setLblCourseReq("Course Requirement")
            setLblCopTitle("Course of Practice title")
            setLblCopUpload("Upload Course of Practice")
            setLblSyllabusUpload("Upload Syllabus PDF")
            setLblPathways("Pathways")
            setLblComboDesc("Combo Description (Optional)")
            setLblComboPrice("Combo Price ($) (Optional)")
            setLblComboDuration("Combo Duration (Optional)")
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
                                        <EditableLabel value={lblCourseCode} onChange={setLblCourseCode} />
                                        <input type="text" placeholder="e.g., RIIHAN309F"
                                            name="courseCode"
                                            value={formik.values.courseCode}
                                            onChange={formik.handleChange}
                                        />
                                    </div>

                                    {/* ✅ ONLY CHANGE: category dropdown from backend */}
                                    <div className="form-group">
                                        <EditableLabel value={lblCategory} onChange={setLblCategory} />
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

                                    <EditableLabel value={lblPricingType} onChange={setLblPricingType} className="pricing-label" />
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
                                        <EditableLabel value={lblVocPrice} onChange={setLblVocPrice} />
                                        <input type="number" placeholder="e.g., 150"
                                            name="vocPrice"
                                            value={formik.values.vocPrice}
                                            onChange={formik.handleChange}
                                        />
                                    </div>

                                    {pricingType === "standard" && (
                                        <>
                                            <div className="form-group">
                                                <EditableLabel value={lblOriginalPrice} onChange={setLblOriginalPrice} />
                                                <input type="number" placeholder="e.g., 1200"
                                                    name="originalPrice"
                                                    value={formik.values.originalPrice}
                                                    onChange={formik.handleChange}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <EditableLabel value={lblSellingPrice} onChange={setLblSellingPrice} />
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
                                        <EditableLabel value={lblCourseTitle} onChange={setLblCourseTitle} />
                                        <input type="text" placeholder="e.g., Conduct Telescopic mate"
                                            name="title"
                                            value={formik.values.title}
                                            onChange={formik.handleChange}
                                            onBlur={(e) => {
                                                formik.handleBlur(e)
                                                if (!formik.values.slug && e.target.value) {
                                                    formik.setFieldValue("slug", toSlug(e.target.value))
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <EditableLabel value={lblUrlSlug} onChange={setLblUrlSlug} />
                                        <input
                                            type="text"
                                            placeholder="e.g., forklift-licence"
                                            name="slug"
                                            value={formik.values.slug}
                                            onChange={(e) => {
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
                                        <small style={{ color: colors.textMuted, fontSize: 12 }}>
                                            Page URL: <code>/course/{formik.values.slug || "your-slug"}</code>
                                        </small>
                                        {formik.touched.slug && formik.errors.slug && (
                                            <div style={{ color: "#e53935", fontSize: 12, marginTop: 4 }}>
                                                {formik.errors.slug}
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <EditableLabel value={lblDuration} onChange={setLblDuration} />
                                        <small style={{ color: "#888", fontSize: 11, display: "block", marginBottom: 4 }}>
                                            Max 5 characters — shown on home page card only (e.g. "1 Day")
                                        </small>
                                        <input type="text" placeholder="e.g., 1 Day"
                                            name="duration"
                                            maxLength={5}
                                            value={formik.values.duration}
                                            onChange={formik.handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <EditableLabel value={lblCertValidity} onChange={setLblCertValidity} />
                                        <input type="text" placeholder="e.g., 3 years"
                                            name="certificateValidity"
                                            value={formik.values.certificateValidity}
                                            onChange={formik.handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <EditableLabel value={lblDeliveryMethod} onChange={setLblDeliveryMethod} />
                                        <input type="text" placeholder="e.g., Online, Classroom"
                                            name="deliveryMethod"
                                            value={formik.values.deliveryMethod}
                                            onChange={formik.handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <EditableLabel value={lblLocation} onChange={setLblLocation} />
                                        <input type="text" placeholder="e.g., New York, London"
                                            name="location"
                                            value={formik.values.location}
                                            onChange={formik.handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <EditableLabel value={lblCourseImage} onChange={setLblCourseImage} />
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
                                        {imageType === "url" && formik.values.courseImage && (
                                            <img
                                                key={formik.values.courseImage}
                                                src={formik.values.courseImage}
                                                alt="preview"
                                                onError={(e) => e.target.style.display = "none"}
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

                                {/* ── Training Duration ── */}
                                <div className="form-group">
                                    <EditableLabel value={headingTrainingDuration} onChange={setHeadingTrainingDuration} />
                                    <small style={{ color: "#888", fontSize: 11, display: "block", marginBottom: 4 }}>
                                        Shown on course details page only (e.g. "1 Day intensive hands-on training")
                                    </small>
                                    <input
                                        type="text"
                                        placeholder="e.g., 1 Day intensive hands-on training"
                                        value={trainingDuration}
                                        onChange={(e) => setTrainingDuration(e.target.value)}
                                    />
                                </div>

                                {/* ── Course Description ── */}
                                <DynamicField
                                    label={headingDescription}
                                    onLabelChange={setHeadingDescription}
                                    placeholder="Course Description..."
                                    values={descriptions}
                                    setValues={setDescriptions}
                                />

                                {/* ── Training Overview ── */}
                                <DynamicField
                                    label={headingTrainingOverview}
                                    onLabelChange={setHeadingTrainingOverview}
                                    placeholder="Training Overview..."
                                    values={trainingOverview}
                                    setValues={setTrainingOverview}
                                />

                                {/* ── Vocational Outcome ── */}
                                <DynamicField
                                    label={headingVocationalOutcome}
                                    onLabelChange={setHeadingVocationalOutcome}
                                    placeholder="Vocational Outcome..."
                                    values={vocationalOutcome}
                                    setValues={setVocationalOutcome}
                                />

                                {/* ── Fees and Charges ── */}
                                <DynamicField
                                    label={headingFeesCharges}
                                    onLabelChange={setHeadingFeesCharges}
                                    placeholder="Fees and Charges..."
                                    values={feesCharges}
                                    setValues={setFeesCharges}
                                />

                                {/* ── Optional Charges ── */}
                                <DynamicField
                                    label={headingOptionalCharges}
                                    onLabelChange={setHeadingOptionalCharges}
                                    placeholder="Optional Charges..."
                                    values={optionalCharges}
                                    setValues={setOptionalCharges}
                                />

                                {/* ── Outcome Point ── */}
                                <DynamicField
                                    label={headingOutcomePoint}
                                    onLabelChange={setHeadingOutcomePoint}
                                    placeholder="Outcome Point..."
                                    values={outcomePoint}
                                    setValues={setOutcomePoint}
                                />

                                <div className="seo-section">
                                    <h3 className="seo-section-title">SEO Settings</h3>

                                    <div className="form-group">
                                        <label>Meta title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. EWP Licence Over 11m | Boom Lift Course NSW | SafeTicks"
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
                                    label={lblCourseReq}
                                    onLabelChange={setLblCourseReq}
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
                                    <EditableLabel value={lblCopTitle} onChange={setLblCopTitle} />
                                    <input
                                        type="text"
                                        placeholder="e.g., Code of Practice Managing the Risk..."
                                        value={handbookTitle}
                                        onChange={(e) => setHandbookTitle(e.target.value)}
                                    />
                                    <EditableLabel value={lblCopUpload} onChange={setLblCopUpload} />
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
                                                onClick={() => { setHandbookFile(null); setExistingHandbookPdf(""); }}
                                                style={{ background: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 12px', cursor: 'pointer' }}
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
                                    <EditableLabel value={lblSyllabusUpload} onChange={setLblSyllabusUpload} />
                                    <div className="upload-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <label className="upload-btn" style={{ flex: 1, margin: 0, display: 'block' }}>
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={(e) => { setSyllabusFile(e.target.files[0]); setExistingSyllabusUrl(""); }}
                                            />
                                            <span>
                                                {syllabusFile ? syllabusFile.name : (existingSyllabusUrl ? "📄 Existing Syllabus" : "⬆ Choose Syllabus PDF")}
                                            </span>
                                        </label>
                                        {(syllabusFile || existingSyllabusUrl) && (
                                            <button
                                                type="button"
                                                onClick={() => { setSyllabusFile(null); setExistingSyllabusUrl(""); }}
                                                style={{ background: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 12px', cursor: 'pointer' }}
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
                                    label={lblPathways}
                                    onLabelChange={setLblPathways}
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
                                                <EditableLabel value={lblComboDesc} onChange={setLblComboDesc} />
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
                                                    <EditableLabel value={lblComboPrice} onChange={setLblComboPrice} />
                                                    <input
                                                        type="number"
                                                        placeholder="e.g., 350"
                                                        value={comboPrice}
                                                        onChange={(e) => setComboPrice(e.target.value)}
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <EditableLabel value={lblComboDuration} onChange={setLblComboDuration} />
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