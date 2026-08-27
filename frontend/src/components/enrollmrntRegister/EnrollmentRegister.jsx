import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import EnrollmentSection1 from "./EnrollmentSection1"
import EnrollmentSection2 from "./EnrollmentSection2"
import EnrollmentSection3 from "./EnrollmentSection3"
import EnrollmentSection4 from "./EnrollmentSection4"
import EnrollmentSection5 from "./EnrollmentSection5"
import { useLocation } from "react-router-dom"
import { API_URL } from "../../data/service"
import { authHeaders } from "../../utils/authHeaders"

// ✅ removed savedFormData from props — component fetches it internally now
const EnrollmentRegister = forwardRef(({ userDetails, section, setSection }, ref) => {

    const location = useLocation()
    const urlParams = new URLSearchParams(location.search)

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" })
        document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" })
        document.querySelector(".main-content")?.scrollTo({ top: 0, behavior: "smooth" })
        document.querySelector(".content-wrapper")?.scrollTo({ top: 0, behavior: "smooth" })
        document.querySelector(".portal-content")?.scrollTo({ top: 0, behavior: "smooth" })
        document.querySelector(".page-content")?.scrollTo({ top: 0, behavior: "smooth" })
        document.querySelector(".student-portal-body")?.scrollTo({ top: 0, behavior: "smooth" })
        document.querySelector(".layout-content")?.scrollTo({ top: 0, behavior: "smooth" })
        let el = document.activeElement
        while (el && el !== document.body) {
            if (el.scrollTop > 0) { el.scrollTop = 0; break }
            el = el.parentElement
        }
    }

    // ✅ single source of truth for saved data — fetched internally
    const [savedFormData, setSavedFormData] = useState(null)

    useEffect(() => {
        const studentId = localStorage.getItem("studentId")
        if (!studentId) return

        const fetchSavedForm = async () => {
            try {
                const res = await fetch(`${API_URL}/api/enrollment-form/${studentId}`)
                const result = await res.json()
                if (result.found) {
                    setSavedFormData(result.data)
                }
            } catch (err) {
                console.error("Failed to load saved enrollment form:", err)
            }
        }

        fetchSavedForm()
    }, [])

    const [formData, setFormData] = useState({
        flowId: localStorage.getItem("flowId") !== "null" ? localStorage.getItem("flowId") : null,
        userId: localStorage.getItem("enrollId") !== "null" ? localStorage.getItem("enrollId") : null,
        enrolledCourseId: urlParams.get("courseId") || "",
        title: "",
        surname: "",
        givenName: userDetails?.name || "",
        middleName: "",
        preferredName: "",
        dob: "",
        gender: "",
        homePhone: "",
        workPhone: "",
        mobilePhone: "",
        email: "",
        residentialAddress: "",
        suburb: "",
        state: "",
        postcode: "",
        postalDifferent: false,
        postalAddress: "",
        postalSuburb: "",
        postalState: "",
        postalPostcode: "",
        emergencyName: "",
        emergencyRelationship: "",
        emergencyContact: "",
        emergencyPermission: "no",

        educationLevel: "",
        yearCompleted: "",
        schoolName: "",
        schoolInAustralia: true,
        schoolState: "",
        schoolPostcode: "",
        schoolCountry: "",
        hasQualifications: "",
        qualificationLevels: [],
        qualificationDetails: "",
        qualificationFile: null,
        qualificationFileUrl: null,
        qualEvidences: {},
        qualEvidenceUrls: [],
        employmentStatus: "",
        employerName: "",
        supervisorName: "",
        workplaceAddress: "",
        employerEmail: "",
        employerPhone: "",
        trainingReason: "",
        trainingReasonOther: "",
        usi: "",
        usiPermission: false,
        staApplication: "",
        staAuthoriseName: "",
        staConsent: false,
        staTownOfBirth: "",
        staOverseasTown: "",
        staIdType: "",
        staIdFile: null,

        countryOfBirth: "",
        speaksOtherLanguage: "",
        otherLanguage: "",
        indigenousStatus: "",
        hasDisability: "",
        disabilityTypes: [],
        disabilityNotes: "",

        acceptPrivacy: false,
        acceptTerms: false,
        studentName: "",
        declarationDate: "",
        signature: null,
        idDocument: null,
        photoDocument: null
    })

    const saveSectionToBackend = async (sectionNumber) => {
        // ✅ fixed: was `location.getItem(...)` — location has no such method
        const studentId = localStorage.getItem("studentId")
        if (!studentId) return

        let payload = {}

        if (sectionNumber === 1) {
            payload = {
                studentId,
                section: 1,
                personalDetails: {
                    title: formData.title,
                    surname: formData.surname,
                    givenName: formData.givenName,
                    middleName: formData.middleName,
                    preferredName: formData.preferredName,
                    dob: formData.dob,
                    gender: formData.gender,
                    email: formData.email,
                    homePhone: formData.homePhone,
                    workPhone: formData.workPhone,
                    mobilePhone: formData.mobilePhone,
                },
                address: {
                    residential: {
                        address: formData.residentialAddress,
                        suburb: formData.suburb,
                        state: formData.state,
                        postcode: formData.postcode,
                    },
                    postal: {
                        address: formData.postalAddress,
                        suburb: formData.postalSuburb,
                        state: formData.postalState,
                        postcode: formData.postalPostcode,
                    }
                },
                emergencyContact: {
                    name: formData.emergencyName,
                    relationship: formData.emergencyRelationship,
                    contactNumber: formData.emergencyContact,
                    consent: formData.emergencyPermission === "yes"
                }
            }
        }

        if (sectionNumber === 2) {
            payload = {
                studentId,
                section: 2,
                usiNumber: formData.usi,
                usiPermission: formData.usiPermission,
                staApplication: formData.staApplication,
                staAuthoriseName: formData.staAuthoriseName,
                staConsent: formData.staConsent,
                staTownOfBirth: formData.staTownOfBirth,
                staOverseasTown: formData.staOverseasTown,
                staIdType: formData.staIdType,
            }
        }

        if (sectionNumber === 3) {
            payload = {
                studentId,
                section: 3,
                education: {
                    highestLevel: formData.educationLevel,
                    yearCompleted: formData.yearCompleted,
                    schoolName: formData.schoolName,
                    schoolState: formData.schoolState,
                    schoolPostcode: formData.schoolPostcode,
                    schoolCountry: formData.schoolCountry,
                },
                qualifications: {
                    hasQualification: formData.hasQualifications === "yes",
                    types: formData.qualificationLevels,
                    details: formData.qualificationDetails || "",
                },
                employment: {
                    status: formData.employmentStatus,
                    details: {
                        employerName: formData.employerName,
                        supervisorName: formData.supervisorName,
                        address: formData.workplaceAddress,
                        email: formData.employerEmail,
                        phone: formData.employerPhone
                    }
                },
                trainingReason: formData.trainingReason,
                trainingReasonOther: formData.trainingReasonOther || "",
            }
        }

        if (sectionNumber === 4) {
            payload = {
                studentId,
                section: 4,
                language: {
                    countryOfBirth: formData.countryOfBirth,
                    otherLanguage: formData.otherLanguage,
                    speaksOtherLanguage: formData.speaksOtherLanguage,
                    indigenousStatus: formData.indigenousStatus,
                },
                specialNeeds: {
                    hasDisability: formData.hasDisability === "yes",
                    types: formData.disabilityTypes,
                    other: formData.disabilityNotes
                }
            }
        }

        try {
            const res = await fetch(`${API_URL}/api/enrollment-form/section`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            const data = await res.json()
        } catch (err) {
            console.error(`Section ${sectionNumber} save error:`, err)
        }
    }

    // Autofill user details
    useEffect(() => {
        if (!userDetails) return

        const parts = (userDetails.name || "").trim().split(" ")

        setFormData(prev => ({
            ...prev,
            userId: userDetails._id || prev.userId,
            givenName: parts[0] || "",
            surname: parts.slice(1).join(" ") || "",
            email: userDetails.email || "",
            mobilePhone: userDetails.phone || userDetails.mobileNumber || userDetails.mobile || ""
        }))
    }, [userDetails])

    // Bind fetched saved data into formData
    useEffect(() => {
        if (!savedFormData) return;

        const buildQualEvidences = () => {
            const evidences = {}
            const urls = savedFormData.qualifications?.evidenceUrls || []
            urls.forEach(({ level, url }) => {
                if (level && url) {
                    evidences[level] = { file: null, url, error: "" }
                }
            })
            return evidences
        }

        const builtEvidences = buildQualEvidences()

        setFormData(prev => ({
            ...prev,
            title: savedFormData.personalDetails?.title || prev.title,
            surname: savedFormData.personalDetails?.surname || prev.surname,
            givenName: savedFormData.personalDetails?.givenName || prev.givenName,
            middleName: savedFormData.personalDetails?.middleName || prev.middleName,
            preferredName: savedFormData.personalDetails?.preferredName || prev.preferredName,
            dob: savedFormData.personalDetails?.dob || prev.dob,
            gender: savedFormData.personalDetails?.gender || prev.gender,
            email: savedFormData.personalDetails?.email || prev.email,
            homePhone: savedFormData.personalDetails?.homePhone || prev.homePhone,
            workPhone: savedFormData.personalDetails?.workPhone || prev.workPhone,
            mobilePhone: savedFormData.personalDetails?.mobilePhone || prev.mobilePhone,
            residentialAddress: savedFormData.address?.residential?.address || prev.residentialAddress,
            suburb: savedFormData.address?.residential?.suburb || prev.suburb,
            state: savedFormData.address?.residential?.state || prev.state,
            postcode: savedFormData.address?.residential?.postcode || prev.postcode,
            postalAddress: savedFormData.address?.postal?.address || prev.postalAddress,
            postalSuburb: savedFormData.address?.postal?.suburb || prev.postalSuburb,
            postalState: savedFormData.address?.postal?.state || prev.postalState,
            postalPostcode: savedFormData.address?.postal?.postcode || prev.postalPostcode,
            emergencyName: savedFormData.emergencyContact?.name || prev.emergencyName,
            emergencyRelationship: savedFormData.emergencyContact?.relationship || prev.emergencyRelationship,
            emergencyContact: savedFormData.emergencyContact?.contactNumber || prev.emergencyContact,
            emergencyPermission: savedFormData.emergencyContact?.consent ? "yes" : "no",
            educationLevel: savedFormData.education?.highestLevel || prev.educationLevel,
            yearCompleted: savedFormData.education?.yearCompleted || prev.yearCompleted,
            schoolName: savedFormData.education?.schoolName || prev.schoolName,
            schoolState: savedFormData.education?.schoolState || prev.schoolState,
            schoolPostcode: savedFormData.education?.schoolPostcode || prev.schoolPostcode,
            schoolCountry: savedFormData.education?.schoolCountry || prev.schoolCountry,
            hasQualifications: savedFormData.qualifications?.hasQualification ? "yes" : "no",
            qualificationLevels: savedFormData.qualifications?.types || prev.qualificationLevels,
            employmentStatus: savedFormData.employment?.status || prev.employmentStatus,
            employerName: savedFormData.employment?.details?.employerName || prev.employerName,
            supervisorName: savedFormData.employment?.details?.supervisorName || prev.supervisorName,
            workplaceAddress: savedFormData.employment?.details?.address || prev.workplaceAddress,
            employerEmail: savedFormData.employment?.details?.email || prev.employerEmail,
            employerPhone: savedFormData.employment?.details?.phone || prev.employerPhone,
            trainingReason: savedFormData.trainingReason || prev.trainingReason,
            countryOfBirth: savedFormData.language?.countryOfBirth || prev.countryOfBirth,
            otherLanguage: savedFormData.language?.otherLanguage || prev.otherLanguage,
            hasDisability: savedFormData.specialNeeds?.hasDisability ? "yes" : "no",
            disabilityTypes: savedFormData.specialNeeds?.types || prev.disabilityTypes,
            disabilityNotes: savedFormData.specialNeeds?.other || prev.disabilityNotes,
            usi: savedFormData.usi?.number || prev.usi,
            usiPermission: savedFormData.usi?.permission || prev.usiPermission,
            staApplication: savedFormData.usi?.staApplication ?? prev.staApplication ?? "no",
            speaksOtherLanguage: savedFormData.language?.speaksOtherLanguage ?? prev.speaksOtherLanguage ?? "",
            indigenousStatus: savedFormData.language?.indigenousStatus ?? prev.indigenousStatus ?? "",
            staAuthoriseName: savedFormData.usi?.staAuthoriseName || prev.staAuthoriseName,
            staConsent: savedFormData.usi?.staConsent ?? prev.staConsent,
            staTownOfBirth: savedFormData.usi?.staTownOfBirth || prev.staTownOfBirth,
            staOverseasTown: savedFormData.usi?.staOverseasTown || prev.staOverseasTown,
            staIdType: savedFormData.usi?.staIdType || prev.staIdType,
            qualificationDetails: savedFormData.qualifications?.details || prev.qualificationDetails,
            qualificationFileUrl: savedFormData.qualifications?.evidenceUrl || prev.qualificationFileUrl,
            signatureUrl: savedFormData.signatureUrl ?? prev.signatureUrl ?? null,
            idDocumentUrl: savedFormData.idDocumentUrl ?? prev.idDocumentUrl ?? null,
            photoDocumentUrl: savedFormData.photoDocumentUrl ?? prev.photoDocumentUrl ?? null,
            staIdFileUrl: savedFormData.usi?.staIdFileUrl || prev.staIdFileUrl,
            qualEvidences: Object.keys(builtEvidences).length > 0 ? builtEvidences : (prev.qualEvidences || {}),
            qualEvidenceUrls: savedFormData.qualifications?.evidenceUrls?.map(e => ({
                level: e.level,
                url: e.url
            })) || prev.qualEvidenceUrls || [],
        }));
    }, [savedFormData]);

    const validateForm = () => {
        if (!formData.acceptPrivacy) return "Accept Privacy Policy"
        if (!formData.acceptTerms) return "Accept Terms"
        if (!formData.studentName) return "Enter Student Name"
        if (!formData.declarationDate) return "Enter Date"
        if (!formData.signature && !formData.signatureUrl) return "Signature required"
        if (!formData.idDocument && !formData.idDocumentUrl) return "Upload ID"
        if (!formData.photoDocument && !formData.photoDocumentUrl) return "Upload Photo"
        return null
    }

    const dataURLtoBlob = (dataUrl) => {
        const arr = dataUrl.split(",")
        const mime = arr[0].match(/:(.*?);/)[1]
        const bstr = atob(arr[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) u8arr[n] = bstr.charCodeAt(n)
        return new Blob([u8arr], { type: mime })
    }

    const submitToBackend = async () => {
        try {
            const fd = new FormData()

            Object.entries(formData).forEach(([key, value]) => {
                if (value === null || value === undefined) return

                if (key === "signature" && typeof value === "string" && value.startsWith("data:image")) {
                    const blob = dataURLtoBlob(value)
                    fd.append("signature", blob, "signature.png")
                } else if (value instanceof File) {
                    fd.append(key, value)
                } else if (Array.isArray(value)) {
                    value.forEach(item => fd.append(key, item))
                } else if (typeof value === "boolean") {
                    fd.append(key, value.toString())
                } else if (typeof value === "object") {
                    return
                } else {
                    fd.append(key, value)
                }
            })

            const token = localStorage.getItem("token");
            const studentId = localStorage.getItem("studentId");

            if (studentId) {
                fd.append("studentId", studentId);
            }

            const submitHeaders = {};
            if (token) {
                submitHeaders.Authorization = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/api/enrollment-form`, {
                method: "POST",
                headers: submitHeaders,
                body: fd,
            });

            const data = await res.json()
            if (!res.ok) throw new Error(data.message)

            if (formData.flowId) {
                try {
                    await fetch(`${API_URL}/api/flow/complete`, {
                        method: "POST",
                        headers: authHeaders({ "Content-Type": "application/json" }),
                        body: JSON.stringify({ flowId: formData.flowId }),
                    });
                } catch (flowErr) {
                    console.error("[EnrollmentRegister] Flow complete error (swallowed):", flowErr);
                }
            }

            return null

        } catch (err) {
            return err.message || "Something went wrong"
        }
    }

    useEffect(() => {
        scrollToTop()
    }, [section])

    useImperativeHandle(ref, () => ({
        submitForm: async () => {
            const error = validateForm()
            if (error) return error

            const apiError = await submitToBackend()
            if (apiError) return apiError

            return null
        },
        getFormData: () => formData,
        saveSection: async (sectionNumber) => {
            await saveSectionToBackend(sectionNumber)
        }
    }))

    return (
        <div>
            {section === 1 && (
                <EnrollmentSection1
                    userDetails={userDetails}
                    data={formData}
                    setData={setFormData}
                    next={async () => {
                        await saveSectionToBackend(1)
                        scrollToTop()
                        setSection(2)
                    }}
                />
            )}

            {section === 2 && (
                <EnrollmentSection2
                    data={formData}
                    setData={setFormData}
                    userId={formData.userId}
                    prev={() => { setSection(1); scrollToTop() }}
                    next={async () => {
                        await saveSectionToBackend(2)
                        scrollToTop()
                        setSection(3)
                    }}
                />
            )}

            {section === 3 && (
                <EnrollmentSection3
                    data={formData}
                    setData={setFormData}
                    prev={() => { setSection(2); scrollToTop() }}
                    next={async () => {
                        await saveSectionToBackend(3)
                        scrollToTop()
                        setSection(4)
                    }}
                />
            )}

            {section === 4 && (
                <EnrollmentSection4
                    data={formData}
                    setData={setFormData}
                    prev={() => {
                        setSection(3)
                        scrollToTop()
                    }}
                    next={async () => {
                        await saveSectionToBackend(4)
                        scrollToTop()
                        setSection(5)
                    }}
                />
            )}

            {section === 5 && (
                <EnrollmentSection5
                    data={formData}
                    setData={setFormData}
                    prev={() => { setSection(4); scrollToTop() }}
                    validateAndSubmit={async () => {
                        const error = validateForm()
                        if (error) return error
                        const apiError = await submitToBackend()
                        if (apiError) return apiError
                        return null
                    }}
                />
            )}
        </div>
    )
})

export default EnrollmentRegister