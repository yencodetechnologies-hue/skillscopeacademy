const cloudinary = require("../config/cloudinary");

exports.getSignedPdfUrl = (req, res) => {
  const { url: rawUrl } = req.query;
  if (!rawUrl) return res.status(400).json({ error: "Missing url" });

  try {
    const decoded = decodeURIComponent(rawUrl);

    if (!decoded.includes("res.cloudinary.com/dpa38mrow/")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Parse: https://res.cloudinary.com/dpa38mrow/{resourceType}/upload/v{version}/{publicId}
    const match = decoded.match(
      /res\.cloudinary\.com\/dpa38mrow\/(\w+)\/upload\/(?:v\d+\/)?(.+?)(?:\?.*)?$/
    );
    if (!match) return res.status(400).json({ error: "Invalid Cloudinary URL" });

    const resourceType = match[1]; // "raw" or "image"
    const publicId = match[2];     // e.g. "courses/filename.pdf"

    const signedUrl = cloudinary.url(publicId, {
      resource_type: resourceType,
      type: "upload",
      sign_url: true,
      secure: true,
    });

    return res.json({ url: signedUrl });
  } catch (err) {
    console.error("getSignedPdfUrl error:", err.message);
    return res.status(500).json({ error: "Failed to sign URL" });
  }
};
