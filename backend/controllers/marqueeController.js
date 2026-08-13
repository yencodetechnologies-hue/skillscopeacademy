const Marquee = require("../models/Marquee");

// Create marquee
const createMarquee = async (req, res) => {
  try {
    const { content, isActive } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Marquee content is required",
      });
    }

    const marquee = await Marquee.create({
      content: content.trim(),
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: "Marquee content created successfully",
      data: marquee,
    });
  } catch (error) {
    console.error("Create marquee error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create marquee content",
      error: error.message,
    });
  }
};


// Get all marquee contents
const getMarquees = async (req, res) => {
  try {
    const marquees = await Marquee.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: marquees,
    });
  } catch (error) {
    console.error("Get marquees error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch marquee contents",
      error: error.message,
    });
  }
};


// Get single marquee
const getMarqueeById = async (req, res) => {
  try {
    const marquee = await Marquee.findById(req.params.id);

    if (!marquee) {
      return res.status(404).json({
        success: false,
        message: "Marquee content not found",
      });
    }

    res.status(200).json({
      success: true,
      data: marquee,
    });
  } catch (error) {
    console.error("Get marquee error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch marquee content",
      error: error.message,
    });
  }
};


// Update marquee
const updateMarquee = async (req, res) => {
  try {
    const { content, isActive } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Marquee content is required",
      });
    }

    const marquee = await Marquee.findByIdAndUpdate(
      req.params.id,
      {
        content: content.trim(),
        isActive: isActive,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!marquee) {
      return res.status(404).json({
        success: false,
        message: "Marquee content not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Marquee content updated successfully",
      data: marquee,
    });
  } catch (error) {
    console.error("Update marquee error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update marquee content",
      error: error.message,
    });
  }
};


// Delete marquee
const deleteMarquee = async (req, res) => {
  try {
    const marquee = await Marquee.findByIdAndDelete(
      req.params.id
    );

    if (!marquee) {
      return res.status(404).json({
        success: false,
        message: "Marquee content not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Marquee content deleted successfully",
    });
  } catch (error) {
    console.error("Delete marquee error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete marquee content",
      error: error.message,
    });
  }
};


// Get active marquee
const getActiveMarquee = async (req, res) => {
  try {
    const marquee = await Marquee.findOne({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: marquee,
    });
  } catch (error) {
    console.error("Get active marquee error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch active marquee",
      error: error.message,
    });
  }
};


module.exports = {
  createMarquee,
  getMarquees,
  getMarqueeById,
  updateMarquee,
  deleteMarquee,
  getActiveMarquee,
};