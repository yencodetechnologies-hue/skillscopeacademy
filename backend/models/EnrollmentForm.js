const mongoose = require("mongoose");

const EnrollmentFormSchema = new mongoose.Schema({
  // ================= BASIC =================
  studentId: String,
  enrollmentFormCompleted: { type: Boolean, default: false },
  enrollmentFormSubmittedAt: Date,

  // ================= SECTION 1 =================
  personalDetails: {
    title: String,
    surname: String,
    givenName: String,
    middleName: String,
    preferredName: String,
    dob: Date,
    gender: String,

    email: String,
    homePhone: String,
    workPhone: String,
    mobilePhone: String,
  },

  address: {
    residential: {
      address: String,
      suburb: String,
      state: String,
      postcode: String,
    },
    postal: {
      address: String,
      suburb: String,
      state: String,
      postcode: String,
    },
  },

  emergencyContact: {
    name: String,
    relationship: String,
    contactNumber: String,
    consent: Boolean,
  },

  usi: {
    number: String,
    permission: Boolean,
    staApplication: String,
    staIdFileUrl: String,

    // if applying via institute
    applyViaInstitute: {
      consent: Boolean,
      name: String,
      townCityOfBirth: String,
    },
    staAuthoriseName: String,
    staConsent: Boolean,
    staTownOfBirth: String,
    staOverseasTown: String,
    staIdType: String,
    identity: {
      type: String, // DriverLicence / Passport / etc

      driverLicence: {
        state: String,
        number: String,
      },

      medicare: {
        number: String,
        irn: String,
        color: String,
        expiry: Date,
      },

      birthCertificate: {
        state: String,
      },

      immicard: {
        number: String,
      },

      australianPassport: {
        number: String,
      },

      nonAustralianPassport: {
        number: String,
        country: String,
      },

      citizenship: {
        stockNumber: String,
        acquisitionDate: Date,
      },

      descent: {
        acquisitionDate: Date,
      },
    },
  },

  // ================= SECTION 2 =================
  education: {
    highestLevel: String,
    yearCompleted: String,
    schoolName: String,
    schoolState: String,
    schoolPostcode: String,
    schoolCountry: String,
  },

  qualifications: {
    hasQualification: Boolean,
    types: [String],
    details: String,
    evidenceUrl: String,          // kept for backward compat (single file fallback)
    // ✅ FIXED: default empty array so $push always works
    evidenceUrls: {
      type: [
        {
          level: { type: String },
          url:   { type: String }
        }
      ],
      default: []
    },
  },

  employment: {
    status: String,

    details: {
      employerName: String,
      supervisorName: String,
      address: String,
      email: String,
      phone: String,
    },
  },

  // ================= SECTION 3 =================
  trainingReason: String,

  specialNeeds: {
    hasDisability: Boolean,
    types: [String],
    other: String,
  },

  language: {
    countryOfBirth: String,
    placeOfBirth: String,

    atsi: String,

    languageAtHome: String,
    otherLanguage: String,
    speaksOtherLanguage: String,
    indigenousStatus: String,
    englishLevel: String,
  },

  // ================= SECTION 4 =================
  enrollment: {
    qualification: String,
    applyingForCT: Boolean,
    preferredStartDate: Date,

    workplaceAccess: Boolean,
    siteLocation: String,

    units: [String], // courses selected
  },

  // ================= SECTION 5 =================
  idDocumentUrl: String,
  photoDocumentUrl: String,
  signatureUrl: String,
  acceptPrivacy: Boolean,
  acceptTerms: Boolean,
  studentName: String,
  declarationDate: String,

  // ================= META =================
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },

  reviewedBy: String,
  reviewedAt: Date,
}, {
  timestamps: true,
  collection: "enrollmenforms",
});

module.exports =
  mongoose.models.enrollmenforms ||
  mongoose.model("enrollmenforms", EnrollmentFormSchema);
