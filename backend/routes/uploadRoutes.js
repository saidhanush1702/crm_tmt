import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* 🧠 FIXED STORAGE LOGIC — PDFs MUST USE resource_type: "raw" */
/* -------------------------------------------------------------------------- */
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split(".").pop().toLowerCase();

    // Detect file type manually
    const mime = file.mimetype;

    let resourceType = "auto";

    if (mime === "application/pdf") {
      resourceType = "raw"; // 🔥 FIX: PDFs must be uploaded as RAW
    } else if (mime.startsWith("image")) {
      resourceType = "image";
    } else if (mime.startsWith("video")) {
      resourceType = "video";
    } else {
      resourceType = "raw"; // other files (.py, .txt etc)
    }

    return {
      folder: "task-manager-chat",
      resource_type: resourceType,
      public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`,
      format: ext,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

/* -------------------------------------------------------------------------- */
/* 🧱 Upload Route */
/* -------------------------------------------------------------------------- */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("Uploaded File →", req.file);

    res.status(200).json({
      success: true,
      fileUrl: req.file.path,         // Correct URL for PDF now
      mime: req.file.mimetype,
      originalName: req.file.originalname,
    });
  } catch (err) {
    console.error("Upload Error →", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧪 Test Route */
/* -------------------------------------------------------------------------- */
router.get("/test", async (req, res) => {
  try {
    const result = await cloudinary.api.ping();
    res.json({ success: true, message: "Cloudinary connected", result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
