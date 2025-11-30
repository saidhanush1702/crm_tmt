import mongoose from "mongoose";

const InternshipApplicationSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    mobile: String,
    college: String,
    year: String,
    branch: String,
    role: String,
    about: String,
    resumeUrl: String,
    read: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    collection: "intern_apply_inbox"  // 🔥 IMPORTANT: Use existing collection name
  }
);

export default mongoose.model("InternshipApplication", InternshipApplicationSchema);
