import express from "express";
import { login, registerIntern } from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin + Intern Login
router.post("/login", login);

// Only Admin can register new interns
router.post("/register-intern", protect, adminOnly, registerIntern);

export default router;
