import express from "express";
import {
  getAllApplications,
  deleteApplication,
  moveForward,
} from "../controllers/inboxController.js";

const router = express.Router();

// @route GET /api/intern-apply/all
router.get("/all", getAllApplications);

// @route DELETE /api/intern-apply/:id
router.delete("/:id", deleteApplication);

// @route PATCH /api/intern-apply/forward/:id
router.patch("/forward/:id", moveForward);

export default router;
