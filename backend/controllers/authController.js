import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// -------------------------------
// ADMIN LOGIN (only fixed admin)
// -------------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role,
      id: user._id,
      name: user.name,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// -------------------------------------
// ADMIN CREATES NEW INTERN USERS ONLY
// -------------------------------------
export const registerIntern = async (req, res) => {
  try {
    // Only admin can call this (middleware will check)
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const intern = await User.create({
      name,
      email,
      passwordHash: hash,
      role: "intern",
    });

    res.status(201).json({ msg: "Intern created successfully", intern });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
