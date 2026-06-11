


// const slugify = require("slugify");

// const Course = require('../models/Course')

// /*
// ========================================
// GET ALL COURSES
// ========================================
// */
// exports.getCourses = async (req, res) => {
//   try {
//     const courses = await Course.find()
//       .populate('category', 'name')
//       .sort({ createdAt: -1 })

//     res.json({ success: true, courses })
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message })
//   }
// }


// exports.createCourse = async (req, res) => {
//   try {
//     const thumbnail = req.file?.path || "";

//     let slug = slugify(req.body.title, {
//       lower: true,
//       strict: true,
//       trim: true,
//     });

//     const existingSlug = await Course.findOne({ slug });

//     if (existingSlug) {
//       slug = `${slug}-${Date.now()}`;
//     }

//     const course = await Course.create({
//       title: req.body.title,
//       slug,

//       description: req.body.description,
//       category: req.body.category || undefined,
//       instructor: req.body.instructor,

//       price: Number(req.body.price) || 0,

//       courseType: req.body.courseType || "single",
//       duration: Number(req.body.duration) || 0,
//       certificateValidity:
//         Number(req.body.certificateValidity) || 0,
//       pricingType: req.body.pricingType || "Standard",

//       comboEnabled: req.body.comboEnabled === "true",
//       comboPrice: Number(req.body.comboPrice) || 0,
//       comboDescription: req.body.comboDescription || "",
//       comboDuration: Number(req.body.comboDuration) || 0,

//       thumbnail,
//     });

//     res.status(201).json({
//       success: true,
//       course,
//     });
//   } catch (error) {
//     console.log("Course Create Error:", error);

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
// /*
// ========================================
// UPDATE COURSE
// ========================================
// */
// exports.updateCourse = async (req, res) => {
//   try {
//     const thumbnail = req.file?.path || undefined

//     const updateData = {
//       title:            req.body.title,
//       description:      req.body.description,
//       instructor:       req.body.instructor,
//       price:            Number(req.body.price) || 0,
//       courseType:       req.body.courseType || 'single',
//       comboEnabled:     req.body.comboEnabled === 'true',
//       comboPrice:       Number(req.body.comboPrice) || 0,
//       comboDescription: req.body.comboDescription || '',
//       comboDuration:    Number(req.body.comboDuration) || 0,
//     }

//     // Only update category if provided
//     if (req.body.category) updateData.category = req.body.category

//     // Only update thumbnail if a new file was uploaded
//     if (thumbnail) updateData.thumbnail = thumbnail

//     const course = await Course.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true }
//     ).populate('category', 'name')

//     if (!course) {
//       return res.status(404).json({ success: false, message: 'Course not found' })
//     }

//     res.json({ success: true, course })
//   } catch (error) {
//     console.log("erorrcourseupdate",error);
    
//     res.status(500).json({ success: false, message: error.message })
//   }
// }

// /*
// ========================================
// DELETE COURSE
// ========================================
// */
// exports.deleteCourse = async (req, res) => {
//   try {
//     const course = await Course.findByIdAndDelete(req.params.id)

//     if (!course) {
//       return res.status(404).json({ success: false, message: 'Course not found' })
//     }

//     res.json({ success: true, message: 'Course deleted successfully' })
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message })
//   }
// }


// /*
// ========================================
// GET SINGLE COURSE BY ID
// ========================================
// */
// exports.getCourseById = async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.id)
//       .populate('category', 'name')

//     if (!course) {
//       return res.status(404).json({ success: false, message: 'Course not found' })
//     }

//     res.json({ success: true, course })
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message })
//   }
// }

// /*
// ========================================
// TOGGLE COURSE STATUS (isActive)
// ========================================
// */
// exports.toggleCourseStatus = async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.id)

//     if (!course) {
//       return res.status(404).json({ success: false, message: 'Course not found' })
//     }

//     course.isActive = !course.isActive
//     await course.save()

//     res.json({ success: true, message: `Course is now ${course.isActive ? 'active' : 'inactive'}`, course })
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message })
//   }
// }




const slugify = require("slugify");

const Course = require('../models/Course')

/*
========================================
GET ALL COURSES
========================================
*/
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('category', 'name')
      .sort({ sortOrder: 1, createdAt: -1 })

    res.json({ success: true, courses })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}


exports.createCourse = async (req, res) => {
  try {
    const thumbnail = req.file?.path || "";

    let slug = slugify(req.body.title, {
      lower: true,
      strict: true,
      trim: true,
    });

    const existingSlug = await Course.findOne({ slug });

    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const course = await Course.create({
      title: req.body.title,
      slug,

      description: req.body.description,
      category: req.body.category || undefined,
      instructor: req.body.instructor,

      price: Number(req.body.price) || 0,

      courseType: req.body.courseType || "single",
      duration: Number(req.body.duration) || 0,
      certificateValidity:
        Number(req.body.certificateValidity) || 0,
      pricingType: req.body.pricingType || "Standard",

      comboEnabled: req.body.comboEnabled === "true",
      comboPrice: Number(req.body.comboPrice) || 0,
      comboDescription: req.body.comboDescription || "",
      comboDuration: Number(req.body.comboDuration) || 0,

      thumbnail,
    });

    res.status(201).json({
      success: true,
      course,
    });
  } catch (error) {
    console.log("Course Create Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/*
========================================
UPDATE COURSE
========================================
*/
exports.updateCourse = async (req, res) => {
  try {
    const thumbnail = req.file?.path || undefined

    const updateData = {
      title:            req.body.title,
      description:      req.body.description,
      instructor:       req.body.instructor,
      price:            Number(req.body.price) || 0,
      courseType:       req.body.courseType || 'single',
      comboEnabled:     req.body.comboEnabled === 'true',
      comboPrice:       Number(req.body.comboPrice) || 0,
      comboDescription: req.body.comboDescription || '',
      comboDuration:    Number(req.body.comboDuration) || 0,
    }

    // Only update category if provided
    if (req.body.category) updateData.category = req.body.category

    // Only update thumbnail if a new file was uploaded
    if (thumbnail) updateData.thumbnail = thumbnail

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('category', 'name')

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }

    res.json({ success: true, course })
  } catch (error) {
    console.log("erorrcourseupdate",error);
    
    res.status(500).json({ success: false, message: error.message })
  }
}

/*
========================================
DELETE COURSE
========================================
*/
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id)

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }

    res.json({ success: true, message: 'Course deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}


/*
========================================
GET SINGLE COURSE BY ID
========================================
*/
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('category', 'name')

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }

    res.json({ success: true, course })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

/*
========================================
TOGGLE COURSE STATUS (isActive)
========================================
*/
exports.toggleCourseStatus = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }

    course.isActive = !course.isActive
    await course.save()

    res.json({ success: true, message: `Course is now ${course.isActive ? 'active' : 'inactive'}`, course })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

/*
========================================
REORDER COURSES
Body: { orderedIds: ['id1', 'id2', ...] }
========================================
*/
exports.reorderCourses = async (req, res) => {
  try {
    const { orderedIds } = req.body
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds array required' })
    }
    await Promise.all(
      orderedIds.map((id, idx) =>
        Course.findByIdAndUpdate(id, { sortOrder: idx })
      )
    )
    res.json({ success: true, message: 'Courses reordered' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}