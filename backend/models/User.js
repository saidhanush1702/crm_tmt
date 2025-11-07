import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ["admin", "intern"], default: "intern" },
  assignedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }]
});

export default mongoose.model("User", userSchema);
