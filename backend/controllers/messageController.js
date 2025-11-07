import Message from "../models/Message.js";

export const getMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const messages = await Message.find({ projectId })
      .populate("senderId", "name role")
      .sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
