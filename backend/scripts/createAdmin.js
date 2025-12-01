import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import connectDB from "../config/db.js";

dotenv.config();
connectDB();

const createAdmin = async () => {
  const email = "admin@example.com";
  const password = "admin123"; // plain text
  const name = "Main Admin";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists.");
    process.exit(0);
  }

  // ❌ Removed bcrypt hashing
  // ❌ Removed salt and hash

  await User.create({
    name,
    email,
    password,   // save plain password
    role: "admin",
  });

  console.log("✅ Admin created successfully without hashing!");
  process.exit(0);
};

createAdmin();
