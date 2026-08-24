import { colors } from "../../constants/theme"
import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import "./VocStep3.css"
import { API_URL } from "../../data/service"


/* =========================================================
   SQUARE WEB PAYMENTS SDK
   ========================================================= */

const SQUARE_SCRIPT = {
    sandbox:
        "https://sandbox.web.squarecdn.com/v1/square.js",

    production:
        "https://web.squarecdn.com/v1/square.js",
}


/**
 * Load Square Web Payments SDK dynamically.
 *
 * We intentionally load this from React instead of putting
 * the script directly in index.html.
 */
const loadSquareSdk = (environment = "sandbox") => {
    return new Promise((resolve, reject) => {

        // Already loaded
        if (window.Square) {
            resolve(window.Square)
            return
        }

        // Check whether another component is already
        // loading Square.
        const existingScript = document.querySelector(
            'script[data-square-sdk="true"]'
        )

        if (existingScript) {

            const handleLoad = () => {
                if (window.Square) {
                    resolve(window.Square)
                } else {
                    reject(
                        new Error(
                            "Square SDK unavailable."
                        )
                    )
                }
            }

            const handleError = () => {
                reject(
                    new Error(
                        "Failed to load Square SDK."
                    )
                )
            }

            existingScript.addEventListener(
                "load",
                handleLoad,
                { once: true }
            )

            existingScript.addEventListener(
                "error",
                handleError,
                { once: true }
            )

            return
        }

        const script =
            document.createElement("script")

        script.src =
            environment === "production"
                ? SQUARE_SCRIPT.production
                : SQUARE_SCRIPT.sandbox

        script.async = true

        script.dataset.squareSdk = "true"

        script.onload = () => {
            if (window.Square) {
                resolve(window.Square)
            } else {
                reject(
                    new Error(
                        "Square SDK unavailable."
                    )
                )
            }
        }

        script.onerror = () => {
            reject(
                new Error(
                    "Failed to load Square SDK."
                )
            )
        }

        document.body.appendChild(script)
    })
}


/* =========================================================
   COMPONENT
   ========================================================= */

function VocStep3({
    details = {},
    courses = [],
    onBack,
    onComplete,
}) {

    console.log(courses,"courses");

    /* =====================================================
       TOTAL
       ===================================================== */

    const total = courses.reduce(
        (sum, c) =>
            sum + (Number(c.price) || 150),
        0
    )


    /* =====================================================
       PAYMENT METHOD
       ===================================================== */

    const [method, setMethod] =
        useState("card")


    /* =====================================================
       CARD HOLDER NAME
       ===================================================== */

    const [cardName, setCardName] =
        useState("")


    /* =====================================================
       BANK TRANSFER
       ===================================================== */

    const [bank, setBank] = useState({
        refId: "",
        proof: null,
    })

    const setB = (key, value) => {
        setBank((previous) => ({
            ...previous,
            [key]: value,
        }))
    }


    /* =====================================================
       SQUARE REFS
       ===================================================== */

    const cardContainerRef =
        useRef(null)

    const squareCardRef =
        useRef(null)

    const squarePaymentsRef =
        useRef(null)


    /* =====================================================
       SQUARE STATE
       ===================================================== */

    const [squareReady, setSquareReady] =
        useState(false)

    const [squareLoading, setSquareLoading] =
        useState(false)

    const [squareError, setSquareError] =
        useState("")

    const [squareCurrency, setSquareCurrency] =
        useState("AUD")


    /* =====================================================
       SUBMIT STATE
       ===================================================== */

    const [submitting, setSubmitting] =
        useState(false)

    const [error, setError] =
        useState("")

    const processingRef =
        useRef(false)


    /* =====================================================
       BANK FILE IMAGE PREVIEW
       ===================================================== */

    const isImageProof = useMemo(
        () =>
            !!(
                bank.proof &&
                bank.proof.type &&
                bank.proof.type.startsWith(
                    "image/"
                )
            ),
        [bank.proof]
    )


    const [previewUrl, setPreviewUrl] =
        useState("")


    useEffect(() => {

        if (!isImageProof) {
            setPreviewUrl("")
            return
        }

        const url =
            URL.createObjectURL(
                bank.proof
            )

        setPreviewUrl(url)

        return () => {
            URL.revokeObjectURL(url)
        }

    }, [
        bank.proof,
        isImageProof,
    ])


    /* =====================================================
       DESTROY SQUARE CARD
       ===================================================== */

    const destroySquareCard = async () => {

        if (squareCardRef.current) {

            try {
                await squareCardRef.current.destroy()
            } catch (_) {
                // Ignore destroy errors
            }

            squareCardRef.current = null
        }

        squarePaymentsRef.current = null

        setSquareReady(false)
    }


    /* =====================================================
       INITIALIZE SQUARE
       ===================================================== */

    useEffect(() => {

        let cancelled = false


        const destroyCard = async () => {

            if (squareCardRef.current) {

                try {
                    await squareCardRef.current.destroy()
                } catch (_) {
                    // noop
                }

                squareCardRef.current = null
            }

            squarePaymentsRef.current =
                null

            setSquareReady(false)
        }


        const initSquare = async () => {

            /*
             * If bank transfer is selected,
             * Square card should not exist.
             */
            if (method !== "card") {

                await destroyCard()

                return
            }


            setSquareLoading(true)
            setSquareError("")
            setSquareReady(false)


            /*
             * Wait until React renders the
             * Square container.
             */
            for (
                let i = 0;
                i < 20 &&
                !cardContainerRef.current &&
                !cancelled;
                i++
            ) {

                await new Promise(
                    (resolve) =>
                        setTimeout(
                            resolve,
                            50
                        )
                )
            }


            if (
                cancelled ||
                !cardContainerRef.current
            ) {

                if (!cancelled) {

                    setSquareError(
                        "Card form container unavailable. Please try again."
                    )

                    setSquareLoading(false)
                }

                return
            }


            try {

                /* =========================================
                   STEP 1
                   GET SQUARE CONFIG FROM BACKEND
                   ========================================= */

                const configRes =
                    await fetch(
                        `${API_URL}/api/payment/square-config`
                    )


                const raw =
                    await configRes.text()


                let config


                try {

                    config =
                        JSON.parse(raw)

                } catch {

                    throw new Error(
                        configRes.status === 404
                            ? "Square payment route not found. Restart the backend server."
                            : `Payment config failed (${configRes.status}). Expected JSON from ${API_URL}/api/payment/square-config.`
                    )
                }


                if (
                    !configRes.ok ||
                    !config.success
                ) {

                    throw new Error(
                        config.message ||
                            "Unable to load Square payment configuration."
                    )
                }


                if (cancelled) {
                    return
                }


                console.log(
                    "[Square] Config loaded:",
                    {
                        environment:
                            config.environment,

                        applicationId:
                            config.applicationId,

                        locationId:
                            config.locationId,

                        currency:
                            config.currency,
                    }
                )


                /* =========================================
                   VALIDATE CONFIG
                   ========================================= */

                if (!config.applicationId) {

                    throw new Error(
                        "Square Application ID is missing."
                    )
                }


                if (!config.locationId) {

                    throw new Error(
                        "Square Location ID is missing."
                    )
                }


                /* =========================================
                   CURRENCY
                   ========================================= */

                setSquareCurrency(
                    config.currency ||
                        "AUD"
                )


                /* =========================================
                   STEP 2
                   LOAD SQUARE SDK
                   ========================================= */

                const Square =
                    await loadSquareSdk(
                        config.environment ||
                            "sandbox"
                    )


                if (!Square) {

                    throw new Error(
                        "Square SDK unavailable."
                    )
                }


                if (cancelled) {
                    return
                }


                /* =========================================
                   STEP 3
                   DESTROY PREVIOUS CARD
                   ========================================= */

                await destroyCard()


                if (
                    cancelled ||
                    !cardContainerRef.current
                ) {
                    return
                }


                /* =========================================
                   IMPORTANT
                   SQUARE REQUIRES EMPTY CONTAINER
                   ========================================= */

                cardContainerRef.current.innerHTML =
                    ""


                /* =========================================
                   STEP 4
                   CREATE PAYMENTS INSTANCE
                   ========================================= */

                const payments =
                    Square.payments(
                        config.applicationId,
                        config.locationId
                    )


                squarePaymentsRef.current =
                    payments


                /* =========================================
                   STEP 5
                   CREATE CARD
                   ========================================= */

                const card =
                    await payments.card({

                        style: {

                            input: {
                                fontSize:
                                    "15px",

                                fontFamily:
                                    "inherit",

                                color:
                                    "#111827",
                            },

                            "input::placeholder":
                                {
                                    color:
                                        "#94a3b8",
                                },

                            ".input-container":
                                {
                                    borderColor:
                                        "#e5e7eb",

                                    borderRadius:
                                        "10px",
                                },

                            ".input-container.is-focus":
                                {
                                    borderColor:
                                        "#00796B",
                                },

                            ".input-container.is-error":
                                {
                                    borderColor:
                                        "#dc2626",
                                },
                        },
                    })


                /* =========================================
                   STEP 6
                   ATTACH CARD TO DOM
                   ========================================= */

                await card.attach(
                    cardContainerRef.current
                )


                if (cancelled) {

                    try {
                        await card.destroy()
                    } catch (_) {
                        // noop
                    }

                    return
                }


                squareCardRef.current =
                    card


                setSquareReady(true)


                console.log(
                    "✅ Square card initialized successfully"
                )

            } catch (err) {

                console.error(
                    "Square init failed:",
                    err
                )


                if (!cancelled) {

                    setSquareError(
                        err.message ||
                            "Could not load secure card form."
                    )

                    setSquareReady(false)
                }

            } finally {

                if (!cancelled) {
                    setSquareLoading(false)
                }
            }
        }


        initSquare()


        return () => {

            cancelled = true

            destroyCard()
        }

    }, [method])


    /* =====================================================
       HANDLE SUBMIT
       ===================================================== */

    const handleSubmit = async () => {

        if (processingRef.current) {
            return
        }


        setError("")


        /* =================================================
           VALIDATE CARD
           ================================================= */

        if (method === "card") {

            if (!cardName.trim()) {

                setError(
                    "Please enter the name on the card."
                )

                return
            }


            if (
                !squareCardRef.current ||
                !squareReady
            ) {

                setError(
                    squareError ||
                        "Secure card payment is not ready. Please wait for the card form to load."
                )

                return
            }
        }


        /* =================================================
           VALIDATE BANK
           ================================================= */

        if (method === "bank") {

            if (!bank.refId.trim()) {

                setError(
                    "Please enter your Transaction / Reference ID."
                )

                return
            }


            if (!bank.proof) {

                setError(
                    "Please upload your payment receipt."
                )

                return
            }
        }


        processingRef.current = true


        try {

            setSubmitting(true)


            let squareTransactionId = ""


            /* =================================================
               CARD PAYMENT
               ================================================= */

            if (method === "card") {

                /*
                 * IMPORTANT:
                 *
                 * We DO NOT read card number,
                 * CVV, expiry month or expiry year.
                 *
                 * Those values are inside the
                 * Square secure iframe.
                 */


                console.log(
                    "[Square] Starting card tokenization..."
                )


                /* =============================================
                   TOKENIZE
                   ============================================= */

                const tokenResult =
                    await squareCardRef.current.tokenize({
                        amount:
                            total.toFixed(2),

                        currencyCode:
                            squareCurrency,

                        intent:
                            "CHARGE",

                        customerInitiated:
                            true,

                        sellerKeyedIn:
                            false,

                        billingContact: {

                            givenName:
                                details.firstName ||
                                "",

                            familyName:
                                details.lastName ||
                                "",

                            email:
                                details.email ||
                                "",

                            phone:
                                details.phone ||
                                "",

                            addressLines:
                                details.streetAddress
                                    ? [
                                          details.streetAddress,
                                      ]
                                    : [],

                            city:
                                details.city ||
                                "",

                            state:
                                details.state ||
                                "",

                            postalCode:
                                details.postcode ||
                                "",

                            countryCode:
                                "AU",
                        },
                    })


                console.log(
                    "[Square] Tokenization result:",
                    {
                        status:
                            tokenResult?.status,

                        hasToken:
                            !!tokenResult?.token,

                        errors:
                            tokenResult?.errors,
                    }
                )


                /* =============================================
                   CHECK TOKENIZATION
                   ============================================= */

                if (
                    tokenResult?.status !==
                    "OK"
                ) {

                    console.error(
                        "[Square] Tokenization failed:",
                        tokenResult?.errors
                    )


                    const tokenError =
                        tokenResult?.errors?.[0]


                    setError(
                        tokenError?.message ||
                            "Unable to securely tokenize your card. Please check the card details and try again."
                    )


                    return
                }


                const sourceId =
                    tokenResult.token


                if (!sourceId) {

                    setError(
                        "Square did not return a payment token. Please try again."
                    )

                    return
                }


                console.log(
                    "[Square] Card token created successfully."
                )


                /* =============================================
                   SEND TOKEN TO BACKEND
                   ============================================= */

                const paymentPayload = {

                    /*
                     * ONLY TOKEN.
                     *
                     * Never send:
                     * card number
                     * CVV
                     * expiry
                     */

                    sourceId,

                    amount:
                        total,

                    currency:
                        squareCurrency,

                    email:
                        details.email ||
                        "",

                    name:
                        `${details.firstName || ""} ${
                            details.lastName || ""
                        }`.trim(),

                    phone:
                        details.phone ||
                        "",

                    userId:
                        details.phone ||
                        details.email ||
                        "guest",

                    preferredCity:
                        details.preferredCity ||
                        details.city ||
                        "",

                    description:
                        "VOC Assessment Payment",

                    courseName:
                        courses
                            .map(
                                (course) =>
                                    course.name ||
                                    course.courseName ||
                                    course.title ||
                                    ""
                            )
                            .filter(Boolean)
                            .join(", "),
                }


                console.log(
                    "[Square] Sending tokenized payment to backend:",
                    {
                        amount:
                            paymentPayload.amount,

                        currency:
                            paymentPayload.currency,

                        email:
                            paymentPayload.email,

                        hasSourceId:
                            !!paymentPayload.sourceId,
                    }
                )


                let payRes


                try {

                    payRes =
                        await fetch(
                            `${API_URL}/api/payment/pay`,
                            {
                                method:
                                    "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",
                                },

                                body:
                                    JSON.stringify(
                                        paymentPayload
                                    ),
                            }
                        )

                } catch (networkError) {

                    console.error(
                        "Payment network error:",
                        networkError
                    )


                    setError(
                        "Network error. Please check your connection and try again."
                    )

                    return
                }


                const payResult =
                    await payRes
                        .json()
                        .catch(
                            () => ({})
                        )


                console.log(
                    "[Square] Backend payment response:",
                    payResult
                )


                if (
                    !payRes.ok ||
                    !payResult.success
                ) {

                    setError(
                        payResult.message ||
                            "Your card was declined. Please check your card details or try a different card."
                    )

                    return
                }


                /* =============================================
                   GET GATEWAY TRANSACTION ID
                   ============================================= */

                squareTransactionId =
                    payResult.gatewayTransactionId ||
                    payResult.transactionId ||
                    ""


                if (
                    !squareTransactionId
                ) {

                    setError(
                        "Payment succeeded but no transaction ID was returned. Please contact support."
                    )

                    return
                }


                console.log(
                    "[Square] Payment successful:",
                    squareTransactionId
                )
            }


            /* =================================================
               STEP 2
               SUBMIT VOC RECORD
               ================================================= */

            const fd =
                new FormData()


            fd.append(
                "firstName",
                details.firstName ||
                    ""
            )


            fd.append(
                "lastName",
                details.lastName ||
                    ""
            )


            fd.append(
                "email",
                details.email ||
                    ""
            )


            fd.append(
                "phone",
                details.phone ||
                    ""
            )


            fd.append(
                "studentId",
                details.studentId ||
                    ""
            )


            fd.append(
                "streetAddress",
                details.streetAddress ||
                    ""
            )


            fd.append(
                "city",
                details.city ||
                    ""
            )


            fd.append(
                "state",
                details.state ||
                    ""
            )


            fd.append(
                "postcode",
                details.postcode ||
                    ""
            )


            /*
             * Preferred city
             */
            fd.append(
                "preferredCity",
                details.preferredCity ||
                    details.city ||
                    ""
            )


            fd.append(
                "courses",
                JSON.stringify(courses)
            )


            fd.append(
                "paymentMethod",
                method
            )


            /* =================================================
               CARD RECORD
               ================================================= */

            if (method === "card") {

                fd.append(
                    "card",
                    JSON.stringify({

                        name:
                            cardName,

                        /*
                         * We don't have the raw
                         * card number.
                         *
                         * Square owns the secure
                         * card fields.
                         */
                    })
                )


                fd.append(
                    "squareTransactionId",
                    squareTransactionId
                )


                /*
                 * Keep old backend field if your
                 * VOC controller currently expects
                 * this field.
                 */
                fd.append(
                    "ewayTransactionId",
                    squareTransactionId
                )
            }


            /* =================================================
               BANK RECORD
               ================================================= */

            else {

                fd.append(
                    "bank",
                    JSON.stringify({
                        refId:
                            bank.refId.trim(),
                    })
                )


                fd.append(
                    "proof",
                    bank.proof
                )
            }


            /* =================================================
               SUBMIT VOC
               ================================================= */
            console.log(fd,"fd");

            const res =
                await fetch(
                    `${API_URL}/api/voc`,
                    {
                        method: "POST",
                        body: fd,
                    }
                )


            const payload =
                await res
                    .json()
                    .catch(
                        () => ({})
                    )


            if (!res.ok) {

                throw new Error(
                    payload.error ||
                        payload.message ||
                        "Submission failed."
                )
            }


            console.log(
                "✅ VOC registration completed"
            )


            /* =================================================
               COMPLETE
               ================================================= */

            onComplete()

        } catch (err) {

            console.error(
                "VOC submission error:",
                err
            )


            setError(
                err.message ||
                    "Submission failed. Please try again."
            )

        } finally {

            processingRef.current =
                false

            setSubmitting(false)
        }
    }


    /* =====================================================
       RENDER
       ===================================================== */

    return (
        <div className="v3-wrap">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="v3-header">

                <h2 className="v3-header-title">
                    Secure Payment
                </h2>

                <p className="v3-header-sub">
                    Choose your preferred payment method
                </p>

            </div>


            {/* =================================================
                BODY
            ================================================= */}

            <div className="v3-body">


                {/* =================================================
                    CARD PAYMENT OPTION
                ================================================= */}

                <div
                    className={`v3-method-card ${
                        method === "card"
                            ? "v3-method-active"
                            : ""
                    }`}
                    onClick={() => {
                        if (!submitting) {
                            setMethod("card")
                            setError("")
                        }
                    }}
                >

                    <div className="v3-method-left">

                        <span className="v3-method-icon">
                            💳
                        </span>

                        <div>

                            <p className="v3-method-title">
                                Credit / Debit Card
                            </p>

                            <p className="v3-method-sub">
                                Pay securely with card
                            </p>

                        </div>

                    </div>


                    <div
                        className={`v3-radio-dot ${
                            method === "card"
                                ? "v3-radio-active"
                                : ""
                        }`}
                    />

                </div>


                {/* =================================================
                    BANK PAYMENT OPTION
                ================================================= */}

                <div
                    className={`v3-method-card ${
                        method === "bank"
                            ? "v3-method-active"
                            : ""
                    }`}
                    onClick={() => {
                        if (!submitting) {
                            setMethod("bank")
                            setError("")
                        }
                    }}
                >

                    <div className="v3-method-left">

                        <span className="v3-method-icon">
                            🏦
                        </span>

                        <div>

                            <p className="v3-method-title">
                                Bank Transfer
                            </p>

                            <p className="v3-method-sub">
                                Upload proof of payment
                            </p>

                        </div>

                    </div>


                    <div
                        className={`v3-radio-dot ${
                            method === "bank"
                                ? "v3-radio-active"
                                : ""
                        }`}
                    />

                </div>


                {/* =================================================
                    SQUARE CARD DETAILS
                ================================================= */}

                {method === "card" && (

                    <div className="v3-details-box">


                        <div className="v3-details-header">

                            <span>
                                🔒
                            </span>

                            <span className="v3-details-title">
                                CARD DETAILS — Encrypted &amp; Secure
                            </span>

                        </div>


                        {/* =================================================
                            CARD HOLDER
                        ================================================= */}

                        <div className="v3-field">

                            <label className="v3-label">
                                NAME ON CARD *
                            </label>

                            <input
                                className="v3-input"
                                placeholder="FULL NAME AS ON CARD"
                                value={cardName}
                                disabled={submitting}
                                onChange={(e) =>
                                    setCardName(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        {/* =================================================
                            SQUARE SECURE CARD FORM
                        ================================================= */}

                        <div className="v3-field">

                            <label className="v3-label">
                                CARD DETAILS *
                            </label>


                            <div
                                ref={
                                    cardContainerRef
                                }
                                id="square-card-container"
                                className="square-card-container"
                            />


                            {squareLoading && (

                                <p
                                    style={{
                                        marginTop:
                                            8,

                                        fontSize:
                                            13,

                                        color:
                                            "#64748b",
                                    }}
                                >
                                    Loading secure card
                                    payment form...
                                </p>

                            )}


                            {squareReady &&
                                !squareLoading && (
                                    <p
                                        style={{
                                            marginTop:
                                                6,

                                            fontSize:
                                                12,

                                            color:
                                                "#059669",
                                        }}
                                    >
                                        ✓ Secure card
                                        form ready
                                    </p>
                                )}


                            {squareError && (

                                <p
                                    style={{
                                        marginTop:
                                            8,

                                        fontSize:
                                            13,

                                        color:
                                            "#dc2626",
                                    }}
                                >
                                    {squareError}
                                </p>

                            )}

                        </div>


                        <p className="v3-accept-text">

                            We accept:&nbsp;

                            <span className="v3-visa">
                                VISA
                            </span>

                            <span className="v3-mc">
                                MC
                            </span>

                        </p>

                    </div>
                )}


                {/* =================================================
                    BANK TRANSFER
                ================================================= */}

                {method === "bank" && (

                    <div className="v3-details-box">


                        <div className="v3-details-header">

                            <span>
                                ℹ️
                            </span>

                            <span className="v3-details-title">
                                BANK TRANSFER INSTRUCTIONS
                            </span>

                        </div>


                        <div className="v3-bank-table">

                            <p className="v3-bank-transfer-heading">
                                TRANSFER $
                                {total.toFixed(2)}
                                {" "}
                                TO:
                            </p>


                            <div className="v3-bank-row">

                                <span>
                                    Bank:
                                </span>

                                <strong>
                                    Commonwealth Bank
                                </strong>

                            </div>


                            <div className="v3-bank-row">

                                <span>
                                    Account Name:
                                </span>

                                <strong>
                                    AIET College
                                </strong>

                            </div>


                            <div className="v3-bank-row">

                                <span>
                                    BSB:
                                </span>

                                <strong>
                                    062268
                                </strong>

                            </div>


                            <div className="v3-bank-row">

                                <span>
                                    Account Number:
                                </span>

                                <strong>
                                    10530830
                                </strong>

                            </div>

                        </div>


                        <p className="v3-bank-ref-note">

                            Use{" "}

                            <strong>
                                your name + date
                            </strong>

                            {" "}
                            as your payment reference.

                        </p>


                        <div className="v3-steps-box">

                            <p className="v3-steps-title">
                                STEPS:
                            </p>


                            <ol className="v3-steps-list">

                                <li>
                                    Make the bank transfer
                                    using the details above
                                </li>

                                <li>
                                    Save your
                                    receipt/screenshot
                                </li>

                                <li>
                                    Enter your
                                    transaction/reference ID
                                </li>

                                <li>
                                    Upload your payment proof
                                </li>

                            </ol>

                        </div>


                        {/* =================================================
                            REFERENCE ID
                        ================================================= */}

                        <div className="v3-field">

                            <label className="v3-label">
                                TRANSACTION / REFERENCE ID *
                            </label>


                            <input
                                className="v3-input v3-ref-input"
                                placeholder="ENTER YOUR TRANSACTION / REFERENCE ID"
                                value={
                                    bank.refId
                                }
                                disabled={
                                    submitting
                                }
                                onChange={(e) =>
                                    setB(
                                        "refId",
                                        e.target.value
                                    )
                                }
                            />


                            <p className="v3-field-hint">
                                Found on your bank receipt
                                or online banking confirmation
                            </p>

                        </div>


                        {/* =================================================
                            RECEIPT
                        ================================================= */}

                        <div className="v3-field">

                            <label className="v3-label">
                                PAYMENT RECEIPT / PROOF *
                            </label>


                            {bank.proof ? (

                                <div className="v3-file-preview">

                                    {isImageProof &&
                                    previewUrl ? (

                                        <img
                                            src={
                                                previewUrl
                                            }
                                            alt="Payment receipt preview"
                                            className="v3-file-thumb"
                                        />

                                    ) : (

                                        <span className="v3-file-icon">
                                            📄
                                        </span>

                                    )}


                                    <div className="v3-file-meta">

                                        <p className="v3-file-name">
                                            {
                                                bank.proof
                                                    .name
                                            }
                                        </p>

                                        <p className="v3-file-size">
                                            {(
                                                bank
                                                    .proof
                                                    .size /
                                                1024
                                            ).toFixed(
                                                1
                                            )}{" "}
                                            KB
                                        </p>

                                    </div>


                                    <button
                                        type="button"
                                        className="v3-change-btn"
                                        disabled={
                                            submitting
                                        }
                                        onClick={() =>
                                            setB(
                                                "proof",
                                                null
                                            )
                                        }
                                    >
                                        Change File
                                    </button>

                                </div>

                            ) : (

                                <div
                                    className="v3-upload-zone"
                                    onClick={() =>
                                        document
                                            .getElementById(
                                                "v3-proof-input"
                                            )
                                            ?.click()
                                    }
                                >

                                    <span className="v3-upload-arrow">
                                        ↑
                                    </span>

                                    <p className="v3-upload-text">
                                        Click to upload payment receipt
                                    </p>

                                    <p className="v3-upload-hint">
                                        JPG, PNG or PDF —
                                        max 5MB
                                    </p>

                                </div>

                            )}


                            <input
                                id="v3-proof-input"
                                type="file"
                                style={{
                                    display:
                                        "none",
                                }}
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) => {

                                    const file =
                                        e.target
                                            .files?.[0]

                                    if (!file) {
                                        return
                                    }


                                    /*
                                     * 5MB validation
                                     */

                                    if (
                                        file.size >
                                        5 * 1024 * 1024
                                    ) {

                                        setError(
                                            "Payment receipt must be less than 5MB."
                                        )

                                        e.target.value =
                                            ""

                                        return
                                    }


                                    setB(
                                        "proof",
                                        file
                                    )

                                }}
                            />


                            <p className="v3-field-hint">
                                * Your submission will be processed
                                once we confirm receipt of funds.
                            </p>

                        </div>

                    </div>

                )}

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="v3-footer">


                <div className="v3-total-block">

                    <p className="v3-total-label">

                        TOTAL PAYABLE
                        &nbsp;

                        <span
                            className={
                                method === "card"
                                    ? "v3-badge-card"
                                    : "v3-badge-bank"
                            }
                        >
                            {method === "card"
                                ? "CREDIT CARD"
                                : "BANK TRANSFER"}
                        </span>

                    </p>


                    <p className="v3-total-amount">
                        $
                        {total.toFixed(2)}
                    </p>


                    <p className="v3-total-sub">

                        {courses.length}

                        {" "}

                        COURSE
                        {courses.length !== 1
                            ? "S"
                            : ""}

                        {" "}
                        SELECTED

                    </p>

                </div>


                <div className="v3-footer-btns">


                    <button
                        type="button"
                        className="v3-back-btn"
                        onClick={onBack}
                        disabled={submitting}
                    >
                        ‹ &nbsp; BACK
                    </button>


                    <button
                        type="button"
                        className="v3-complete-btn"
                        onClick={handleSubmit}
                        disabled={
                            submitting ||
                            (
                                method ===
                                    "card" &&
                                (
                                    squareLoading ||
                                    !squareReady
                                )
                            )
                        }
                    >

                        {submitting
                            ? "SUBMITTING..."
                            : "COMPLETE REGISTRATION"}

                    </button>

                </div>


                {error && (

                    <p
                        style={{
                            marginTop:
                                8,

                            color:
                                colors.errorBg,

                            fontSize:
                                13,

                            textAlign:
                                "right",
                        }}
                    >
                        ⚠ {error}
                    </p>

                )}

            </div>

        </div>
    )
}


export default VocStep3