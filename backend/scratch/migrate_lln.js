try {
  require("dns").setServers(["8.8.8.8"]);
} catch (err) {}
const mongoose = require("mongoose");
require("dotenv").config();

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const LLN = db.collection("llndassessments");
        const Flows = db.collection("enrollmentflows");
        const Courses = db.collection("courses");

        const records = await LLN.find({
            $or: [
                { courseName: { $exists: false } },
                { bookingDate: { $exists: false } },
                { course: { $exists: false } }
            ]
        }).toArray();

        console.log(`Found ${records.length} records to potentially fix.`);

        for (const record of records) {
            let email = record.email;
            if (!email) continue;

            // Find the most recent flow for this email
            // We need to populate or join, but let's just find by email if stored in flow or student
            // EnrollmentFlow usually has studentId. We might need to find student first.
            const student = await db.collection("studentmains").findOne({ email: new RegExp(`^${email}$`, "i") });
            
            if (student) {
                const flow = await Flows.findOne(
                    { studentId: student._id },
                    { sort: { createdAt: -1 } }
                );

                if (flow && flow.items && flow.items.length > 0) {
                    const firstItem = flow.items[0];
                    const courseName = firstItem.course?.courseName || "Unknown";
                    const bookingDate = new Date(flow.createdAt).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" });
                    const courseId = firstItem.course?.courseId;

                    await LLN.updateOne(
                        { _id: record._id },
                        {
                            $set: {
                                courseName: courseName,
                                bookingDate: bookingDate,
                                course: courseId
                            }
                        }
                    );
                    console.log(`Updated record for ${email}: ${courseName} | ${bookingDate}`);
                }
            }
        }

        console.log("Migration complete.");
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
}

migrate();
