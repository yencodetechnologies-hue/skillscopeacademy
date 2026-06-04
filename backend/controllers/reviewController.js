const Review = require('../models/Review')

exports.addReview = async (req, res) => {
  try {
    const review = await Review.create({
      ...req.body,
      user: req.user._id,
    })

    res.status(201).json({
      success: true,
      review,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      course: req.params.courseId,
    }).populate('user', 'name avatar')

    res.json({
      success: true,
      reviews,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}