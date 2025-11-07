import Project from "../models/Project.js";
import User from "../models/User.js";

export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Automatically include admin as member
    const project = await Project.create({
      name,
      description,
      createdBy: req.user.id,
      members: [req.user.id], // 👈 Admin added as a member automatically
    });

    // Optionally, also update admin’s assignedProjects list
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { assignedProjects: project._id },
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


export const getProjects = async (req, res) => {
  try {
    const projects =
      req.user.role === "admin"
        ? await Project.find().populate("members", "name email")
        : await Project.find({ members: req.user.id }).populate("members", "name email");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const assignMembers = async (req, res) => {
  try {
    const { projectId, memberIds } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: "Project not found" });

    project.members = memberIds;
    await project.save();

    await User.updateMany(
      { _id: { $in: memberIds } },
      { $addToSet: { assignedProjects: project._id } }
    );

    res.json({ msg: "Members updated", project });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
