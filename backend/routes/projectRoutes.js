import express from "express";
import {
  createProject,
  getProjects,
  assignMembers,
} from "../controllers/projectController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, adminOnly, createProject);
router.get("/", protect, getProjects);
router.put("/assign", protect, adminOnly, assignMembers);

export default router;

