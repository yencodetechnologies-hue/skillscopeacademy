const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    // BASIC INFO
    companyName: {
      type: String,
      required: true, 

      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    mobileNumber: {
      type: String,
      default: null,
    },

    // CONTACT PERSON — primary contact at the company (separate from
    // companyName; used for emails, bookings, and admin reference).
    contactPerson: {
      type: String,
      default: "",
      trim: true,
    },

    // STATUS
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // Pay Later — admin-controlled flag that lets a company enroll students
    // without paying upfront (settle invoice later). Default off.
    payLater: {
      type: Boolean,
      default: false,
    },
    role:{
      type:String,
      default :"Company"
    },

    // LOGIN TRACKING
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);