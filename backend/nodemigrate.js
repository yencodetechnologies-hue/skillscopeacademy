const mongoose = require("mongoose");

/* =========================
   SOURCE CONNECTION
========================= */

const SOURCE_URI =
  "mongodb+srv://safetytraining:safetytraining@safetytraining.cw7lmny.mongodb.net/?appName=safetytraining";

/* =========================
   TARGET CONNECTION
========================= */

const TARGET_URI =
  "mongodb://safetytraining:safetytraining@ac-az9wriw-shard-00-00.cw7lmny.mongodb.net:27017,ac-az9wriw-shard-00-01.cw7lmny.mongodb.net:27017,ac-az9wriw-shard-00-02.cw7lmny.mongodb.net:27017/?ssl=true&replicaSet=atlas-vfievz-shard-0&authSource=admin&appName=safetytraining";

/* =========================
   SOURCE SCHEMAS
========================= */

const sourceCategorySchema = new mongoose.Schema(
  {},
  { strict: false, collection: "categories" }
);

const sourceCourseSchema = new mongoose.Schema(
  {},
  { strict: false, collection: "courses" }
);

/* =========================
   TARGET SCHEMAS
========================= */

const targetCategorySchema = new mongoose.Schema(
  {
    name: String,
    image: String,
  },
  {
    timestamps: true,
    collection: "categories",
  }
);

const targetCourseSchema = new mongoose.Schema(
  {
    title: String,
    slug: String,
    description: String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    instructor: String,
    price: Number,
    thumbnail: String,
    courseType: String,
    duration: Number,
    certificateValidity: Number,
    pricingType: String,
    urlSlug: String,
    comboEnabled: Boolean,
    comboPrice: Number,
    comboDescription: String,
    comboDuration: Number,
    rating: Number,
  },
  {
    timestamps: true,
    collection: "courses",
  }
);

async function migrate() {
  let sourceConn;
  let targetConn;

  try {
    console.log("Connecting source database...");

    sourceConn = await mongoose.createConnection(
      SOURCE_URI
    ).asPromise();

    console.log("Connecting target database...");

    targetConn = await mongoose.createConnection(
      TARGET_URI
    ).asPromise();

    const SourceCategory = sourceConn.model(
      "SourceCategory",
      sourceCategorySchema
    );

    const SourceCourse = sourceConn.model(
      "SourceCourse",
      sourceCourseSchema
    );

    const TargetCategory = targetConn.model(
      "Category",
      targetCategorySchema
    );

    const TargetCourse = targetConn.model(
      "Course",
      targetCourseSchema
    );

    console.log("Fetching source categories...");

    const sourceCategories =
      await SourceCategory.find().lean();

    console.log(
      `Found ${sourceCategories.length} categories`
    );

    const categoryMap = {};

    for (const cat of sourceCategories) {
      const targetCategory =
        await TargetCategory.findOneAndUpdate(
          {
            name: cat.name,
          },
          {
            name: cat.name,
            image: cat.image || "",
          },
          {
            upsert: true,
            new: true,
          }
        );

      categoryMap[cat._id.toString()] =
        targetCategory._id;

      console.log(
        `Category migrated: ${cat.name}`
      );
    }

    console.log(
      "Categories migration completed"
    );

    const sourceCourses =
      await SourceCourse.find().lean();

    console.log(
      `Found ${sourceCourses.length} courses`
    );

    let migratedCount = 0;

    for (const course of sourceCourses) {
      try {
        await TargetCourse.findOneAndUpdate(
          {
            slug: course.slug,
          },
          {
            title: course.title || "",

            slug:
              course.slug ||
              `${Date.now()}-${Math.random()}`,

            description: Array.isArray(
              course.description
            )
              ? course.description.join("\n")
              : course.description || "",

            category:
              categoryMap[
                course.category?.toString()
              ] || null,

            instructor: "Safety Training",

            price:
              course.sellingPrice ||
              course.comboPrice ||
              course.withExperiencePrice ||
              course.withoutExperiencePrice ||
              0,

            thumbnail: course.image || "",

            courseType: course.comboEnabled
              ? "combo"
              : "single",

            duration:
              parseInt(course.duration) || 0,

            certificateValidity:
              parseInt(
                course.certificateValidity
              ) || 0,

            pricingType:
              course.pricingType ||
              "Standard",

            urlSlug: course.slug || "",

            comboEnabled:
              course.comboEnabled || false,

            comboPrice:
              course.comboPrice || 0,

            comboDescription:
              course.comboDescription || "",

            comboDuration:
              parseInt(
                course.comboDuration
              ) || 0,

            rating: 4.5,
          },
          {
            upsert: true,
            new: true,
          }
        );

        migratedCount++;

        console.log(
          `Migrated (${migratedCount}): ${course.title}`
        );
      } catch (err) {
        console.log(
          `Failed: ${course.title}`
        );
        console.log(err.message);
      }
    }

    console.log("\n=================================");
    console.log(
      `Categories Migrated: ${sourceCategories.length}`
    );
    console.log(
      `Courses Migrated: ${migratedCount}`
    );
    console.log("Migration Completed");
    console.log("=================================\n");
  } catch (error) {
    console.error(
      "Migration Error:",
      error.message
    );
  } finally {
    if (sourceConn) await sourceConn.close();
    if (targetConn) await targetConn.close();

    process.exit(0);
  }
}

migrate();