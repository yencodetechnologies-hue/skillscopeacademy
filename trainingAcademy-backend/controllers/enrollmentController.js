const Enrollment = require("../models/Enrollment")

const getCourseEnrollmentCount = async (req,res) => {

  try{

    const {courseId} = req.params

    const count = await Enrollment.countDocuments({
      course: courseId
    })

    res.json({
      studentsEnrolled: count
    })

  }
  catch(err){

    res.status(500).json({
      message: err.message
    })

  }

}

module.exports = { getCourseEnrollmentCount }