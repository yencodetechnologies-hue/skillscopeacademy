const mongoose = require("mongoose");

const ROLES = ["Student", "Teacher", "Admin", "Company"];

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        // Validated in code, not via DB-level enum, to avoid stale MongoDB validators
        default: "Student",
        validate: {
            validator: v => ROLES.includes(v),
            message: props => `"${props.value}" is not a valid role. Must be one of: ${ROLES.join(", ")}`
        }
    }
}, { timestamps: true });

// Remove any stale MongoDB collection-level validator on startup
userSchema.post("init", function() {});
mongoose.connection.once("open", async () => {
    try {
        await mongoose.connection.db.command({
            collMod: "users",
            validator: {},
            validationLevel: "off"
        });
    } catch (e) {
        // Collection may not exist yet — ignore
    }
});

module.exports = mongoose.model("User", userSchema);