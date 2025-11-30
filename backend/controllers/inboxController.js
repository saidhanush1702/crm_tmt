import InternshipApplication from "../models/InternshipApplication.js";

// @desc Get all applications
export const getAllApplications = async (req, res) => {
  try {
    const items = await InternshipApplication.find().sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch applications" });
  }
};

// @desc Delete application
export const deleteApplication = async (req, res) => {
  try {
    await InternshipApplication.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete application" });
  }
};

// @desc Mark as read
export const markAsRead = async (req, res) => {
  try {
    await InternshipApplication.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update application" });
  }
};
