import InternshipApplication from "../models/InternshipApplication.js";

// @desc Get all applications
export const getAllApplications = async (req, res) => {
  try {
    const items = await InternshipApplication.find().sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch applications" });
  }
};

// @desc Delete application (Not Suitable)
export const deleteApplication = async (req, res) => {
  try {
    await InternshipApplication.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, error: "Failed to delete application" });
  }
};

// @desc Move Forward (Selected)
export const moveForward = async (req, res) => {
  try {
    const updated = await InternshipApplication.findByIdAndUpdate(
      req.params.id,
      { movedForward: true },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, error: "Application not found" });
    }

    res.json({ success: true, item: updated });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, error: "Failed to update application" });
  }
};
