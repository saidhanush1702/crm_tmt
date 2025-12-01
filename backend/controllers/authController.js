
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

    // Compare plain text
    if (password !== user.password) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

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
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const intern = await User.create({
      name,
      email,
      password,   // save plain text
      role: "intern",
    });

    res.status(201).json({ msg: "Intern created successfully", intern });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
