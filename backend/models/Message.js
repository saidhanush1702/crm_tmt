import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },

    // ✅ New fields for file attachments
    fileUrl: {
      type: String,
      default: null, // Cloudinary URL if file/image/video is uploaded
    },
    fileType: {
      type: String,
      enum: ["image", "video", "file", null],
      default: null, // Helps frontend decide how to display
    },
    originalName: {
      type: String,
      default: null, // Original filename (e.g. resume.pdf)
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
