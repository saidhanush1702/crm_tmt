import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* 🧠 1️⃣ Configure Cloudinary Storage (auto-detects images, videos, files) */
/* -------------------------------------------------------------------------- */
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Extract extension safely
    const ext = file.originalname.split(".").pop();

    return {
      folder: "task-manager-chat",
      resource_type: "auto", // allows any file (image, video, pdf, etc.)
      public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`,
      format: ext, // helps Cloudinary preserve correct file type
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // ✅ limit file size to 100MB
  fileFilter: (req, file, cb) => {
    if (!file.originalname) {
      return cb(new Error("File must have a name"));
    }
    cb(null, true);
  },
});

/* -------------------------------------------------------------------------- */
/* 🧱 2️⃣ File Upload Endpoint */
/* -------------------------------------------------------------------------- */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // ✅ Log Cloudinary response for debugging
    console.log("✅ File uploaded:", req.file);

    const fileUrl = req.file.path;
    const mime = req.file.mimetype || "";

    const fileType = mime.startsWith("image")
      ? "image"
      : mime.startsWith("video")
      ? "video"
      : "file";

    res.status(200).json({
      success: true,
      fileUrl,
      fileType,
      originalName: req.file.originalname,
    });
  } catch (err) {
    console.error("❌ Cloudinary upload error:", err);
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: err.message || err,
    });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧩 3️⃣ Optional Test Route — checks Cloudinary connectivity */
/* -------------------------------------------------------------------------- */
router.get("/test", async (req, res) => {
  try {
    const result = await cloudinary.api.ping();
    res.json({ success: true, message: "Cloudinary connected ✅", result });
  } catch (err) {
    console.error("❌ Cloudinary test failed:", err);
    res
      .status(500)
      .json({ success: false, message: "Cloudinary not connected", error: err.message });
  }
});

export default router;
